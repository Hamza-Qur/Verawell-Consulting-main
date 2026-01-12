import React, { useState, useEffect } from 'react';
import { BASE_URL } from '../redux/services/endpoint';
import defaultProfilePic from '../otherImages/UserPic.png';

const ProfileImage = ({ src, alt, className, style }) => {
  const [imageUrl, setImageUrl] = useState(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (src) {
      // If src is already a full URL
      if (src.startsWith('http')) {
        setImageUrl(src);
      } 
      // If src is a relative path from API
      else if (src.startsWith('/storage/')) {
        // Remove leading slash
        const cleanPath = src.substring(1);
        // Add timestamp to bust cache and avoid CORS preflight
        const url = `${BASE_URL}/${cleanPath}?t=${Date.now()}`;
        setImageUrl(url);
      }
      // If it's just a filename
      else {
        const url = `${BASE_URL}/storage/profiles/${src}?t=${Date.now()}`;
        setImageUrl(url);
      }
    } else {
      setImageUrl(null);
    }
    setHasError(false);
  }, [src]);

  const handleError = () => {
    console.log("Image failed to load:", imageUrl);
    setHasError(true);
  };

  return (
    <img
      src={hasError || !imageUrl ? defaultProfilePic : imageUrl}
      alt={alt}
      className={className}
      style={style}
      onError={handleError}
      crossOrigin="anonymous" // Try this for CORS
    />
  );
};

export default ProfileImage;