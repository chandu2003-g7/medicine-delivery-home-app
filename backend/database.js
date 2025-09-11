// MEDICINE DELIVERY APP - DATABASE CONNECTION
// This file connects our app to the SQLite database

// Import required modules
const sqlite3 = require('sqlite3').verbose();  // SQLite database library
const path = require('path');                  // File path utilities

// Create the path to our database file
// __dirname = current folder (backend)
// '../database/' = go up one level, then into database folder
// 'medicine_app.db' = our database file name
const dbPath = path.join(__dirname, '../database/medicine_app.db');

// Show where the database file will be created (helpful for debugging)
console.log('💾 Database will be created at:', dbPath);

// Create the database connection
// If the file doesn't exist, SQLite will create it automatically
const db = new sqlite3.Database(dbPath, (err) => {
    if (err) {
        // If something goes wrong, show the error
        console.error('❌ Error opening database:', err.message);
    } else {
        // If successful, show success message
        console.log('✅ Connected to SQLite database successfully');
    }
});

// Function to initialize database (create tables and add sample data)
function initializeDatabase() {
    // Return a Promise - handles tasks that take time (like reading files)
    return new Promise((resolve, reject) => {
        // Import file system module to read files
        const fs = require('fs');
        
        // Create path to our schema.sql file
        const schemaPath = path.join(__dirname, '../database/schema.sql');
        
        console.log('📖 Reading database schema from:', schemaPath);
        
        // Read the schema.sql file
        fs.readFile(schemaPath, 'utf8', (err, sql) => {
            if (err) {
                console.error('❌ Error reading schema file:', err);
                reject(err);  // Something went wrong with file reading
                return;
            }
            
            console.log('⚡ Executing database schema...');
            
            // Execute all SQL commands from our schema file
            // This creates all tables and adds sample data
            db.exec(sql, (err) => {
                if (err) {
                    console.error('❌ Error executing schema:', err);
                    reject(err);  // Something went wrong with SQL execution
                } else {
                    console.log('✅ Database initialized successfully!');
                    console.log('🏥 Created tables: users, medicines, orders, order_items, medication_reminders');
                    console.log('💊 Added 8 sample medicines to catalog');
                    resolve();  // Everything worked perfectly!
                }
            });
        });
    });
}

// Export the database connection and initialization function
// This makes them available to other files in our project
module.exports = { 
    db,                    // The database connection
    initializeDatabase     // Function to set up the database
};

// Show that this file has loaded successfully
console.log('🔗 Database connection module loaded');
