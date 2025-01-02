import React from 'react';
import { Link } from 'react-router-dom';
import styled from '@emotion/styled';

const FeatureLink = styled(Link)`
  display: inline-block;
  color: #4CAF50;
  text-decoration: none;
  font-weight: 500;
  margin-top: 1rem;
  padding: 0.5rem 0;
  cursor: pointer;
  &:hover {
    text-decoration: underline;
  }
`;

const FeaturesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 2rem;
  padding: 2rem;
`;

const FeatureCard = styled.div`
  background: white;
  border-radius: 8px;
  padding: 2rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  h3 {
    margin-top: 0;
    margin-bottom: 1rem;
  }
  p {
    color: #666;
    margin-bottom: 1.5rem;
  }
`;

const HeroSection = styled.div`
  text-align: center;
  padding: 3rem 2rem;
  h1 {
    font-size: 2.5rem;
    margin-bottom: 1rem;
  }
  .subtitle {
    font-size: 1.2rem;
    color: #666;
  }
`;

const Home = () => {
  return (
    <div>
      <HeroSection>
        <h1>Welcome to CMYK Color Wheel</h1>
        <p className="subtitle">
          Create, explore, and save beautiful color palettes with our intuitive tools
        </p>
      </HeroSection>

      <FeaturesGrid>
        <FeatureCard>
          <h3>Color Harmonies</h3>
          <p>
            Explore different color harmonies including complementary, analogous, triadic, and more to create balanced color combinations.
          </p>
          <FeatureLink to="/harmonies">
            Try Harmonies →
          </FeatureLink>
        </FeatureCard>

        <FeatureCard>
          <h3>Gamut Masks</h3>
          <p>
            Use customizable gamut masks to create color combinations within specific color spaces and constraints.
          </p>
          <FeatureLink to="/gamut-masks">
            Try Gamut Masks →
          </FeatureLink>
        </FeatureCard>

        <FeatureCard>
          <h3>Image Colors</h3>
          <p>
            Extract color palettes from your favorite images. Simply drag and drop to discover the colors that make them beautiful.
          </p>
          <FeatureLink to="/image-picker">
            Extract Colors →
          </FeatureLink>
        </FeatureCard>

        <FeatureCard>
          <h3>Save Palettes</h3>
          <p>
            Create an account to save your favorite color combinations and access them anywhere.
          </p>
          <FeatureLink to="/palettes">
            View Palettes →
          </FeatureLink>
        </FeatureCard>
      </FeaturesGrid>
    </div>
  );
};

export default Home;
