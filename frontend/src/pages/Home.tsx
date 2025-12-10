import React from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

export const Home: React.FC = () => {
  const { t } = useTranslation();

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <div className="hero-badge">{t('home.badge')}</div>
          <h1 className="hero-title">{t('home.title')}</h1>
          <p className="hero-subtitle">{t('home.subtitle')}</p>
          <div className="hero-actions">
            <Link to="/products" className="btn-hero-primary">
              {t('home.cta')}
            </Link>
            <a href="#categories" className="btn-hero-secondary">
              {t('home.ctaSecondary')}
            </a>
          </div>
          <div className="hero-stats">
            <div className="stat-item">
              <span className="stat-icon">🎯</span>
              <span className="stat-label">{t('home.stat1')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">⚡</span>
              <span className="stat-label">{t('home.stat2')}</span>
            </div>
            <div className="stat-item">
              <span className="stat-icon">❤️</span>
              <span className="stat-label">{t('home.stat3')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Badges */}
      <section className="trust-section">
        <div className="trust-badges">
          <div className="trust-badge">
            <span className="trust-icon">✓</span>
            <span className="trust-text">{t('home.trust1')}</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">🚚</span>
            <span className="trust-text">{t('home.trust2')}</span>
          </div>
          <div className="trust-badge">
            <span className="trust-icon">↻</span>
            <span className="trust-text">{t('home.trust3')}</span>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section id="categories" className="categories-section">
        <div className="section-header">
          <h2 className="section-title">{t('home.categoriesTitle')}</h2>
          <p className="section-subtitle">{t('home.categoriesSubtitle')}</p>
        </div>
        <div className="categories-grid">
          <Link to="/products?category=kitchen" className="category-card">
            <div className="category-icon">🍳</div>
            <h3 className="category-title">{t('home.category1Title')}</h3>
            <p className="category-desc">{t('home.category1Desc')}</p>
            <span className="category-link">{t('home.categoryLink')}</span>
          </Link>
          <Link to="/products?category=living" className="category-card">
            <div className="category-icon">🛋️</div>
            <h3 className="category-title">{t('home.category2Title')}</h3>
            <p className="category-desc">{t('home.category2Desc')}</p>
            <span className="category-link">{t('home.categoryLink')}</span>
          </Link>
          <Link to="/products?category=bedroom" className="category-card">
            <div className="category-icon">🛏️</div>
            <h3 className="category-title">{t('home.category3Title')}</h3>
            <p className="category-desc">{t('home.category3Desc')}</p>
            <span className="category-link">{t('home.categoryLink')}</span>
          </Link>
          <Link to="/products?category=bathroom" className="category-card">
            <div className="category-icon">🚿</div>
            <h3 className="category-title">{t('home.category4Title')}</h3>
            <p className="category-desc">{t('home.category4Desc')}</p>
            <span className="category-link">{t('home.categoryLink')}</span>
          </Link>
          <Link to="/products?category=office" className="category-card">
            <div className="category-icon">💼</div>
            <h3 className="category-title">{t('home.category5Title')}</h3>
            <p className="category-desc">{t('home.category5Desc')}</p>
            <span className="category-link">{t('home.categoryLink')}</span>
          </Link>
          <Link to="/products?category=outdoor" className="category-card">
            <div className="category-icon">🏡</div>
            <h3 className="category-title">{t('home.category6Title')}</h3>
            <p className="category-desc">{t('home.category6Desc')}</p>
            <span className="category-link">{t('home.categoryLink')}</span>
          </Link>
        </div>
      </section>

      {/* Why Choose Us Section */}
      <section className="why-section">
        <div className="section-header">
          <h2 className="section-title">{t('home.whyTitle')}</h2>
          <p className="section-subtitle">{t('home.whySubtitle')}</p>
        </div>
        <div className="why-grid">
          <div className="why-card">
            <div className="why-icon">⭐</div>
            <h3 className="why-title">{t('home.why1Title')}</h3>
            <p className="why-desc">{t('home.why1Desc')}</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🚀</div>
            <h3 className="why-title">{t('home.why2Title')}</h3>
            <p className="why-desc">{t('home.why2Desc')}</p>
          </div>
          <div className="why-card">
            <div className="why-icon">💰</div>
            <h3 className="why-title">{t('home.why3Title')}</h3>
            <p className="why-desc">{t('home.why3Desc')}</p>
          </div>
          <div className="why-card">
            <div className="why-icon">🛡️</div>
            <h3 className="why-title">{t('home.why4Title')}</h3>
            <p className="why-desc">{t('home.why4Desc')}</p>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section">
        <div className="section-header">
          <h2 className="section-title">{t('home.testimonialsTitle')}</h2>
          <p className="section-subtitle">{t('home.testimonialsSubtitle')}</p>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">{t('home.testimonial1Text')}</p>
            <div className="testimonial-author">
              <strong>{t('home.testimonial1Author')}</strong>
              <span>{t('home.testimonial1Location')}</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">{t('home.testimonial2Text')}</p>
            <div className="testimonial-author">
              <strong>{t('home.testimonial2Author')}</strong>
              <span>{t('home.testimonial2Location')}</span>
            </div>
          </div>
          <div className="testimonial-card">
            <div className="testimonial-rating">⭐⭐⭐⭐⭐</div>
            <p className="testimonial-text">{t('home.testimonial3Text')}</p>
            <div className="testimonial-author">
              <strong>{t('home.testimonial3Author')}</strong>
              <span>{t('home.testimonial3Location')}</span>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="cta-section">
        <div className="cta-content">
          <h2 className="cta-title">{t('home.ctaTitle')}</h2>
          <p className="cta-text">{t('home.ctaText')}</p>
          <Link to="/products" className="btn-cta">
            {t('home.ctaButton')}
          </Link>
        </div>
      </section>
    </div>
  );
};