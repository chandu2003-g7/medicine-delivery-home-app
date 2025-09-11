-- MEDICINE DELIVERY APP DATABASE SCHEMA
-- This file defines all tables and relationships

-- ========================================
-- USERS TABLE - Customer Accounts
-- ========================================
CREATE TABLE users (
    user_id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-generated ID (1, 2, 3...)
    first_name TEXT NOT NULL,                   -- Required: Customer's first name
    last_name TEXT NOT NULL,                    -- Required: Customer's last name  
    email TEXT UNIQUE NOT NULL,                 -- Required & Unique: Login email
    password_hash TEXT NOT NULL,                -- Required: Encrypted password
    phone TEXT,                                 -- Optional: Phone number
    address TEXT,                               -- Optional: Home address
    city TEXT,                                  -- Optional: City
    state TEXT,                                 -- Optional: State
    pincode TEXT,                               -- Optional: Postal code
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP  -- Auto: When account was created
);

-- ========================================
-- MEDICINES TABLE - Available Products
-- ========================================
CREATE TABLE medicines (
    medicine_id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-generated ID
    name TEXT NOT NULL,                             -- Required: Medicine name
    generic_name TEXT,                              -- Optional: Generic name (e.g., "Paracetamol")
    manufacturer TEXT,                              -- Optional: Company name
    category TEXT,                                  -- Optional: Type (Pain Relief, Antibiotic, etc.)
    description TEXT,                               -- Optional: Detailed description
    price REAL NOT NULL,                            -- Required: Price in rupees
    stock_quantity INTEGER DEFAULT 0,               -- Stock count (default 0)
    prescription_required INTEGER DEFAULT 0,        -- 0 = Over counter, 1 = Prescription needed
    image_url TEXT,                                -- Optional: Link to medicine image
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP   -- Auto: When medicine was added
);

-- ========================================
-- ORDERS TABLE - Purchase Records
-- ========================================
CREATE TABLE orders (
    order_id INTEGER PRIMARY KEY AUTOINCREMENT,     -- Auto-generated order ID
    user_id INTEGER NOT NULL,                       -- Which customer placed this order
    order_status TEXT DEFAULT 'pending',           -- Order status (pending, confirmed, delivered)
    total_amount REAL NOT NULL,                     -- Total price including delivery
    delivery_address TEXT NOT NULL,                 -- Where to deliver
    payment_method TEXT,                            -- How customer is paying
    payment_status TEXT DEFAULT 'pending',         -- Payment status
    order_date DATETIME DEFAULT CURRENT_TIMESTAMP,  -- When order was placed
    delivery_date DATETIME,                         -- When order was/will be delivered
    FOREIGN KEY (user_id) REFERENCES users(user_id) -- Links to users table
);

-- ========================================
-- ORDER ITEMS TABLE - What's in Each Order
-- ========================================
CREATE TABLE order_items (
    item_id INTEGER PRIMARY KEY AUTOINCREMENT,      -- Auto-generated item ID
    order_id INTEGER NOT NULL,                      -- Which order this item belongs to
    medicine_id INTEGER NOT NULL,                   -- Which medicine was ordered
    quantity INTEGER NOT NULL,                      -- How many of this medicine
    unit_price REAL NOT NULL,                       -- Price per unit at time of order
    total_price REAL NOT NULL,                      -- quantity × unit_price
    FOREIGN KEY (order_id) REFERENCES orders(order_id),           -- Links to orders table
    FOREIGN KEY (medicine_id) REFERENCES medicines(medicine_id)   -- Links to medicines table
);

-- ========================================
-- MEDICATION REMINDERS TABLE - Future Feature
-- ========================================
CREATE TABLE medication_reminders (
    reminder_id INTEGER PRIMARY KEY AUTOINCREMENT,  -- Auto-generated reminder ID
    user_id INTEGER NOT NULL,                       -- Which user set this reminder
    medicine_name TEXT NOT NULL,                    -- Name of medicine to take
    dosage TEXT,                                    -- How much to take (e.g., "1 tablet")
    frequency TEXT,                                 -- How often (e.g., "Twice daily")
    reminder_time TEXT NOT NULL,                    -- What time (e.g., "09:00")
    start_date DATE NOT NULL,                       -- When to start reminders
    end_date DATE,                                  -- When to stop (optional)
    is_active INTEGER DEFAULT 1,                   -- 1 = active, 0 = inactive
    notes TEXT,                                     -- Additional notes from user
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,  -- When reminder was created
    FOREIGN KEY (user_id) REFERENCES users(user_id) -- Links to users table
);

-- ========================================
-- SAMPLE DATA - 8 Realistic Medicines
-- ========================================
-- This adds real medicines to test our app with

INSERT INTO medicines (name, generic_name, manufacturer, category, price, stock_quantity, prescription_required) VALUES

-- Over-the-counter medicines (no prescription needed)
('Paracetamol 500mg', 'Paracetamol', 'Generic Pharma', 'Pain Relief', 25.50, 100, 0),
('Crocin Advance', 'Paracetamol', 'GSK', 'Pain Relief', 35.00, 80, 0),
('Dolo 650', 'Paracetamol', 'Micro Labs', 'Fever', 28.50, 150, 0),
('Cetirizine 10mg', 'Cetirizine', 'Cipla', 'Allergy', 15.00, 120, 0),
('Ibuprofen 400mg', 'Ibuprofen', 'Sun Pharma', 'Pain Relief', 32.00, 90, 0),
('Vitamin D3 Tablets', 'Cholecalciferol', 'Health Supplements', 'Vitamins', 45.00, 200, 0),

-- Prescription medicines (require doctor's prescription)  
('Amoxicillin 250mg', 'Amoxicillin', 'Antibiotics Ltd', 'Antibiotic', 120.00, 50, 1),
('Omeprazole 20mg', 'Omeprazole', 'Dr. Reddy', 'Acidity', 85.00, 75, 1);
