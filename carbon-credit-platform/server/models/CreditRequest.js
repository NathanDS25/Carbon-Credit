const mongoose = require('mongoose');

const CreditRequestSchema = new mongoose.Schema({
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  companyName: { type: String, required: true },
  creditsNeeded: { type: Number, required: true },
  purpose: { type: String, required: true },
  deadline: { type: String, required: true },
  status: { type: String, enum: ['pending', 'active', 'fulfilled'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CreditRequest', CreditRequestSchema);
