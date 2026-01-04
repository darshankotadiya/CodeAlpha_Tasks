const router = require("express").Router();
const Post = require("../models/Post");

// CREATE POST
router.post("/", async (req, res) => {
  const post = await Post.create(req.body);
  res.json(post);
});

// GET POSTS
router.get("/", async (req, res) => {
  const posts = await Post.find()
    .populate("user", "username")
    .sort({ createdAt: -1 });

  res.json(posts);
});

// ❤️ LIKE / UNLIKE
router.post("/:id/like", async (req, res) => {
  const { userId } = req.body;
  const post = await Post.findById(req.params.id);

  if (!post) return res.status(404).json("Post not found");

  if (post.likes.includes(userId)) {
    post.likes = post.likes.filter(id => id.toString() !== userId);
  } else {
    post.likes.push(userId);
  }

  await post.save();
  res.json(post);
});

module.exports = router;
