const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Shared
  name: { type: String, required: true },
  role: { type: String, enum: ['cadet', 'accessor'], required: true },

  // Accessor fields
  email: { type: String, unique: true, sparse: true },
  password: String,

  // Cadet fields
  chestNo: { type: String, unique: true, sparse: true },
  batch: String,
  cadetType: { type: String, enum: ['fresher', 'repeater'] }
}, { timestamps: true });

module.exports = mongoose.model('User', UserSchema);
