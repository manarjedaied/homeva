import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import { MoonIcon, SunIcon } from '../icons/ThemeIcons';
import { LanguageSwitcher } from './LanguageSwitcher';
import { adminStorage } from '../../utils/storage';

export const AdminNavbar: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname === path;

  const handleLogout = () => {
    adminStorage.clear();
    navigate('/admin/login');
  };

  return (
    <header className="admin-header">
      <nav className="admin-nav">
        <Link to="/admin" className="admin-logo-container">
          <span className="logo-text">Homeva Admin</span>
        </Link>
        <div className="admin-nav-links">
          <Link to="/admin" className={isActive('/admin') || isActive('/admin/dashboard') ? 'active' : ''}>
            {t('admin.nav.dashboard')}
          </Link>
          <Link to="/admin/products" className={isActive('/admin/products') ? 'active' : ''}>
            {t('admin.nav.products')}
          </Link>
          <Link to="/admin/orders" className={isActive('/admin/orders') ? 'active' : ''}>
            {t('admin.nav.orders')}
          </Link>
        </div>
        <div className="admin-header-actions">
          <button 
            onClick={toggleTheme} 
            className="theme-toggle" 
            aria-label={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <LanguageSwitcher />
          <button onClick={handleLogout} className="admin-logout-btn">
            {t('admin.nav.logout')}
          </button>
        </div>
      </nav>
    </header>
  );
};

