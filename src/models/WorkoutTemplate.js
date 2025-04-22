const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Exercise schema for each exercise in a day
const ExerciseSchema = new Schema({
  exercise_name: {
    type: String,
    required: true
  },
  sets: {
    type: Schema.Types.Mixed,
    default: null
  },
  intensity: {
    type: String,
    default: ''
  },
  notes: {
    type: String,
    default: ''
  },
  variations: {
    type: [String],
    default: []
  }
});

// Day schema for each day in the workout plan
const DaySchema = new Schema({
  day_number: {
    type: Number,
    required: true
  },
  exercises: {
    type: [ExerciseSchema],
    default: []
  },
  day_notes: {
    type: String,
    default: ''
  }
});

// Focus schema to track the type of workout
const FocusSchema = new Schema({
  strength: {
    type: Boolean,
    default: false
  },
  hypertrophy: {
    type: Boolean,
    default: false
  },
  endurance: {
    type: Boolean,
    default: false
  },
  mobility: {
    type: Boolean,
    default: false
  }
});

// Main Workout Template schema
const WorkoutTemplateSchema = new Schema({
  plan_name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  time: {
    type: String,
    default: ''
  },
  difficulty_level: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', ''],
    default: ''
  },
  focus: {
    type: FocusSchema,
    default: () => ({})
  },
  tags: {
    type: [String],
    default: []
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  days: {
    type: [DaySchema],
    default: []
  }
}, {
  timestamps: {
    createdAt: 'created_date',
    updatedAt: 'last_modified'
  }
});

module.exports = mongoose.model('WorkoutTemplate', WorkoutTemplateSchema); 