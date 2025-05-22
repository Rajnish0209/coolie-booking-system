# Frontend

This directory contains the frontend code for the Coolie Booking System. It is a React.js application that provides the user interface for interacting with the booking system.

## Tech Stack

- React.js
- React Router
- Bootstrap 5
- CSS (index.css)
- Axios
- Web Vitals

## Folder Structure

```
frontend/
├── public/             # Static assets and HTML template
│   ├── index.html      # Main HTML file
│   └── ...             # Other static assets (favicon, manifest, etc.)
├── src/
│   ├── components/     # Reusable UI components
│   │   ├── auth/       # Authentication related components
│   │   ├── layout/     # Layout components (Navbar, Footer)
│   │   └── routing/    # Private/Protected route components
│   ├── context/        # React Context for global state management
│   ├── pages/          # Top-level page components
│   ├── App.js          # Main application component with routing
│   ├── index.js        # Entry point of the React application
│   ├── index.css       # Global styles, including Bootstrap imports or custom global styles
│   └── ...             # Other files (service worker, setupTests, etc.)
├── .env                # Environment variables (if any, for frontend)
├── package.json        # Project dependencies and scripts
└── README.md           # This file
```

## Setup

1.  Navigate to the frontend directory:
    ```bash
    cd frontend
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```
3.  Start the frontend development server:
    ```bash
    npm start
    ```

## Scripts

- `npm start`: Runs the app in development mode.
- `npm run build`: Builds the app for production.
- `npm test`: Runs the test runner.
- `npm run eject`: Ejects from Create React App configuration (one-way operation).

## Available Pages & Components

### Core Components:
*   **`App.js`**: Main application wrapper, sets up routing.
*   **`index.js`**: Renders the `App` component into the DOM.

### Layout Components (`src/components/layout/`):
*   **`Navbar.js`**: Navigation bar displayed on most pages.
*   **`Footer.js`**: Footer section.

### Authentication Components (`src/components/auth/`):
*   **`Login.js`**: User login form.
*   **`Register.js`**: Passenger registration form.
*   **`RegisterCoolie.js`**: Coolie registration form.

### Routing (`src/components/routing/`):
*   **`PrivateRoute.js`**: Wrapper to protect routes that require authentication.

### Context (`src/context/`):
*   **`AuthContext.js`**: Manages authentication state (user, token, login/logout functions) globally.

### Pages (`src/pages/`):
*   **`Home.js`**: Landing page of the application.
*   **`Dashboard.js`**: Main dashboard after login, content varies by user role.
*   **`UserProfile.js`**: Page for users to view and edit their profile.
*   **`CoolieProfile.js`**: Page for coolies to view and manage their profile and availability.
*   **`AdminPanel.js`**: Admin dashboard for managing users, coolies, and viewing stats.
*   **`AdminProfile.js`**: Page for admin to view/edit their profile.
*   **`BookingForm.js`**: Form for passengers to book a coolie.
*   **`BookingHistory.js`**: Page for users/coolies to view their booking history.
*   **`CoolieApprovalHistory.js`**: Page for admins to view history of coolie approvals.
*   **`NotFound.js`**: Page displayed for invalid routes.

<!-- The rest of the file is the default Create React App README -->
