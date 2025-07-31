import React, { useState, useRef, useEffect } from 'react';

const DominantColorThumbnail = ({ imageUrl, alt, className }) => {
  const [imageLoaded, setImageLoaded] = useState(false);
  const [scaledDimensions, setScaledDimensions] = useState({ width: 120, height: 120 });
  const containerRef = useRef(null);

  // Function to calculate scaled dimensions
  const calculateScaledDimensions = (image, containerHeight) => {
    const aspectRatio = image.naturalWidth / image.naturalHeight;
    const scaledHeight = containerHeight;
    const scaledWidth = scaledHeight * aspectRatio;
    
    return { width: scaledWidth, height: scaledHeight };
  };

  useEffect(() => {
    if (!imageUrl) {
      console.log('DominantColorThumbnail: No imageUrl provided');
      return;
    }

    console.log('DominantColorThumbnail: Loading image from URL:', imageUrl);
    const image = new Image();
    
    image.onload = () => {
      console.log('DominantColorThumbnail: Image loaded successfully');
      try {
        // Get container height - use a reasonable default if not available
        const containerHeight = containerRef.current?.offsetHeight || 200;
        console.log('DominantColorThumbnail: Container height:', containerHeight);
        
        // Calculate scaled dimensions
        const dimensions = calculateScaledDimensions(image, containerHeight);
        console.log('DominantColorThumbnail: Scaled dimensions:', dimensions);
        setScaledDimensions(dimensions);
        
        setImageLoaded(true);
      } catch (error) {
        console.error('Error processing image:', error);
        setImageLoaded(true);
      }
    };
    
    image.onerror = () => {
      console.error('Failed to load image:', imageUrl);
      setImageLoaded(true);
    };
    
    image.src = imageUrl;
  }, [imageUrl]);

  return (
    <div 
      ref={containerRef}
      className={className}
      style={{
        backgroundColor: '#D9D9D9', // Simple fallback color
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        width: '100%',
        height: '100%'
      }}
    >
      {imageLoaded && (
        <img
          src={imageUrl}
          alt={alt}
          style={{
            width: `${scaledDimensions.width}px`,
            height: `${scaledDimensions.height}px`,
            objectFit: 'cover',
            borderRadius: '1rem'
          }}
        />
      )}
      {!imageLoaded && (
        <div style={{ color: '#666', fontSize: '14px' }}>Loading...</div>
      )}
    </div>
  );
};

export default DominantColorThumbnail; 