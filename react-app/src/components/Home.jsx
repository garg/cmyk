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
          <h3>Color Wheel</h3>
          <p>
            Interactive color wheel with harmony guides and gamut masks to help you create perfect color combinations.
          </p>
          <Link to="/stage" className="feature-link">
            Try Color Wheel →
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

        <div className="feature-card">
          <h3>Color Harmonies</h3>
          <p>
            Explore different color harmonies including complementary, analogous, triadic, and more.
          </p>
          <Link to="/stage" className="feature-link">
            Explore Harmonies →
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Home;
