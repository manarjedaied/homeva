import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../contexts/ThemeContext';
import { MoonIcon, SunIcon } from './icons/ThemeIcons';
import { LanguageSwitcher } from './nav/LanguageSwitcher';
import Auth from '../utils/storage';

export const Sidebar: React.FC = () => {
  const { t } = useTranslation();
  const { theme, toggleTheme } = useTheme();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => {
    if (path === '/admin') {
      return location.pathname === '/admin' || location.pathname === '/admin/dashboard';
    }
    return location.pathname === path;
  };

  const handleLogout = () => {
    Auth.clear();
    navigate('/admin/login');
  };

  const menuItems = [
    { path: '/admin', icon: '📊', label: t('admin.nav.dashboard') },
    { path: '/admin/products', icon: '📦', label: t('admin.nav.products') },
    { path: '/admin/categories', icon: '🗂️', label: t('admin.nav.categories') },
    { path: '/admin/orders', icon: '🛒', label: t('admin.nav.orders') },
  ];

  return (
    <aside className="admin-sidebar">
      <div className="sidebar-header">
        <Link to="/admin" className="sidebar-logo">
          <span className="logo-icon">🏠</span>
          <span className="logo-text">Homeva</span>
          <span className="logo-badge">Admin</span>
        </Link>
      </div>

      <nav className="sidebar-nav">
        {menuItems.map((item) => (
          <Link
            key={item.path}
            to={item.path}
            className={`sidebar-nav-item ${isActive(item.path) ? 'active' : ''}`}
          >
            <span className="nav-icon">{item.icon}</span>
            <span className="nav-label">{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-actions">
          <button
            onClick={toggleTheme}
            className="sidebar-action-btn"
            aria-label={theme === 'light' ? 'Passer au mode sombre' : 'Passer au mode clair'}
            title={theme === 'light' ? 'Mode sombre' : 'Mode clair'}
          >
            {theme === 'light' ? <MoonIcon /> : <SunIcon />}
          </button>
          <div className="sidebar-language-switcher">
            <LanguageSwitcher />
          </div>
        </div>
        <button onClick={handleLogout} className="sidebar-logout-btn">
          <span className="logout-icon">🚪</span>
          <span>{t('admin.nav.logout')}</span>
        </button>
      </div>
    </aside>
  );
};

