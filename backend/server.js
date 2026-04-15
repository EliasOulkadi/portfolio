// Portfolio Backend - Full Stack Application
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// Middleware configuration
app.use(cors()); // Enable cross-origin requests
app.use(express.json()); // Parse JSON request bodies

// Serve static frontend files
const FRONTEND = path.resolve(__dirname, '..', 'frontend');
console.log('Frontend directory:', FRONTEND);
app.use(express.static(FRONTEND));

// API routes - portfolio endpoints
app.use('/api/auth',     require('./routes/auth'));     // Authentication
app.use('/api/projects', require('./routes/projects')); // Project management
app.use('/api/contact',  require('./routes/contact'));  // Contact form
app.use('/api/tasks',    require('./routes/tasks'));    // Task system

// Admin panel routes
app.get('/admin', (_req, res) => res.sendFile(path.join(FRONTEND, 'admin.html')));
app.get('/panel', (_req, res) => res.sendFile(path.join(FRONTEND, 'panel.html')));

// Catch all route - serve main portfolio
app.get('*', (_req, res) => res.sendFile(path.join(FRONTEND, 'index.html')));

// Start server when run directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n Portfolio server started successfully!`);
    console.log(` Local:   http://localhost:${PORT}`);
    console.log(` Ready to handle requests! \n`);
  });
}

module.exports = app;
