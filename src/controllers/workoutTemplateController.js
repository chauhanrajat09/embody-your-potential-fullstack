const WorkoutTemplate = require('../models/WorkoutTemplate');

// Get all workout templates for a user
exports.getWorkoutTemplates = async (req, res) => {
  try {
    const templates = await WorkoutTemplate.find({ user_id: req.user.id });
    res.status(200).json(templates);
  } catch (error) {
    console.error('Error fetching workout templates:', error);
    res.status(500).json({ message: 'Error fetching workout templates', error: error.message });
  }
};

// Get a single workout template by ID
exports.getWorkoutTemplateById = async (req, res) => {
  try {
    const template = await WorkoutTemplate.findOne({ 
      _id: req.params.id,
      user_id: req.user.id 
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    res.status(200).json(template);
  } catch (error) {
    console.error('Error fetching workout template:', error);
    res.status(500).json({ message: 'Error fetching workout template', error: error.message });
  }
};

// Create a new workout template
exports.createWorkoutTemplate = async (req, res) => {
  try {
    const newTemplate = new WorkoutTemplate({
      ...req.body,
      user_id: req.user.id
    });
    
    const savedTemplate = await newTemplate.save();
    res.status(201).json(savedTemplate);
  } catch (error) {
    console.error('Error creating workout template:', error);
    res.status(500).json({ message: 'Error creating workout template', error: error.message });
  }
};

// Update a workout template
exports.updateWorkoutTemplate = async (req, res) => {
  try {
    const template = await WorkoutTemplate.findOneAndUpdate(
      { _id: req.params.id, user_id: req.user.id },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    res.status(200).json(template);
  } catch (error) {
    console.error('Error updating workout template:', error);
    res.status(500).json({ message: 'Error updating workout template', error: error.message });
  }
};

// Delete a workout template
exports.deleteWorkoutTemplate = async (req, res) => {
  try {
    const template = await WorkoutTemplate.findOneAndDelete({ 
      _id: req.params.id, 
      user_id: req.user.id 
    });
    
    if (!template) {
      return res.status(404).json({ message: 'Workout template not found' });
    }
    
    res.status(200).json({ message: 'Workout template deleted successfully' });
  } catch (error) {
    console.error('Error deleting workout template:', error);
    res.status(500).json({ message: 'Error deleting workout template', error: error.message });
  }
}; 