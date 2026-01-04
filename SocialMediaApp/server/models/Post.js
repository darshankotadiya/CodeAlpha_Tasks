const mongoose = require("mongoose");

const PostSchema = new mongoose.Schema({
  content: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // 👇 LIKE FEATURE
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Post", PostSchema);
