import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

export const Home: React.FC = () => {
  const { t } = useTranslation();
  const [hasShownWelcome, setHasShownWelcome] = useState(false);

  useEffect(() => {
    // Afficher l'animation de bienvenue une seule fois au chargement
    if (!hasShownWelcome) {
      toast.success(
        `🎉 ${t('home.title')}\n${t('home.subtitle')}`,
        {
          duration: 5000,
          icon: '🏠',
          style: {
            fontSize: '16px',
            padding: '20px',
            textAlign: 'center',
            lineHeight: '1.6',
          },
        }
      );
      setHasShownWelcome(true);
    }
  }, [hasShownWelcome, t]);

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">{t('home.title')}</h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-hero-primary">
              {t('home.cta')}
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="categories-section">
        <h2 className="section-title">{t('home.categoriesTitle')}</h2>
        <div className="categories-grid">
          <Link to="/products" className="category-card">
            <div className="category-icon">🍳</div>
            <h3 className="category-title">{t('home.feature1Title')}</h3>
            <p className="category-desc">{t('home.feature1Desc')}</p>
          </Link>
          <Link to="/products" className="category-card">
            <div className="category-icon">🛋️</div>
            <h3 className="category-title">{t('home.feature2Title')}</h3>
            <p className="category-desc">{t('home.feature2Desc')}</p>
          </Link>
          <Link to="/products" className="category-card">
            <div className="category-icon">🏡</div>
            <h3 className="category-title">{t('home.feature3Title')}</h3>
            <p className="category-desc">{t('home.feature3Desc')}</p>
          </Link>
        </div>
      </section>
    </div>
  );
};

