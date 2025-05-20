import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

// Auth Components
import Login from './components/auth/Login';
import Register from './components/auth/Register';
import RegisterCoolie from './components/auth/RegisterCoolie';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';
import PrivateRoute from './components/routing/PrivateRoute';

// Pages
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import BookingForm from './pages/BookingForm';
import BookingHistory from './pages/BookingHistory';
import CoolieProfile from './pages/CoolieProfile';
import UserProfile from './pages/UserProfile';
import AdminProfile from './pages/AdminProfile';
import AdminPanel from './pages/AdminPanel';
import CoolieApprovalHistory from './pages/CoolieApprovalHistory';
import NotFound from './pages/NotFound';

// Context
import { AuthProvider } from './context/AuthContext';

function App() {
  return (
    <AuthProvider>
      <Router>
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          <Navbar />
          <main style={{ flexGrow: 1 }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="/register-coolie" element={<RegisterCoolie />} />
              
              {/* Protected Routes */}
              <Route
                path="/dashboard"
                element={<PrivateRoute component={Dashboard} />}
              />
              <Route
                path="/book"
                element={<PrivateRoute component={BookingForm} roles={['passenger']} />}
              />
              <Route
                path="/bookings"
                element={<PrivateRoute component={BookingHistory} />}
              />
              <Route
                path="/coolie-profile"
                element={<PrivateRoute component={CoolieProfile} roles={['coolie']} />}
              />
              <Route
                path="/user-profile"
                element={<PrivateRoute component={UserProfile} roles={['passenger']} />}
              />
              <Route
                path="/admin-profile"
                element={<PrivateRoute component={AdminProfile} roles={['admin']} />}
              />
              <Route
                path="/admin"
                element={<PrivateRoute component={AdminPanel} roles={['admin']} />}
              />
              <Route
                path="/coolie-approvals"
                element={<PrivateRoute component={CoolieApprovalHistory} roles={['admin']} />}
              />
              
              {/* 404 Route */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </main>
          <Footer />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
