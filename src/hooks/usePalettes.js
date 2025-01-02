import { useState, useEffect } from 'react';
import axios from 'axios';

const usePalettes = () => {
  const [palettes, setPalettes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [allLoaded, setAllLoaded] = useState(false);
  const [sortType, setSortType] = useState('new');

  const loadMore = () => {
    setPage(prev => prev + 1);
  };

  useEffect(() => {
    const fetchPalettes = async (type = sortType, pageNum = page) => {
      setLoading(true);
      try {
        const response = await axios.get(`/api/palettes`, {
          params: {
            sort: type,
            page: pageNum,
            limit: 12
          }
        });
        
        if (pageNum === 1) {
          setPalettes(response.data);
        } else {
          setPalettes(prev => [...prev, ...response.data]);
        }
        
        setAllLoaded(response.data.length < 12);
        setSortType(type);
      } catch (err) {
        setError(err);
      } finally {
        setLoading(false);
      }
    };

    fetchPalettes();
  }, [page, sortType]);

  const createPalette = async (paletteData) => {
    try {
      const response = await axios.post('/api/palettes', paletteData);
      setPalettes([response.data, ...palettes]);
    } catch (err) {
      setError(err);
    }
  };

  const updatePalette = async (id, updatedData) => {
    try {
      const response = await axios.put(`/api/palettes/${id}`, updatedData);
      setPalettes(palettes.map(p => p._id === id ? response.data : p));
    } catch (err) {
      setError(err);
    }
  };

  const deletePalette = async (id) => {
    try {
      await axios.delete(`/api/palettes/${id}`);
      setPalettes(palettes.filter(p => p._id !== id));
    } catch (err) {
      setError(err);
    }
  };

  return {
    palettes,
    loading,
    error,
    allLoaded,
    createPalette,
    updatePalette,
    deletePalette,
    loadMore,
    sortType
  };
};

export default usePalettes;
