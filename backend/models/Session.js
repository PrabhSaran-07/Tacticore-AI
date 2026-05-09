const mongoose = require('mongoose');

const SessionSchema = new mongoose.Schema({
  scenario: { type: mongoose.Schema.Types.ObjectId, ref: 'Scenario' },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['waiting', 'active', 'completed'], default: 'waiting' },
  timeline: Array,
  results: { type: mongoose.Schema.Types.ObjectId, ref: 'Result' }
}, { timestamps: true });

module.exports = mongoose.model('Session', SessionSchema);
