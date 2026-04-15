// Portfolio Backend - My personal server
require('dotenv').config();

const express = require('express');
const cors    = require('cors');
const path    = require('path');

const app = express();

// Middleware setup
app.use(cors()); // Allow frontend to talk to backend
app.use(express.json()); // Parse JSON bodies

// Serve frontend files
const FRONTEND = path.resolve(__dirname, '..', 'frontend');
console.log('Frontend path:', FRONTEND);
app.use(express.static(FRONTEND));

// API routes - my portfolio endpoints
app.use('/api/auth',     require('./routes/auth'));     // Login/logout
app.use('/api/projects', require('./routes/projects')); // Portfolio projects
app.use('/api/contact',  require('./routes/contact'));  // Contact form
app.use('/api/tasks',    require('./routes/tasks'));    // Task management

// Admin panel routes
app.get('/admin', (_req, res) => res.sendFile(path.join(FRONTEND, 'admin.html')));
app.get('/panel', (_req, res) => res.sendFile(path.join(FRONTEND, 'panel.html')));

// Catch all - serve the main portfolio
app.get('*', (_req, res) => res.sendFile(path.join(FRONTEND, 'index.html')));

// Start server if running directly
if (require.main === module) {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`\n Portfolio server running!`);
    console.log(` Local:   http://localhost:${PORT}`);
    console.log(` Ready to receive requests! \n`);
  });
}

module.exports = app;
