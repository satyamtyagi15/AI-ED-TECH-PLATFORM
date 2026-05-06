const mongoose = require('mongoose');

const dailyChallengeSchema = new mongoose.Schema({
  tenantId: { type: mongoose.Schema.Types.ObjectId, ref: 'Tenant', required: true },
  date: { type: String, required: true }, // format: YYYY-MM-DD
  challenge: {
    title: String,
    description: String,
    question: String,
    answer: String,
    xpReward: { type: Number, default: 50 }
  },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('DailyChallenge', dailyChallengeSchema);