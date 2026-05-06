const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');
const {
  createSession,
  getActiveSessions,
  getTeacherSessions,
  getJoinToken,
  endSession,
  deleteSession 
} = require('../controllers/liveSessionController');

const router = express.Router();

router.post('/', protect, authRole(['teacher']), createSession);
router.get('/teacher', protect, authRole(['teacher']), getTeacherSessions);
router.get('/active', protect, getActiveSessions);
router.get('/:sessionId/token', protect, getJoinToken);
router.put('/:sessionId/end', protect, authRole(['teacher']), endSession);
router.delete('/:sessionId', protect, authRole(['teacher']), deleteSession);

module.exports = router;