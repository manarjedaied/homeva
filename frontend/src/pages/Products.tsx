import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { productAPI } from "../services/api";
import { Product } from "../types";
import { formatPrice } from "../utils/formatPrice";
import { useTranslation } from "react-i18next";

export const Products: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState("all");

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        const data = await productAPI.getAll();
        setProducts(data);
      } catch (error) {
        console.error("Erreur chargement produits :", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Extraire catégories uniques
  const categories = [
    "all",
    ...Array.from(
      new Set(
        products
          .map((p) => (typeof p.category === "string" ? p.category : p.category?.name))
          .filter(Boolean)
      )
    ),
  ];

  const filteredProducts =
    selectedCategory === "all"
      ? products
      : products.filter(
          (p) =>
            (typeof p.category === "string" ? p.category : p.category?.name) ===
            selectedCategory
        );

  if (loading) {
    return (
      <div className="products-page">
        <p>Chargement...</p>
      </div>
    );
  }

  return (
    <div className="products-page">
      <div className="products-header">
        <h1 className="products-title">{t("products.title")}</h1>
        <p className="products-subtitle">
          {products.length} produit(s) trouvé(s)
        </p>
      </div>

      {categories.length > 1 && (
        <div className="products-filters">
          {categories.map((category) => (
            <button
              key={category}
onClick={() => setSelectedCategory(category || "all")}
              className={`filter-btn ${
                selectedCategory === category ? "active" : ""
              }`}
            >
              {category === "all" ? "Tous" : category}
            </button>
          ))}
        </div>
      )}

      {filteredProducts.length === 0 ? (
        <p>Aucun produit trouvé.</p>
      ) : (
        <div className="products-grid">
          {filteredProducts.map((product) => {
            const categoryLabel =
              typeof product.category === "string"
                ? product.category
                : product.category?.name;

            const firstImage =
              product.images && product.images.length > 0
                ? `http://localhost:5000${product.images[0]}`
                : "https://via.placeholder.com/300x300?text=Produit";

            return (
              <div
                key={product._id}
                className="product-card"
                onClick={() => navigate(`/products/${product._id}`)}
              >
                <div className="product-image-wrapper">
                  <img
                    src={firstImage}
                    alt={product.name}
                    className="product-image"
                  />

                  {/* Badge stock limité */}
                  {product.stockLimite && (
                    <span className="product-badge">Stock limité</span>
                  )}

                
                </div>

                <div className="product-content">
                  {categoryLabel && (
                    <span className="product-category">{categoryLabel}</span>
                  )}

                  <h3 className="product-name">{product.name}</h3>
                  <p className="product-description">{product.description}</p>

                  <div className="product-footer">
                    <div className="product-price-wrapper">
                      {product.pourcentagePromo ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <span style={{
                              textDecoration: 'line-through',
                              color: '#999',
                              fontSize: '0.9em'
                            }}>
                              {formatPrice(product.price)}
                            </span>
                            <span style={{
                              backgroundColor: '#e74c3c',
                              color: 'white',
                              padding: '2px 6px',
                              borderRadius: '11px',
                              fontSize: '0.85em',
                              fontWeight: 'bold'
                            }}>
                              -{product.pourcentagePromo}%
                            </span>
                          </div>
                          <span className="product-price" >
                            {formatPrice(
                              product.price * (1 - product.pourcentagePromo / 100)
                            )}
                          </span>
                        </div>
                      ) : (
                        <span className="product-price">
                          {formatPrice(product.price)}
                        </span>
                      )}
                    </div>

                    <button
                      className="product-btn"
                      onClick={(e) => {
                        e.stopPropagation();
                        console.log("Ajouter au panier :", product._id);
                      }}
                    >
                      {t("products.addToCart")}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
