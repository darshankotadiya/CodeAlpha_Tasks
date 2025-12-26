const API_URL = "http://localhost:5000/api";
let currentProduct = "";
let currentPrice = 0;

async function loadDetails() {
    const id = new URLSearchParams(window.location.search).get('id');
    try {
        const res = await fetch(`${API_URL}/products`);
        const products = await res.json();
        const p = products.find(item => item._id === id);
        if (p) {
            currentProduct = p.name;
            currentPrice = p.price;
            document.getElementById('product-details').innerHTML = `
                <img src="${p.image}" style="width:400px; object-fit:contain; border-radius:10px;">
                <div style="flex:1;">
                    <h1 style="margin-top:0;">${p.name}</h1>
                    <p style="font-size:30px; color:#B12704; font-weight:bold; margin:10px 0;">$${p.price}</p>
                    <div style="background:#fdfdfd; padding:20px; border-radius:10px; border-left:5px solid #febd69; margin:20px 0;">
                        <h3 style="margin-top:0;">Product Specifications:</h3>
                        <p><b>Description:</b> ${p.desc} - Premium build quality for high performance.</p>
                        <p><b>Warranty:</b> 1 Year official domestic warranty.</p>
                    </div>
                    <p style="color:green; font-weight:700;">FREE Delivery Expected by: ${new Date(Date.now() + 4*24*60*60*1000).toDateString()}</p>
                    <button class="btn" style="height:55px; font-size:18px;" onclick="openScanner()">Proceed to Checkout</button>
                </div>
            `;
        }
    } catch (err) { console.error("Error loading details:", err); }
}

function openScanner() { document.getElementById('scanner-modal').style.display = 'flex'; }

function simulateProcessing() {
    const statusDiv = document.getElementById('payment-status');
    statusDiv.innerHTML = `<p style="color: blue; animation: blink 1s infinite;">⏳ Processing Payment...</p>`;
    setTimeout(() => {
        document.getElementById('scanner-modal').style.display = 'none';
        showFinalReceipt(currentProduct, currentPrice);
    }, 2000);
}

// --- Save oreders Function ---
async function showFinalReceipt(name, price) {
    document.getElementById('pay-modal').style.display = 'flex';
    const gst = (price * 0.18).toFixed(2);
    const total = (parseFloat(price) + parseFloat(gst)).toFixed(2);
    const orderID = "GPAY-" + Math.floor(Math.random() * 1000000);

    // ડend data in database.
    await fetch(`${API_URL}/orders`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({
            username: localStorage.getItem('user') || "Guest",
            productName: name,
            amount: total,
            orderID: orderID,
            status: "Pending"
        })
    });

    document.getElementById('bill-info').innerHTML = `
        <div style="text-align:center; margin-bottom:15px;">
            <h2 style="margin:0; color:#131921; font-size:22px;">CodeAlpha Premium Store</h2>
            <p style="margin:0; font-size:12px; color:#555;">Official Digital Purchase Receipt</p>
        </div>
        <hr style="border:0.5px solid #eee;">
        <div style="padding:10px 0; text-align: left;">
            <strong>Order Details:</strong><br>
            <b>Order ID:</b> ${orderID}<br>
            <b>Product Name:</b> ${name}<br>
            <b>Base Price:</b> $${price}<br>
            <b>GST (18%):</b> $${gst}<br>
        </div>
        <hr style="border:0.5px dashed #ccc;">
        <div style="padding:10px 0; display:flex; justify-content:space-between; align-items:center;">
            <span style="font-size:18px; font-weight:bold;">Total Amount:</span>
            <span style="font-size:20px; color:#28a745; font-weight:bold;">$${total}</span>
        </div>
        <hr style="border:0.5px solid #eee;">
        <div style="text-align:center; margin-top:20px; padding:10px; background:#f0fff4; border-radius:10px;">
            <p style="font-size:18px; color:#2d3748; margin:0;"><b>Keep Smiling & Shine Bright! ✨</b></p>
            <p style="font-size:14px; color:#4a5568; margin-top:5px;">Your presence makes our store special. We can't wait to see you again! 😊</p>
        </div>
    `;
}

function closeScanner() {
    document.getElementById('scanner-modal').style.display = 'none';
    document.getElementById('payment-status').innerHTML = `<p style="font-weight: bold; color: #e47911;">Waiting for payment...</p>`;
}

window.onload = loadDetails;