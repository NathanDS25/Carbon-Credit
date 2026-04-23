const mongoose = require('mongoose');

const ActionLogSchema = new mongoose.Schema({
  actionType: { type: String, required: true }, // 'chat', 'schedule_meet', 'upload', etc.
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  payload: { type: mongoose.Schema.Types.Mixed },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('ActionLog', ActionLogSchema);
