import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import i18n from "../i18n/config";
import { productAPI, orderAPI, settingsAPI, Settings, getImageUrl } from "../services/api";
import { Product } from "../types";
import { formatPrice } from "../utils/formatPrice";
import reviewsData from "../data/reviews.json";

export const ProductDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [product, setProduct] = useState<Product | null>(null);
  const [settings, setSettings] = useState<Settings | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const [orderMessage, setOrderMessage] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const [form, setForm] = useState({
    clientName: "",
    phone: "",
    ville: "",
    address: "",
    quantity: 1,
  });

  // -------------------------
  // Random Reviews Selection
  // -------------------------
  const [randomReviews, setRandomReviews] = useState<typeof reviewsData>([]);

  useEffect(() => {
    // Sélectionner 4 avis aléatoires
    const shuffled = [...reviewsData].sort(() => 0.5 - Math.random());
    setRandomReviews(shuffled.slice(0, 4));
  }, []);

  // -------------------------
  // Fetch product and settings
  // -------------------------
  useEffect(() => {
  if (window.fbq && product) {
    window.fbq("track", "ViewContent", {
      content_name: product.name,
      content_ids: [product._id],
      content_type: "product",
      value: product.price,
      currency: "TND",
    });
  }
}, [product]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [productData, settingsData] = await Promise.all([
          productAPI.getById(id!),
          settingsAPI.get()
        ]);
        setProduct(productData);
        setSettings(settingsData);
      } catch (err) {
        console.error("Error loading data:", err);
      } finally {
        setLoading(false);
      }
    };

    if (id) fetchData();
  }, [id]);

  if (loading) {
    return (
      <div className="product-details-page">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t("common.loading")}</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="product-details-page">
        <p>{t("products.notFound")}</p>
        <button onClick={() => navigate("/products")} className="btn btn-primary">
          {t("products.backToList")}
        </button>
      </div>
    );
  }

  // -------------------------
  // PRICE CALCULATIONS
  // -------------------------
  const quantity = form.quantity;
  
  // Utiliser les paramètres du produit en priorité, sinon les settings globaux, sinon valeurs par défaut
  const quantityDiscountEnabled = product.quantityDiscountEnabled !== null && product.quantityDiscountEnabled !== undefined
    ? product.quantityDiscountEnabled
    : (settings?.quantityDiscountEnabled ?? true);
  const discountPercentage = product.quantityDiscountPercentage !== null && product.quantityDiscountPercentage !== undefined
    ? product.quantityDiscountPercentage
    : (settings?.quantityDiscountPercentage ?? 5);
  const discountMinQuantity = product.quantityDiscountMinQuantity !== null && product.quantityDiscountMinQuantity !== undefined
    ? product.quantityDiscountMinQuantity
    : (settings?.quantityDiscountMinQuantity ?? 2);
  
  const freeDeliveryEnabled = product.freeDeliveryEnabled !== null && product.freeDeliveryEnabled !== undefined
    ? product.freeDeliveryEnabled
    : (settings?.freeDeliveryEnabled ?? true);
  const freeDeliveryMinQuantity = product.freeDeliveryMinQuantity !== null && product.freeDeliveryMinQuantity !== undefined
    ? product.freeDeliveryMinQuantity
    : (settings?.freeDeliveryMinQuantity ?? 3);
  
  const deliveryFee = product.customDeliveryFee !== null && product.customDeliveryFee !== undefined
    ? product.customDeliveryFee
    : (settings?.defaultDeliveryFee ?? 7);
  
  // Prix unitaire en tenant compte de la promo du produit
  const unitPrice = product.pourcentagePromo 
    ? product.price * (1 - product.pourcentagePromo / 100)
    : product.price;
    
  const subtotal = unitPrice * quantity;

  // Vérifier si la remise quantité s'applique
  const hasDiscount = quantityDiscountEnabled && quantity >= discountMinQuantity;
  const discountAmount = hasDiscount ? subtotal * (discountPercentage / 100) : 0;

  const priceAfterDiscount = subtotal - discountAmount;

  // Vérifier si la livraison est gratuite
  const isFreeDelivery = freeDeliveryEnabled && quantity >= freeDeliveryMinQuantity;
  const finalDeliveryFee = isFreeDelivery ? 0 : deliveryFee;

  const totalPrice = priceAfterDiscount + finalDeliveryFee;

  const images = product.images && product.images.length
    ? product.images.map(img => getImageUrl(img))
    : [];

  // -------------------------
  // SUBMIT ORDER
  // -------------------------
  const submitOrder = async (e: React.FormEvent) => {
    e.preventDefault();

    setSubmitting(true);
    setOrderMessage(null);

    if (!form.clientName || !form.phone || !form.ville || !form.address) {
      setOrderMessage({ type: "error", text: t("orders.pleaseFillAll") });
      setSubmitting(false);
      return;
    }

    try {
      const createdOrder = await orderAPI.create({
        clientName: form.clientName,
        phone: form.phone,
        ville: form.ville,
        address: form.address,
        product: product._id,
        quantity: form.quantity,
        
        // Informations de prix
        unitPrice: product.price,
        productPromoPercentage: product.pourcentagePromo || 0,
        unitPriceWithPromo: unitPrice,
        subtotal: subtotal,
        quantityDiscountPercentage: hasDiscount ? discountPercentage : 0,
        quantityDiscountAmount: discountAmount,
        priceAfterDiscount: priceAfterDiscount,
        deliveryFee: finalDeliveryFee,
        isFreeDelivery: isFreeDelivery,
        totalPrice: totalPrice,
        deliveryType: "domicile"
      } as any);

      // Afficher la notification de succès avec toast
      toast.success(t("orders.orderSuccess"), {
  duration: 3000,
  icon: "✅",
});

// Redirection avec récap commande
navigate("/order-success", {
  state: {
    _id: createdOrder._id,
    productName: product.name,
    quantity: form.quantity,
    totalPrice: totalPrice,
    phone: form.phone,
    ville: form.ville,
    deliveryType: "Livraison à domicile"
  }
});

      
      setOrderMessage({ type: "success", text: t("orders.orderSuccess") });

      // Réinitialiser le formulaire après 5 secondes
      setTimeout(() => {
        setForm({
          clientName: "",
          phone: "",
          ville: "",
          address: "",
          quantity: 1,
        });
        setOrderMessage(null);
      }, 5000);
    } catch (err) {
      toast.error(t("orders.orderError"), {
        duration: 5000,
        icon: "❌",
      });
      setOrderMessage({ type: "error", text: t("orders.orderError") });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="product-details-page">
      <button className="back-button" onClick={() => navigate("/products")}>
        ← {t("common.back")}
      </button>

      <div className="product-details-container">
        {/* ------------------------- */}
        {/* IMAGE GALLERY */}
        {/* ------------------------- */}
        <div className="product-images-section">
          <div className="main-image-wrapper">
            <img
              src={images[selectedImage] || ""}
              alt={product.name}
              className="main-image"
            />
          </div>

          <div className="thumbnail-gallery">
            {images.map((img, index) => (
              <button
                key={index}
                onClick={() => setSelectedImage(index)}
                className={`thumbnail ${selectedImage === index ? "active" : ""}`}
              >
                <img src={img} alt={`${product.name} view ${index}`} />
              </button>
            ))}
          </div>
        </div>

        {/* ------------------------- */}
        {/* PRODUCT INFO */}
        {/* ------------------------- */}
        <div className="product-info-section">
          {product.category && (
            <span className="product-category-badge">
              {typeof product.category === "string" ? product.category : product.category.name}
            </span>
          )}

          <h1 className="product-title">{product.name}</h1>
          
          {/* Badge Stock limité */}
          {product.stockLimite && (
            <div className="limited-stock-badge">
              <span className="limited-stock-icon">⚠️</span>
              <span>{t("products.limitedStock")}</span>
            </div>
          )}

          {/* Rating - 5 étoiles statiques */}
          <div className="product-rating">
            <div className="stars-container">
              {[...Array(5)].map((_, index) => (
                <span key={index} className="star filled">★</span>
              ))}
            </div>
            <span className="rating-text">{t("products.rating")}: 5.0</span>
          </div>
          
          {/* Prix avec gestion de la promo */}
          <div className="product-price-wrapper">
            {product.pourcentagePromo ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <span style={{
                    textDecoration: 'line-through',
                    color: '#999',
                    fontSize: '1.2em'
                  }}>
                    {formatPrice(product.price)}
                  </span>
                  <span style={{
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    padding: '4px 10px',
                    borderRadius: '11px',
                    fontSize: '0.9em',
                    fontWeight: 'bold'
                  }}>
                    -{product.pourcentagePromo}%
                  </span>
                </div>
                <span className="product-price-large">
                  {formatPrice(
                    product.price * (1 - product.pourcentagePromo / 100)
                  )}
                </span>
              </div>
            ) : (
              <span className="product-price-large">
                {formatPrice(product.price)}
              </span>
            )}
          </div>

          <p className="product-description-full">{product.description}</p>

          {/* ------------------------- */}
          {/* ORDER FORM */}
          {/* ------------------------- */}
          <div className="order-form-container">
            <h3>{t("orders.orderForm")}</h3>

            {orderMessage && (
              <div className={`order-message ${orderMessage.type}`}>
                {orderMessage.text}
              </div>
            )}

            <form className="order-form" onSubmit={submitOrder}>
              <div className="form-group">
                <label>{t("orders.clientName")} *</label>
                <input
                  type="text"
                  value={form.clientName}
                  onChange={(e) =>
                    setForm({ ...form, clientName: e.target.value })
                  }
                />
              </div>

              <div className="form-group">
                <label>{t("orders.phone")} *</label>
                <input
                  type="number"
                  value={form.phone}
                  onChange={(e) => setForm({ ...form, phone: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>الولاية *</label>
                <input
                  type="text"
                  value={form.ville}
                  onChange={(e) => setForm({ ...form, ville: e.target.value })}
                />
              </div>

              <div className="form-group">
                <label>{t("orders.address")} *</label>
                <textarea
                  rows={3}
                  value={form.address}
                  onChange={(e) => setForm({ ...form, address: e.target.value })}
                />
              </div>

              {/* PROMO SECTION */}
              {settings && (
                <div className="promo-section">
                  {quantityDiscountEnabled && (
                    <div className="promo-item">
                      <span className="promo-icon">🎁</span>
                      <span className="promo-text">
                        {(() => {
                          const currentLang = i18n.language || 'fr';
                          const isArabic = currentLang === 'ar';
                          const isEnglish = currentLang === 'en';
                          
                          if (isArabic) {
                            return `${discountMinQuantity} منتج = -${discountPercentage}%`;
                          } else if (isEnglish) {
                            return `${discountMinQuantity} product${discountMinQuantity > 1 ? 's' : ''} = -${discountPercentage}%`;
                          } else {
                            return `${discountMinQuantity} produit${discountMinQuantity > 1 ? 's' : ''} = -${discountPercentage}%`;
                          }
                        })()}
                      </span>
                    </div>
                  )}
                  {freeDeliveryEnabled && (
                    <div className="promo-item">
                      <span className="promo-icon">🚚</span>
                      <span className="promo-text">
                        {(() => {
                          const currentLang = i18n.language || 'fr';
                          const isArabic = currentLang === 'ar';
                          const isEnglish = currentLang === 'en';
                          
                          if (isArabic) {
                            return `${freeDeliveryMinQuantity} منتج = توصيل مجاني`;
                          } else if (isEnglish) {
                            return `${freeDeliveryMinQuantity} product${freeDeliveryMinQuantity > 1 ? 's' : ''} = Free delivery`;
                          } else {
                            return `${freeDeliveryMinQuantity} produit${freeDeliveryMinQuantity > 1 ? 's' : ''} = Livraison gratuite`;
                          }
                        })()}
                      </span>
                    </div>
                  )}
                </div>
              )}

              {/* QUANTITY */}
              <div className="form-group">
                <label>{t("orders.quantity")}</label>
                <div className="quantity-controls">
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() =>
                      form.quantity > 1 &&
                      setForm({ ...form, quantity: form.quantity - 1 })
                    }
                    disabled={form.quantity <= 1}
                  >
                    -
                  </button>
                  <input
                    type="number"
                    min={1}
                    max={999}
                    value={form.quantity}
                    onChange={(e) => {
                      const value = parseInt(e.target.value) || 1;
                      const maxValue = 999;
                      setForm({ 
                        ...form, 
                        quantity: Math.min(Math.max(1, value), maxValue) 
                      });
                    }}
                    className="quantity-input"
                  />
                  <button
                    type="button"
                    className="quantity-btn"
                    onClick={() => {
                      const maxValue = 999;
                      if (form.quantity < maxValue) {
                        setForm({ ...form, quantity: form.quantity + 1 });
                      }
                    }}
                    disabled={form.quantity >= 999}
                  >
                    +
                  </button>
                </div>
              </div>

              {/* PRICE SUMMARY */}
              <div className="price-summary-section">
                <div className="price-summary-row">
                  <span className="price-summary-label">
                    {t("orders.price")} {quantity > 1 && `(${quantity}x)`}
                  </span>
                  <span className="price-summary-value">{formatPrice(subtotal)}</span>
                </div>

                {hasDiscount && (
                  <div className="price-summary-row price-summary-discount">
                    <span className="price-summary-label">
                      {t("orders.discount")} (-{discountPercentage}%)
                      <span className="save-badge">
                        {t("orders.youSave")}: {formatPrice(discountAmount)}
                      </span>
                    </span>
                    <span className="price-summary-value discount-value">
                      -{formatPrice(discountAmount)}
                    </span>
                  </div>
                )}

                <div className="price-summary-row">
                  <span className="price-summary-label">
                    {isFreeDelivery ? (
                      <>
                        {t("orders.delivery")}
                        <span className="free-delivery-indicator">
                          {" ✨ "}{t("orders.freeDelivery")}
                        </span>
                      </>
                    ) : (
                      t("orders.delivery")
                    )}
                  </span>
                  <span className={`price-summary-value ${isFreeDelivery ? "free-delivery" : ""}`}>
                    {isFreeDelivery ? t("orders.freeDelivery") : formatPrice(deliveryFee)}
                  </span>
                </div>

                <div className="price-summary-row price-summary-total">
                  <span className="price-summary-label">{t("orders.total")}</span>
                  <span className="price-summary-value">{formatPrice(totalPrice)}</span>
                </div>
              </div>

              <div className="form-actions">
                <button 
                  type="submit" 
                  className="btn-submit-order" 
                  disabled={submitting}
                >
                  {submitting ? t("common.loading") : t("orders.submitOrder")}
                </button>
                <button
                  type="button"
                  className="btn-cancel-order"
                  onClick={() => {
                    setForm({
                      clientName: "",
                      phone: "",
                      ville: "",
                      address: "",
                      quantity: 1,
                    });
                    setOrderMessage(null);
                  }}
                  disabled={submitting}
                >
                  {t("common.cancel")}
                </button>
              </div>
            </form>
          </div>
   {/* 
<div className="product-landing">
  <img
    src="/img/land.png"
    alt="Landing promotion"
    className="product-landing-image"
  />
 

</div>*/}
          {/* ------------------------- */}
          {/* CUSTOMER REVIEWS */}
          {/* ------------------------- */}
          <div className="customer-reviews-section">
            <div className="reviews-header">
              <h3>{t("reviews.title")}</h3>
              <p className="reviews-subtitle">{t("reviews.subtitle")}</p>
            </div>
            <div className="reviews-grid">
              {randomReviews.map((review) => (
                <div key={review.id} className="review-card">
                  <div className="review-header">
                    <div className="reviewer-info">
                      <div className="reviewer-avatar">
                        {review.name.charAt(0)}
                      </div>
                      <div className="reviewer-details">
                        <h4 className="reviewer-name">{review.name}</h4>
                        <span className="review-verified">✓ {t("reviews.verified")}</span>
                      </div>
                    </div>
                    <div className="review-rating">
                      {[...Array(review.rating)].map((_, i) => (
                        <span key={i} className="star">⭐</span>
                      ))}
                    </div>
                  </div>
                  <p className="review-comment">{review.comment}</p>
                </div>
              ))}
            </div>
          </div>

          {/* ------------------------- */}
          {/* PRODUCT FEATURES */}
          {/* ------------------------- */}
          <div className="product-features">
            <h3>{t("products.features")}</h3>
            <ul>
              <li>{t("products.feature1")}</li>
              <li>{t("products.feature2")}</li>
              <li>{t("products.feature3")}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};