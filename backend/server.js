// MEDICINE DELIVERY APP - MAIN SERVER
// This is the heart of our backend that coordinates everything

// ==============================================
// IMPORT REQUIRED PACKAGES
// ==============================================

const express = require('express');           // Web server framework
const cors = require('cors');                 // Allows frontend/backend communication
const path = require('path');                 // File path utilities
const { db, initializeDatabase } = require('./database');  // Our database connection

// Show startup message
console.log('🚀 Starting Medicine Delivery App Server...');

// ==============================================
// CREATE EXPRESS APPLICATION
// ==============================================

// Create the Express app (our server instance)
const app = express();

// Set the port number (like a door number for our server)
const PORT = 3000;

console.log('📱 Server instance created');

// ==============================================
// MIDDLEWARE SETUP
// ==============================================
// Middleware = Security guards that process requests before they reach our main code

console.log('🛡️ Setting up security middleware...');

// Enable CORS - allows our frontend to communicate with backend
// Without this, browsers block cross-origin requests for security
app.use(cors());

// Parse JSON data - converts JSON strings to JavaScript objects
// Essential for handling API requests with JSON payloads
app.use(express.json());

// Parse URL-encoded data - handles form submissions
// Allows processing of HTML forms and URL parameters
app.use(express.urlencoded({ extended: true }));

// Serve static files - makes our HTML/CSS/JS files available to browsers
// When someone visits our website, they get files from the frontend folder
const staticPath = path.join(__dirname, '../frontend');
app.use(express.static(staticPath));

console.log('✅ Middleware configured successfully');
console.log('📁 Static files will be served from:', staticPath);

// ==============================================
// DATABASE INITIALIZATION
// ==============================================

console.log('📦 Initializing database...');

// Initialize our database (create tables, add sample data)
initializeDatabase()
    .then(() => {
        console.log('✅ Database initialized successfully!');
        console.log('🏥 All tables created: users, medicines, orders, order_items, reminders');
        console.log('💊 Sample medicines added to catalog');
    })
    .catch((err) => {
        console.error('❌ Database initialization failed:', err);
        console.log('💡 Make sure database folder and schema.sql file exist');
        console.log('💡 Check that schema.sql contains valid SQL commands');
    });

// ==============================================
// API ROUTES SETUP
// ==============================================

console.log('🛣️ Setting up API routes...');

// Uncomment these lines one by one to debug which causes the error

const authRoutes = require('./routes/auth.js');           // Handles login/register
const medicineRoutes = require('./routes/medicines');  // Handles medicine catalog

app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);

console.log('✅ API routes configuration pending: temporarily commented for debugging.');

// ==============================================
// DEFAULT ROUTE (HOMEPAGE)
// ==============================================

// When someone visits the root URL (http://localhost:3000), send them our main HTML file
app.get('/', (req, res) => {
    console.log('👤 Someone visited the homepage');
    const htmlPath = path.join(__dirname, '../frontend/index.html');
    res.sendFile(htmlPath);
});

// ==============================================
// ERROR HANDLING MIDDLEWARE
// ==============================================

// 404 handler (use next to avoid "missing param" error)
app.use(function (req, res, next) {
  res.status(404).json({
    message: 'Page not found',
    requestedUrl: req.originalUrl
  });
});

// Handle general server errors
app.use((err, req, res, next) => {
    console.error('💥 Server error occurred:', err);
    res.status(500).json({ 
        message: 'Internal server error',
        error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
});

// ==============================================
// START THE SERVER
// ==============================================

// Start listening for requests
app.listen(PORT, () => {
    console.log('🎉 Server is now running successfully!');
    console.log(`🌐 Your app is available at: http://localhost:${PORT}`);
    console.log('💡 Press Ctrl+C to stop the server');
    console.log('📱 Server is ready to handle user requests!');
    console.log('🔥 Backend server fully operational!');
});

// Export the app (useful for testing)
module.exports = app;

// Show that server file has loaded
console.log('📄 Main server file loaded successfully');
