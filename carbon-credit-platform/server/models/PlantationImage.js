const mongoose = require('mongoose');

const PlantationImageSchema = new mongoose.Schema({
  filename: { type: String, required: true },
  filePath: { type: String, required: true },
  originalName: { type: String },
  ngoWallet: { type: String },
  location: { type: String },
  notes: { type: String },
}, { timestamps: true });

module.exports = mongoose.model('PlantationImage', PlantationImageSchema);
