import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { orderAPI } from '../services/api';
import { Order } from '../types';
import { formatPrice } from '../utils/formatPrice';

export const Orders: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setLoading(true);
        const data = await orderAPI.getAll();
        setOrders(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Une erreur est survenue');
      } finally {
        setLoading(false);
      }
    };

    fetchOrders();
  }, []);

  if (loading) {
    return <div className="loading">{t('common.loading')}</div>;
  }

  if (error) {
    return <div className="error">{t('common.error')}: {error}</div>;
  }

  return (
    <div className="orders">
      <h1>{t('orders.title')}</h1>
      {orders.length === 0 ? (
        <p>{t('orders.noOrders')}</p>
      ) : (
        <div className="orders-list">
          {orders.map((order) => (
            <div key={order._id} className="order-card">
              <h3>Commande #{order._id.slice(-6)}</h3>
              <p>
                <strong>Client:</strong> {order.customerName}
              </p>
              <p>
                <strong>{t('orders.status')}:</strong> {order.status}
              </p>
              <p>
                <strong>Total:</strong> {formatPrice(order.totalAmount)}
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

