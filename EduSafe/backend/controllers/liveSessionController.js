const LiveSession = require('../models/LiveSession');
const { AccessToken, RoomServiceClient } = require('livekit-server-sdk');

// Lazy‑initialize the RoomServiceClient only when needed
let roomService = null;

const getRoomService = () => {
  const url = process.env.LIVEKIT_URL;
  const apiKey = process.env.LIVEKIT_API_KEY;
  const apiSecret = process.env.LIVEKIT_API_SECRET;

  if (!url || !apiKey || !apiSecret) {
    throw new Error('Missing LiveKit environment variables. Check LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET');
  }

  if (!roomService) {
    roomService = new RoomServiceClient(url, apiKey, apiSecret);
  }
  return roomService;
};

// Create a new live session
exports.createSession = async (req, res) => {
  try {
    const { title, description } = req.body;
    const roomName = `edusafe-${req.user.tenantId}-${Date.now()}`;

    await getRoomService().createRoom({
      name: roomName,
      emptyTimeout: 10 * 60,
      maxParticipants: 50,
    });

    const session = await LiveSession.create({
      teacherId: req.user._id,
      tenantId: req.user.tenantId,
      title,
      description,
      roomName,
    });

    res.status(201).json({ success: true, session });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get token to join a session
exports.getJoinToken = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });

    const at = new AccessToken(
      process.env.LIVEKIT_API_KEY,
      process.env.LIVEKIT_API_SECRET,
      {
        identity: req.user._id.toString(),
        name: `${req.user.firstName} ${req.user.lastName}`,
        metadata: JSON.stringify({ role: req.user.role })
      }
    );
    at.addGrant({ roomJoin: true, room: session.roomName });

    const token = await at.toJwt();

    if (req.user.role === 'teacher' && session.status === 'scheduled') {
      session.status = 'active';
      session.startedAt = new Date();
      await session.save();
    }

    res.json({ success: true, token, roomName: session.roomName, sessionTitle: session.title });
  } catch (error) {
    console.error('Join token error:', error);
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get active sessions for a tenant (students)
exports.getActiveSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find({
      tenantId: req.user.tenantId,
      status: 'active'
    }).populate('teacherId', 'firstName lastName');
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get teacher's own sessions
exports.getTeacherSessions = async (req, res) => {
  try {
    const sessions = await LiveSession.find({ teacherId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, sessions });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// End a session (teacher only) – also deletes the room in LiveKit
exports.endSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.sessionId);
    if (!session || session.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    session.status = 'ended';
    session.endedAt = new Date();
    await session.save();

    // Delete the room in LiveKit to kick all participants
    try {
      await getRoomService().deleteRoom(session.roomName);
    } catch (err) {
      console.warn('Could not delete LiveKit room:', err.message);
    }

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete a session permanently (teacher only)
exports.deleteSession = async (req, res) => {
  try {
    const session = await LiveSession.findById(req.params.sessionId);
    if (!session) return res.status(404).json({ success: false, message: 'Session not found' });
    if (session.teacherId.toString() !== req.user._id.toString())
      return res.status(403).json({ success: false, message: 'Not authorized' });

    // Delete the room from LiveKit if it still exists
    try {
      await getRoomService().deleteRoom(session.roomName);
    } catch (err) {
      console.warn('Could not delete LiveKit room (maybe already deleted):', err.message);
    }

    await session.deleteOne();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};