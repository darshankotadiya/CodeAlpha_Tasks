const router = require("express").Router();
const Comment = require("../models/Comment");

// Add comment
router.post("/", async (req, res) => {
  if (!req.body.text || req.body.text.trim() === "") {
    return res.json({ error: "Empty comment" });
  }

  const comment = await Comment.create(req.body);
  res.json(comment);
});

// Get comments for a post
router.get("/:postId", async (req, res) => {
  const comments = await Comment.find({ post: req.params.postId })
    .populate("user", "username")
    .sort({ createdAt: -1 });

  res.json(comments);
});

module.exports = router;
