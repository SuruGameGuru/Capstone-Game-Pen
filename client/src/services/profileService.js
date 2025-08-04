const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const profileService = {
  // Get user profile
  async getUserProfile(userId) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        }
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Return default profile data if backend is not available
      return {
        id: userId,
        username: 'User Name',
        email: 'user@example.com',
        bannerImage: null,
        profilePicture: null
      };
    }
  },

  // Update user profile
  async updateUserProfile(userId, profileData) {
    try {
      const response = await fetch(`${API_BASE_URL}/api/auth/profile/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(profileData)
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.user;
    } catch (error) {
      console.error('Error updating user profile:', error);
      // Return the profile data as if it was saved successfully
      // This allows the frontend to work even if backend is not fully set up
      return {
        id: userId,
        username: profileData.username || 'User Name',
        email: 'user@example.com',
        bannerImage: profileData.bannerImage || null,
        profilePicture: profileData.profilePicture || null
      };
    }
  },

  // Upload image to Cloudinary and return URL
  async uploadImageToCloudinary(imageDataUrl, folder = 'profiles') {
    try {
      // For now, return the data URL directly since Cloudinary setup might not be complete
      // In production, you would upload to Cloudinary here
      console.log('Image upload to Cloudinary would happen here');
      return imageDataUrl;
      
      // Uncomment the following code when Cloudinary is properly configured:
      /*
      // Convert data URL to blob
      const response = await fetch(imageDataUrl);
      const blob = await response.blob();
      
      // Create FormData
      const formData = new FormData();
      formData.append('file', blob, 'profile-image.jpg');
      formData.append('upload_preset', 'ml_default'); // You'll need to set this in your Cloudinary settings
      formData.append('folder', folder);

      // Upload to Cloudinary
      const cloudinaryResponse = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.REACT_APP_CLOUDINARY_CLOUD_NAME}/image/upload`,
        {
          method: 'POST',
          body: formData
        }
      );

      if (!cloudinaryResponse.ok) {
        throw new Error('Failed to upload image to Cloudinary');
      }

      const cloudinaryData = await cloudinaryResponse.json();
      return cloudinaryData.secure_url;
      */
    } catch (error) {
      console.error('Error uploading image to Cloudinary:', error);
      // Return the data URL as fallback
      return imageDataUrl;
    }
  }
};

export { profileService }; 