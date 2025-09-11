// AUTHENTICATION ROUTES - User Registration and Login
// This file handles all user account operations

// ==============================================
// IMPORT REQUIRED PACKAGES
// ==============================================

const express = require('express');
const bcrypt = require('bcrypt');              // For password hashing
const jwt = require('jsonwebtoken');           // For creating login tokens
const { db } = require('../database');         // Our database connection

// Create router (like a mini Express app for specific routes)
const router = express.Router();

// Secret key for creating JWT tokens (in production, use environment variables)
const JWT_SECRET = 'medicine-app-secret-key-2025';

console.log('🔐 Authentication system loaded');

// ==============================================
// USER REGISTRATION ROUTE
// ==============================================

// Handle POST requests to /api/auth/register
router.post('/register', async (req, res) => {
    console.log('📝 New user attempting registration:', req.body.email);
    
    try {
        // Extract user data from request body
        const { 
            firstName, lastName, email, password, 
            phone, address, city, state, pincode 
        } = req.body;
        
        // Basic validation
        if (!firstName || !lastName || !email || !password) {
            return res.status(400).json({ 
                message: 'First name, last name, email, and password are required' 
            });
        }
        
        if (password.length < 6) {
            return res.status(400).json({ 
                message: 'Password must be at least 6 characters long' 
            });
        }
        
        // Check if user already exists with this email
        db.get('SELECT email FROM users WHERE email = ?', [email], async (err, existingUser) => {
            if (err) {
                console.error('❌ Database error during registration:', err);
                return res.status(500).json({ message: 'Database error occurred' });
            }
            
            // If we found a user with this email, they already exist
            if (existingUser) {
                console.log('❌ Registration failed: Email already in use -', email);
                return res.status(400).json({ 
                    message: 'An account with this email already exists. Please use a different email or try logging in.' 
                });
            }
            
            try {
                // Hash the password for security
                // Salt rounds = 10 (higher = more secure but slower)
                console.log('🔒 Hashing password for security...');
                const hashedPassword = await bcrypt.hash(password, 10);
                
                // Insert new user into database
                const insertQuery = `
                    INSERT INTO users (
                        first_name, last_name, email, password_hash, 
                        phone, address, city, state, pincode
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
                `;
                
                db.run(insertQuery, [
                    firstName, lastName, email, hashedPassword,
                    phone, address, city, state, pincode
                ], function(err) {
                    if (err) {
                        console.error('❌ Error creating user account:', err);
                        return res.status(500).json({ 
                            message: 'Failed to create account. Please try again.' 
                        });
                    }
                    
                    console.log('✅ New user registered successfully! User ID:', this.lastID);
                    console.log('👤 User details:', { firstName, lastName, email });
                    
                    res.status(201).json({ 
                        message: 'Account created successfully! You can now login with your credentials.',
                        userId: this.lastID
                    });
                });
                
            } catch (hashError) {
                console.error('❌ Password hashing error:', hashError);
                res.status(500).json({ 
                    message: 'Account creation failed due to security processing error' 
                });
            }
        });
        
    } catch (error) {
        console.error('❌ Registration error:', error);
        res.status(500).json({ 
            message: 'Server error during registration. Please try again later.' 
        });
    }
});

// ==============================================
// USER LOGIN ROUTE
// ==============================================

// Handle POST requests to /api/auth/login
router.post('/login', (req, res) => {
    console.log('🔑 User attempting login:', req.body.email);
    
    try {
        const { email, password } = req.body;
        
        // Basic validation
        if (!email || !password) {
            return res.status(400).json({ 
                message: 'Email and password are required' 
            });
        }
        
        // Find user in database by email
        db.get('SELECT * FROM users WHERE email = ?', [email], async (err, user) => {
            if (err) {
                console.error('❌ Database error during login:', err);
                return res.status(500).json({ message: 'Database error occurred' });
            }
            
            // If no user found with this email
            if (!user) {
                console.log('❌ Login failed: No user found with email -', email);
                return res.status(400).json({ 
                    message: 'Invalid email or password. Please check your credentials and try again.' 
                });
            }
            
            try {
                // Compare provided password with hashed password in database
                console.log('🔍 Verifying password...');
                const isValidPassword = await bcrypt.compare(password, user.password_hash);
                
                if (!isValidPassword) {
                    console.log('❌ Login failed: Wrong password for user -', email);
                    return res.status(400).json({ 
                        message: 'Invalid email or password. Please check your credentials and try again.' 
                    });
                }
                
                // Create JWT token for this user session
                // This token proves the user is authenticated
                console.log('🎫 Creating authentication token...');
                const token = jwt.sign(
                    { 
                        userId: user.user_id, 
                        email: user.email 
                    },  // Payload (data to include in token)
                    JWT_SECRET,  // Secret key
                    { expiresIn: '24h' }  // Token expires in 24 hours
                );
                
                console.log('✅ Login successful for user:', user.email);
                console.log('👤 User ID:', user.user_id, '| Name:', user.first_name, user.last_name);
                
                // Send back success response with token and user info
                res.json({
                    message: 'Login successful! Welcome back!',
                    token,  // Frontend will store this token
                    user: {  // User info (without sensitive data)
                        id: user.user_id,
                        firstName: user.first_name,
                        lastName: user.last_name,
                        email: user.email,
                        phone: user.phone,
                        city: user.city
                    }
                });
                
            } catch (compareError) {
                console.error('❌ Password comparison error:', compareError);
                res.status(500).json({ message: 'Authentication processing failed' });
            }
        });
        
    } catch (error) {
        console.error('❌ Login error:', error);
        res.status(500).json({ 
            message: 'Server error during login. Please try again later.' 
        });
    }
});

// ==============================================
// EXPORT THE ROUTER
// ==============================================

// Make this router available to other files (specifically server.js)
module.exports = router;

console.log('✅ Authentication routes configured successfully');
