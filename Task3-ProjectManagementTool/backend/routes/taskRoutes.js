const express = require('express');
const router = express.Router();
const { createTask, addComment, getTasks } = require('../controllers/taskController');
router.post('/', createTask);
router.post('/comment', addComment);
router.get('/', getTasks); // all tasks show

module.exports = router;