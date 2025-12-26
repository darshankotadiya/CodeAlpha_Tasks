const API = "http://localhost:5000/api";

async function loadDashboard() {
    const res = await fetch(`${API}/products`);
    const products = await res.json();
    
    const list = document.getElementById('product-list');
    const side = document.getElementById('sidebar-stock');
    if(!list) return;

    document.getElementById('user-welcome').innerText = "Hello, " + (localStorage.getItem('user') || "Student");

    side.innerHTML = products.map(p => `
        <div style="padding:12px; border-bottom:1px solid #eee; cursor:pointer;" onclick="window.location.href='details.html?id=${p._id}'">
            <b>${p.name}</b>: <span style="color:green; font-size:12px;">Available</span>
        </div>
    `).join('');

    list.innerHTML = products.map(p => `
        <div class="card">
            <img src="${p.image}">
            <h3>${p.name}</h3>
            <p style="font-size:22px; font-weight:700; color:#B12704;">$${p.price}</p>
            <button class="btn" onclick="window.location.href='details.html?id=${p._id}'">Add to Cart</button>
        </div>
    `).join('');
}

// --- Orders Processing Logic---
async function openOrdersModal() {
    document.getElementById('orders-modal').style.display = 'flex';
    const res = await fetch(`${API}/orders`);
    const orders = await res.json();
    
    const rows = document.getElementById('order-rows');
    rows.innerHTML = orders.map(o => `
        <tr style="border-bottom: 1px solid #eee;">
            <td style="padding:12px;">${o.orderID}</td>
            <td>${o.productName}</td>
            <td style="font-weight:bold; color:${o.status==='Accepted'?'green':(o.status==='Processing'?'blue':'orange')}">${o.status}</td>
            <td>
                <button onclick="updateStatus('${o._id}', 'Processing')" style="cursor:pointer; padding:5px 8px;">Process</button>
                <button onclick="updateStatus('${o._id}', 'Accepted')" style="cursor:pointer; padding:5px 8px; background:#d4edda; border:1px solid green;">Accept</button>
                <button onclick="deleteOrder('${o._id}')" style="cursor:pointer; color:red; border:none; background:none; font-weight:bold; margin-left:10px;">Delete</button>
            </td>
        </tr>
    `).join('');
}

async function updateStatus(id, newStatus) {
    await fetch(`${API}/orders/${id}`, {
        method: 'PATCH',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ status: newStatus })
    });
    openOrdersModal(); 
}

async function deleteOrder(id) {
    if(confirm("Delete this order?")) {
        await fetch(`${API}/orders/${id}`, { method: 'DELETE' });
        openOrdersModal();
    }
}

function logout() { localStorage.clear(); window.location.href = "auth.html"; }
window.onload = loadDashboard;