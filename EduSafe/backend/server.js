const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const connectDB = require('./config/db');

// Load env vars
dotenv.config({ path: path.resolve(__dirname, '../.env') });

// Connect DB
connectDB();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ✅ Serve everything inside /uploads (including /resources subfolder)
// Serve /uploads and all its subfolders
app.use('/uploads', express.static(path.resolve(__dirname, '../uploads')));

app.use('/uploads/resources', express.static(path.join(__dirname, 'uploads/resources')));

// Routes
app.use('/api/auth', require('./routes/authRoutes'));
app.use('/api/users', require('./routes/userRoutes'));

// --- MINIMAL ADDITION: mount the same users router at /user so old requests still work
// This lets POST http://localhost:5000/user hit the same handlers as /api/users
app.use('/user', require('./routes/userRoutes'));

// other existing routes
app.use('/api/resources', require('./routes/resourceRoutes'));
app.use('/api/messages', require('./routes/messageRoutes'));
app.use('/api/quizzes', require('./routes/quizRoutes'));
app.use('/api/drills', require('./routes/drillRoutes'));
app.use('/api/alerts', require('./routes/alertRoutes'));
app.use('/api/progress', require('./routes/progressRoutes'));
app.use('/api/tenants', require('./routes/tenantRoutes'));
app.use('/api/teachers', require('./routes/teacherRoutes'));
app.use('/api/students', require('./routes/studentRoutes'));
app.use('/api/parents', require('./routes/parentRoutes'));
app.use('/api/director', require('./routes/directorRoutes'));
// Base route
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EduSafe API is running...',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: 'Something went wrong!',
    error: process.env.NODE_ENV === 'production' ? {} : err.message
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`🌐 Environment: ${process.env.NODE_ENV || 'development'}`);
});
