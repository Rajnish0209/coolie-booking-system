# Coolie Booking System

A full-stack web application for booking coolies at Indian railway stations. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- **User Authentication**: Register, login, and role-based access control
- **Passenger Features**: Book coolies, track booking status, view booking history
- **Coolie Features**: Accept/complete bookings, update availability, receive notifications
- **Admin Features**: Approve coolie registrations, view statistics, manage users

## Tech Stack

- **Frontend**: React.js, React Router, Tailwind CSS, Axios
- **Backend**: Node.js, Express.js, MongoDB, Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **Other**: RESTful API, Responsive Design

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```
   cd backend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the backend directory with the following variables:
   ```
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/coolie-booking-system
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   JWT_COOKIE_EXPIRE=7
   ```

4. Start the backend server:
   ```
   npm run dev
   ```

### Frontend Setup

1. Navigate to the frontend directory:
   ```
   cd frontend
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Start the frontend development server:
   ```
   npm start
   ```

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


## Contributors

- Rajnish