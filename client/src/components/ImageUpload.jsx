import React, { useState } from 'react';
import api from '../services/api';

const ImageUpload = ({ onUploadSuccess, onUploadError, uploadType = 'art' }) => {
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

  const artGenres = [
    'Art', 'Drawing', 'Painting', 'Digital Art', 'Concept Art',
    'Character Design', 'Environment Art', 'UI/UX Design',
    'Pixel Art', '3D Art', 'Animation', 'Illustration'
  ];

  const genres = uploadType === 'art' ? artGenres : gameGenres;

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = () => {
        setPreview(reader.result);
      };
      reader.readAsDataURL(selectedFile);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      alert('Please select an image file');
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('description', description);
      formData.append('genre', genre);
      formData.append('isPublic', isPublic);

      const response = await api.post('/images/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Reset form
      setFile(null);
      setDescription('');
      setGenre('');
      setIsPublic(true);
      setPreview(null);
      
      if (onUploadSuccess) {
        onUploadSuccess(response.data);
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
    <div className="image-upload">
      <form onSubmit={handleSubmit}>
        <div className="upload-section">
          <label htmlFor="image-input" className="file-input-label">
            {preview ? (
              <img src={preview} alt="Preview" className="image-preview" />
            ) : (
              <div className="upload-placeholder">
                <span>📁</span>
                <p>Click to select image</p>
              </div>
            )}
          </label>
          <input
            id="image-input"
            type="file"
            accept="image/*"
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
              placeholder="Describe your image..."
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
              Make this image public
            </label>
          </div>

          <button 
            type="submit" 
            disabled={loading || !file}
            className="upload-button"
          >
            {loading ? 'Uploading...' : 'Upload Image'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default ImageUpload; 