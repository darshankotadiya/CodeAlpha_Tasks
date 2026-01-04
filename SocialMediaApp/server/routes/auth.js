const router = require("express").Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");


// REGISTER
router.post("/register", async (req, res) => {
  try {
    const hash = await bcrypt.hash(req.body.password, 10);
    await User.create({
      username: req.body.username,
      password: hash
    });
    res.json({ message: "Registered" });
  } catch {
    res.json({ error: "Username already exists" });
  }
});

// LOGIN
router.post("/login", async (req, res) => {
  const user = await User.findOne({ username: req.body.username });
  if (!user) return res.json({ error: "User not found" });

  const ok = await bcrypt.compare(req.body.password, user.password);
  if (!ok) return res.json({ error: "Wrong password" });

  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.cookie("token", token, { httpOnly: true })
     .json({ message: "Login success" });
});

// CURRENT USER
router.get("/me", async (req, res) => {
  try {
    const data = jwt.verify(req.cookies.token, process.env.JWT_SECRET);
    const user = await User.findById(data.id);
    res.json(user);
  } catch {
    res.json(null);
  }
});

// LOGOUT
router.post("/logout", (req, res) => {
  res.clearCookie("token").json({ message: "Logout" });
});

module.exports = router;
