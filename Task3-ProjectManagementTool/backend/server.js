const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const connectDB = require('./db');

// Import Route Handlers
const authRoutes = require('./routes/authRoutes');
const projectRoutes = require('./routes/projectRoutes');
const taskRoutes = require('./routes/taskRoutes');

dotenv.config();
connectDB(); // Connect to MongoDB Compass

const app = express();

// Middleware
app.use(express.json()); // Allows server to accept JSON data in request body
app.use(cors()); // Allows frontend to communicate with this backend

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectRoutes);
app.use('/api/tasks', taskRoutes);

// Root route to check server status in browser
app.get('/', (req, res) => {
    res.send(`
        <h1 style="font-family: sans-serif;">🚀 Project Management Tool Backend is Live!</h1>
        <p>Current Status: <strong>Running Successfully</strong></p>
        <p>Check Projects JSON: <a href="http://localhost:5000/api/projects">View Projects</a></p>
    `);
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n================================================`);
    console.log(`🚀 SERVER RUNNING AT: http://localhost:${PORT}`);
    console.log(`================================================\n`);
});