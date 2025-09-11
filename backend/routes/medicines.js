// MEDICINE ROUTES - Medicine Catalog Management
// This file handles all medicine-related requests

// ==============================================
// IMPORT REQUIRED PACKAGES
// ==============================================

const express = require('express');
const { db } = require('../database');

// Create router for medicine-related routes
const router = express.Router();

console.log('💊 Medicine management system loaded');

// ==============================================
// GET ALL MEDICINES ROUTE
// ==============================================

// Handle GET requests to /api/medicines
router.get('/', (req, res) => {
    console.log('📋 Client requesting all available medicines');
    
    // SQL query to get all medicines that are in stock
    // ORDER BY name = alphabetical sorting for better user experience
    const query = 'SELECT * FROM medicines WHERE stock_quantity > 0 ORDER BY name ASC';
    
    // Execute the query
    db.all(query, (err, medicines) => {
        if (err) {
            console.error('❌ Error fetching medicines from database:', err);
            return res.status(500).json({ 
                message: 'Failed to load medicines. Please try again later.' 
            });
        }
        
        console.log(`✅ Successfully retrieved ${medicines.length} medicines from catalog`);
        
        // Log medicine details for debugging
        medicines.forEach(medicine => {
            console.log(`   💊 ${medicine.name} - ₹${medicine.price} (Stock: ${medicine.stock_quantity})`);
        });
        
        // Send the medicines data back as JSON
        res.json(medicines);
    });
});

// ==============================================
// SEARCH MEDICINES ROUTE  
// ==============================================

// Handle GET requests to /api/medicines/search?query=searchterm
router.get('/search', (req, res) => {
    // Extract the search query from URL parameters
    const { query } = req.query;
    
    console.log('🔍 Client searching for medicines with query:', query);
    
    // Validate search query
    if (!query || query.trim().length < 1) {
        return res.status(400).json({ 
            message: 'Search query is required and must be at least 1 character long' 
        });
    }
    
    // SQL query to search in multiple columns
    // LIKE operator with wildcards allows partial matching
    // % means "any characters" so %para% matches "Paracetamol"
    const searchQuery = `
        SELECT * FROM medicines 
        WHERE (
            name LIKE ? OR 
            generic_name LIKE ? OR 
            category LIKE ? OR
            manufacturer LIKE ?
        ) 
        AND stock_quantity > 0
        ORDER BY name ASC
    `;
    
    // Create search term with wildcards for flexible matching
    const searchTerm = `%${query.trim()}%`;
    
    // Execute search query (same search term used for all columns)
    db.all(searchQuery, [searchTerm, searchTerm, searchTerm, searchTerm], (err, medicines) => {
        if (err) {
            console.error('❌ Error searching medicines:', err);
            return res.status(500).json({ 
                message: 'Search failed due to database error. Please try again.' 
            });
        }
        
        console.log(`✅ Search completed: found ${medicines.length} medicines matching "${query}"`);
        
        // Log search results for debugging
        if (medicines.length > 0) {
            console.log('   Search results:');
            medicines.forEach(medicine => {
                console.log(`   💊 ${medicine.name} - ₹${medicine.price}`);
            });
        } else {
            console.log('   No medicines found matching the search criteria');
        }
        
        res.json(medicines);
    });
});

// ==============================================
// GET SINGLE MEDICINE ROUTE
// ==============================================

// Handle GET requests to /api/medicines/:id (where :id is the medicine ID)
router.get('/:id', (req, res) => {
    // Extract the ID from the URL parameters
    const { id } = req.params;
    
    console.log('🔍 Client requesting details for medicine ID:', id);
    
    // Validate the ID
    if (!id || isNaN(id)) {
        return res.status(400).json({ 
            message: 'Valid medicine ID is required' 
        });
    }
    
    // Find medicine by ID
    db.get('SELECT * FROM medicines WHERE medicine_id = ?', [id], (err, medicine) => {
        if (err) {
            console.error('❌ Error fetching medicine details:', err);
            return res.status(500).json({ 
                message: 'Failed to load medicine details. Please try again.' 
            });
        }
        
        // If no medicine found with this ID
        if (!medicine) {
            console.log('❌ Medicine not found with ID:', id);
            return res.status(404).json({ 
                message: 'Medicine not found. It may have been discontinued or the ID is incorrect.' 
            });
        }
        
        console.log('✅ Medicine details found:', medicine.name);
        console.log(`   💊 ${medicine.name} - ₹${medicine.price}`);
        console.log(`   📦 Stock: ${medicine.stock_quantity} | Category: ${medicine.category}`);
        
        res.json(medicine);
    });
});

// ==============================================
// EXPORT THE ROUTER
// ==============================================

// Make this router available to other files (specifically server.js)
module.exports = router;

console.log('✅ Medicine routes configured successfully');
console.log('   📍 GET /api/medicines - Get all medicines');
console.log('   📍 GET /api/medicines/search?query=term - Search medicines');
console.log('   📍 GET /api/medicines/:id - Get single medicine details');
