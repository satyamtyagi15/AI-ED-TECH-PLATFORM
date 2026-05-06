const express = require('express');
const { getDrills, createDrill, updateDrillStatus, deleteDrill, participateDrill } = require('../controllers/drillController');
const { protect } = require('../middleware/authMiddleware');
const { authRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.route('/')
  .get(protect, getDrills)
  .post(protect, authRole(['teacher']), createDrill);

router.put('/:id/status', protect, authRole(['teacher']), updateDrillStatus);
router.delete('/:id', protect, authRole(['teacher']), deleteDrill);

// New route for student participation (any logged-in user)
router.post('/:id/participate', protect, participateDrill);

module.exports = router;