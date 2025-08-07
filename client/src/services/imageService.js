// client/src/services/imageService.js
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

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
      
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }
      
      const url = `${API_BASE_URL}/api/images?${queryParams}`;
      console.log('imageService: Making request to:', url);
      console.log('imageService: Filters:', filters);
      console.log('imageService: Headers:', headers);
      
      const response = await fetch(url, {
        headers
      });
      
      console.log('imageService: Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('imageService: Response data:', data);
      return data;
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}/like`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}/unlike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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

  // Check if current user has liked an image
  async checkIfLiked(imageId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}/check-like`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.liked;
    } catch (error) {
      console.error('Error checking like status:', error);
      return false;
    }
  },

  // Dislike an image
  async dislikeImage(imageId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}/dislike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error disliking image:', error);
      throw error;
    }
  },

  // Undislike an image
  async undislikeImage(imageId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}/undislike`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      return await response.json();
    } catch (error) {
      console.error('Error undisliking image:', error);
      throw error;
    }
  },

  // Check if current user has disliked an image
  async checkIfDisliked(imageId) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}/check-dislike`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      return data.disliked;
    } catch (error) {
      console.error('Error checking dislike status:', error);
      return false;
    }
  },

  // Update image
  async updateImage(imageId, updateData) {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
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
      const token = localStorage.getItem('token');
      const response = await fetch(`${API_BASE_URL}/api/images/${imageId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
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