import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ColorWheel from './ColorWheel';
import ImageColorPicker from './ImageColorPicker';
import ReverseGamut from './ReverseGamut';
import usePalettes from '../hooks/usePalettes';
import { useToast } from '../components/Toast';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';
import './Stage.css';

const Stage = () => {
  const [activeTab, setActiveTab] = useState('harmony');
  const [wheelMode, setWheelMode] = useState('regular');
  const [paletteName, setPaletteName] = useState('');
  const [localPalette, setLocalPalette] = useState([]);
  const navigate = useNavigate();
  const { createPalette } = usePalettes();
  const { showToast } = useToast();
  const { user } = useAuth();

  const handleAddToPalette = (colors) => {
    setLocalPalette(prev => [...prev, ...colors]);
    showToast(`Added ${colors.length} color${colors.length > 1 ? 's' : ''} to palette`, 'success');
  };

  const handleRemoveColor = (index) => {
    setLocalPalette(prev => prev.filter((_, i) => i !== index));
    showToast('Color removed from palette', 'success');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!paletteName.trim()) {
      showToast('Please fill out the palette name', 'error');
      return;
    }

    if (localPalette.length === 0) {
      showToast('Please add some colors to the palette before submitting', 'error');
      return;
    }

    try {
      const palette = await createPalette({
        name: paletteName,
        colors: localPalette.map(color => ({
          hex: color.hexString,
          rgb: color.rgbString,
          hsv: color.hsvString,
          hsl: color.hslString,
          name: color.longName || color.hexString
        }))
      });
      setLocalPalette([]);
      setPaletteName('');
      showToast('Palette saved successfully!', 'success');
      navigate(`/palettes/${palette._id}`);
    } catch (error) {
      showToast(`Error saving palette: ${error.message}`, 'error');
    }
  };

  const renderTabContent = () => {
    switch (activeTab) {
      case 'harmony':
        return (
          <ColorWheel 
            onColorSelect={color => handleAddToPalette([color])}
            onAddToPalette={handleAddToPalette}
            wheelMode={wheelMode}
          />
        );
      case 'gamut':
        return (
          <ColorWheel 
            onColorSelect={color => handleAddToPalette([color])}
            onAddToPalette={handleAddToPalette}
            gamutShape="fiveSidedPolygon"
            wheelMode={wheelMode}
          />
        );
      case 'image':
        return (
          <ImageColorPicker 
            onAddToPalette={handleAddToPalette}
          />
        );
      case 'reverse':
        return (
          <ReverseGamut 
            onAddToPalette={handleAddToPalette}
            wheelMode={wheelMode}
          />
        );
      default:
        return null;
    }
  };

  return (
    <div className="stage-container">
      <div className="stage-grid">
        <div className="stage-left">
          <div className="stage-controls">
            <div className="stage-tabs">
              <button 
                className={`tab-button ${activeTab === 'harmony' ? 'active' : ''}`}
                onClick={() => setActiveTab('harmony')}
              >
                Harmonies
              </button>
              <button 
                className={`tab-button ${activeTab === 'gamut' ? 'active' : ''}`}
                onClick={() => setActiveTab('gamut')}
              >
                Gamut Masks
              </button>
              <button 
                className={`tab-button ${activeTab === 'image' ? 'active' : ''}`}
                onClick={() => setActiveTab('image')}
              >
                Image
              </button>
              <button 
                className={`tab-button ${activeTab === 'reverse' ? 'active' : ''}`}
                onClick={() => setActiveTab('reverse')}
              >
                Reverse Gamut
              </button>
            </div>
            {(activeTab === 'harmony' || activeTab === 'gamut') && (
              <div className="wheel-mode-control">
                <select
                  className="wheel-mode-select"
                  value={wheelMode}
                  onChange={(e) => setWheelMode(e.target.value)}
                >
                  <option value="regular">Regular Wheel</option>
                  <option value="yurmby">YURMBY Wheel</option>
                </select>
              </div>
            )}
          </div>
          {renderTabContent()}
        </div>

        <div className="stage-right">
          {user ? (
            <form onSubmit={handleSubmit} className="palette-form">
              <div className="form-group">
                <label htmlFor="paletteName">Name</label>
                <input
                  id="paletteName"
                  type="text"
                  value={paletteName}
                  onChange={(e) => setPaletteName(e.target.value)}
                  placeholder="Palette Name"
                  className="palette-name-input"
                />
              </div>
              <button 
                type="submit" 
                className="submit-button"
                disabled={!paletteName.trim() || localPalette.length === 0}
              >
                Save Palette
              </button>
            </form>
          ) : (
            <div className="login-prompt">
              <p>Log in to save your palettes</p>
              <Link to="/login" className="login-button">
                Log In
              </Link>
            </div>
          )}

          <div className="local-palette">
            <h3>Palette</h3>
            {localPalette.length > 0 ? (
              <div className="color-list">
                {localPalette.map((color, index) => (
                  <div key={index} className="color-detail">
                    <div className="color-header">
                      <h4>{color.longName || color.hexString}</h4>
                      <button
                        className="delete-button"
                        onClick={() => handleRemoveColor(index)}
                        aria-label="Remove color"
                      >
                        ×
                      </button>
                    </div>
                    <div 
                      className="color-preview" 
                      style={{ backgroundColor: color.hexString }}
                    />
                    <div className="color-info">
                      <div>Hex: {color.hex}</div>
                      <div>{color.rgbString}</div>
                      <div>{color.hsvString}</div>
                      <div>{color.hslString}</div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-palette">
                <p>Click on the color wheel or use the image picker to add colors</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Stage;
