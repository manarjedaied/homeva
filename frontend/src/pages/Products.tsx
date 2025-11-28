import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productAPI } from '../services/api';
import { Product } from '../types';
import { formatPrice } from '../utils/formatPrice';

// Produits statiques pour la démonstration
const staticProducts: Product[] = [
  {
    _id: '1',
    name: 'Plante Monstera',
    description: 'Magnifique plante d\'intérieur avec de grandes feuilles vertes. Parfaite pour purifier l\'air de votre maison.',
    price: 29.99,
    image: 'https://images.unsplash.com/photo-1519336056116-9e848d0bce5d?w=400',
    category: 'Plantes',
    stock: 15,
  },
  {
    _id: '2',
    name: 'Pot en Céramique',
    description: 'Pot élégant en céramique blanche, idéal pour vos plantes. Disponible en plusieurs tailles.',
    price: 19.99,
    image: 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400',
    category: 'Accessoires',
    stock: 8,
  },
  {
    _id: '3',
    name: 'Ficus Lyrata',
    description: 'Plante d\'intérieur populaire avec des feuilles en forme de violon. Facile à entretenir.',
    price: 34.99,
    image: 'https://images.unsplash.com/photo-1463154545680-d59320fd685d?w=400',
    category: 'Plantes',
    stock: 12,
  },
  {
    _id: '4',
    name: 'Engrais Organique',
    description: 'Engrais naturel pour plantes d\'intérieur. Favorise une croissance saine et vigoureuse.',
    price: 12.99,
    image: 'https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?w=400',
    category: 'Soins',
    stock: 25,
  },
  {
    _id: '5',
    name: 'Suspension Macramé',
    description: 'Support suspendu en macramé pour vos plantes. Design moderne et élégant.',
    price: 24.99,
    image: 'https://images.unsplash.com/photo-1516253593875-bd7ba052fbc5?w=400',
    category: 'Accessoires',
    stock: 6,
  },
  {
    _id: '6',
    name: 'Aloe Vera',
    description: 'Plante succulente aux propriétés apaisantes. Parfaite pour les débutants en jardinage.',
    price: 14.99,
    image: 'https://images.unsplash.com/photo-1509423350716-97f9360b4e09?w=400',
    category: 'Plantes',
    stock: 20,
  },
];

export const Products: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getAll();
        // Utiliser les produits statiques si l'API ne retourne rien
        setProducts(data.length > 0 ? data : staticProducts);
      } catch (err) {
        // En cas d'erreur, utiliser les produits statiques
        setProducts(staticProducts);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  const categories = ['all', ...Array.from(new Set(products.map(p => p.category).filter((cat): cat is string => Boolean(cat))))];
  const filteredProducts = selectedCategory === 'all' 
    ? products 
    : products.filter(p => p.category === selectedCategory);

  if (loading) {
    return (
      <div className="products-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1 className="products-title">{t('products.title')}</h1>
        <p className="products-subtitle">
          {products.length} {products.length === 1 ? 'produit disponible' : 'produits disponibles'}
        </p>
      </div>

      {categories.length > 1 && (
        <div className="products-filters">
          {categories.map((category) => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`filter-btn ${selectedCategory === category ? 'active' : ''}`}
            >
              {category === 'all' ? 'Tous' : category}
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <div className="no-products">
          <p>{t('products.noProducts')}</p>
        </div>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => (
            <div 
              key={product._id} 
              className="product-card"
              onClick={() => navigate(`/products/${product._id}`)}
            >
              <div className="product-image-wrapper">
                <img 
                  src={product.image || 'https://via.placeholder.com/300x300?text=Produit'} 
                  alt={product.name} 
                  className="product-image" 
                />
                {product.stock && product.stock < 10 && (
                  <span className="product-badge">Stock limité</span>
                )}
              </div>
              <div className="product-content">
                {product.category && (
                  <span className="product-category">{product.category}</span>
                )}
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <div className="product-footer">
                  <div className="product-price-wrapper">
                    <span className="product-price">{formatPrice(product.price)}</span>

                  </div>
                  <button 
                    className="product-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      // Logique pour ajouter au panier
                    }}
                  >
                    {t('products.addToCart')}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

