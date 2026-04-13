import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import DashboardLayout from './layouts/DashboardLayout';

// Pages Import for Public Routes
import Login from './pages/Login';
import LandingPage from './pages/LandingPage';

// Modules
import AppRoutes from './routes/AppRoutes';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div>Chargement...</div>;
  return user ? <DashboardLayout>{children}</DashboardLayout> : <Navigate to="/login" />;
};

function App() {
  return (
    <Router>
      <AuthProvider>
        <ThemeProvider>
          <Routes>
            {/* Explicit Public Routes */}
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<LandingPage />} />

            {/* Protected Routes (Catch-all for everything else) */}
            <Route
              path="/*"
              element={
                <PrivateRoute>
                  <AppRoutes />
                </PrivateRoute>
              }
            />
          </Routes>
        </ThemeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
