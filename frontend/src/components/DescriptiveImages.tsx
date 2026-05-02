import React, { useEffect, useState } from 'react';
import { DescImgProd } from '../types';
import { getImageUrl } from '../services/api';
import './DescriptiveImages.css';

interface DescriptiveImagesProps {
  productId: string;
}

export const DescriptiveImages: React.FC<DescriptiveImagesProps> = ({ productId }) => {
  const [images, setImages] = useState<DescImgProd[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        setLoading(true);
        setError(null);
        const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const API_BASE_URL = `${API_URL}/api`;
        
        const response = await fetch(`${API_BASE_URL}/desc-imgs/product/${productId}`);
        if (!response.ok) {
          throw new Error('Failed to load images');
        }
        const data = await response.json();
        
        // Trier par isMain (true d'abord), puis par position
        const sorted = (data as DescImgProd[]).sort((a, b) => {
          if (a.isMain !== b.isMain) {
            return a.isMain ? -1 : 1;
          }
          return (a.position || 0) - (b.position || 0);
        });
        
        setImages(sorted);
      } catch (err) {
        console.error('Error loading descriptive images:', err);
        setError(err instanceof Error ? err.message : 'Error loading images');
      } finally {
        setLoading(false);
      }
    };

    if (productId) {
      fetchImages();
    }
  }, [productId]);

  if (loading) {
    return <div className="descriptive-images loading">Chargement des images...</div>;
  }

  if (error || images.length === 0) {
    return null; // Ne pas afficher si pas d'images
  }

  // Séparer les images par type
  const heroImages = images.filter(img => img.type === 'hero');
  const otherImages = images.filter(img => img.type !== 'hero');

  return (
    <div className="descriptive-images-section">
      {/* Hero images en grand */}
      {heroImages.length > 0 && (
        <div className="hero-images">
          {heroImages.map((image) => (
            <div key={image._id} className="hero-image-wrapper">
              <img
                src={getImageUrl(image.url)}
                alt={image.alt || 'Product image'}
                className="hero-image"
              />
              {image.caption && (
                <p className="image-caption">
                  {typeof image.caption === 'string' ? image.caption : image.caption[navigator.language.split('-')[0]] || ''}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Autres images en grille */}
      {otherImages.length > 0 && (
        <div className="other-images">
          <div className="images-grid">
            {otherImages.map((image) => (
              <div key={image._id} className="image-card">
                <img
                  src={getImageUrl(image.url)}
                  alt={image.alt || 'Product image'}
                  className="card-image"
                />
                {image.caption && (
                  <p className="image-caption">
                    {typeof image.caption === 'string' ? image.caption : image.caption[navigator.language.split('-')[0]] || ''}
                  </p>
                )}
                <span className="image-type-badge">{image.type}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
