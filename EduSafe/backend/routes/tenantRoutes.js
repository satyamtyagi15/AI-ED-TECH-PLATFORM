const express = require('express');
const { body, validationResult } = require('express-validator');
const router = express.Router();
const Tenant = require('../models/Tenant');

// ===============================
// Create Tenant
// ===============================
router.post(
  '/',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('address').notEmpty().withMessage('Address is required'),
    body('contactEmail').isEmail().withMessage('Valid email is required'),
    body('contactPhone')
      .isLength({ min: 10, max: 15 })
      .withMessage('Contact phone must be between 10–15 digits')
      .matches(/^[0-9]+$/)
      .withMessage('Contact phone must contain only numbers'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, address, contactEmail, contactPhone, isActive } = req.body;

      const tenant = new Tenant({
        name,
        address,
        contactEmail,
        contactPhone,
        isActive: isActive ?? true, // default true if not provided
      });

      await tenant.save();
      res.status(201).json(tenant);
    } catch (error) {
      res.status(500).json({ message: 'Error creating tenant', error: error.message });
    }
  }
);

// ===============================
// Get all Tenants
// ===============================
router.get('/', async (req, res) => {
  try {
    const tenants = await Tenant.find();
    res.json(tenants);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenants', error: error.message });
  }
});

// ===============================
// Get Tenant by ID
// ===============================
router.get('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findById(req.params.id);
    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }
    res.json(tenant);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching tenant', error: error.message });
  }
});

// ===============================
// Update Tenant by ID
// ===============================
router.put(
  '/:id',
  [
    body('name').optional().notEmpty().withMessage('Name cannot be empty'),
    body('address').optional().notEmpty().withMessage('Address cannot be empty'),
    body('contactEmail').optional().isEmail().withMessage('Valid email is required'),
    body('contactPhone')
      .optional()
      .isLength({ min: 10, max: 15 })
      .withMessage('Contact phone must be between 10–15 digits')
      .matches(/^[0-9]+$/)
      .withMessage('Contact phone must contain only numbers'),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { name, address, contactEmail, contactPhone, isActive } = req.body;

      const tenant = await Tenant.findByIdAndUpdate(
        req.params.id,
        { name, address, contactEmail, contactPhone, isActive },
        { new: true, runValidators: true }
      );

      if (!tenant) {
        return res.status(404).json({ message: 'Tenant not found' });
      }

      res.json(tenant);
    } catch (error) {
      res.status(500).json({ message: 'Error updating tenant', error: error.message });
    }
  }
);

// ===============================
// Delete Tenant by ID
// ===============================
router.delete('/:id', async (req, res) => {
  try {
    const tenant = await Tenant.findByIdAndDelete(req.params.id);

    if (!tenant) {
      return res.status(404).json({ message: 'Tenant not found' });
    }

    res.json({ message: 'Tenant deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting tenant', error: error.message });
  }
});

module.exports = router;
