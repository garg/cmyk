import React, { useState, useEffect } from 'react';
import Palettes from '../collections/palettes';
import PaletteItem from './PaletteItem';
import './PaletteList.css';

const PaletteList = ({ sortType = 'new' }) => {
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [allLoaded, setAllLoaded] = useState(false);
  const [page, setPage] = useState(1);

  useEffect(() => {
    const loadPalettes = async () => {
      setLoading(true);
      try {
        const newPalettes = await Palettes.getAll();
        setPalettes(newPalettes);
        setAllLoaded(newPalettes.length < 10 * page);
      } catch (error) {
        console.error('Error loading palettes:', error);
      } finally {
        setLoading(false);
      }
    };

    loadPalettes();
  }, [page]);

  const handleLoadMore = () => {
    setPage(prev => prev + 1);
  };

  return (
    <div className="palette-list">
      {loading && <p>Loading palettes...</p>}
      
      {!loading && palettes.map(palette => (
        <PaletteItem key={palette._id} palette={palette} />
      ))}

      {!loading && !allLoaded && (
        <button 
          className="load-more"
          onClick={handleLoadMore}
        >
          Load More
        </button>
      )}
    </div>
  );
};

export default PaletteList;
