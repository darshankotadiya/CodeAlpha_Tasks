const express = require('express');
const router = express.Router();
const { createProject, getProjects } = require('../controllers/projectController');

// Define project endpoints
router.post('/', createProject); // Handles POST to /api/projects
router.get('/', getProjects);    // Handles GET to /api/projects

module.exports = router;