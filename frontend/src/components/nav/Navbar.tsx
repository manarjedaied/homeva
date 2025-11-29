import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { MoonIcon, SunIcon } from '../icons/ThemeIcons';
import { LanguageSwitcher } from './LanguageSwitcher';

export const Navbar: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <header className="header">
      <nav className="nav">
        <Link to="/" className="logo-container">
          <img src="/img/logo.png" alt="Homeva Logo" className="logo-image" />
          <span className="logo-text">Homeva</span>
        </Link>
        <div className="nav-links">
          <Link to="/" className={isActive('/') ? 'active' : ''}>
            {t('nav.home')}
          </Link>
          <Link to="/products" className={isActive('/products') ? 'active' : ''}>
            {t('nav.products')}
          </Link>
          <Link to="/orders" className={isActive('/orders') ? 'active' : ''}>
            {t('nav.orders')}
          </Link>
        </div>
        <div className="header-actions">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle" 
            aria-label={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <LanguageSwitcher />
        </div>
      </nav>
    </header>
  );
};

