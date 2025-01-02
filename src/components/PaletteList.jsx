import React from 'react';
import PaletteItem from './PaletteItem';
import usePalettes from '../hooks/usePalettes';
import './PaletteList.css';

const PaletteList = () => {
  const { palettes, loading, error, sortType, setSortType } = usePalettes();

  const handleSortChange = (newSortType) => {
    setSortType(newSortType);
  };

  return (
    <div className="palette-list-container">
      <div className="palette-list-header">
        <h2>Color Palettes</h2>
        <div className="sort-controls">
          <label>Sort by: </label>
          <select 
            value={sortType} 
            onChange={(e) => handleSortChange(e.target.value)}
            className="sort-select"
          >
            <option value="new">Newest</option>
            <option value="popular">Most Popular</option>
          </select>
        </div>
      </div>

      {error && <p className="error-message">Error loading palettes: {error.message}</p>}
      
      {loading ? (
        <p className="loading-message">Loading palettes...</p>
      ) : (
        <div className="palette-list">
          {palettes.length === 0 ? (
            <p className="no-palettes-message">No palettes yet. Create your first palette!</p>
          ) : (
            palettes.map(palette => (
              <PaletteItem key={palette.id} palette={palette} />
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default PaletteList;
