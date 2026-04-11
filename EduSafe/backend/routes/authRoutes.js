const express = require('express');
const {
  registerUser,
  registerTenant,
  loginUser,
  getUserProfile,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user (director, teacher, student, parent)
 * @access  Public
 */
router.post('/register', registerUser);

/**
 * @route   POST /api/auth/register-tenant
 * @desc    Register a new tenant (school/institute)
 * @access  Public
 */
router.post('/register-tenant', registerTenant);

/**
 * @route   POST /api/auth/login
 * @desc    Authenticate user & get token
 * @access  Public
 */
router.post('/login', loginUser);

/**
 * @route   GET /api/auth/profile
 * @desc    Get logged in user profile
 * @access  Private
 */
router.get('/profile', protect, getUserProfile);

module.exports = router;
