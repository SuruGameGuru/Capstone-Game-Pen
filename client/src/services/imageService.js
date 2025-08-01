// client/src/services/imageService.js
const API_BASE_URL = 'http://localhost:3001';

export const imageService = {
  // Get all images with optional filters
  async getImages(filters = {}) {
    try {
      const queryParams = new URLSearchParams();
      
      if (filters.genre) queryParams.append('genre', filters.genre);
      if (filters.user_id) queryParams.append('user_id', filters.user_id);
      if (filters.is_public !== undefined) queryParams.append('is_public', filters.is_public);
      if (filters.limit) queryParams.append('limit', filters.limit);
      if (filters.offset) queryParams.append('offset', filters.offset);
      
      const response = await fetch(`${API_BASE_URL}/api/images?${queryParams}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching images:', error);
      return [];
    }
  },

  // Get a single image by ID
  async getImage(id) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/${id}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error fetching image:', error);
      return null;
    }
  },

  // Get latest art images for landing page
  async getLatestArt(limit = 1) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images?is_public=true&limit=${limit}&offset=0`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const images = await response.json();
      // Return the latest image regardless of genre (since ExploreArt shows all images)
      return images;
    } catch (error) {
      console.error('Error fetching latest art:', error);
      return [];
    }
  },

  // Upload a new image
  async uploadImage(formData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/upload`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error uploading image:', error);
      throw error;
    }
  },

  // Like an image
  async likeImage(imageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}/like`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error liking image:', error);
      throw error;
    }
  },

  // Unlike an image
  async unlikeImage(imageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}/unlike`, {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error unliking image:', error);
      throw error;
    }
  },

  // Update image
  async updateImage(imageId, updateData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error updating image:', error);
      throw error;
    }
  },

  // Delete an image
  async deleteImage(imageId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error deleting image:', error);
      throw error;
    }
  }
}; 