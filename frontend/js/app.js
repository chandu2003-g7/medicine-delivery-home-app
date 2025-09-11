// MediCare Plus - Main JavaScript Application
// Controls frontend behavior and communicates with backend APIs

console.log('🚀 MediCare Plus App Starting...');

// ==============================================
// MAIN APPLICATION CLASS
// ==============================================

class MedicineApp {
    constructor() {
        // Application state
        this.currentUser = null;    // Stores logged-in user info
        this.apiBaseUrl = window.location.origin + '/api';  // Base URL for backend API
        this.cart = [];             // Local shopping cart data

        console.log('📱 App initialized with API base:', this.apiBaseUrl);

        // Kick off setup
        this.init();
    }

    // Initialize the application
    init() {
        console.log('🔧 Setting up application...');
        this.loadFromLocalStorage();    // Load saved user/cart
        this.setupEventListeners();     // Hook up navigation buttons
        this.loadDefaultView();         // Show homepage
        this.updateCartDisplay();       // Display cart count
        console.log('✅ Application setup complete!');
    }

    // ==============================================
    // EVENT LISTENERS FOR NAVIGATION
    // ==============================================

    setupEventListeners() {
        // Home button
        document.getElementById('nav-home').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadHomeView();
        });

        // Medicines button
        document.getElementById('nav-medicines').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadMedicinesView();
        });

        // Cart button
        document.getElementById('nav-cart').addEventListener('click', (e) => {
            e.preventDefault();
            this.loadCartView();
        });

        // Login/Logout button
        document.getElementById('nav-login').addEventListener('click', (e) => {
            e.preventDefault();
            if (this.currentUser) {
                this.logout();
            } else {
                this.loadLoginView();
            }
        });
    }

    // ==============================================
    // LOCAL STORAGE HANDLING
    // ==============================================

    loadFromLocalStorage() {
        const token = localStorage.getItem('authToken');
        const user = localStorage.getItem('currentUser');
        const cart = localStorage.getItem('cart');

        // Restore user session if token exists
        if (token && user) {
            this.currentUser = JSON.parse(user);
            this.updateNavigation(true);
            console.log('👤 User loaded from storage:', this.currentUser.firstName);
        }

        // Restore cart
        if (cart) {
            this.cart = JSON.parse(cart);
            console.log('🛒 Cart loaded from storage:', this.cart.length, 'items');
        }
    }

    saveCartToLocalStorage() {
        localStorage.setItem('cart', JSON.stringify(this.cart));
    }

    // ==============================================
    // NAVIGATION UI UPDATES
    // ==============================================

    updateNavigation(isLoggedIn) {
        const loginLink = document.getElementById('nav-login');
        const cartLink = document.getElementById('nav-cart');

        if (isLoggedIn) {
            loginLink.innerHTML = `<i class="fas fa-user-circle"></i> ${this.currentUser.firstName}`;
            cartLink.style.display = 'block';
        } else {
            loginLink.innerHTML = `<i class="fas fa-user"></i> Login`;
            cartLink.style.display = 'none';
        }
    }

    // ==============================================
    // HOME PAGE VIEW
    // ==============================================

    loadDefaultView() {
        this.loadHomeView();
    }

    loadHomeView() {
        console.log('🏠 Loading home view...');
        const content = document.getElementById('app-content');
        content.innerHTML = `
            <div class="hero-section fade-in">
                <h1 class="display-4">Welcome to MediCare Plus</h1>
                <p class="lead">Your trusted partner for medicine delivery & reminders</p>
                <div class="row mt-5">
                    <div class="col-md-6 mb-4">
                        <div class="feature-card">
                            <i class="fas fa-truck fa-3x text-primary"></i>
                            <h3>Medicine Delivery</h3>
                            <p class="text-muted">Order medicines online and receive them at your doorstep</p>
                            <button class="btn btn-primary" onclick="app.loadMedicinesView()">
                                <i class="fas fa-shopping-bag"></i> Order Now
                            </button>
                        </div>
                    </div>
                    <div class="col-md-6 mb-4">
                        <div class="feature-card">
                            <i class="fas fa-bell fa-3x text-success"></i>
                            <h3>Smart Reminders</h3>
                            <p class="text-muted">Never miss your medication with timely reminders</p>
                            <button class="btn btn-success" onclick="app.showMedicationReminder()">
                                <i class="fas fa-clock"></i> Set Reminders
                            </button>
                        </div>
                    </div>
                </div>
                <div class="row mt-5">
                    <div class="col-md-4 mb-3 text-center">
                        <i class="fas fa-shield-alt fa-2x text-info mb-2"></i>
                        <h5>Safe & Secure</h5>
                        <p class="text-muted">All medicines are authentic</p>
                    </div>
                    <div class="col-md-4 mb-3 text-center">
                        <i class="fas fa-clock fa-2x text-warning mb-2"></i>
                        <h5>Quick Delivery</h5>
                        <p class="text-muted">Fast delivery within 2-4 hours</p>
                    </div>
                    <div class="col-md-4 mb-3 text-center">
                        <i class="fas fa-user-md fa-2x text-danger mb-2"></i>
                        <h5>Expert Support</h5>
                        <p class="text-muted">Pharmacist support 24/7</p>
                    </div>
                </div>
                
                <!-- Quick Access Links -->
                <div class="row mt-4">
                    <div class="col-md-12 text-center">
                        <button class="btn btn-outline-primary me-2" onclick="app.loadOrderHistory()">
                            <i class="fas fa-history"></i> Order History
                        </button>
                        <button class="btn btn-outline-success" onclick="app.showMedicationReminder()">
                            <i class="fas fa-bell"></i> Manage Reminders
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    // ==============================================
    // MEDICINES PAGE VIEW
    // ==============================================

    async loadMedicinesView() {
        console.log('💊 Loading medicines view...');
        const content = document.getElementById('app-content');
        content.innerHTML = `
            <div class="medicines-section fade-in">
                <div class="d-flex justify-content-between align-items-center mb-4">
                    <h2><i class="fas fa-capsules text-primary"></i> Available Medicines</h2>
                    <div class="search-box">
                        <input type="text" id="medicine-search" class="form-control" placeholder="🔍 Search medicines..." style="min-width: 300px;">
                    </div>
                </div>
                <div id="medicines-grid" class="row">
                    <div class="col-12 text-center py-5">
                        <div class="spinner-border text-primary" role="status"></div>
                        <p class="mt-2 text-muted">Loading medicines...</p>
                    </div>
                </div>
            </div>
        `;

        // Setup search
        document.getElementById('medicine-search').addEventListener('input', (e) => {
            const query = e.target.value.trim();
            if (query.length >= 2) this.searchMedicines(query);
            else if (query.length === 0) this.loadAllMedicines();
        });

        await this.loadAllMedicines();
    }

    // Fetch all medicines from backend
    async loadAllMedicines() {
        try {
            console.log('📦 Fetching all medicines...');
            const res = await fetch(`${this.apiBaseUrl}/medicines`);
            if (!res.ok) throw new Error(`Server error: ${res.status}`);
            const medicines = await res.json();
            this.displayMedicines(medicines);
        } catch (err) {
            console.error('❌ Error loading medicines:', err);
            document.getElementById('medicines-grid').innerHTML = `
                <div class="col-12">
                    <div class="alert alert-danger text-center">
                        <i class="fas fa-exclamation-triangle"></i>
                        <strong>Unable to load medicines</strong><br>
                        Please ensure the server is running.
                    </div>
                </div>
            `;
        }
    }

    // Search medicines by query
    async searchMedicines(query) {
        try {
            console.log('🔍 Searching medicines for:', query);
            const res = await fetch(`${this.apiBaseUrl}/medicines/search?query=${encodeURIComponent(query)}`);
            if (!res.ok) throw new Error(`Search failed: ${res.status}`);
            const medicines = await res.json();
            this.displayMedicines(medicines);
        } catch (err) {
            console.error('❌ Search error:', err);
            this.showAlert('Search failed. Please try again.', 'danger');
        }
    }

    // Display medicines in grid layout
    displayMedicines(medicines) {
        const grid = document.getElementById('medicines-grid');
        if (medicines.length === 0) {
            grid.innerHTML = `
                <div class="col-12">
                    <div class="alert alert-info text-center">
                        <i class="fas fa-info-circle"></i>
                        <h5>No medicines found</h5>
                        <p>Try another search.</p>
                    </div>
                </div>
            `;
            return;
        }
        grid.innerHTML = medicines.map(med => `
            <div class="col-lg-3 col-md-4 col-sm-6 mb-4">
                <div class="card medicine-card">
                    <div class="card-body">
                        <h5 class="card-title">${med.name}</h5>
                        <p class="text-muted small">${med.generic_name || ''}</p>
                        <p class="price-tag">₹${med.price}</p>
                        <p><small class="badge ${med.prescription_required ? 'bg-warning' : 'bg-success'}">
                            ${med.prescription_required ? 'Prescription' : 'OTC'}
                        </small> 
                        <small class="text-muted">${med.stock_quantity} left</small></p>
                        <button class="btn btn-primary w-100" 
                            onclick="app.addToCart(${med.medicine_id}, '${med.name.replace(/'/g,"\\'")}', ${med.price})"
                            ${med.stock_quantity <= 0 ? 'disabled' : ''}>
                            <i class="fas fa-cart-plus"></i> 
                            ${med.stock_quantity > 0 ? 'Add to Cart' : 'Out of Stock'}
                        </button>
                    </div>
                </div>
            </div>
        `).join('');
    }

    // ==============================================
    // SHOPPING CART FUNCTIONS
    // ==============================================

    addToCart(id, name, price) {
        console.log('🛒 Adding to cart:', name);
        const item = this.cart.find(i => i.medicine_id === id);
        if (item) item.quantity++;
        else this.cart.push({ medicine_id: id, name, price, quantity: 1 });
        this.saveCartToLocalStorage();
        this.updateCartDisplay();
        this.showAlert(`${name} added to cart!`, 'success');
    }

    updateCartDisplay() {
        const count = this.cart.reduce((sum, i) => sum + i.quantity, 0);
        document.getElementById('cart-count').textContent = count;
    }

    loadCartView() {
        if (!this.currentUser) {
            this.showAlert('Please login to view your cart', 'warning');
            return this.loadLoginView();
        }
        const content = document.getElementById('app-content');
        if (this.cart.length === 0) {
            content.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-cart fa-4x text-muted mb-4"></i>
                    <h3>Your cart is empty</h3>
                    <button class="btn btn-primary" onclick="app.loadMedicinesView()">
                        <i class="fas fa-capsules"></i> Browse Medicines
                    </button>
                </div>
            `;
            return;
        }
        const subtotal = this.cart.reduce((sum, i) => sum + (i.price * i.quantity), 0);
        const deliveryFee = 50;
        const total = subtotal + deliveryFee;
        content.innerHTML = `
            <div class="cart-section fade-in">
                <h2><i class="fas fa-shopping-cart text-primary"></i> Your Shopping Cart</h2>
                <div class="row">
                    <div class="col-lg-8">
                        <div class="card">
                            <div class="card-header"><h5>Cart Items</h5></div>
                            <div class="card-body">
                                ${this.cart.map((i, idx) => `
                                    <div class="d-flex justify-content-between align-items-center py-2 ${idx>0?'border-top':''}">
                                        <div>
                                            <h6>${i.name}</h6>
                                            <small>₹${i.price.toFixed(2)} each</small>
                                        </div>
                                        <div>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="app.updateCartQuantity(${i.medicine_id}, -1)" ${i.quantity<=1?'disabled':''}>-</button>
                                            <span class="mx-2">${i.quantity}</span>
                                            <button class="btn btn-sm btn-outline-secondary" onclick="app.updateCartQuantity(${i.medicine_id}, 1)">+</button>
                                        </div>
                                        <div><strong>₹${(i.price*i.quantity).toFixed(2)}</strong></div>
                                        <div>
                                            <button class="btn btn-sm btn-outline-danger" onclick="app.removeFromCart(${i.medicine_id})">
                                                <i class="fas fa-trash"></i>
                                            </button>
                                        </div>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                    </div>
                    <div class="col-lg-4">
                        <div class="card">
                            <div class="card-header"><h5>Order Summary</h5></div>
                            <div class="card-body">
                                <p>Subtotal (${this.cart.length} items): ₹${subtotal.toFixed(2)}</p>
                                <p>Delivery Fee: ₹${deliveryFee.toFixed(2)}</p>
                                <hr>
                                <h5>Total: ₹${total.toFixed(2)}</h5>
                                <button class="btn btn-success w-100" onclick="app.proceedToCheckout()">
                                    <i class="fas fa-credit-card"></i> Proceed to Checkout
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    updateCartQuantity(id, change) {
        const item = this.cart.find(i => i.medicine_id===id);
        if (!item) return;
        item.quantity += change;
        if (item.quantity<=0) this.removeFromCart(id);
        else {
            this.saveCartToLocalStorage();
            this.updateCartDisplay();
            this.loadCartView();
        }
    }

    removeFromCart(id) {
        this.cart = this.cart.filter(i => i.medicine_id!==id);
        this.saveCartToLocalStorage();
        this.updateCartDisplay();
        this.loadCartView();
        this.showAlert('Item removed from cart', 'info');
    }

    // ==============================================
    // CHECKOUT FUNCTIONALITY
    // ==============================================

    proceedToCheckout() {
        if (this.cart.length === 0) {
            this.showAlert('Your cart is empty!', 'warning');
            return;
        }

        // Calculate totals
        const subtotal = this.cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        const deliveryFee = 50;
        const total = subtotal + deliveryFee;

        // Show checkout confirmation
        this.showCheckoutConfirmation(subtotal, deliveryFee, total);
    }

    showCheckoutConfirmation(subtotal, deliveryFee, total) {
        const content = document.getElementById('app-content');
        
        content.innerHTML = `
            <div class="checkout-section fade-in">
                <div class="row">
                    <div class="col-md-8">
                        <h2>🛒 Checkout Confirmation</h2>
                        
                        <!-- Order Summary -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5>Order Summary</h5>
                            </div>
                            <div class="card-body">
                                ${this.cart.map(item => `
                                    <div class="d-flex justify-content-between align-items-center mb-2">
                                        <div>
                                            <strong>${item.name}</strong>
                                            <small class="text-muted"> × ${item.quantity}</small>
                                        </div>
                                        <span>₹${(item.price * item.quantity).toFixed(2)}</span>
                                    </div>
                                `).join('')}
                                
                                <hr>
                                <div class="d-flex justify-content-between">
                                    <span>Subtotal:</span>
                                    <span>₹${subtotal.toFixed(2)}</span>
                                </div>
                                <div class="d-flex justify-content-between">
                                    <span>Delivery Fee:</span>
                                    <span>₹${deliveryFee.toFixed(2)}</span>
                                </div>
                                <hr>
                                <div class="d-flex justify-content-between">
                                    <strong>Total:</strong>
                                    <strong>₹${total.toFixed(2)}</strong>
                                </div>
                            </div>
                        </div>

                        <!-- Delivery Details -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5>Delivery Details</h5>
                            </div>
                            <div class="card-body">
                                <form id="delivery-form">
                                    <div class="mb-3">
                                        <label class="form-label">Full Name *</label>
                                        <input type="text" class="form-control" id="customer-name" value="${this.currentUser?.firstName || ''} ${this.currentUser?.lastName || ''}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Phone Number *</label>
                                        <input type="tel" class="form-control" id="customer-phone" value="${this.currentUser?.phone || ''}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">Delivery Address *</label>
                                        <textarea class="form-control" id="delivery-address" rows="3" required>${this.currentUser?.address || ''}</textarea>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">City *</label>
                                        <input type="text" class="form-control" id="customer-city" value="${this.currentUser?.city || ''}" required>
                                    </div>
                                    <div class="mb-3">
                                        <label class="form-label">PIN Code *</label>
                                        <input type="text" class="form-control" id="customer-pincode" required>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <!-- Payment Method -->
                        <div class="card mb-4">
                            <div class="card-header">
                                <h5>Payment Method</h5>
                            </div>
                            <div class="card-body">
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="payment" id="cod" checked>
                                    <label class="form-check-label" for="cod">
                                        Cash on Delivery
                                    </label>
                                </div>
                                <div class="form-check mb-2">
                                    <input class="form-check-input" type="radio" name="payment" id="online" disabled>
                                    <label class="form-check-label" for="online">
                                        Online Payment <small class="text-muted">(Coming Soon)</small>
                                    </label>
                                </div>
                            </div>
                        </div>

                        <!-- Place Order Button -->
                        <button class="btn btn-success btn-lg w-100" onclick="app.placeOrder(${total})">
                            <i class="fas fa-check"></i> Place Order - ₹${total.toFixed(2)}
                        </button>
                        
                        <button class="btn btn-outline-secondary w-100 mt-2" onclick="app.loadCartView()">
                            <i class="fas fa-arrow-left"></i> Back to Cart
                        </button>
                    </div>
                </div>
            </div>
        `;
    }

    placeOrder(total) {
        // Get form data
        const name = document.getElementById('customer-name').value;
        const phone = document.getElementById('customer-phone').value;
        const address = document.getElementById('delivery-address').value;
        const city = document.getElementById('customer-city').value;
        const pincode = document.getElementById('customer-pincode').value;

        // Validate form
        if (!name || !phone || !address || !city || !pincode) {
            this.showAlert('Please fill all required fields!', 'warning');
            return;
        }

        // Create order data
        const orderData = {
            orderId: 'ORD' + Date.now(),
            items: [...this.cart],
            total: total,
            customerInfo: { name, phone, address, city, pincode },
            orderDate: new Date().toLocaleString(),
            status: 'Confirmed',
            paymentMethod: 'Cash on Delivery'
        };

        // Save to localStorage (simulate database)
        let orders = JSON.parse(localStorage.getItem('orders') || '[]');
        orders.push(orderData);
        localStorage.setItem('orders', JSON.stringify(orders));

        // Clear cart
        this.cart = [];
        this.saveCartToLocalStorage();
        this.updateCartDisplay();

        // Show success
        this.showOrderSuccess(orderData);
    }

    showOrderSuccess(orderData) {
        const content = document.getElementById('app-content');
        
        content.innerHTML = `
            <div class="order-success fade-in text-center">
                <div class="card mx-auto" style="max-width: 600px;">
                    <div class="card-body p-5">
                        <div class="mb-4">
                            <i class="fas fa-check-circle text-success" style="font-size: 4rem;"></i>
                        </div>
                        
                        <h2 class="text-success mb-3">Order Placed Successfully!</h2>
                        
                        <div class="alert alert-success mb-4">
                            <h5>Order ID: <strong>${orderData.orderId}</strong></h5>
                            <p class="mb-0">Total Amount: <strong>₹${orderData.total.toFixed(2)}</strong></p>
                        </div>
                        
                        <div class="mb-4">
                            <h6>Delivery Details:</h6>
                            <p class="mb-1"><strong>${orderData.customerInfo.name}</strong></p>
                            <p class="mb-1">${orderData.customerInfo.phone}</p>
                            <p class="mb-1">${orderData.customerInfo.address}</p>
                            <p class="mb-0">${orderData.customerInfo.city} - ${orderData.customerInfo.pincode}</p>
                        </div>
                        
                        <div class="mb-4">
                            <p><strong>Expected Delivery:</strong> Within 2-3 business days</p>
                            <p><strong>Payment:</strong> Cash on Delivery</p>
                        </div>
                        
                        <div class="d-grid gap-2">
                            <button class="btn btn-primary" onclick="app.loadOrderHistory()">View Order History</button>
                            <button class="btn btn-outline-primary" onclick="app.loadHomeView()">Continue Shopping</button>
                        </div>
                    </div>
                </div>
            </div>
        `;
    }

    // ==============================================
    // ORDER HISTORY
    // ==============================================

    loadOrderHistory() {
        const orders = JSON.parse(localStorage.getItem('orders') || '[]');
        
        const content = document.getElementById('app-content');
        
        if (orders.length === 0) {
            content.innerHTML = `
                <div class="text-center py-5">
                    <i class="fas fa-shopping-bag text-muted" style="font-size: 4rem;"></i>
                    <h3 class="mt-3">No Orders Yet</h3>
                    <p class="text-muted">Start shopping to see your order history here.</p>
                    <button class="btn btn-primary" onclick="app.loadMedicinesView()">Browse Medicines</button>
                </div>
            `;
            return;
        }

        content.innerHTML = `
            <div class="order-history fade-in">
                <h2>📦 Your Order History</h2>
                
                <div class="row">
                    ${orders.reverse().map(order => `
                        <div class="col-md-6 mb-4">
                            <div class="card">
                                <div class="card-header d-flex justify-content-between">
                                    <span><strong>Order ${order.orderId}</strong></span>
                                    <span class="badge bg-success">${order.status}</span>
                                </div>
                                <div class="card-body">
                                    <p><strong>Date:</strong> ${order.orderDate}</p>
                                    <p><strong>Total:</strong> ₹${order.total.toFixed(2)}</p>
                                    <p><strong>Items:</strong> ${order.items.length} medicine(s)</p>
                                    
                                    <div class="small text-muted mb-2">
                                        ${order.items.map(item => `${item.name} (×${item.quantity})`).join(', ')}
                                    </div>
                                    
                                    <div class="small">
                                        <strong>Delivery to:</strong><br>
                                        ${order.customerInfo.name}<br>
                                        ${order.customerInfo.address}<br>
                                        ${order.customerInfo.city} - ${order.customerInfo.pincode}
                                    </div>
                                </div>
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
    }

    // ==============================================
    // MEDICATION REMINDERS
    // ==============================================

    showMedicationReminder() {
        const content = document.getElementById('app-content');
        const reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        
        content.innerHTML = `
            <div class="reminders-section fade-in">
                <h2>🔔 Medication Reminders</h2>
                
                <!-- Add New Reminder -->
                <div class="card mb-4">
                    <div class="card-header">
                        <h5>Set New Reminder</h5>
                    </div>
                    <div class="card-body">
                        <form id="reminder-form">
                            <div class="row">
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Medicine Name *</label>
                                    <input type="text" class="form-control" id="med-name" required>
                                </div>
                                <div class="col-md-6 mb-3">
                                    <label class="form-label">Dosage *</label>
                                    <input type="text" class="form-control" id="dosage" placeholder="1 tablet, 5ml syrup, etc." required>
                                </div>
                            </div>
                            
                            <div class="row">
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Frequency *</label>
                                    <select class="form-control" id="frequency" required>
                                        <option value="">Select frequency</option>
                                        <option value="once">Once daily</option>
                                        <option value="twice">Twice daily</option>
                                        <option value="thrice">Three times daily</option>
                                        <option value="four">Four times daily</option>
                                    </select>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">First Reminder Time *</label>
                                    <input type="time" class="form-control" id="reminder-time" required>
                                </div>
                                <div class="col-md-4 mb-3">
                                    <label class="form-label">Duration (days)</label>
                                    <input type="number" class="form-control" id="duration" placeholder="7" min="1" max="90">
                                </div>
                            </div>
                            
                            <div class="mb-3">
                                <label class="form-label">Special Instructions</label>
                                <textarea class="form-control" id="instructions" rows="2" placeholder="Before/after meals, with water, etc."></textarea>
                            </div>
                            
                            <button type="submit" class="btn btn-success">
                                <i class="fas fa-plus"></i> Set Reminder
                            </button>
                        </form>
                    </div>
                </div>

                <!-- Active Reminders -->
                <div class="card">
                    <div class="card-header">
                        <h5>Active Reminders (${reminders.length})</h5>
                    </div>
                    <div class="card-body">
                        <div id="active-reminders">
                            ${reminders.length === 0 ? 
                                '<p class="text-muted text-center py-3">No active reminders. Set your first reminder above!</p>' : 
                                reminders.map(reminder => `
                                    <div class="reminder-item border rounded p-3 mb-3">
                                        <div class="row align-items-center">
                                            <div class="col-md-8">
                                                <h6 class="mb-1">${reminder.medicineName}</h6>
                                                <p class="mb-1 text-muted">
                                                    <strong>Dosage:</strong> ${reminder.dosage} | 
                                                    <strong>Frequency:</strong> ${reminder.frequency} | 
                                                    <strong>Time:</strong> ${reminder.time}
                                                </p>
                                                ${reminder.instructions ? `<small class="text-muted">${reminder.instructions}</small>` : ''}
                                            </div>
                                            <div class="col-md-4 text-end">
                                                <button class="btn btn-sm btn-outline-danger" onclick="app.deleteReminder(${reminder.id})">
                                                    <i class="fas fa-trash"></i> Delete
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                `).join('')
                            }
                        </div>
                    </div>
                </div>
            </div>
        `;

        // Add form submit handler
        document.getElementById('reminder-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.addReminder();
        });
    }

    addReminder() {
        const medName = document.getElementById('med-name').value;
        const dosage = document.getElementById('dosage').value;
        const frequency = document.getElementById('frequency').value;
        const time = document.getElementById('reminder-time').value;
        const duration = document.getElementById('duration').value;
        const instructions = document.getElementById('instructions').value;

        if (!medName || !dosage || !frequency || !time) {
            this.showAlert('Please fill all required fields!', 'warning');
            return;
        }

        // Create reminder object
        const reminder = {
            id: Date.now(),
            medicineName: medName,
            dosage: dosage,
            frequency: frequency,
            time: time,
            duration: duration || 7,
            instructions: instructions,
            createdAt: new Date().toISOString(),
            isActive: true
        };

        // Save reminder
        let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        reminders.push(reminder);
        localStorage.setItem('reminders', JSON.stringify(reminders));

        this.showAlert('Reminder set successfully!', 'success');
        
        // Refresh the reminders view
        this.showMedicationReminder();

        // Request notification permission
        this.requestNotificationPermission();
    }

    deleteReminder(id) {
        let reminders = JSON.parse(localStorage.getItem('reminders') || '[]');
        reminders = reminders.filter(r => r.id !== id);
        localStorage.setItem('reminders', JSON.stringify(reminders));
        
        this.showAlert('Reminder deleted successfully!', 'success');
        this.showMedicationReminder();
    }

    requestNotificationPermission() {
        if ('Notification' in window) {
            if (Notification.permission === 'default') {
                Notification.requestPermission().then(permission => {
                    if (permission === 'granted') {
                        this.showAlert('Notifications enabled! You will receive reminders.', 'success');
                    }
                });
            }
        }
    }

    // ==============================================
    // AUTHENTICATION VIEWS & HANDLERS
    // ==============================================

    loadLoginView() {
        const content = document.getElementById('app-content');
        content.innerHTML = `
            <div class="row justify-content-center fade-in">
                <div class="col-md-6">
                    <div class="card">
                        <div class="card-header">
                            <ul class="nav nav-tabs card-header-tabs">
                                <li class="nav-item">
                                    <a class="nav-link active" href="#" id="login-tab">Login</a>
                                </li>
                                <li class="nav-item">
                                    <a class="nav-link" href="#" id="register-tab">Register</a>
                                </li>
                            </ul>
                        </div>
                        <div class="card-body" id="auth-form-container">
                            ${this.getLoginForm()}
                        </div>
                    </div>
                </div>
            </div>
        `;
        document.getElementById('login-tab').addEventListener('click', e => { e.preventDefault(); this.switchAuthTab('login'); });
        document.getElementById('register-tab').addEventListener('click', e => { e.preventDefault(); this.switchAuthTab('register'); });
        this.setupLoginForm();
    }

    getLoginForm() {
        return `
            <form id="login-form">
                <h4 class="mb-4"><i class="fas fa-sign-in-alt text-primary"></i> Login</h4>
                <div class="mb-3">
                    <label class="form-label"><i class="fas fa-envelope"></i> Email</label>
                    <input type="email" id="login-email" class="form-control" required>
                </div>
                <div class="mb-3">
                    <label class="form-label"><i class="fas fa-lock"></i> Password</label>
                    <input type="password" id="login-password" class="form-control" required>
                </div>
                <button type="submit" class="btn btn-primary w-100">Login</button>
                <div id="login-message" class="mt-3"></div>
                <div class="text-center mt-3"><small>Don't have account? <a href="#" id="switch-to-register">Register here</a></small></div>
            </form>
        `;
    }

    getRegisterForm() {
        return `
            <form id="register-form">
                <h4 class="mb-4"><i class="fas fa-user-plus text-success"></i> Register</h4>
                <div class="row">
                    <div class="col-md-6 mb-3"><input type="text" id="register-firstname" class="form-control" placeholder="First name" required></div>
                    <div class="col-md-6 mb-3"><input type="text" id="register-lastname" class="form-control" placeholder="Last name" required></div>
                </div>
                <div class="mb-3"><input type="email" id="register-email" class="form-control" placeholder="Email" required></div>
                <div class="mb-3"><input type="password" id="register-password" class="form-control" placeholder="Password (min 6 chars)" required minlength="6"></div>
                <div class="mb-3"><input type="tel" id="register-phone" class="form-control" placeholder="Phone"></div>
                <div class="mb-3"><textarea id="register-address" class="form-control" rows="2" placeholder="Address"></textarea></div>
                <div class="row">
                    <div class="col-md-6 mb-3"><input type="text" id="register-city" class="form-control" placeholder="City"></div>
                    <div class="col-md-6 mb-3"><input type="text" id="register-pincode" class="form-control" placeholder="Pincode" pattern="[0-9]{6}"></div>
                </div>
                <button type="submit" class="btn btn-success w-100">Create Account</button>
                <div id="register-message" class="mt-3"></div>
                <div class="text-center mt-3"><small>Already have account? <a href="#" id="switch-to-login">Login here</a></small></div>
            </form>
        `;
    }

    switchAuthTab(type) {
        const loginTab = document.getElementById('login-tab');
        const registerTab = document.getElementById('register-tab');
        const container = document.getElementById('auth-form-container');
        if (type==='login') {
            loginTab.classList.add('active');
            registerTab.classList.remove('active');
            container.innerHTML=this.getLoginForm();
            this.setupLoginForm();
        } else {
            registerTab.classList.add('active');
            loginTab.classList.remove('active');
            container.innerHTML=this.getRegisterForm();
            this.setupRegisterForm();
        }
    }

    setupLoginForm() {
        const form=document.getElementById('login-form');
        form.addEventListener('submit', async e=>{ e.preventDefault(); await this.handleLogin(); });
        document.getElementById('switch-to-register').addEventListener('click', e=>{ e.preventDefault(); this.switchAuthTab('register'); });
    }

    setupRegisterForm() {
        const form=document.getElementById('register-form');
        form.addEventListener('submit', async e=>{ e.preventDefault(); await this.handleRegister(); });
        document.getElementById('switch-to-login').addEventListener('click', e=>{ e.preventDefault(); this.switchAuthTab('login'); });
    }

    // ==============================================
    // LOGIN & REGISTER HANDLERS
    // ==============================================

    async handleLogin() {
        const email=document.getElementById('login-email').value;
        const password=document.getElementById('login-password').value;
        const msg=document.getElementById('login-message');
        msg.innerHTML='';
        try {
            const res=await fetch(`${this.apiBaseUrl}/auth/login`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify({email,password})
            });
            const data=await res.json();
            if(res.ok){
                localStorage.setItem('authToken',data.token);
                localStorage.setItem('currentUser',JSON.stringify(data.user));
                this.currentUser=data.user;
                this.updateNavigation(true);
                msg.innerHTML=`<div class="alert alert-success">Login successful! Welcome, ${data.user.firstName}!</div>`;
                setTimeout(()=>this.loadHomeView(),1500);
            } else {
                msg.innerHTML=`<div class="alert alert-danger">${data.message}</div>`;
            }
        } catch(err){
            msg.innerHTML=`<div class="alert alert-danger">Login failed. Check server.</div>`;
        }
    }

    async handleRegister() {
        const formData={
            firstName:document.getElementById('register-firstname').value,
            lastName:document.getElementById('register-lastname').value,
            email:document.getElementById('register-email').value,
            password:document.getElementById('register-password').value,
            phone:document.getElementById('register-phone').value,
            address:document.getElementById('register-address').value,
            city:document.getElementById('register-city').value,
            pincode:document.getElementById('register-pincode').value
        };
        const msg=document.getElementById('register-message');
        msg.innerHTML='';
        try {
            const res=await fetch(`${this.apiBaseUrl}/auth/register`,{
                method:'POST',
                headers:{'Content-Type':'application/json'},
                body:JSON.stringify(formData)
            });
            const data=await res.json();
            if(res.ok){
                msg.innerHTML=`<div class="alert alert-success">Registration successful! Please login.</div>`;
                setTimeout(()=>this.switchAuthTab('login'),2000);
            } else {
                msg.innerHTML=`<div class="alert alert-danger">${data.message}</div>`;
            }
        } catch(err){
            msg.innerHTML=`<div class="alert alert-danger">Registration failed. Check server.</div>`;
        }
    }

    // ==============================================
    // LOGOUT FUNCTIONALITY
    // ==============================================

    logout() {
        localStorage.removeItem('authToken');
        localStorage.removeItem('currentUser');
        this.currentUser = null;
        this.updateNavigation(false);
        this.showAlert('Logged out successfully!', 'success');
        this.loadHomeView();
    }

    // ==============================================
    // ALERT UTILITY
    // ==============================================

    showAlert(message,type='info') {
        const container=document.getElementById('alert-container');
        const id='alert-'+Date.now();
        container.insertAdjacentHTML('afterbegin',`
            <div id="${id}" class="alert alert-${type} alert-dismissible fade show slide-in">
                ${message}
                <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
            </div>
        `);
        setTimeout(()=>document.getElementById(id)?.remove(),5000);
    }
}

// Initialize app when page loads
let app;
document.addEventListener('DOMContentLoaded',()=>{
    console.log('🌟 DOM loaded - initializing app');
    app=new MedicineApp();
});
console.log('📄 app.js loaded successfully');

