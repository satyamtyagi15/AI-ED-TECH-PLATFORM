const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true
  },
  questionType: {
    type: String,
    enum: ['mcq', 'truefalse', 'short', 'long'],
    default: 'mcq'
  },
  options: [{
    type: String,
    required: function() {
      return this.questionType === 'mcq' || this.questionType === 'truefalse';
    }
  }],
  correctAnswer: {
    type: Number,
    required: function() {
      return this.questionType === 'mcq' || this.questionType === 'truefalse';
    }
  },
  media: {
    type: {
      type: String,
      enum: ['gif', 'image', 'video', 'none'],
      default: 'none'
    },
    url: String,
    resourceId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Resource'
    }
  },
  timelimitSeconds: Number
});

const quizSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: String,
  questions: [questionSchema],
  tenantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tenant',
    required: true
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  resourceId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Resource'
  },
  timeLimit: Number,
  passingScore: {
    type: Number,
    default: 60
  },
  category: {
    type: String,
    enum: ['earthquake', 'flood', 'fire', 'tornado', 'tsunami', 'general', 'mental health', 'safety', 'health', 'science', 'technology'],
    default: 'general'
  },
  xpReward: {
    type: Number,
    default: 100
  }
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);