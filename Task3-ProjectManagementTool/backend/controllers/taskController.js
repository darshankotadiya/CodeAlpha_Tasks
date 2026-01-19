const Task = require('../models/Task');

// Logic to create a new task
exports.createTask = async (req, res) => {
    try {
        const task = await Task.create(req.body);
        res.status(201).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Task Creation Failed', error: error.message });
    }
};

// Logic to get all tasks (Front-end માટે જરૂરી)
exports.getTasks = async (req, res) => {
    try {
        const tasks = await Task.find();
        res.status(200).json(tasks);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch tasks', error: error.message });
    }
};

// Logic to add a comment
exports.addComment = async (req, res) => {
    try {
        const { taskId, userId, text } = req.body;
        const task = await Task.findById(taskId);
        if(!task) return res.status(404).json({ message: 'Task not found' });

        task.comments.push({ user: userId, text });
        await task.save();
        res.status(200).json(task);
    } catch (error) {
        res.status(500).json({ message: 'Failed to add comment' });
    }
};