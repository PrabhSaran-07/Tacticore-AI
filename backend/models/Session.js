const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario' },
  sessionCode: { type: String, unique: true, required: true },
  accessor: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
  problemDescription: String,
  optimumSolution: Object, // Stores map paths and markers
  assignedResources: {
    volunteers: { type: Number, default: 0 },
    fireTrucks: { type: Number, default: 0 },
    waterPumps: { type: Number, default: 0 }
  },
  timeLimit: { type: Number, default: 30 }, // in minutes
  timeline: Array,
  results: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
