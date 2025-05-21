# Backend

This directory contains the backend code for the Coolie Booking System. It is a Node.js and Express.js application that provides a RESTful API for the frontend to interact with.

## Tech Stack

- Node.js
- Express.js
- MongoDB
- Mongoose
- JWT (JSON Web Tokens)
- bcrypt
- cors
- dotenvA
- morgan

## Folder Structure

```
backend/
├── src/
│   ├── config/         # Configuration files (e.g., database connection)
│   ├── controllers/    # Request handlers for different routes
│   ├── middleware/     # Custom middleware (e.g., authentication, error handling)
│   ├── models/         # Mongoose models for database schemas
│   └── routes/         # Express route definitions
├── .env                # Environment variables (ignored by git)
├── package.json        # Project dependencies and scripts
├── server.js           # Main server entry point
└── README.md           # This file
```

## Setup

1.  Navigate to the backend directory:
    ```bash
    cd backend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Create a `.env` file in this directory with the following variables:
    ```env
    PORT=5000
    MONGO_URI=mongodb://localhost:27017/coolie-booking-system
    JWT_SECRET=your_jwt_secret
    JWT_EXPIRE=7d
    JWT_COOKIE_EXPIRE=7
    ```
4.  Start the backend server:
    ```bash
    npm run dev
    ```

## Scripts

- `npm start`: Starts the server in production mode.
- `npm run dev`: Starts the server in development mode using nodemon for automatic restarts.
- `npm test`: (Currently not implemented) Placeholder for running tests.

## API Endpoints

### Authentication Routes
- `POST /api/auth/register` - Register a new passenger
- `POST /api/auth/register-coolie` - Register a new coolie
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/logout` - Logout user

### User Routes
- `GET /api/users` - Get all users (admin only)
- `GET /api/users/:id` - Get single user
- `PUT /api/users/:id` - Update user
- `DELETE /api/users/:id` - Delete user (admin only)

### Coolie Routes
- `GET /api/coolies` - Get all coolies
- `GET /api/coolies/:id` - Get single coolie
- `PUT /api/coolies/:id` - Update coolie
- `PUT /api/coolies/:id/availability` - Update coolie availability
- `PUT /api/coolies/:id/approve` - Approve/reject coolie (admin only)
- `GET /api/coolies/available` - Get available coolies by station and platform

### Booking Routes
- `POST /api/bookings` - Create a new booking
- `GET /api/bookings` - Get all bookings (filtered by user role)
- `GET /api/bookings/:id` - Get single booking
- `PUT /api/bookings/:id/status` - Update booking status
- `POST /api/bookings/:id/rate` - Rate a completed booking

### Admin Routes
- `GET /api/admin/stats` - Get dashboard statistics
- `GET /api/admin/pending-coolies` - Get pending coolie approvals
- `GET /api/admin/booking-stats` - Get booking statistics

### Notification Routes
- `GET /api/notifications` - Get all notifications for current user
- `PUT /api/notifications/:id/read` - Mark notification as read
- `PUT /api/notifications/read-all` - Mark all notifications as read
- `DELETE /api/notifications/:id` - Delete notification
