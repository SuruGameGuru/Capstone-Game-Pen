// client/src/services/videoService.js
import api from './api';

const videoService = {
  // Upload video
  async uploadVideo(formData) {
    try {
      const response = await api.post('/videos/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error) {
      console.error('Error uploading video:', error);
      throw error;
    }
  },

  // Get all videos with optional filters
  async getVideos(filters = {}) {
    try {
      const params = new URLSearchParams();
      
      if (filters.genre) params.append('genre', filters.genre);
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.is_public !== undefined) params.append('is_public', filters.is_public);
      if (filters.limit) params.append('limit', filters.limit);
      if (filters.offset) params.append('offset', filters.offset);
      
      const response = await api.get(`/videos?${params.toString()}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }
  },

  // Get single video by ID
  async getVideo(id) {
    try {
      const response = await api.get(`/videos/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching video:', error);
      throw error;
    }
  },

  // Get latest videos
  async getLatestVideos(limit = 10) {
    try {
      const response = await api.get(`/videos/latest/${limit}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching latest videos:', error);
      throw error;
    }
  },

  // Get user's videos
  async getUserVideos(userId, isPublic = true) {
    try {
      const response = await api.get('/videos', {
        params: {
          user_id: userId,
          is_public: isPublic
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching user videos:', error);
      throw error;
    }
  },

  // Get videos by genre
  async getVideosByGenre(genre, limit = 20) {
    try {
      const response = await api.get('/videos', {
        params: {
          genre: genre,
          is_public: true,
          limit: limit
        }
      });
      return response.data;
    } catch (error) {
      console.error('Error fetching videos by genre:', error);
      throw error;
    }
  },

  // Check if user has liked a video
  async checkIfLiked(videoId) {
    try {
      const response = await api.get(`/videos/${videoId}/check-like`);
      return response.data.hasLiked;
    } catch (error) {
      console.error('Error checking video like status:', error);
      return false;
    }
  },

  // Like a video
  async likeVideo(videoId) {
    try {
      const response = await api.post(`/videos/${videoId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error liking video:', error);
      throw error;
    }
  },

  // Unlike a video
  async unlikeVideo(videoId) {
    try {
      const response = await api.delete(`/videos/${videoId}/like`);
      return response.data;
    } catch (error) {
      console.error('Error unliking video:', error);
      throw error;
    }
  },

  // Get video like count
  async getVideoLikes(videoId) {
    try {
      const response = await api.get(`/videos/${videoId}/likes`);
      return response.data.likeCount;
    } catch (error) {
      console.error('Error fetching video likes:', error);
      return 0;
    }
  },

  // Delete video
  async deleteVideo(videoId) {
    try {
      const response = await api.delete(`/videos/${videoId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  },

  // Search videos
  async searchVideos(searchTerm, filters = {}) {
    try {
      const allVideos = await this.getVideos(filters);
      
      if (!searchTerm) return allVideos;
      
      return allVideos.filter(video => 
        video.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.genre?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        video.username?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    } catch (error) {
      console.error('Error searching videos:', error);
      throw error;
    }
  }
};

export { videoService }; 