const express = require('express');
const { 
  getQuizzes, 
  getQuiz, 
  createQuiz, 
  deleteQuiz,
  submitQuiz, 
  getQuizSubmissions, 
  getLeaderboard,
  getSubmissionDetails,   // add
  gradeSubmission    // add
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getQuizzes)
  .post(protect, authRole(['teacher']), createQuiz);

router.route('/:id')
  .get(protect, getQuiz)
  .delete(protect, authRole(['teacher']), deleteQuiz);

router.post('/:id/submit', protect, authRole(['student']), submitQuiz);
router.get('/submissions/:quizId', protect, getQuizSubmissions);
router.get('/leaderboard/:quizId', protect, getLeaderboard);
// Teacher grades a submission
router.get('/submission/:submissionId', protect, authRole(['teacher']), getSubmissionDetails);
router.put('/submission/:submissionId/grade', protect, authRole(['teacher']), gradeSubmission);

module.exports = router;