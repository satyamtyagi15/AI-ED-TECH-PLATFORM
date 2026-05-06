const Drill = require('../models/Drill');

// @desc    Get all drills for a tenant
// @route   GET /api/drills
// @access  Private
const getDrills = async (req, res) => {
  try {
    const { tenantId } = req.user;
    const drills = await Drill.find({ tenantId })
      .populate('createdBy', 'firstName lastName')
      .populate('participants', 'firstName lastName')
      .sort({ scheduledDate: 1 });
    
    res.json(drills);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Create a new drill
// @route   POST /api/drills
// @access  Private (Teacher only)
const createDrill = async (req, res) => {
  try {
    const { title, description, scheduledDate, participants } = req.body;
    const { _id: createdBy, tenantId } = req.user;

    const drill = await Drill.create({
      title,
      description,
      scheduledDate,
      participants,
      tenantId,
      createdBy,
      status: 'PENDING'
    });

    const populatedDrill = await Drill.findById(drill._id)
      .populate('createdBy', 'firstName lastName')
      .populate('participants', 'firstName lastName');

    res.status(201).json(populatedDrill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Update drill status
// @route   PUT /api/drills/:id/status
// @access  Private (Teacher only)
const updateDrillStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, feedback } = req.body;

    const allowedStatuses = ['PENDING', 'COMPLETED'];
    if (!allowedStatuses.includes(status)) {
      return res.status(400).json({ 
        message: `Invalid status. Allowed values: ${allowedStatuses.join(', ')}` 
      });
    }

    const drill = await Drill.findByIdAndUpdate(
      id,
      { status, feedback },
      { new: true }
    )
      .populate('createdBy', 'firstName lastName')
      .populate('participants', 'firstName lastName');

    if (!drill) {
      return res.status(404).json({ message: 'Drill not found' });
    }

    res.json(drill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Delete a drill
// @route   DELETE /api/drills/:id
// @access  Private (Teacher only)
const deleteDrill = async (req, res) => {
  try {
    const { id } = req.params;
    const drill = await Drill.findByIdAndDelete(id);

    if (!drill) {
      return res.status(404).json({ message: 'Drill not found' });
    }

    res.json({ message: 'Drill deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// @desc    Student participates in a drill
// @route   POST /api/drills/:id/participate
// @access  Private (Student)
const participateDrill = async (req, res) => {
  try {
    const { id } = req.params;
    const { studentId } = req.body;
    const userId = req.user._id;

    if (studentId !== userId.toString()) {
      return res.status(403).json({ message: 'You can only participate on your own behalf' });
    }

    const drill = await Drill.findById(id);
    if (!drill) {
      return res.status(404).json({ message: 'Drill not found' });
    }

    if (drill.participants.includes(studentId)) {
      return res.status(400).json({ message: 'Already participating in this drill' });
    }

    drill.participants.push(studentId);
    await drill.save();

    const updatedDrill = await Drill.findById(id)
      .populate('createdBy', 'firstName lastName')
      .populate('participants', 'firstName lastName');

    res.json(updatedDrill);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getDrills, createDrill, updateDrillStatus, deleteDrill, participateDrill };