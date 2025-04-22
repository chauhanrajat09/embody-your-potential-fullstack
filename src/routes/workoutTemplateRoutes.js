const express = require('express');
const router = express.Router();
const workoutTemplateController = require('../controllers/workoutTemplateController');
const auth = require('../middleware/auth');

// All routes are protected with auth middleware
router.use(auth);

// Get all workout templates for the logged in user
router.get('/', workoutTemplateController.getWorkoutTemplates);

// Get a specific workout template by ID
router.get('/:id', workoutTemplateController.getWorkoutTemplateById);

// Create a new workout template
router.post('/', workoutTemplateController.createWorkoutTemplate);

// Update a workout template
router.put('/:id', workoutTemplateController.updateWorkoutTemplate);

// Delete a workout template
router.delete('/:id', workoutTemplateController.deleteWorkoutTemplate);

module.exports = router; 