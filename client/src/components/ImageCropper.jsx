import React, { useState, useRef, useEffect } from 'react';
import '../styles/ImageCropper.css';

const ImageCropper = ({ 
  imageSrc, 
  onCrop, 
  onCancel, 
  aspectRatio = 1, // 1 for square (profile pic), 3 for banner (3:1 ratio)
  cropType = 'profile' // 'profile' or 'banner'
}) => {
  const [crop, setCrop] = useState({ x: 0, y: 0, width: 200, height: 200 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imageSize, setImageSize] = useState({ width: 0, height: 0 });
  
  const containerRef = useRef(null);
  const imageRef = useRef(null);
  const cropRef = useRef(null);

  useEffect(() => {
    if (imageSrc && imageRef.current) {
      const img = new Image();
      img.onload = () => {
        setImageSize({ width: img.width, height: img.height });
        setImageLoaded(true);
        
        // Initialize crop area
        const containerWidth = containerRef.current?.clientWidth || 400;
        const containerHeight = containerRef.current?.clientHeight || 300;
        
        let cropWidth, cropHeight;
        if (cropType === 'banner') {
          // Banner: 3:1 aspect ratio
          cropWidth = Math.min(containerWidth * 0.8, containerWidth - 40);
          cropHeight = cropWidth / 3;
        } else {
          // Profile: 1:1 aspect ratio (square)
          cropWidth = Math.min(containerWidth * 0.6, containerHeight * 0.6, 200);
          cropHeight = cropWidth;
        }
        
        const cropX = (containerWidth - cropWidth) / 2;
        const cropY = (containerHeight - cropHeight) / 2;
        
        setCrop({
          x: cropX,
          y: cropY,
          width: cropWidth,
          height: cropHeight
        });
      };
      img.src = imageSrc;
    }
  }, [imageSrc, cropType]);

  const handleMouseDown = (e) => {
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    // Check if click is inside crop area
    if (x >= crop.x && x <= crop.x + crop.width &&
        y >= crop.y && y <= crop.y + crop.height) {
      setIsDragging(true);
      setDragStart({ x: x - crop.x, y: y - crop.y });
    }
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newX = Math.max(0, Math.min(x - dragStart.x, containerRef.current.clientWidth - crop.width));
    const newY = Math.max(0, Math.min(y - dragStart.y, containerRef.current.clientHeight - crop.height));
    
    setCrop(prev => ({
      ...prev,
      x: newX,
      y: newY
    }));
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleResize = (direction, e) => {
    e.stopPropagation();
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    let newCrop = { ...crop };
    
    switch (direction) {
      case 'nw':
        newCrop.width = Math.max(50, crop.x + crop.width - x);
        newCrop.height = cropType === 'banner' ? newCrop.width / 3 : newCrop.width;
        newCrop.x = x;
        newCrop.y = y;
        break;
      case 'ne':
        newCrop.width = Math.max(50, x - crop.x);
        newCrop.height = cropType === 'banner' ? newCrop.width / 3 : newCrop.width;
        newCrop.y = y;
        break;
      case 'sw':
        newCrop.width = Math.max(50, crop.x + crop.width - x);
        newCrop.height = cropType === 'banner' ? newCrop.width / 3 : newCrop.width;
        newCrop.x = x;
        break;
      case 'se':
        newCrop.width = Math.max(50, x - crop.x);
        newCrop.height = cropType === 'banner' ? newCrop.width / 3 : newCrop.width;
        break;
    }
    
    // Ensure crop stays within bounds
    newCrop.x = Math.max(0, Math.min(newCrop.x, containerRef.current.clientWidth - newCrop.width));
    newCrop.y = Math.max(0, Math.min(newCrop.y, containerRef.current.clientHeight - newCrop.height));
    
    setCrop(newCrop);
  };

  const handleCrop = () => {
    if (!imageLoaded) return;
    
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    // Set canvas size to crop dimensions
    canvas.width = crop.width;
    canvas.height = crop.height;
    
    // Calculate source coordinates based on crop position and image scale
    const containerWidth = containerRef.current.clientWidth;
    const containerHeight = containerRef.current.clientHeight;
    const scaleX = imageSize.width / containerWidth;
    const scaleY = imageSize.height / containerHeight;
    
    const sourceX = crop.x * scaleX;
    const sourceY = crop.y * scaleY;
    const sourceWidth = crop.width * scaleX;
    const sourceHeight = crop.height * scaleY;
    
    // Draw cropped image to canvas
    ctx.drawImage(
      imageRef.current,
      sourceX, sourceY, sourceWidth, sourceHeight,
      0, 0, crop.width, crop.height
    );
    
    // Convert to data URL
    const croppedImageUrl = canvas.toDataURL('image/jpeg', 0.9);
    onCrop(croppedImageUrl);
  };

  if (!imageSrc) return null;

  return (
    <div className="image-cropper-overlay">
      <div className="image-cropper-modal">
        <div className="image-cropper-header">
          <h3>Crop {cropType === 'banner' ? 'Banner' : 'Profile Picture'}</h3>
          <button className="image-cropper-close" onClick={onCancel}>×</button>
        </div>
        
        <div className="image-cropper-content">
          <div 
            className="image-cropper-container"
            ref={containerRef}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img
              ref={imageRef}
              src={imageSrc}
              alt="Crop preview"
              className="image-cropper-image"
            />
            
            {imageLoaded && (
              <div
                ref={cropRef}
                className="image-cropper-crop-area"
                style={{
                  left: crop.x,
                  top: crop.y,
                  width: crop.width,
                  height: crop.height
                }}
              >
                {/* Resize handles */}
                <div 
                  className="image-cropper-handle image-cropper-handle-nw"
                  onMouseDown={(e) => handleResize('nw', e)}
                />
                <div 
                  className="image-cropper-handle image-cropper-handle-ne"
                  onMouseDown={(e) => handleResize('ne', e)}
                />
                <div 
                  className="image-cropper-handle image-cropper-handle-sw"
                  onMouseDown={(e) => handleResize('sw', e)}
                />
                <div 
                  className="image-cropper-handle image-cropper-handle-se"
                  onMouseDown={(e) => handleResize('se', e)}
                />
              </div>
            )}
          </div>
          
          <div className="image-cropper-instructions">
            <p>Drag to move the crop area. Use the corner handles to resize.</p>
            <p>Aspect ratio is locked to {cropType === 'banner' ? '3:1' : '1:1'}.</p>
          </div>
        </div>
        
        <div className="image-cropper-actions">
          <button className="image-cropper-btn image-cropper-btn-secondary" onClick={onCancel}>
            Cancel
          </button>
          <button className="image-cropper-btn image-cropper-btn-primary" onClick={handleCrop}>
            Apply Crop
          </button>
        </div>
      </div>
    </div>
  );
};

export default ImageCropper; 