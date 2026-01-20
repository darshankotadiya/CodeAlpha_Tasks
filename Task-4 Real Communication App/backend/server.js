const express = require("express");
const http = require("http");
const app = express();
const server = http.createServer(app);
const io = require("socket.io")(server, {
    cors: {
        origin: "http://localhost:5173", // તમારા ફ્રન્ટએન્ડનો URL
        methods: ["GET", "POST"]
    }
});

io.on("connection", (socket) => {
    // Send unique ID to the user
    socket.emit("me", socket.id);

    // Call Handling
    socket.on("callUser", (data) => {
        io.to(data.userToCall).emit("callUser", { signal: data.signalData, from: data.from, name: data.name });
    });

    socket.on("answerCall", (data) => {
        io.to(data.to).emit("callAccepted", data.signal);
    });

    // Chat Handling: Broadcast message to others
    socket.on("message", (data) => {
        socket.broadcast.emit("message", data);
    });

    // Drawing Sync
    socket.on("drawing", (data) => {
        socket.broadcast.emit("drawing", data);
    });

    // File Sharing
    socket.on("file-send", (data) => {
        socket.broadcast.emit("file-received", data);
    });
});

server.listen(8080, () => console.log("Server is running on port 8080"));