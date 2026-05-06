const express = require('express');
const multer = require('multer');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');
const {
  generateQuiz,
  getTodaysChallenge,
  submitChallenge
} = require('../controllers/aiQuizController');

const router = express.Router();

// Configure multer for file uploads (store temporarily in memory)
const upload = multer({ dest: 'uploads/temp/', limits: { fileSize: 10 * 1024 * 1024 } }); // 10MB limit

// Teacher: generate quiz (supports JSON or multipart form-data)
router.post(
  '/generate-quiz',
  protect,
  authRole(['teacher']),
  upload.single('file'),
  generateQuiz
);

// Student endpoints (unchanged)
router.get('/daily-challenge', protect, getTodaysChallenge);
router.post('/daily-challenge/submit', protect, submitChallenge);

module.exports = router;