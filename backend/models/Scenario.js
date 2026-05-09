const mongoose = require('mongoose');

const ScenarioSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: String,
  map: String,
  objectives: [String],
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, { timestamps: true });

module.exports = mongoose.model('Scenario', ScenarioSchema);
