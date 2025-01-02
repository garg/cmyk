import { useState, useEffect } from 'react';
import Palettes from '../collections/palettes';

const usePalettes = () => {
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [sortType, setSortType] = useState('new');

  const loadPalettes = () => {
    try {
      const allPalettes = Palettes.getAll();
      const sortedPalettes = sortPalettes(allPalettes, sortType);
      setPalettes(sortedPalettes);
      setError(null);
    } catch (err) {
      setError(err);
    } finally {
      setLoading(false);
    }
  };

  const sortPalettes = (palettesToSort, type) => {
    switch (type) {
      case 'popular':
        return [...palettesToSort].sort((a, b) => (b.votes || 0) - (a.votes || 0));
      case 'new':
      default:
        return [...palettesToSort].sort((a, b) => 
          new Date(b.createdAt) - new Date(a.createdAt)
        );
    }
  };

  useEffect(() => {
    loadPalettes();
  }, [sortType]);

  const createPalette = (paletteData) => {
    try {
      const newPalette = Palettes.create(paletteData);
      loadPalettes(); // Reload to maintain sort order
      return newPalette;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const updatePalette = (id, updatedData) => {
    try {
      const updated = Palettes.update(id, updatedData);
      loadPalettes(); // Reload to maintain sort order
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const deletePalette = (id) => {
    try {
      Palettes.delete(id);
      loadPalettes(); // Reload to maintain sort order
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const votePalette = (id) => {
    try {
      const updated = Palettes.vote(id);
      loadPalettes(); // Reload to maintain sort order
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  const unvotePalette = (id) => {
    try {
      const updated = Palettes.unvote(id);
      loadPalettes(); // Reload to maintain sort order
      return updated;
    } catch (err) {
      setError(err);
      throw err;
    }
  };

  return {
    palettes,
    loading,
    error,
    createPalette,
    updatePalette,
    deletePalette,
    votePalette,
    unvotePalette,
    sortType,
    setSortType
  };
};

export default usePalettes;
