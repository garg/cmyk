import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate, Link } from 'react-router-dom';
import './App.css';
import PaletteList from './components/PaletteList';
import Stage from './components/Stage';
import { useAuth, AuthProvider } from './context/AuthContext';
import Login from './components/Login';
import ProtectedRoute from './components/ProtectedRoute';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import Home from './components/Home';
import GlobalStyles from './components/GlobalStyles';
import { ToastProvider, useToast } from './components/Toast';

function Navigation() {
  const { user, logout, loading } = useAuth();
  const navigate = useNavigate();
  const { showToast } = useToast();

  if (loading) {
    return (
      <nav className="main-nav">
        <div className="nav-links">
          <LoadingSpinner size={24} />
        </div>
      </nav>
    );
  }

  return (
    <nav className="main-nav">
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/stage" className="nav-link">Color Wheel</Link>
        <Link to="/palettes" className="nav-link">Palettes</Link>
      </div>
      <div>
        {user ? (
          <button 
            onClick={async () => {
              try {
                await logout();
                showToast('Logged out successfully', 'success');
                navigate('/');
              } catch (error) {
                showToast('Error logging out', 'error');
              }
            }}
            className="auth-button"
          >
            Logout ({user.email})
          </button>
        ) : (
          <Link to="/login" className="auth-button">
            Login
          </Link>
        )}
      </div>
    </nav>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ToastProvider>
          <Router>
            <GlobalStyles />
            <Navigation />
            <main className="main-content">
              <ErrorBoundary>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/palettes" element={
                    <ProtectedRoute>
                      <PaletteList />
                    </ProtectedRoute>
                  } />
                  <Route path="/stage" element={
                    <ErrorBoundary>
                      <Stage />
                    </ErrorBoundary>
                  } />
                  <Route path="/login" element={<Login />} />
                </Routes>
              </ErrorBoundary>
            </main>
          </Router>
        </ToastProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
}

export default App;
