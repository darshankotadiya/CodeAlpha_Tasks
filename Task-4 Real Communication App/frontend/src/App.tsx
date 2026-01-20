// @ts-nocheck
import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";
import Peer from "simple-peer";

const socket = io("http://localhost:8080");

const App = () => {
    const [me, setMe] = useState("");
    const [stream, setStream] = useState<MediaStream | null>(null);
    const [name, setName] = useState("");
    const [partnerId, setPartnerId] = useState("");
    const [callAccepted, setCallAccepted] = useState(false);
    const [messages, setMessages] = useState([]);
    const [currentMsg, setCurrentMsg] = useState("");
    const [drawColor, setDrawColor] = useState("#00dbde");
    const [files, setFiles] = useState([]);

    const myVideo = useRef<HTMLVideoElement>(null);
    const userVideo = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const connectionRef = useRef<any>();

    useEffect(() => {
        // CHAT FIX: Remove duplicate listeners
        socket.removeAllListeners("message");
        socket.removeAllListeners("me");
        socket.removeAllListeners("file-received");
        socket.removeAllListeners("drawing");

        socket.on("me", (id) => setMe(id));
        
        socket.on("message", (msg) => {
            setMessages((prev) => [...prev, msg]);
        });

        socket.on("file-received", (file) => {
            setFiles((prev) => [...prev, file]);
        });
        
        socket.on("drawing", (data) => {
            const ctx = canvasRef.current?.getContext("2d");
            if (ctx && data.type === "draw") {
                ctx.strokeStyle = data.color; ctx.lineTo(data.x, data.y); ctx.stroke();
            } else if (ctx && data.type === "text") {
                ctx.fillStyle = data.color; ctx.font = "20px Inter";
                ctx.fillText(data.text, data.x, data.y);
            }
        });

        return () => { socket.off("message"); };
    }, []);

    const connectUser = async () => {
        try {
            const s = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
            setStream(s);
            if (myVideo.current) myVideo.current.srcObject = s;

            const peer = new Peer({ initiator: true, trickle: false, stream: s });
            peer.on("signal", (data) => socket.emit("callUser", { userToCall: partnerId, signalData: data, from: me, name }));
            peer.on("stream", (remoteS) => { if (userVideo.current) userVideo.current.srcObject = remoteS; });
            socket.on("callAccepted", (signal) => { setCallAccepted(true); peer.signal(signal); });
            connectionRef.current = peer;
        } catch (err) { alert("Camera Access Required!"); }
    };

    const shareScreen = () => {
        navigator.mediaDevices.getDisplayMedia({ cursor: true }).then((screenStream) => {
            if (connectionRef.current) {
                const screenTrack = screenStream.getTracks()[0];
                connectionRef.current.replaceTrack(stream.getVideoTracks()[0], screenTrack, stream);
                if (myVideo.current) myVideo.current.srcObject = screenStream;
                screenTrack.onended = () => {
                    connectionRef.current.replaceTrack(screenTrack, stream.getVideoTracks()[0], stream);
                    if (myVideo.current) myVideo.current.srcObject = stream;
                };
            }
        });
    };

    const handleFile = (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = () => {
            const data = { name: file.name, data: reader.result };
            socket.emit("file-send", data);
            setFiles((prev) => [...prev, data]);
        };
        reader.readAsDataURL(file);
    };

    const sendChat = () => {
        if (!currentMsg.trim()) return;
        const msg = { user: name || "User", text: currentMsg };
        
        // FIX: emit only, let server broadcast back if needed
        socket.emit("message", msg); 
        setMessages((prev) => [...prev, msg]); 
        setCurrentMsg("");
    };

    return (
        <div style={styles.appWrapper}>
            <div style={styles.container}>
                <header style={styles.header}>
                    <h1 style={styles.title}>Elite Master Workspace 🚀</h1>
                    <p style={styles.subtitle}>Full-Stack Real-Time Collaboration</p>
                </header>

                <div style={styles.mainGrid}>
                    <div style={styles.card}>
                        <div style={styles.videoContainer}>
                            <video playsInline muted ref={myVideo} autoPlay style={styles.videoBox} />
                            {callAccepted && <video playsInline ref={userVideo} autoPlay style={styles.videoBox} />}
                        </div>
                        <div style={styles.controls}>
                            <input placeholder="Enter Name" value={name} onChange={(e) => setName(e.target.value)} style={styles.input} />
                            <input placeholder="Partner ID" value={partnerId} onChange={(e) => setPartnerId(e.target.value)} style={styles.input} />
                            <button onClick={connectUser} style={styles.primaryBtn}>Connect</button>
                            <button onClick={shareScreen} style={styles.secondaryBtn}>🖥️ Share Screen</button>
                            
                            {/* YOUR ID IS BACK HERE */}
                            <p style={styles.idLabel}>My ID: <span style={{color: '#00dbde'}}>{me}</span></p>
                        </div>
                    </div>

                    <div style={styles.card}>
                        <div style={styles.toolbar}>
                            <input type="color" value={drawColor} onChange={(e) => setDrawColor(e.target.value)} />
                            <button onClick={() => canvasRef.current.getContext('2d').clearRect(0,0,1000,1000)} style={styles.toolBtn}>Clear</button>
                        </div>
                        <canvas ref={canvasRef} width={800} height={600} style={styles.canvas}
                            onMouseDown={(e) => {
                                const ctx = canvasRef.current.getContext("2d"); ctx.beginPath(); ctx.strokeStyle = drawColor; ctx.moveTo(e.nativeEvent.offsetX, e.nativeEvent.offsetY);
                                canvasRef.current.onmousemove = (ev) => { ctx.lineTo(ev.offsetX, ev.offsetY); ctx.stroke(); socket.emit("drawing", { type: "draw", x: ev.offsetX, y: ev.offsetY, color: drawColor }); };
                            }}
                            onMouseUp={() => canvasRef.current.onmousemove = null}
                        />
                    </div>

                    <div style={styles.card}>
                        <div style={styles.chatBox}>
                            {messages.map((m, i) => <div key={i} style={styles.msgLine}><strong>{m.user}:</strong> {m.text}</div>)}
                            {files.map((f, i) => <div key={i}><a href={f.data} download={f.name} style={{color: '#00dbde'}}>📎 {f.name}</a></div>)}
                        </div>
                        <div style={{display: 'flex', gap: '8px'}}>
                            <input placeholder="Message..." value={currentMsg} onChange={(e) => setCurrentMsg(e.target.value)} style={styles.chatInput} />
                            <button onClick={sendChat} style={styles.sendBtn}>➤</button>
                        </div>
                        <input type="file" onChange={handleFile} style={{marginTop: '10px', fontSize: '11px'}} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    appWrapper: { minHeight: "100vh", background: "#05070a", display: "flex", justifyContent: "center", padding: "20px" },
    container: { width: "100%", maxWidth: "1400px" },
    header: { textAlign: "center", marginBottom: "30px" },
    title: { fontSize: "3rem", background: "linear-gradient(to right, #00dbde, #fc00ff)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" },
    mainGrid: { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "20px" },
    card: { background: "#11141d", padding: "20px", borderRadius: "20px", border: "1px solid #222", color: "#fff" },
    videoContainer: { display: "flex", gap: "10px", marginBottom: "15px" },
    videoBox: { width: "100%", borderRadius: "12px", background: "#000" },
    input: { width: "100%", padding: "12px", background: "#1c1f26", border: "1px solid #333", color: "#fff", borderRadius: "10px", marginBottom: "10px" },
    primaryBtn: { width: "100%", padding: "12px", background: "#00dbde", color: "#000", fontWeight: "bold", borderRadius: "10px", border: "none" },
    secondaryBtn: { width: "100%", padding: "12px", background: "transparent", border: "1px solid #00dbde", color: "#00dbde", borderRadius: "10px", marginTop: "10px" },
    canvas: { background: "#fff", borderRadius: "12px", width: "100%", height: "300px", cursor: "crosshair" },
    chatBox: { height: "250px", background: "rgba(0,0,0,0.2)", borderRadius: "12px", padding: "15px", overflowY: "auto", marginBottom: "10px", textAlign: "left" },
    chatInput: { flex: 1, padding: "12px", background: "#1c1f26", color: "#fff", borderRadius: "10px", border: "1px solid #333" },
    sendBtn: { background: "#00dbde", padding: "0 20px", borderRadius: "10px", border: "none" },
    msgLine: { borderBottom: "1px solid #222", padding: "5px 0" },
    idLabel: { fontSize: "11px", color: "#718096", marginTop: "10px" },
    toolbar: { display: "flex", gap: "10px", marginBottom: "10px", justifyContent: "center" },
    toolBtn: { background: "#2d3748", color: "#fff", border: "none", padding: "5px 15px", borderRadius: "8px" }
};

export default App;