import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productAPI } from '../services/api';
import { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';

// Produits statiques avec plusieurs images
const staticProductsWithImages: Record<string, Product & { images: string[] }> = {
  '1': {
    _id: '1',
    name: 'Plante Monstera',
    description: 'Magnifique plante d\'intérieur avec de grandes feuilles vertes. Parfaite pour purifier l\'air de votre maison. Cette plante tropicale est facile à entretenir et apporte une touche de nature à votre intérieur.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1519336056116-9e848d0bce5d?w=800',
    category: 'Plantes',
    stock: 15,
    images: [
      'https://images.unsplash.com/photo-1519336056116-9e848d0bce5d?w=800',
      'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=800',
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
    ],
  },
  '2': {
    _id: '2',
    name: 'Pot en Céramique',
    description: 'Pot élégant en céramique blanche, idéal pour vos plantes. Disponible en plusieurs tailles. Design moderne et minimaliste qui s\'adapte à tous les styles de décoration.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
    category: 'Accessoires',
    stock: 8,
    images: [
      'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=800',
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    ],
  },
  '3': {
    _id: '3',
    name: 'Ficus Lyrata',
    description: 'Plante d\'intérieur populaire avec des feuilles en forme de violon. Facile à entretenir et parfaite pour les débutants. Cette plante apporte une ambiance tropicale à votre espace.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=800',
    category: 'Plantes',
    stock: 12,
    images: [
      'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=800',
      'https://images.unsplash.com/photo-1519336056116-9e848d0bce5d?w=800',
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
    ],
  },
  '4': {
    _id: '4',
    name: 'Engrais Organique',
    description: 'Engrais naturel pour plantes d\'intérieur. Favorise une croissance saine et vigoureuse. 100% biologique et respectueux de l\'environnement.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
    category: 'Soins',
    stock: 25,
    images: [
      'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=800',
      'https://images.unsplash.com/photo-1519336056116-9e848d0bce5d?w=800',
      'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=800',
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    ],
  },
  '5': {
    _id: '5',
    name: 'Suspension Macramé',
    description: 'Support suspendu en macramé pour vos plantes. Design moderne et élégant. Fabriqué à la main avec des matériaux de qualité.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
    category: 'Accessoires',
    stock: 6,
    images: [
      'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=800',
      'https://images.unsplash.com/photo-1519336056116-9e848d0bce5d?w=800',
      'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=800',
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
    ],
  },
  '6': {
    _id: '6',
    name: 'Aloe Vera',
    description: 'Plante succulente aux propriétés apaisantes. Parfaite pour les débutants en jardinage. Facile à entretenir et très résistante.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
    category: 'Plantes',
    stock: 20,
    images: [
      'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=800',
      'https://images.unsplash.com/photo-1519336056116-9e848d0bce5d?w=800',
      'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=800',
      'https://images.unsplash.com/photo-1416879595882-3373a0480b5b?w=800',
      'https://images.unsplash.com/photo-1466692476868-aef1dfb1e735?w=800',
    ],
  },
};

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [product, setProduct] = useState<(Product & { images?: string[] }) | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        setLoading(true);
        if (id && staticProductsWithImages[id]) {
          setProduct(staticProductsWithImages[id]);
        } else {
          const data = await productAPI.getById(id!);
          setProduct(data);
        }
      } catch (err) {
        // En cas d'erreur, utiliser les données statiques si disponibles
        if (id && staticProductsWithImages[id]) {
          setProduct(staticProductsWithImages[id]);
        }
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchProduct();
    }
  }, [id]);

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <div className="error-container">
          <p>{t('products.notFound')}</p>
          <button onClick={() => navigate('/products')} className="btn btn-primary">
            {t('products.backToList')}
          </button>
        </div>
      </div>
    );
  }

  const images = product.images || (product.image ? [product.image] : []);
  const displayImages = images.length >= 5 ? images.slice(0, 5) : images;

  return (
    <div className="product-details-page">
      <button onClick={() => navigate('/products')} className="back-button">
        ← {t('common.back')}
      </button>

      <div className="product-details-container">
        <div className="product-images-section">
          <div className="main-image-wrapper">
            <img
              src={displayImages[selectedImageIndex] || product.image}
              alt={product.name}
              className="main-image"
            />
          </div>
          <div className="thumbnail-gallery">
            {displayImages.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImageIndex(index)}
                className={`thumbnail ${selectedImageIndex === index ? 'active' : ''}`}
              >
                <img src={img} alt={`${product.name} - Vue ${index + 1}`} />
              </button>
            ))}
          </div>
        </div>

        <div className="product-info-section">
          {product.category && (
            <span className="product-category-badge">{product.category}</span>
          )}
          <h1 className="product-title">{product.name}</h1>
          <div className="product-price-large">
            {formatPrice(product.price)}
          </div>
          <p className="product-description-full">{product.description}</p>



          <div className="product-actions">
            <button className="btn-add-to-cart" disabled={product.stock === 0}>
              {t('products.addToCart')}
            </button>
            <button className="btn-wishlist">
              ♡ {t('products.addToWishlist')}
            </button>
          </div>

          <div className="product-features">
            <h3>{t('products.features')}</h3>
            <ul>
              <li>{t('products.feature1')}</li>
              <li>{t('products.feature2')}</li>
              <li>{t('products.feature3')}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

