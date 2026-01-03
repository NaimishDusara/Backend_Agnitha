// const express = require('express');
// const cors = require('cors');
// const path = require('path');
// require('dotenv').config();

// const connectDB = require('./config/db');
// const pasteRoutes = require('./routes/paste');

// const app = express();
// const PORT = process.env.PORT || 3000;

// connectDB();

// // Middleware
// app.use(cors());
// app.use(express.json());
// app.use(express.urlencoded({ extended: true }));

// // Routes
// app.use('/', pasteRoutes);

// // 404 handler
// app.use((req, res) => {
//   res.status(404).json({ 
//     error: 'Route not found' 
//   });
// });

// // Error handler
// app.use((err, req, res, next) => {
//   console.error('Server error:', err);
//   res.status(500).json({ 
//     error: 'Internal server error' 
//   });
// });

// // Start server
// app.listen(PORT, () => {
//   console.log(`Server running on port ${PORT}`);
// });



const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

const connectDB = require('./config/db');
const pasteRoutes = require('./routes/pasteRoutes');

const app = express();
const PORT = process.env.PORT || 5000;

// Connect to MongoDB
connectDB();

// Trust proxy for Railway
app.set('trust proxy', 1);

// Middleware
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log all incoming requests for debugging
app.use((req, res, next) => {
  console.log(`${req.method} ${req.url}`);
  next();
});

// Routes
app.use('/', pasteRoutes);

// Root route for Railway health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'PasteBin Lite API',
    status: 'running',
    endpoints: {
      health: '/api/healthz',
      createPaste: 'POST /api/pastes',
      getPaste: 'GET /api/pastes/:id',
      viewPaste: 'GET /p/:id'
    }
  });
});

// 404 handler
app.use((req, res) => {
  console.log('404 - Route not found:', req.url);
  res.status(404).json({ 
    error: 'Route not found',
    url: req.url
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
});