import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminOrderAPI } from '../services/api';
import { Order, Product } from '../types';

export const AdminOrders: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const data = await adminOrderAPI.getAll();
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminOrderAPI.updateStatus(id, newStatus);
      fetchOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  if (loading) {
    return (
      <div className="admin-orders">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-orders">
      <h1 className="admin-page-title">{t('admin.orders.title')}</h1>
      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th>{t('admin.orders.clientName')}</th>
              <th>{t('admin.orders.email')}</th>
              <th>{t('admin.orders.phone')}</th>
              <th>{t('admin.orders.product')}</th>
              <th>{t('admin.orders.quantity')}</th>
              <th>{t('admin.orders.status')}</th>
              <th>{t('common.actions')}</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order._id}>
                <td>{order.clientName}</td>
                <td>{order.email || '-'}</td>
                <td>{order.phone}</td>
                <td>
                  {typeof order.product === 'object' && order.product !== null
                    ? (order.product as Product).name
                    : order.product}
                </td>
                <td>{order.quantity}</td>
                <td>
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order._id, e.target.value)}
                    className="admin-status-select"
                  >
                    <option value="Nouveau">Nouveau</option>
                    <option value="En cours">En cours</option>
                    <option value="Terminé">Terminé</option>
                  </select>
                </td>
                <td>
                  <button onClick={() => handleStatusChange(order._id, 'Terminé')} className="admin-btn-primary">
                    {t('admin.orders.complete')}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

