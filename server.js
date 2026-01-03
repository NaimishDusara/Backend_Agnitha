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
require('dotenv').config();

const app = express();
// Railway uses PORT from environment, fallback to 8080
const PORT = process.env.PORT || 8080;

// Trust proxy
app.set('trust proxy', 1);

// Middleware - BEFORE routes
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Request logger
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// Simple health check - NO database dependency
app.get('/api/healthz', (req, res) => {
  console.log('Health check called');
  res.status(200).json({ ok: true });
});

// Root route - NO database dependency
app.get('/', (req, res) => {
  console.log('Root route called');
  res.status(200).json({ 
    message: 'PasteBin Lite API',
    status: 'running',
    version: '1.0.0',
    port: PORT,
    endpoints: {
      health: 'GET /api/healthz',
      createPaste: 'POST /api/pastes',
      getPaste: 'GET /api/pastes/:id',
      viewPaste: 'GET /p/:id'
    }
  });
});

// Import database connection
const connectDB = require('./src/config/db');

// Import routes AFTER app is created
let pasteRoutes;
try {
  pasteRoutes = require('./src/routes/paste');
  app.use('/', pasteRoutes);
  console.log('✓ Routes loaded successfully');
} catch (error) {
  console.error('✗ Failed to load routes:', error.message);
}

// 404 handler
app.use((req, res) => {
  console.log(`404: ${req.method} ${req.url}`);
  res.status(404).json({ 
    error: 'Route not found',
    path: req.url
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err.message);
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Internal server error',
    message: process.env.NODE_ENV === 'production' ? 'Something went wrong' : err.message
  });
});

// Start server function
const startServer = async () => {
  try {
    console.log('=================================');
    console.log('Starting PasteBin Lite Server...');
    console.log('=================================');
    
    // Start server on 0.0.0.0 to accept connections from Railway
    const server = app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Server listening on port ${PORT}`);
      console.log(`✓ Server accessible at http://0.0.0.0:${PORT}`);
      console.log(`✓ Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log('=================================');
    });

    // Connect to database in background (non-blocking)
    connectDB()
      .then(() => console.log('✓ Database ready'))
      .catch(err => {
        console.error('✗ Database connection failed:', err.message);
        console.log('⚠ Server will continue running without database');
      });

    // Handle server errors
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`✗ Port ${PORT} is already in use`);
      } else {
        console.error('✗ Server error:', error);
      }
      process.exit(1);
    });

    // Graceful shutdown
    process.on('SIGTERM', () => {
      console.log('SIGTERM received, shutting down gracefully');
      server.close(() => {
        console.log('Server closed');
        process.exit(0);
      });
    });

  } catch (error) {
    console.error('✗ Failed to start server:', error);
    process.exit(1);
  }
};

// Handle uncaught errors
process.on('uncaughtException', (error) => {
  console.error('Uncaught Exception:', error);
});

process.on('unhandledRejection', (error) => {
  console.error('Unhandled Rejection:', error);
});

// Start the server
startServer();