const Quiz = require('../models/Quiz');
const QuizSubmission = require('../models/QuizSubmission');
const mongoose = require('mongoose');

// @desc    Get a single quiz
// @route   GET /api/quizzes/:id
// @access  Private
const getQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const quiz = await Quiz.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('resourceId');
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }
    
    res.json(quiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new quiz
// @route   POST /api/quizzes
// @access  Private (Teacher only)
const createQuiz = async (req, res) => {
  try {
    const { title, description, questions, resourceId, timeLimit, passingScore, category, xpReward } = req.body;
    const { _id: createdBy, tenantId } = req.user;

    const validatedQuestions = questions.map(q => {
      const isSubjective = q.questionType === 'short' || q.questionType === 'long';
      if (!isSubjective && (!q.options || q.options.length < 2)) {
        throw new Error(`Question "${q.question}" must have at least 2 options`);
      }
      return {
        ...q,
        media: q.media || { type: 'none' },
        options: isSubjective ? [] : q.options,
        correctAnswer: isSubjective ? 0 : q.correctAnswer
      };
    });

    const quiz = await Quiz.create({
      title,
      description,
      questions: validatedQuestions,
      resourceId,
      timeLimit,
      passingScore,
      category,
      xpReward,
      tenantId,
      createdBy
    });

    const populatedQuiz = await Quiz.findById(quiz._id)
      .populate('createdBy', 'firstName lastName')
      .populate('resourceId');

    res.status(201).json(populatedQuiz);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get all quizzes for a tenant
// @route   GET /api/quizzes
// @access  Private
const getQuizzes = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const quizzes = await Quiz.find({ tenantId })
      .populate('createdBy', 'firstName lastName')
      .populate('resourceId')
      .sort({ createdAt: -1 });
    
    res.json(quizzes);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a quiz
// @route   DELETE /api/quizzes/:id
// @access  Private (Teacher only)
const deleteQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { _id: userId, tenantId } = req.user;

    const quiz = await Quiz.findOne({ _id: id, tenantId });
    
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    if (quiz.createdBy.toString() !== userId.toString()) {
      return res.status(403).json({ message: 'Not authorized to delete this quiz' });
    }

    await QuizSubmission.deleteMany({ quizId: id });
    await Quiz.findByIdAndDelete(id);

    res.json({ message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Submit quiz answers
// @route   POST /api/quizzes/:id/submit
// @access  Private (Student only)
const submitQuiz = async (req, res) => {
  try {
    const { id } = req.params;
    const { answers, timeTaken } = req.body;
    const { _id: studentId } = req.user;

    const quiz = await Quiz.findById(id);
    if (!quiz) {
      return res.status(404).json({ message: 'Quiz not found' });
    }

    let correctCount = 0;
    const answerResults = answers.map((answer, idx) => {
      const question = quiz.questions[idx];
      const isSubjective = question.questionType === 'short' || question.questionType === 'long';
      let isCorrect = false;
      let storedAnswer = null;

      if (isSubjective) {
        storedAnswer = answer.textAnswer || '';
        // Subjective questions are not auto‑graded; teacher can grade later.
        // For now, they do not affect score.
      } else {
        const selectedIdx = answer.selectedAnswer;
        storedAnswer = selectedIdx;
        isCorrect = (selectedIdx === question.correctAnswer);
        if (isCorrect) correctCount++;
      }

      return {
        questionIndex: idx,
        selectedAnswer: storedAnswer,
        isCorrect,
        textAnswer: isSubjective ? answer.textAnswer : undefined
      };
    });

    const totalAuto = quiz.questions.filter(q => q.questionType !== 'short' && q.questionType !== 'long').length;
    const score = totalAuto === 0 ? 0 : Math.round((correctCount / totalAuto) * 100);

    const submission = await QuizSubmission.create({
      quizId: id,
      studentId,
      answers: answerResults,
      score,
      timeTaken
    });

    const populatedSubmission = await QuizSubmission.findById(submission._id)
      .populate('quizId')
      .populate('studentId', 'firstName lastName');

    res.status(201).json(populatedSubmission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get quiz submissions
// @route   GET /api/quizzes/submissions/:quizId
// @access  Private
const getQuizSubmissions = async (req, res) => {
  try {
    const { quizId } = req.params;
    const { role, tenantId, _id: userId } = req.user;

    let query = { quizId };
    if (role === 'student') {
      query.studentId = userId;
    }
    
    const submissions = await QuizSubmission.find(query)
      .populate('studentId', 'firstName lastName')
      .populate('quizId')
      .sort({ completedAt: -1 });
    
    res.json(submissions);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get leaderboard for a quiz
// @route   GET /api/quizzes/leaderboard/:quizId
// @access  Private
const getLeaderboard = async (req, res) => {
  try {
    const { quizId } = req.params;
    
    const leaderboard = await QuizSubmission.aggregate([
      { $match: { quizId: new mongoose.Types.ObjectId(quizId) } },
      {
        $lookup: {
          from: 'users',
          localField: 'studentId',
          foreignField: '_id',
          as: 'student'
        }
      },
      { $unwind: '$student' },
      {
        $group: {
          _id: '$studentId',
          firstName: { $first: '$student.firstName' },
          lastName: { $first: '$student.lastName' },
          bestScore: { $max: '$score' },
          attempts: { $sum: 1 },
          lastAttempt: { $max: '$completedAt' }
        }
      },
      { $sort: { bestScore: -1, lastAttempt: 1 } }
    ]);
    
    res.json(leaderboard);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== NEW FUNCTIONS FOR TEACHER GRADING ==========

// @desc    Get a single submission with full details (for teacher grading)
// @route   GET /api/quiz-submissions/:submissionId
// @access  Private (Teacher only)
const getSubmissionDetails = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { role, tenantId } = req.user;
    if (role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submission = await QuizSubmission.findById(submissionId)
      .populate('studentId', 'firstName lastName')
      .populate('quizId');
    
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    // Verify teacher has access to this quiz
    const quiz = await Quiz.findById(submission.quizId);
    if (!quiz || quiz.tenantId.toString() !== tenantId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    res.json(submission);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Teacher grades subjective answers and updates score
// @route   PUT /api/quiz-submissions/:submissionId/grade
// @access  Private (Teacher only)
const gradeSubmission = async (req, res) => {
  try {
    const { submissionId } = req.params;
    const { grades } = req.body; // Array of { questionIndex, isCorrect }
    const { role, tenantId } = req.user;
    if (role !== 'teacher') {
      return res.status(403).json({ message: 'Access denied' });
    }

    const submission = await QuizSubmission.findById(submissionId).populate('quizId');
    if (!submission) {
      return res.status(404).json({ message: 'Submission not found' });
    }

    const quiz = await Quiz.findById(submission.quizId);
    if (!quiz || quiz.tenantId.toString() !== tenantId.toString()) {
      return res.status(403).json({ message: 'Not authorized' });
    }

    // Update grades for subjective questions
    const updatedAnswers = submission.answers.map(ans => {
      const gradeUpdate = grades.find(g => g.questionIndex === ans.questionIndex);
      if (gradeUpdate) {
        ans.teacherGrade = gradeUpdate.isCorrect ? 1 : 0;
        // Override isCorrect for subjective questions
        if (quiz.questions[ans.questionIndex].questionType === 'short' || quiz.questions[ans.questionIndex].questionType === 'long') {
          ans.isCorrect = gradeUpdate.isCorrect;
        }
      }
      return ans;
    });

    // Recalculate total score: sum of correct answers (auto + teacher-graded)
    let correctCount = 0;
    updatedAnswers.forEach(ans => {
      if (ans.isCorrect) correctCount++;
    });
    const totalQuestions = quiz.questions.length;
    const newScore = totalQuestions === 0 ? 0 : Math.round((correctCount / totalQuestions) * 100);

    submission.answers = updatedAnswers;
    submission.score = newScore;
    await submission.save();

    res.json({ success: true, submission });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ========== MODULE EXPORTS ==========

module.exports = { 
  getQuizzes, 
  getQuiz, 
  createQuiz, 
  deleteQuiz,
  submitQuiz, 
  getQuizSubmissions, 
  getLeaderboard,
  getSubmissionDetails,   
  gradeSubmission        
};