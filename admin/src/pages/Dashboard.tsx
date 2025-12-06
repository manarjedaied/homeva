import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';
import { adminProductAPI, adminOrderAPI } from '../services/api';
import { Order, Product } from '../types';
import { formatPrice } from '../utils/formatPrice';

interface DashboardStats {
  // Chiffre d'affaires
  totalRevenue: number;
  monthlyRevenue: number;
  previousMonthRevenue: number;
  revenueChange: number;
  
  // Commandes
  totalOrders: number;
  monthlyOrders: number;
  previousMonthOrders: number;
  ordersChange: number;
  pendingOrders: number;
  completedOrders: number;
  
  // Produits
  totalProducts: number;
  activeProducts: number;
  lowStockProducts: number;
  outOfStockProducts: number;
  
  // Clients
  totalClients: number;
  monthlyNewClients: number;
  
  // Données détaillées
  recentOrders: Order[];
  popularProducts: Array<{ product: Product; orderCount: number }>;
  stockAlerts: Product[];
}

export const AdminDashboard: React.FC = () => {
  const { t } = useTranslation();
  const [stats, setStats] = useState<DashboardStats>({
    totalRevenue: 0,
    monthlyRevenue: 0,
    previousMonthRevenue: 0,
    revenueChange: 0,
    totalOrders: 0,
    monthlyOrders: 0,
    previousMonthOrders: 0,
    ordersChange: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    activeProducts: 0,
    lowStockProducts: 0,
    outOfStockProducts: 0,
    totalClients: 0,
    monthlyNewClients: 0,
    recentOrders: [],
    popularProducts: [],
    stockAlerts: [],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [products, orders] = await Promise.all([
          adminProductAPI.getAll(),
          adminOrderAPI.getAll(),
        ]);

        const now = new Date();
        const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1);
        const previousMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const previousMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);

        // Filtrer les commandes (exclure "Annulé")
        const validOrders = (orders as Order[]).filter(o => o.status !== 'Annulé');
        
        // Chiffre d'affaires
        const totalRevenue = validOrders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const monthlyRevenue = validOrders
          .filter(o => {
            const orderDate = o.createdAt ? new Date(o.createdAt) : new Date(0);
            return orderDate >= currentMonthStart;
          })
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const previousMonthRevenue = validOrders
          .filter(o => {
            const orderDate = o.createdAt ? new Date(o.createdAt) : new Date(0);
            return orderDate >= previousMonthStart && orderDate <= previousMonthEnd;
          })
          .reduce((sum, o) => sum + (o.totalPrice || 0), 0);
        const revenueChange = previousMonthRevenue > 0 
          ? ((monthlyRevenue - previousMonthRevenue) / previousMonthRevenue) * 100 
          : 0;

        // Commandes
        const totalOrders = validOrders.length;
        const monthlyOrders = validOrders.filter(o => {
          const orderDate = o.createdAt ? new Date(o.createdAt) : new Date(0);
          return orderDate >= currentMonthStart;
        }).length;
        const previousMonthOrders = validOrders.filter(o => {
          const orderDate = o.createdAt ? new Date(o.createdAt) : new Date(0);
          return orderDate >= previousMonthStart && orderDate <= previousMonthEnd;
        }).length;
        const ordersChange = previousMonthOrders > 0 
          ? ((monthlyOrders - previousMonthOrders) / previousMonthOrders) * 100 
          : 0;
        const pendingOrders = validOrders.filter(o => o.status === 'Nouveau' || o.status === 'En cours').length;
        const completedOrders = validOrders.filter(o => o.status === 'Terminé').length;

        // Produits
        const totalProducts = products.length;
        const activeProducts = products.filter((p: Product) => {
          const category = typeof p.category === 'object' ? p.category : null;
          return category ? (category as any).isActive !== false : true;
        }).length;
        const lowStockProducts = products.filter((p: Product) => {
          if (!p.stockLimite || !p.stockTotal) return false;
          const remaining = p.remainingStock ?? p.stockTotal;
          return remaining > 0 && remaining <= 10;
        }).length;
        const outOfStockProducts = products.filter((p: Product) => {
          if (!p.stockLimite || !p.stockTotal) return false;
          const remaining = p.remainingStock ?? p.stockTotal;
          return remaining <= 0;
        }).length;

        // Clients uniques
        const uniqueClients = new Set(validOrders.map(o => o.clientName || o.phone));
        const totalClients = uniqueClients.size;
        const monthlyNewClients = new Set(
          validOrders
            .filter(o => {
              const orderDate = o.createdAt ? new Date(o.createdAt) : new Date(0);
              return orderDate >= currentMonthStart;
            })
            .map(o => o.clientName || o.phone)
        ).size;

        // Commandes récentes (5 dernières)
        const recentOrders = [...validOrders]
          .sort((a, b) => {
            const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
            const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
            return dateB - dateA;
          })
          .slice(0, 5);

        // Produits populaires (top 5)
        const productOrderCount: Record<string, { product: Product; count: number }> = {};
        validOrders.forEach(order => {
          const productId = typeof order.product === 'string' ? order.product : order.product._id;
          if (!productOrderCount[productId]) {
            const product = products.find((p: Product) => p._id === productId);
            if (product) {
              productOrderCount[productId] = { product, count: 0 };
            }
          }
          if (productOrderCount[productId]) {
            productOrderCount[productId].count += order.quantity;
          }
        });
        const popularProducts = Object.values(productOrderCount)
          .sort((a, b) => b.count - a.count)
          .slice(0, 5)
          .map(item => ({ product: item.product, orderCount: item.count }));

        // Alertes stock
        const stockAlerts = products
          .filter((p: Product) => {
            if (!p.stockLimite || !p.stockTotal) return false;
            const remaining = p.remainingStock ?? p.stockTotal;
            return remaining <= 10;
          })
          .slice(0, 5);

        setStats({
          totalRevenue,
          monthlyRevenue,
          previousMonthRevenue,
          revenueChange,
          totalOrders,
          monthlyOrders,
          previousMonthOrders,
          ordersChange,
          pendingOrders,
          completedOrders,
          totalProducts,
          activeProducts,
          lowStockProducts,
          outOfStockProducts,
          totalClients,
          monthlyNewClients,
          recentOrders,
          popularProducts,
          stockAlerts,
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
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

  const getProductName = (order: Order): string => {
    if (typeof order.product === 'object' && order.product) {
      return order.product.name;
    }
    return 'Produit';
  };

  return (
    <div className="admin-dashboard">
      <div className="dashboard-header">
        <div>
          <h1 className="dashboard-title">{t('admin.dashboard.title') || 'Tableau de bord'}</h1>
          <p className="dashboard-subtitle">Vue d'ensemble de votre activité</p>
        </div>
      </div>

      {/* 4 Cartes principales */}
      <div className="dashboard-stats-grid">
        {/* Chiffre d'affaires */}
        <div className="dashboard-stat-card stat-revenue">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-revenue">
              <span className="stat-icon">💰</span>
            </div>
            <div className={`stat-trend ${stats.revenueChange >= 0 ? 'trend-up' : 'trend-down'}`}>
              <span>{stats.revenueChange >= 0 ? '↗' : '↘'}</span>
              <span className="trend-percentage">
                {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-label">Chiffre d'affaires</h3>
            <p className="stat-value">{formatPrice(stats.monthlyRevenue || 0)}</p>
            <p className="stat-subtext">Total: {formatPrice(stats.totalRevenue || 0)}</p>
            <Link to="/admin/orders" className="stat-link">Voir les commandes →</Link>
          </div>
        </div>

        {/* Commandes */}
        <div className="dashboard-stat-card stat-success">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-success">
              <span className="stat-icon">🛒</span>
            </div>
            <div className={`stat-trend ${stats.ordersChange >= 0 ? 'trend-up' : 'trend-down'}`}>
              <span>{stats.ordersChange >= 0 ? '↗' : '↘'}</span>
              <span className="trend-percentage">
                {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange.toFixed(1)}%
              </span>
            </div>
          </div>
          <div className="stat-card-body">
            <h3 className="stat-label">Commandes</h3>
            <p className="stat-value">{stats.monthlyOrders}</p>
            <p className="stat-subtext">Total: {stats.totalOrders} | En attente: {stats.pendingOrders}</p>
            <Link to="/admin/orders" className="stat-link">Gérer les commandes →</Link>
          </div>
        </div>

        {/* Produits */}
        <div className="dashboard-stat-card stat-primary">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-primary">
              <span className="stat-icon">📦</span>
            </div>
            {stats.lowStockProducts > 0 || stats.outOfStockProducts > 0 ? (
              <div className="stat-alert">
                <span className="alert-badge">{stats.outOfStockProducts + stats.lowStockProducts}</span>
              </div>
            ) : null}
          </div>
          <div className="stat-card-body">
            <h3 className="stat-label">Produits</h3>
            <p className="stat-value">{stats.totalProducts}</p>
            <p className="stat-subtext">
              Actifs: {stats.activeProducts}
              {stats.lowStockProducts > 0 && ` | Stock faible: ${stats.lowStockProducts}`}
              {stats.outOfStockProducts > 0 && ` | Rupture: ${stats.outOfStockProducts}`}
            </p>
            <Link to="/admin/products" className="stat-link">Voir tous les produits →</Link>
          </div>
        </div>

        {/* Clients */}
        <div className="dashboard-stat-card stat-info">
          <div className="stat-card-header">
            <div className="stat-icon-wrapper stat-icon-info">
              <span className="stat-icon">👥</span>
            </div>
            {stats.monthlyNewClients > 0 && (
              <div className="stat-trend trend-up">
                <span>↗</span>
                <span className="trend-percentage">+{stats.monthlyNewClients}</span>
              </div>
            )}
          </div>
          <div className="stat-card-body">
            <h3 className="stat-label">Clients</h3>
            <p className="stat-value">{stats.totalClients}</p>
            <p className="stat-subtext">Nouveaux ce mois: {stats.monthlyNewClients}</p>
          </div>
        </div>
      </div>

      {/* Sections supplémentaires */}
      <div className="dashboard-sections-grid">
        {/* Commandes récentes */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="section-title">Commandes récentes</h2>
            <Link to="/admin/orders" className="section-link">Voir tout →</Link>
          </div>
          <div className="dashboard-recent-orders">
            {stats.recentOrders.length > 0 ? (
              stats.recentOrders.map((order) => (
                <div key={order._id} className="recent-order-card">
                  <div className="recent-order-info">
                    <h4>{order.clientName}</h4>
                    <p>{getProductName(order)} × {order.quantity}</p>
                    <span className="recent-order-date">
                      {order.createdAt ? new Date(order.createdAt).toLocaleDateString('fr-FR') : ''}
                    </span>
                  </div>
                  <div className="recent-order-right">
                    <span className="recent-order-price">{formatPrice((order.totalPrice || 0))}</span>
                    <span className={`status-badge status-${order.status.toLowerCase().replace(' ', '-')}`}>
                      {order.status}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">Aucune commande récente</p>
            )}
          </div>
        </div>

        {/* Produits populaires */}
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="section-title">Produits populaires</h2>
            <Link to="/admin/products" className="section-link">Voir tout →</Link>
          </div>
          <div className="dashboard-popular-products">
            {stats.popularProducts.length > 0 ? (
              stats.popularProducts.map((item, index) => (
                <div key={item.product._id} className="popular-product-card">
                  <div className="popular-product-rank">#{index + 1}</div>
                  <div className="popular-product-info">
                    <h4>{item.product.name}</h4>
                    <p className="popular-product-orders">{item.orderCount} commande(s)</p>
                  </div>
                  <div className="popular-product-price">
                    {formatPrice(
                      item.product.pourcentagePromo && item.product.pourcentagePromo > 0
                        ? (item.product.price || 0) * (1 - item.product.pourcentagePromo / 100)
                        : (item.product.price || 0)
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="empty-state">Aucun produit populaire</p>
            )}
          </div>
        </div>
      </div>

      {/* Alertes stock */}
      {stats.stockAlerts.length > 0 && (
        <div className="dashboard-section">
          <div className="dashboard-section-header">
            <h2 className="section-title">⚠️ Alertes stock</h2>
            <Link to="/admin/products" className="section-link">Gérer →</Link>
          </div>
          <div className="dashboard-stock-alerts">
            {stats.stockAlerts.map((product) => {
              const remaining = product.remainingStock ?? product.stockTotal ?? 0;
              const isOutOfStock = remaining <= 0;
              return (
                <div key={product._id} className={`stock-alert-card ${isOutOfStock ? 'alert-critical' : 'alert-warning'}`}>
                  <div className="stock-alert-info">
                    <h4>{product.name}</h4>
                    <p className="stock-alert-details">
                      Stock restant: <strong>{remaining}</strong> / {product.stockTotal || 0}
                    </p>
                  </div>
                  <div className="stock-alert-badge">
                    {isOutOfStock ? '⚠️ Rupture' : '⚠️ Stock faible'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
