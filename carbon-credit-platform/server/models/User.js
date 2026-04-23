const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { 
    type: String, 
    enum: ['ngo', 'company', 'admin'], 
    default: 'ngo' 
  },
  walletAddress: { type: String },
  creditBalance: { type: Number, default: 0 },
  // NGO-specific fields
  treesPlanted: { type: Number, default: 0 },
  activeProjects: { type: Number, default: 0 },
  // Company-specific fields
  industry: { type: String, default: '' },
  location: { type: String, default: '' },
  creditsNeeded: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
