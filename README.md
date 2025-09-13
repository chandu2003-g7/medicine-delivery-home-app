# Medicine Delivery Web App

A full-stack **e-pharmacy platform** enabling users to browse/search medicines, manage accounts, place orders, track delivery, set medication reminders, and view order history. Includes an admin dashboard for inventory and user management.

## Tech Stack
- **Frontend:** HTML5, CSS3, JavaScript (ES6+), responsive design  
- **Backend:** Node.js, Express.js, RESTful APIs  
- **Database:** SQLite  
- **Security:** bcrypt, JWT, CORS  
- **Deployment:** Render (HTTPS, 99.9% uptime)

## Key Features
- **User Auth:** Secure registration/login (bcrypt, JWT)  
- **Medicine Catalog:** Search, filter, real-time stock checks  
- **Shopping Cart:** Add/remove items, persistent sessions  
- **Order System:** Place orders, view history, status updates  
- **Reminders:** Schedule dosage alerts  
- **Admin Panel:** Manage users, inventory, orders  

## API Endpoints (Examples)
- `POST /api/auth/login`  
- `GET /api/medicines`  
- `POST /api/cart/add`  
- `POST /api/orders`

## Future Enhancements
- Payment gateway integration  
- Real-time tracking (WebSockets)  
- Prescription upload/validation  

MIT License  
