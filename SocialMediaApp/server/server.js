const express = require("express");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");
const path = require("path");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(express.json());
app.use(cookieParser());

// Serve frontend
app.use(express.static(path.join(__dirname, "../client")));

// MongoDB
mongoose.connect(process.env.MONGO_URI)
.then(() => console.log("MongoDB Connected"))
.catch(err => console.log(err));

// Routes
app.use("/auth", require("./routes/auth"));
app.use("/posts", require("./routes/posts"));
app.use("/comments", require("./routes/comments"));



// Start server
app.listen(PORT, () => {
  console.log("====================================");
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`🌐 Register:  http://localhost:${PORT}/register.html`);
  console.log(`🌐 Login:     http://localhost:${PORT}/login.html`);
  console.log(`🌐 Dashboard: http://localhost:${PORT}/dashboard.html`);
  console.log("====================================");
});
