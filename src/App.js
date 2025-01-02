import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import './App.css';
import PaletteList from './components/PaletteList';
import Stage from './components/Stage';
import ErrorBoundary from './components/ErrorBoundary';
import Home from './components/Home';
import GlobalStyles from './components/GlobalStyles';
import { ToastProvider } from './components/Toast';

function Navigation() {
  return (
    <nav className="main-nav">
      <div className="nav-links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/harmonies" className="nav-link">Harmonies</Link>
        <Link to="/gamut-masks" className="nav-link">Gamut Masks</Link>
        <Link to="/image-picker" className="nav-link">Image</Link>
        <Link to="/reverse-gamut" className="nav-link">Reverse Gamut</Link>
        <Link to="/palettes" className="nav-link">Palettes</Link>
      </div>
    </nav>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <Router>
          <GlobalStyles />
          <Navigation />
          <main className="main-content">
            <ErrorBoundary>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/palettes" element={<PaletteList />} />
                <Route path="/stage/:mode?" element={
                  <ErrorBoundary>
                    <Stage />
                  </ErrorBoundary>
                } />
                <Route path="/harmonies" element={
                  <ErrorBoundary>
                    <Stage initialMode="harmony" />
                  </ErrorBoundary>
                } />
                <Route path="/gamut-masks" element={
                  <ErrorBoundary>
                    <Stage initialMode="gamut" />
                  </ErrorBoundary>
                } />
                <Route path="/image-picker" element={
                  <ErrorBoundary>
                    <Stage initialMode="image" />
                  </ErrorBoundary>
                } />
                <Route path="/reverse-gamut" element={
                  <ErrorBoundary>
                    <Stage initialMode="reverse" />
                  </ErrorBoundary>
                } />
              </Routes>
            </ErrorBoundary>
          </main>
        </Router>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
