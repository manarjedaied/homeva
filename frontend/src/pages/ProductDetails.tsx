import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { productAPI, orderAPI } from '../services/api';
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
  const [orderFormData, setOrderFormData] = useState({
    clientName: '',
    phone: '',
    address: '',
    quantity: 1,
  });
  const [submitting, setSubmitting] = useState(false);
  const [orderMessage, setOrderMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  // Calculs pour le récapitulatif
  const DELIVERY_FEE = 7; // Frais de livraison en TND
  const DISCOUNT_PERCENTAGE = 5; // Remise de 5% UNIQUEMENT pour 2 produits
  const PRODUCT_DISCOUNT_PERCENTAGE = 25; // Remise affichée sur le produit (20% ou 30%)
  const unitPrice = product.price; // Prix actuel (après remise)
  const originalPrice = unitPrice / (1 - PRODUCT_DISCOUNT_PERCENTAGE / 100); // Calcul du prix original
  const quantity = orderFormData.quantity;
  const subtotal = unitPrice * quantity;
  const hasDiscount = quantity === 2; // Remise uniquement pour exactement 2 produits
  const discountAmount = hasDiscount ? (subtotal * DISCOUNT_PERCENTAGE) / 100 : 0;
  const priceAfterDiscount = subtotal - discountAmount;
  const isFreeDelivery = quantity >= 3;
  const deliveryFee = isFreeDelivery ? 0 : DELIVERY_FEE;
  const total = priceAfterDiscount + deliveryFee;

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
          <div className="product-price-container">
            <div className="product-price-original">
              {formatPrice(originalPrice)}
            </div>
            <div className="product-discount-badge">
              -{PRODUCT_DISCOUNT_PERCENTAGE}%
            </div>
            <div className="product-price-large">
              {formatPrice(product.price)}
            </div>
          </div>
          <p className="product-description-full">{product.description}</p>

          <div className="order-form-container">
              <h3>{t('orders.orderForm')}</h3>
              {orderMessage && (
                <div className={`order-message ${orderMessage.type}`}>
                  {orderMessage.text}
                </div>
              )}
              <form 
                className="order-form"
                onSubmit={async (e) => {
                  e.preventDefault();
                  setSubmitting(true);
                  setOrderMessage(null);
                  
                  // Validation
                  if (!orderFormData.clientName || !orderFormData.phone || !orderFormData.address) {
                    setOrderMessage({ type: 'error', text: t('orders.pleaseFillAll') });
                    setSubmitting(false);
                    return;
                  }

                  try {
                    await orderAPI.create({
                      clientName: orderFormData.clientName,
                      email: '', // Email non requis dans le formulaire mais requis par le backend
                      phone: orderFormData.phone,
                      address: orderFormData.address,
                      product: product._id,
                      quantity: orderFormData.quantity,
                    } as any);
                    
                    setOrderMessage({ type: 'success', text: t('orders.orderSuccess') });
                    // Reset form after 2 seconds
                    setTimeout(() => {
                      setOrderFormData({
                        clientName: '',
                        phone: '',
                        address: '',
                        quantity: 1,
                      });
                      setOrderMessage(null);
                    }, 2000);
                  } catch (error) {
                    setOrderMessage({ type: 'error', text: t('orders.orderError') });
                  } finally {
                    setSubmitting(false);
                  }
                }}
              >
                <div className="form-group">
                  <label htmlFor="clientName">{t('orders.clientName')} *</label>
                  <input
                    type="text"
                    id="clientName"
                    value={orderFormData.clientName}
                    onChange={(e) => setOrderFormData({ ...orderFormData, clientName: e.target.value })}
                    required
                  />
                </div>



                <div className="form-group">
                  <label htmlFor="phone">{t('orders.phone')} *</label>
                  <input
                    type="tel"
                    id="phone"
                    value={orderFormData.phone}
                    onChange={(e) => setOrderFormData({ ...orderFormData, phone: e.target.value })}
                    required
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="address">{t('orders.address')} *</label>
                  <textarea
                    id="address"
                    value={orderFormData.address}
                    onChange={(e) => setOrderFormData({ ...orderFormData, address: e.target.value })}
                    required
                    rows={3}
                  />
                </div>

                <div className="promo-section">
                  <div className="promo-item">
                    <span className="promo-icon">🎁</span>
                    <span className="promo-text">{t('orders.promo2Products')}</span>
                  </div>
                  <div className="promo-item">
                    <span className="promo-icon">🚚</span>
                    <span className="promo-text">{t('orders.promo3Products')}</span>
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="quantity">{t('orders.quantity')}</label>
                  <div className="quantity-controls">
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => {
                        if (orderFormData.quantity > 1) {
                          setOrderFormData({ ...orderFormData, quantity: orderFormData.quantity - 1 });
                        }
                      }}
                      disabled={orderFormData.quantity <= 1}
                    >
                      -
                    </button>
                    <input
                      type="number"
                      id="quantity"
                      min="1"
                      max={product.stock || 999}
                      value={orderFormData.quantity}
                      onChange={(e) => {
                        const value = parseInt(e.target.value) || 1;
                        const maxValue = product.stock || 999;
                        setOrderFormData({ ...orderFormData, quantity: Math.min(Math.max(1, value), maxValue) });
                      }}
                      className="quantity-input"
                    />
                    <button
                      type="button"
                      className="quantity-btn"
                      onClick={() => {
                        const maxValue = product.stock || 999;
                        if (orderFormData.quantity < maxValue) {
                          setOrderFormData({ ...orderFormData, quantity: orderFormData.quantity + 1 });
                        }
                      }}
                      disabled={orderFormData.quantity >= (product.stock || 999)}
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="form-actions">
                  <button 
                    type="submit" 
                    className="btn-submit-order"
                    disabled={submitting}
                  >
                    {submitting ? t('common.loading') : t('orders.submitOrder')}
            </button>
                  <button 
                    type="button" 
                    className="btn-cancel-order"
                    onClick={() => {
                      setOrderFormData({
                        clientName: '',
                        phone: '',
                        address: '',
                        quantity: 1,
                      });
                      setOrderMessage(null);
                    }}
                    disabled={submitting}
                  >
                    {t('common.cancel')}
            </button>
                </div>

                <div className="price-summary-section">
                  <div className="price-summary-row">
                    <span className="price-summary-label">{t('orders.price')} {quantity > 1 && `(${quantity}x)`}</span>
                    <span className="price-summary-value">{formatPrice(subtotal)}</span>
                  </div>
                  {hasDiscount && (
                    <div className="price-summary-row price-summary-discount">
                      <span className="price-summary-label">
                        {t('orders.discount')} (-{DISCOUNT_PERCENTAGE}%)
                        <span className="save-badge">{t('orders.youSave')}: {formatPrice(discountAmount)}</span>
                      </span>
                      <span className="price-summary-value discount-value">-{formatPrice(discountAmount)}</span>
                    </div>
                  )}
                  <div className="price-summary-row">
                    <span className="price-summary-label">
                      {isFreeDelivery ? (
                        <>
                          {t('orders.delivery')}
                          <span className="free-delivery-indicator"> ✨ {t('orders.freeDelivery')}</span>
                        </>
                      ) : (
                        t('orders.delivery')
                      )}
                    </span>
                    <span className={`price-summary-value ${isFreeDelivery ? 'free-delivery' : ''}`}>
                      {isFreeDelivery ? t('orders.freeDelivery') : formatPrice(deliveryFee)}
                    </span>
                  </div>
                  <div className="price-summary-row price-summary-total">
                    <span className="price-summary-label">{t('orders.total')}</span>
                    <span className="price-summary-value">{formatPrice(total)}</span>
                  </div>
                </div>
              </form>
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

