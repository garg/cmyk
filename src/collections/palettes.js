const STORAGE_KEY = 'cmyk_palettes';

const Palettes = {
  getAll: () => {
    try {
      const palettes = localStorage.getItem(STORAGE_KEY);
      if (!palettes) {
        // Initialize with a default palette
        const defaultPalette = {
          id: Date.now().toString(),
          name: 'Sample Palette',
          colors: ['#FF5733', '#33FF57', '#3357FF', '#FF33F5'],
          createdAt: new Date().toISOString(),
          votes: 0
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify([defaultPalette]));
        return [defaultPalette];
      }
      return JSON.parse(palettes);
    } catch (error) {
      console.error('Error fetching palettes from localStorage:', error);
      return [];
    }
  },

  getById: (id) => {
    try {
      const palettes = Palettes.getAll();
      return palettes.find(palette => palette.id === id);
    } catch (error) {
      console.error('Error fetching palette:', error);
      throw error;
    }
  },

  create: (paletteData) => {
    try {
      const palettes = Palettes.getAll();
      const newPalette = {
        ...paletteData,
        id: Date.now().toString(), // Simple unique ID
        createdAt: new Date().toISOString(),
        votes: 0
      };
      
      const updatedPalettes = [newPalette, ...palettes];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPalettes));
      return newPalette;
    } catch (error) {
      console.error('Error creating palette:', error);
      throw error;
    }
  },

  update: (id, paletteData) => {
    try {
      const palettes = Palettes.getAll();
      const updatedPalettes = palettes.map(palette => 
        palette.id === id ? { ...palette, ...paletteData } : palette
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPalettes));
      return updatedPalettes.find(p => p.id === id);
    } catch (error) {
      console.error('Error updating palette:', error);
      throw error;
    }
  },

  delete: (id) => {
    try {
      const palettes = Palettes.getAll();
      const updatedPalettes = palettes.filter(palette => palette.id !== id);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPalettes));
      return true;
    } catch (error) {
      console.error('Error deleting palette:', error);
      throw error;
    }
  },

  vote: (id) => {
    try {
      const palettes = Palettes.getAll();
      const updatedPalettes = palettes.map(palette => 
        palette.id === id ? { ...palette, votes: (palette.votes || 0) + 1 } : palette
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPalettes));
      return updatedPalettes.find(p => p.id === id);
    } catch (error) {
      console.error('Error voting for palette:', error);
      throw error;
    }
  },

  unvote: (id) => {
    try {
      const palettes = Palettes.getAll();
      const updatedPalettes = palettes.map(palette => 
        palette.id === id ? { ...palette, votes: Math.max(0, (palette.votes || 0) - 1) } : palette
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedPalettes));
      return updatedPalettes.find(p => p.id === id);
    } catch (error) {
      console.error('Error unvoting for palette:', error);
      throw error;
    }
  }
};

export default Palettes;
