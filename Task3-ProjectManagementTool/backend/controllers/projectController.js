const Project = require('../models/Project');

// Create a new project
exports.createProject = async (req, res) => {
    try {
        const { projectName, description, ownerId } = req.body;
        const project = await Project.create({ 
            projectName, 
            description, 
            owner: ownerId 
        });
        res.status(201).json(project);
    } catch (error) {
        res.status(500).json({ message: 'Server Error', error: error.message });
    }
};

// Get all projects and populate owner details
exports.getProjects = async (req, res) => {
    try {
        const projects = await Project.find().populate('owner', 'username email');
        res.status(200).json(projects);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching projects' });
    }
};