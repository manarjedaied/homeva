import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminProductAPI, adminOrderAPI } from '../services/api';
import { Order } from '../types';

interface AdminStats {
  totalProducts: number;
  totalOrders: number;
  pendingOrders: number;
  completedOrders: number;
  recentOrders: Order[];
}

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<AdminStats>({
    totalProducts: 0,
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    recentOrders: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders] = await Promise.all([
          adminProductAPI.getAll(),
          adminOrderAPI.getAll(),
        ]);

        const pendingOrders = orders.filter((o: any) => o.status === 'Nouveau' || o.status === 'En cours').length;
        const completedOrders = orders.filter((o: any) => o.status === 'Terminé').length;
        const recentOrders = (orders as Order[])
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5);

        setStats({
          totalProducts: products.length,
          totalOrders: orders.length,
          pendingOrders,
          completedOrders,
          recentOrders,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
        // En mode dev, utiliser des données mock
        if (import.meta.env.DEV) {
          setStats({
            totalProducts: 12,
            totalOrders: 8,
            pendingOrders: 3,
            completedOrders: 5,
            recentOrders: [],
          });
        }
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="admin-dashboard">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  const completionRate = stats.totalOrders > 0 
    ? Math.round((stats.completedOrders / stats.totalOrders) * 100) 
    : 0;

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t('admin.dashboard.title')}</h1>
          <p className="dashboard-subtitle">Bienvenue dans votre tableau de bord</p>
        </div>
      </div>

      <div className="dashboard-stats-grid">
        <div className="dashboard-stat-card stat-primary">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-primary">
              <span className="stat-icon">📦</span>
            </div>
            <div className="stat-trend">
              <span className="trend-up">↗</span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-label">{t('admin.dashboard.totalProducts')}</h3>
            <p className="stat-value">{stats.totalProducts}</p>
            <Link to="/admin/products" className="stat-link">Voir tous les produits →</Link>
          </div>
        </div>

        <div className="dashboard-stat-card stat-success">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-success">
              <span className="stat-icon">🛒</span>
            </div>
            <div className="stat-trend">
              <span className="trend-up">↗</span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-label">{t('admin.dashboard.totalOrders')}</h3>
            <p className="stat-value">{stats.totalOrders}</p>
            <Link to="/admin/orders" className="stat-link">Voir toutes les commandes →</Link>
          </div>
        </div>

        <div className="dashboard-stat-card stat-warning">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-warning">
              <span className="stat-icon">⏳</span>
            </div>
            <div className="stat-trend">
              <span className="trend-neutral">→</span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-label">{t('admin.dashboard.pendingOrders')}</h3>
            <p className="stat-value">{stats.pendingOrders}</p>
            <Link to="/admin/orders" className="stat-link">Gérer les commandes →</Link>
          </div>
        </div>

        <div className="dashboard-stat-card stat-info">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-info">
              <span className="stat-icon">✅</span>
            </div>
            <div className="stat-trend">
              <span className="trend-up">↗</span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-label">{t('admin.dashboard.completedOrders')}</h3>
            <p className="stat-value">{stats.completedOrders}</p>
            <div className="stat-progress">
              <div className="stat-progress-bar">
                <div 
                  className="stat-progress-fill" 
                  style={{ width: `${completionRate}%` }}
                ></div>
              </div>
              <span className="stat-progress-text">{completionRate}%</span>
            </div>
          </div>
        </div>
      </div>

      {stats.recentOrders.length > 0 && (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="section-title">Commandes récentes</h2>
            <Link to="/admin/orders" className="section-link">Voir tout →</Link>
          </div>
          <div className="dashboard-recent-orders">
            {stats.recentOrders.map((order) => (
              <div key={order._id} className="recent-order-card">
                <div className="recent-order-info">
                  <h4>{order.clientName}</h4>
                  <p>{order.product} × {order.quantity}</p>
                </div>
                <div className="recent-order-status">
                  <span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
                    {order.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

