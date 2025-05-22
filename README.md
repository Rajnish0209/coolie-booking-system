<!-- filepath: c:\Users\rajni\coolie-booking-system\README.md -->
# Coolie Booking System

A full-stack web application for booking coolies at Indian railway stations. Built with the MERN stack (MongoDB, Express.js, React.js, Node.js).

## Features

- **User Authentication**: Register, login, and role-based access control
- **Passenger Features**: Book coolies, track booking status, view booking history
- **Coolie Features**: Accept/complete bookings, update availability, receive notifications
- **Admin Features**: Approve coolie registrations, view statistics, manage users

## Project Structure

```
coolie-booking-system/
├── backend/            # Node.js, Express.js, MongoDB backend
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── middleware/
│   │   ├── models/
│   │   └── routes/
│   ├── .env
│   ├── package.json
│   ├── server.js
│   └── README.md       # Backend specific README
├── frontend/           # React.js frontend
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── context/
│   │   └── pages/
│   ├── .env
│   ├── package.json
│   └── README.md       # Frontend specific README
├── .gitignore
├── package.json        # (If you have a root package.json for managing both)
└── README.md           # This file (Overall project README)
```

## Tech Stack

### Overall
- **Full Stack**: MERN (MongoDB, Express.js, React.js, Node.js)
- **Authentication**: JWT (JSON Web Tokens)
- **API**: RESTful API
- **Design**: Responsive Design

### Backend
- Node.js
- Express.js
- MongoDB
- Mongoose
- bcrypt
- cors
- dotenv
- morgan

### Frontend
- React.js
- React Router
- Bootstrap 5
- CSS (index.css)
- Axios
- Web Vitals


## Key Changes
- **Session Management**: Refactored `AuthContext.js` to use role-specific tokens (`token_passenger`, `token_coolie`, `token_admin`) in `localStorage`, resolving session conflicts between different user roles.
- **Global Styling**: Consolidated global styles into `frontend/src/index.css` and integrated Bootstrap 5 for UI consistency and responsiveness.

## Installation

### Prerequisites

- Node.js (v14+)
- MongoDB (local or Atlas)

### Backend Setup

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Create a `.env` file in the `backend` directory with the following variables:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/coolie-booking-system
   JWT_SECRET=your_jwt_secret
   JWT_EXPIRE=7d
   JWT_COOKIE_EXPIRE=7
   ```

4. Start the backend server:
   ```bash
   npm run dev
   ```
   The backend server will typically run on `http://localhost:5000`.

### Frontend Setup

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the frontend development server:
   ```bash
   npm start
   ```
   The frontend development server will typically run on `http://localhost:3000`.


## Available Scripts

### Backend (`coolie-booking-system/backend/`)
- `npm start`: Starts the server in production mode.
- `npm run dev`: Starts the server in development mode using nodemon for automatic restarts.
- `npm test`: (Currently not implemented) Placeholder for running tests.

### Frontend (`coolie-booking-system/frontend/`)
- `npm start`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm test`: Runs the test runner.
- `npm run eject`: Ejects from Create React App configuration (one-way operation).

## API Endpoints

The backend provides the following RESTful API endpoints. All endpoints are prefixed with `/api`.

### Authentication Routes (`/auth`)
- `POST /register`: Register a new passenger.
- `POST /register-coolie`: Register a new coolie.
- `POST /login`: Login user (passenger, coolie, or admin).
- `GET /me`: Get details of the currently logged-in user.
- `GET /logout`: Logout the current user.

### User Routes (`/users`)
- `GET /`: Get all users (admin only).
- `GET /:id`: Get a single user by ID.
- `PUT /:id`: Update user details.
- `DELETE /:id`: Delete a user (admin only).

### Coolie Routes (`/coolies`)
- `GET /`: Get all coolies.
- `GET /:id`: Get a single coolie by ID.
- `PUT /:id`: Update coolie details (coolie only, for their own profile).
- `PUT /:id/availability`: Update coolie availability status (coolie only).
- `PUT /:id/approve`: Approve or reject a coolie registration (admin only).
- `GET /available`: Get available coolies based on station and platform (query params: `station`, `platform`).

### Booking Routes (`/bookings`)
- `POST /`: Create a new booking (passenger only).
- `GET /`: Get all bookings.
    - Passengers see their own bookings.
    - Coolies see bookings assigned to them.
    - Admins see all bookings.
- `GET /:id`: Get a single booking by ID.
- `PUT /:id/status`: Update booking status (e.g., accepted by coolie, completed, cancelled).
- `POST /:id/rate`: Rate a completed booking (passenger only).

### Admin Routes (`/admin`)
- `GET /stats`: Get dashboard statistics (e.g., total users, bookings, pending coolies).
- `GET /pending-coolies`: Get a list of coolies pending registration approval.
- `GET /booking-stats`: Get booking-related statistics.

### Notification Routes (`/notifications`)
- `GET /`: Get all notifications for the current user.
- `PUT /:id/read`: Mark a specific notification as read.
- `PUT /read-all`: Mark all notifications as read for the current user.
- `DELETE /:id`: Delete a specific notification.

## Frontend Details

For more detailed information about the frontend's folder structure, components, and pages, please refer to the `frontend/README.md` file.

## Backend Details

For more detailed information about the backend's folder structure, controllers, models, and middleware, please refer to the `backend/README.md` file.

## Contributors

- Rajnish
