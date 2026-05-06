const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
  questionIndex: Number,
  selectedAnswer: mongoose.Schema.Types.Mixed,
  isCorrect: {
    type: Boolean,
    default: false
  },
  textAnswer: String,
  // For subjective questions, teacher can override isCorrect later
  teacherGrade: {
    type: Number,
    min: 0,
    max: 1,
    default: null // null = not graded yet
  }
});

const quizSubmissionSchema = new mongoose.Schema({
  quizId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Quiz',
    required: true
  },
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  answers: [answerSchema],
  score: {
    type: Number,
    required: true
  },
  timeTaken: Number,
  completedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

module.exports = mongoose.model('QuizSubmission', quizSubmissionSchema);