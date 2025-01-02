import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3000/api';

const Palettes = {
  getAll: async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/palettes`);
      return response.data;
    } catch (error) {
      console.error('Error fetching palettes:', error);
      throw error;
    }
  },

  getById: async (id) => {
    try {
      const response = await axios.get(`${API_BASE_URL}/palettes/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching palette:', error);
      throw error;
    }
  },

  create: async (paletteData, token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/palettes`, paletteData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error creating palette:', error);
      throw error;
    }
  },

  update: async (id, paletteData, token) => {
    try {
      const response = await axios.put(`${API_BASE_URL}/palettes/${id}`, paletteData, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error updating palette:', error);
      throw error;
    }
  },

  delete: async (id, token) => {
    try {
      const response = await axios.delete(`${API_BASE_URL}/palettes/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error deleting palette:', error);
      throw error;
    }
  },

  vote: async (paletteId, token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/palettes/${paletteId}/vote`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error voting for palette:', error);
      throw error;
    }
  },

  unvote: async (paletteId, token) => {
    try {
      const response = await axios.post(`${API_BASE_URL}/palettes/${paletteId}/unvote`, {}, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error unvoting for palette:', error);
      throw error;
    }
  }
};

export default Palettes;
