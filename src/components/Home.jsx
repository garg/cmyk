import React from 'react';
import { Link } from 'react-router-dom';

const Home = () => {
  return (
    <div className="home-container">
      <div className="hero-section">
        <h1>Welcome to CMYK Color Wheel</h1>
        <p className="subtitle">
          Create, explore, and save beautiful color palettes with our intuitive tools
        </p>
      </div>

      <div className="features-grid">
        <div className="feature-card">
          <h3>Color Harmonies</h3>
          <p>
            Explore different color harmonies including complementary, analogous, triadic, and more to create balanced color combinations.
          </p>
          <Link to="/stage" className="feature-link">
            Try Harmonies →
          </Link>
        </div>

        <div className="feature-card">
          <h3>Gamut Masks</h3>
          <p>
            Use customizable gamut masks to create color combinations within specific color spaces and constraints.
          </p>
          <Link to="/stage" className="feature-link">
            Try Gamut Masks →
          </Link>
        </div>

        <div className="feature-card">
          <h3>Image Colors</h3>
          <p>
            Extract color palettes from your favorite images. Simply drag and drop to discover the colors that make them beautiful.
          </p>
          <Link to="/stage" className="feature-link">
            Extract Colors →
          </Link>
        </div>

        <div className="feature-card">
          <h3>Save Palettes</h3>
          <p>
            Create an account to save your favorite color combinations and access them anywhere.
          </p>
          <Link to="/palettes" className="feature-link">
            View Palettes →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
