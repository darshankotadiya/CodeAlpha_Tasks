const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');

const app = express();
app.use(express.json()); 
app.use(cors()); 

mongoose.connect('mongodb://localhost:27017/codealpha_shop')
    .then(() => console.log("✅ MongoDB Database Connected Successfully"))
    .catch(err => console.error("❌ DB Connection Error:", err));

const User = mongoose.model('User', new mongoose.Schema({
    username: String, email: { type: String, unique: true }, password: String
}));

const Product = mongoose.model('Product', new mongoose.Schema({
    name: String, price: Number, desc: String, category: String, image: String, rating: Number, stock: Number
}));

const Order = mongoose.model('Order', new mongoose.Schema({
    username: String,
    productName: String,
    amount: Number,
    orderID: String,
    status: { type: String, default: "Pending" }, 
    date: { type: Date, default: Date.now }
}));

app.post('/api/register', async (req, res) => {
    try { const u = new User(req.body); await u.save(); res.json({msg: "Success"}); } 
    catch(e) { res.status(400).json({msg: "Error"}); }
});

app.post('/api/login', async (req, res) => {
    const u = await User.findOne({email: req.body.email, password: req.body.password});
    if(u) res.json({username: u.username}); else res.status(401).json({msg: "Failed"});
});

app.get('/api/products', async (req, res) => res.json(await Product.find()));

// --- Order Management APIs ---
app.post('/api/orders', async (req, res) => {
    try { const o = new Order(req.body); await o.save(); res.json({ msg: "Order Stored Successfully" }); } 
    catch (e) { res.status(400).json({ msg: "Error saving order" }); }
});

app.get('/api/orders', async (req, res) => res.json(await Order.find()));

app.patch('/api/orders/:id', async (req, res) => {
    try { await Order.findByIdAndUpdate(req.params.id, { status: req.body.status }); res.json({ msg: "Status Updated" }); } 
    catch (e) { res.status(400).json({ msg: "Update Failed" }); }
});

app.delete('/api/orders/:id', async (req, res) => {
    try { await Order.findByIdAndDelete(req.params.id); res.json({ msg: "Deleted" }); } 
    catch (e) { res.status(400).json({ msg: "Delete Failed" }); }
});

app.listen(5000, () => console.log("🚀 Server running on port 5000"));