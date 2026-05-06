const mongoose = require('mongoose');

const liveSessionSchema = new mongoose.Schema({
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  title: { type: String, required: true },
  description: String,
  roomName: { type: String, required: true },
  status: { type: String, enum: ['scheduled', 'active', 'ended'], default: 'scheduled' },
  scheduledAt: { type: Date, default: Date.now },
  startedAt: Date,
  endedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('LiveSession', liveSessionSchema);