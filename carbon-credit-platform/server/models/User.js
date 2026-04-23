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
  walletAddress: { type: String }, // Optional during registration, can be linked later
  creditBalance: { type: Number, default: 0 },
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);
