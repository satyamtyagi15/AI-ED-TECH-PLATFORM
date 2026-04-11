// backend/routes/userRoutes.js
const express = require('express');
const User = require('../models/User');
const { getUsersByRole, getUserById } = require('../controllers/userController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * POST /user or /api/users
 * Create a new user (minimal validation).
 * Note: this route is intentionally NOT protected so you can create users
 * (signup / seed). The User model will hash the password in pre-save.
 */
router.post('/', async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      tenantId,
      phone,
      grade,
      studentId,
      school
    } = req.body;

    // Basic required field check (adjust to your needs)
    if (!firstName || !lastName || !email || !password || !role || !tenantId) {
      return res.status(400).json({
        success: false,
        message: 'Missing required fields: firstName, lastName, email, password, role, tenantId'
      });
    }

    // Prevent duplicate email
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) {
      return res.status(409).json({ success: false, message: 'Email already in use' });
    }

    const user = await User.create({
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      tenantId,
      phone,
      grade,
      studentId,
      school
    });

    // Remove password before sending response
    const userObj = user.toObject();
    delete userObj.password;

    return res.status(201).json({ success: true, user: userObj });
  } catch (err) {
    console.error('POST /user error:', err);

    // Handle mongoose validation errors or other DB errors
    if (err.name === 'ValidationError') {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({ success: false, message: messages.join(', ') });
    }

    return res.status(500).json({ success: false, message: 'Server error' });
  }
});

// existing protected GET routes (left unchanged)
router.get('/', protect, getUsersByRole);
router.get('/:id', protect, getUserById);

module.exports = router;
