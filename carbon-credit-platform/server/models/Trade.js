const mongoose = require('mongoose');

const TradeSchema = new mongoose.Schema({
  buyer: String,
  seller: String,
  credits: Number,
  price: Number,
  time: String,
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Trade', TradeSchema);
