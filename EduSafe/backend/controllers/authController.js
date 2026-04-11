const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Tenant = require("../models/Tenant");

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "30d" });
};

// @desc    Register a new user
// @route   POST /api/auth/register
// @access  Public
const registerUser = async (req, res) => {
  try {
    const {
      firstName,
      lastName,
      email,
      password,
      role,
      tenantId,
      studentId,
      grade,
    } = req.body;

    // Basic validation
    if (!firstName || !lastName || !email || !password || !role || !tenantId) {
      return res.status(400).json({ message: "All required fields must be provided" });
    }

    // Check if user exists
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Check if tenant exists
    const tenant = await Tenant.findById(tenantId);
    if (!tenant) {
      return res.status(400).json({ message: "Tenant not found" });
    }

    // Extra validations for role-specific fields
    if (role === "student" && !grade) {
      return res.status(400).json({ message: "Grade is required for students" });
    }
    if (role === "parent" && !studentId) {
      return res.status(400).json({ message: "studentId is required for parents" });
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password, // password hashing handled in User model (pre-save hook)
      role,
      tenantId,
      studentId: role === "parent" ? studentId : null,
      grade: role === "student" ? grade : null,
    });

    res.status(201).json({
      _id: user._id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      role: user.role,
      tenantId: user.tenantId,
      token: generateToken(user._id),
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Register a new tenant (institute)
// @route   POST /api/auth/register-tenant
// @access  Public
const registerTenant = async (req, res) => {
  try {
    const {
      name,
      address,
      contactEmail,
      contactPhone,
      emergencyContacts,
      userData,
    } = req.body;

    if (!name || !contactEmail || !userData) {
      return res.status(400).json({ message: "Tenant name, contactEmail, and director userData are required" });
    }

    // Check if tenant exists
    const tenantExists = await Tenant.findOne({ name });
    if (tenantExists) {
      return res.status(400).json({ message: "Tenant already exists" });
    }

    // Create tenant
    const tenant = await Tenant.create({
      name,
      address,
      contactEmail,
      contactPhone,
      emergencyContacts,
    });

    // Create director user
    const user = await User.create({
      ...userData,
      tenantId: tenant._id,
      role: "director",
    });

    res.status(201).json({
      tenant,
      user: {
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        token: generateToken(user._id),
      },
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Auth user & get token
// @route   POST /api/auth/login
// @access  Public
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).populate("tenantId");

    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role,
        tenantId: user.tenantId,
        tenant: user.tenantId,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Get user profile
// @route   GET /api/auth/profile
// @access  Private
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("tenantId");

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ message: "User not found" });
    }
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { registerUser, registerTenant, loginUser, getUserProfile };
