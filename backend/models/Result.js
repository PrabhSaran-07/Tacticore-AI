const mongoose = require('mongoose');

const ResultSchema = new mongoose.Schema({
  session: { type: mongoose.Schema.Types.ObjectId, ref: 'Session' },
  score: Number,
  feedback: String,
  metrics: Object
}, { timestamps: true });

module.exports = mongoose.model('Result', ResultSchema);
