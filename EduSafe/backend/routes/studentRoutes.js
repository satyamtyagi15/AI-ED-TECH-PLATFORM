const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { 
  getStudentDetails,
  getStudentQuizSubmissions,
  getStudentCompletedResources,
  getStudentEmergencyContacts 
} = require('../controllers/studentController');

const router = express.Router();

router.get('/:id', protect, getStudentDetails);
router.get('/:id/quiz-submissions', protect, getStudentQuizSubmissions);
router.get('/:id/completed-resources', protect, getStudentCompletedResources);
router.get('/:id/emergency-contacts', protect, getStudentEmergencyContacts);

module.exports = router;