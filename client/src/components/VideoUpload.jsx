import React, { useState } from 'react';
import { videoService } from '../services/videoService';

const VideoUpload = ({ onUploadSuccess, onUploadError, uploadType = 'game' }) => {
  const [file, setFile] = useState(null);
  const [description, setDescription] = useState('');
  const [genre, setGenre] = useState('');
  const [isPublic, setIsPublic] = useState(true);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);

  const gameGenres = [
    'Action', 'Adventure', 'RPG', 'Strategy', 'Puzzle', 
    'Racing', 'Sports', 'Simulation', 'Horror', 'Comedy', 
    'Fantasy', 'Sci-Fi'
  ];

  const genres = gameGenres; // Videos are always game demos

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create video preview
      const videoUrl = URL.createObjectURL(selectedFile);
      setPreview(videoUrl);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select a video file');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('video', file);
      formData.append('description', description);
      formData.append('genre', genre);
      formData.append('isPublic', isPublic);

      const response = await videoService.uploadVideo(formData);

      // Reset form
      setFile(null);
      setDescription('');
      setGenre('');
      setIsPublic(true);
      setPreview(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(response);
      }
    } catch (error) {
      console.error('Upload error:', error);
      if (onUploadError) {
        onUploadError(error.response?.data?.message || 'Upload failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="video-upload">
      <form onSubmit={handleSubmit}>
        <div className="upload-section">
          <label htmlFor="video-input" className="file-input-label">
            {preview ? (
              <video 
                src={preview} 
                controls 
                className="video-preview"
                style={{ maxWidth: '100%', maxHeight: '300px' }}
              />
            ) : (
              <div className="upload-placeholder">
                <span>🎬</span>
                <p>Click to select video</p>
              </div>
            )}
          </label>
          <input
            id="video-input"
            type="file"
            accept="video/*"
            onChange={handleFileChange}
            style={{ display: 'none' }}
          />
        </div>

        <div className="upload-form">
          <div className="form-group">
            <label htmlFor="description">Description:</label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your game demo..."
              rows="3"
            />
          </div>

          <div className="form-group">
            <label htmlFor="genre">Genre:</label>
            <select
              id="genre"
              value={genre}
              onChange={(e) => setGenre(e.target.value)}
            >
              <option value="">Select a genre</option>
              {genres.map((g) => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>
              <input
                type="checkbox"
                checked={isPublic}
                onChange={(e) => setIsPublic(e.target.checked)}
              />
              Make this video public
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || !file}
            className="upload-button"
          >
            {loading ? 'Uploading...' : 'Upload Video'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default VideoUpload; 