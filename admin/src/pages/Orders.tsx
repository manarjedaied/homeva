import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { adminOrderAPI } from '../services/api';
import { Order, Product } from '../types';
import { formatPrice } from '../utils/formatPrice';
import { getImageUrl } from '../services/api';
import { ViewIcon, PrintIcon } from '../components/icons/ActionIcons';

type StatusFilter = 'Tous' | 'Nouveau' | 'En cours' | 'Terminé' | 'Annulé';

export const AdminOrders: React.FC = () => {
  const { t } = useTranslation();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('Tous');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showCancelConfirm, setShowCancelConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) {
        setLoading(true);
      }
      const data = await adminOrderAPI.getAll();
      setOrders(data as Order[]);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await adminOrderAPI.updateStatus(id, newStatus);
      // Mettre à jour sans afficher le loading
      await fetchOrders(false);
      setShowCancelConfirm(null);
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Erreur lors de la mise à jour du statut');
    }
  };

  const handleAccept = async (order: Order) => {
    await handleStatusChange(order._id, 'En cours');
  };

  const handleReject = (order: Order) => {
    setShowCancelConfirm(order._id);
  };

  const confirmReject = async (orderId: string) => {
    await handleStatusChange(orderId, 'Annulé');
  };

  const getProductName = (order: Order): string => {
    if (typeof order.product === 'object' && order.product !== null) {
      return order.product.name;
    }
    return 'Produit';
  };

  const getProductImage = (order: Order): string | null => {
    if (typeof order.product === 'object' && order.product !== null) {
      const product = order.product as Product;
      return product.images?.[0] || product.image || null;
    }
    return null;
  };

  // Filtrage et recherche
  const filteredOrders = useMemo(() => {
    let filtered = orders;

    // Filtre par statut
    if (statusFilter !== 'Tous') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }

    // Recherche
    if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(order => {
          const productName = getProductName(order).toLowerCase();
          return (
            order.clientName.toLowerCase().includes(query) ||
            order.phone.includes(query) ||
            productName.includes(query)
          );
        });
    }

    return filtered;
  }, [orders, statusFilter, searchQuery]);

  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'Nouveau':
        return 'status-badge status-nouveau';
      case 'En cours':
        return 'status-badge status-en-cours';
      case 'Terminé':
        return 'status-badge status-terminé';
      case 'Annulé':
        return 'status-badge status-annulé';
      default:
        return 'status-badge';
    }
  };

  const formatDate = (dateString?: string): string => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const handlePrintInvoice = (order: Order) => {
    const productName = getProductName(order);
    const orderDate = formatDate(order.createdAt);
    
    // Créer le contenu HTML de la facture
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="UTF-8">
          <title>Facture - Commande #${order._id.slice(-6)}</title>
          <style>
            @media print {
              @page {
                size: A4;
                margin: 1cm;
              }
              body {
                margin: 0;
                padding: 0;
              }
            }
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            .invoice-container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
            }
            .invoice-header {
              border-bottom: 3px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .invoice-title {
              font-size: 32px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .invoice-number {
              font-size: 14px;
              color: #666;
            }
            .invoice-info {
              display: flex;
              justify-content: space-between;
              margin-bottom: 30px;
            }
            .info-section {
              flex: 1;
            }
            .info-section h3 {
              font-size: 16px;
              margin-bottom: 10px;
              color: #333;
              border-bottom: 1px solid #ddd;
              padding-bottom: 5px;
            }
            .info-row {
              margin-bottom: 5px;
              font-size: 14px;
            }
            .info-label {
              font-weight: bold;
              display: inline-block;
              width: 120px;
            }
            .product-section {
              margin: 30px 0;
            }
            .product-section h3 {
              font-size: 18px;
              margin-bottom: 15px;
              border-bottom: 2px solid #333;
              padding-bottom: 10px;
            }
            .product-details {
              margin-bottom: 20px;
              padding: 15px;
              background: #f9f9f9;
              border-radius: 5px;
            }
            .product-name {
              font-size: 18px;
              font-weight: bold;
              margin-bottom: 10px;
            }
            .price-details {
              margin-top: 20px;
            }
            .price-row {
              display: flex;
              justify-content: space-between;
              padding: 8px 0;
              font-size: 14px;
              border-bottom: 1px solid #eee;
            }
            .price-row.total {
              font-size: 20px;
              font-weight: bold;
              border-top: 2px solid #333;
              border-bottom: 2px solid #333;
              padding: 15px 0;
              margin-top: 10px;
            }
            .price-label {
              font-weight: bold;
            }
            .free-delivery {
              color: #28a745;
              font-weight: bold;
            }
            .invoice-footer {
              margin-top: 40px;
              padding-top: 20px;
              border-top: 1px solid #ddd;
              text-align: center;
              font-size: 12px;
              color: #666;
            }
            @media print {
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="invoice-container">
            <div class="invoice-header">
              <div class="invoice-title">FACTURE</div>
              <div class="invoice-number">Commande #${order._id.slice(-6).toUpperCase()}</div>
            </div>
            
            <div class="invoice-info">
              <div class="info-section">
                <h3>Informations Client</h3>
                <div class="info-row">
                  <span class="info-label">Nom:</span>
                  <span>${order.clientName}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Téléphone:</span>
                  <span>${order.phone}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Ville:</span>
                  <span>${order.ville || ''}</span>
                </div>
                <div class="info-row">
                  <span class="info-label">Adresse:</span>
                  <span>${order.address}</span>
                </div>
              </div>
              
              <div class="info-section">
                <h3>Informations Commande</h3>
                <div class="info-row">
                  <span class="info-label">Date:</span>
                  <span>${orderDate}</span>
                </div>
              </div>
            </div>
            
            <div class="product-section">
              <h3>Produit Commandé</h3>
              <div class="product-details">
                <div class="product-name">${productName}</div>
                <div class="info-row">
                  <span class="info-label">Quantité:</span>
                  <span>${order.quantity}</span>
                </div>
              </div>
            </div>
            
            <div class="price-details">
              ${order.unitPrice ? `
                <div class="price-row">
                  <span class="price-label">Prix unitaire:</span>
                  <span>${formatPrice(order.unitPrice)}</span>
                </div>
              ` : ''}
              ${order.productPromoPercentage && order.productPromoPercentage > 0 ? `
                <div class="price-row">
                  <span class="price-label">Promotion produit:</span>
                  <span>-${order.productPromoPercentage}%</span>
                </div>
              ` : ''}
              ${order.unitPriceWithPromo ? `
                <div class="price-row">
                  <span class="price-label">Prix unitaire après promo:</span>
                  <span>${formatPrice(order.unitPriceWithPromo)}</span>
                </div>
              ` : ''}
              ${order.subtotal ? `
                <div class="price-row">
                  <span class="price-label">Sous-total:</span>
                  <span>${formatPrice(order.subtotal)}</span>
                </div>
              ` : ''}
              ${order.quantityDiscountPercentage && order.quantityDiscountPercentage > 0 ? `
                <div class="price-row">
                  <span class="price-label">Remise quantité (${order.quantityDiscountPercentage}%):</span>
                  <span>-${formatPrice(order.quantityDiscountAmount || 0)}</span>
                </div>
              ` : ''}

              <div class="price-row">
                <span class="price-label">Frais de livraison:</span>
                <span>${order.isFreeDelivery ? '<span class="free-delivery">Gratuit</span>' : formatPrice(order.deliveryFee || 0)}</span>
              </div>
              <div class="price-row total">
                <span class="price-label">TOTAL:</span>
                <span>${formatPrice(order.totalPrice || 0)}</span>
              </div>
            </div>
            
            <div class="invoice-footer">
              <p>Merci pour votre commande !</p>
            </div>
          </div>
        </body>
      </html>
    `;

    // Créer une nouvelle fenêtre pour l'impression
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(invoiceHTML);
      printWindow.document.close();
      
      // Attendre que le contenu soit chargé avant d'imprimer
      printWindow.onload = () => {
        setTimeout(() => {
          printWindow.print();
        }, 250);
      };
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
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">{t('admin.orders.title') || 'Commandes'}</h1>
          <p className="admin-page-subtitle">
            {filteredOrders.length} commande{filteredOrders.length > 1 ? 's' : ''} 
            {statusFilter !== 'Tous' && ` (${statusFilter})`}
          </p>
        </div>
      </div>

      {/* Filtres et recherche */}
      <div className="orders-filters">
        <div className="orders-search">
          <input
            type="text"
            placeholder="Rechercher par client, téléphone ou produit..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="admin-form-input"
          />
        </div>
        <div className="orders-status-filters">
          {(['Tous', 'Nouveau', 'En cours', 'Terminé', 'Annulé'] as StatusFilter[]).map((status) => (
            <button
              key={status}
              className={`status-filter-btn ${statusFilter === status ? 'active' : ''}`}
              onClick={() => setStatusFilter(status)}
            >
              {status}
              {status !== 'Tous' && (
                <span className="filter-count">
                  {orders.filter(o => o.status === status).length}
                </span>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Table des commandes */}
      <div className="admin-table-container orders-table-container">
        <table className="admin-table orders-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Client</th>
              <th>Produit</th>
              <th>Quantité</th>
              <th>Prix total</th>
              <th>Ville</th>
              <th>Adresse</th>
              <th>Statut</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredOrders.length === 0 ? (
              <tr>
                <td colSpan={9} className="empty-table-message">
                  Aucune commande trouvée
                </td>
              </tr>
            ) : (
              filteredOrders.map((order) => {
                const productImage = getProductImage(order);
                const isNew = order.status === 'Nouveau';

                return (
                  <tr key={order._id} className={isNew ? 'order-new' : ''}>
                    <td className="order-date">
                      <div className="order-date-time">{formatDate(order.createdAt)}</div>
                    </td>
                    <td className="order-client">
                      <div className="client-name">{order.clientName}</div>
                      <div className="client-contact">
                        <span className="client-phone">📞 {order.phone}</span>
                      </div>
                    </td>
                    <td className="order-product">
                      <div className="product-info">
                        {productImage && (
                          <img
                            src={getImageUrl(productImage)}
                            alt={getProductName(order)}
                            className="product-thumbnail"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        )}
                        <div className="product-details">
                          <div className="product-name">{getProductName(order)}</div>
                          {order.unitPrice && (
                            <div className="product-price-detail">
                              {formatPrice(order.unitPrice)}
                              {order.productPromoPercentage && order.productPromoPercentage > 0 && (
                                <span className="product-promo"> -{order.productPromoPercentage}%</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="order-quantity">
                      <span className="quantity-badge">{order.quantity}</span>
                    </td>
                    <td className="order-total">
                      <div className="total-price">{formatPrice(order.totalPrice || 0)}</div>
                      {order.isFreeDelivery && (
                        <div className="free-delivery-badge">Livraison gratuite</div>
                      )}
                    </td>
                    <td className="order-ville">
                      <div className="ville-text">{order.ville || '-'}</div>
                    </td>
                    <td className="order-address">
                      <div className="address-text">{order.address}</div>
                    </td>
                    <td className="order-status">
                      <span className={getStatusBadgeClass(order.status)}>
                        {order.status}
                      </span>
                    </td>
                    <td className="order-actions">
                      <div className="actions-buttons">
                        {isNew && (
                          <>
                            <button
                              type="button"
                              className="admin-btn-accept"
                              onClick={() => handleAccept(order)}
                              title="Accepter la commande"
                            >
                              ✓ Accepter
                            </button>
                            <button
                              type="button"
                              className="admin-btn-reject"
                              onClick={() => handleReject(order)}
                              title="Refuser la commande"
                            >
                              ✕ Refuser
                            </button>
                          </>
                        )}
                        {order.status === 'En cours' && (
                          <>
                            <button
                              type="button"
                              className="admin-btn-primary"
                              onClick={() => handleStatusChange(order._id, 'Terminé')}
                              title="Marquer comme terminé"
                            >
                              ✓ Terminer
                            </button>
                            <button
                              type="button"
                              className="admin-btn-reject"
                              onClick={() => {
                                if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ? (Vous n\'avez pas reçu l\'argent)')) {
                                  handleStatusChange(order._id, 'Nouveau');
                                }
                              }}
                              title="Annuler la commande"
                            >
                              ✕ Annuler
                            </button>
                          </>
                        )}
                        <button
                          type="button"
                          className="admin-btn-view"
                          onClick={() => setSelectedOrder(order)}
                          title="Voir les détails"
                        >
                          <ViewIcon />
                        </button>
                        <button
                          type="button"
                          className="admin-btn-view"
                          onClick={() => handlePrintInvoice(order)}
                          title="Imprimer la facture"
                        >
                          <PrintIcon />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Modal de confirmation de refus */}
      {showCancelConfirm && (
        <div className="modal-overlay" onClick={() => setShowCancelConfirm(null)}>
          <div className="modal-content confirm-modal" onClick={(e) => e.stopPropagation()}>
            <h3>Confirmer le refus</h3>
            <p>Êtes-vous sûr de vouloir refuser cette commande ?</p>
            <div className="modal-actions">
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setShowCancelConfirm(null)}
              >
                Annuler
              </button>
              <button
                type="button"
                className="admin-btn-reject"
                onClick={() => confirmReject(showCancelConfirm)}
              >
                Confirmer le refus
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de détails de commande */}
      {selectedOrder && (
        <div className="modal-overlay" onClick={() => setSelectedOrder(null)}>
          <div className="modal-content order-details-modal" onClick={(e) => e.stopPropagation()}>
            <div className="order-details-header">
              <h2>Détails de la commande</h2>
              <button
                className="admin-form-close-btn"
                onClick={() => setSelectedOrder(null)}
                aria-label="Fermer"
              >
                ✕
              </button>
            </div>
            <div className="order-details-content">
              <div className="order-details-section">
                <h3>Informations client</h3>
                <div className="detail-row">
                  <span className="detail-label">Nom:</span>
                  <span className="detail-value">{selectedOrder.clientName}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Téléphone:</span>
                  <span className="detail-value">{selectedOrder.phone}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Adresse:</span>
                  <span className="detail-value">{selectedOrder.address}</span>
                </div>
              </div>

              <div className="order-details-section">
                <h3>Produit commandé</h3>
                {typeof selectedOrder.product === 'object' && selectedOrder.product && (
                  <>
                    <div className="order-product-detail">
                      {getProductImage(selectedOrder) && (
                        <img
                          src={getImageUrl(getProductImage(selectedOrder)!)}
                          alt={getProductName(selectedOrder)}
                          className="order-product-image"
                        />
                      )}
                      <div>
                        <div className="detail-row">
                          <span className="detail-label">Produit:</span>
                          <span className="detail-value">{getProductName(selectedOrder)}</span>
                        </div>
                        <div className="detail-row">
                          <span className="detail-label">Quantité:</span>
                          <span className="detail-value">{selectedOrder.quantity}</span>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>

              <div className="order-details-section">
                <h3>Détails de prix</h3>
                {selectedOrder.unitPrice && (
                  <div className="detail-row">
                    <span className="detail-label">Prix unitaire:</span>
                    <span className="detail-value">{formatPrice(selectedOrder.unitPrice)}</span>
                  </div>
                )}
                {selectedOrder.productPromoPercentage && selectedOrder.productPromoPercentage > 0 && (
                  <div className="detail-row">
                    <span className="detail-label">Promo produit:</span>
                    <span className="detail-value">-{selectedOrder.productPromoPercentage}%</span>
                  </div>
                )}
                {selectedOrder.unitPriceWithPromo && (
                  <div className="detail-row">
                    <span className="detail-label">Prix unitaire après promo:</span>
                    <span className="detail-value">{formatPrice(selectedOrder.unitPriceWithPromo)}</span>
                  </div>
                )}
                {selectedOrder.subtotal && (
                  <div className="detail-row">
                    <span className="detail-label">Sous-total:</span>
                    <span className="detail-value">{formatPrice(selectedOrder.subtotal)}</span>
                  </div>
                )}

                {selectedOrder.deliveryFee !== undefined && (
                  <div className="detail-row">
                    <span className="detail-label">Frais de livraison:</span>
                    <span className="detail-value">
                      {selectedOrder.isFreeDelivery ? (
                        <span className="free-delivery">Gratuit</span>
                      ) : (
                        formatPrice(selectedOrder.deliveryFee || 0)
                      )}
                    </span>
                  </div>
                )}
                <div className="detail-row total-row">
                  <span className="detail-label">Total:</span>
                  <span className="detail-value total-price-large">
                    {formatPrice(selectedOrder.totalPrice || 0)}
                  </span>
                </div>
              </div>

              <div className="order-details-section">
                <h3>Informations de commande</h3>
                <div className="detail-row">
                  <span className="detail-label">Date:</span>
                  <span className="detail-value">{formatDate(selectedOrder.createdAt)}</span>
                </div>
                <div className="detail-row">
                  <span className="detail-label">Statut:</span>
                  <span className={getStatusBadgeClass(selectedOrder.status)}>
                    {selectedOrder.status}
                  </span>
                </div>
              </div>
            </div>
            <div className="order-details-actions">
              {selectedOrder.status === 'Nouveau' && (
                <>
                  <button
                    type="button"
                    className="admin-btn-accept"
                    onClick={() => {
                      handleAccept(selectedOrder);
                      setSelectedOrder(null);
                    }}
                  >
                    ✓ Accepter
                  </button>
                  <button
                    type="button"
                    className="admin-btn-reject"
                    onClick={() => {
                      handleReject(selectedOrder);
                      setSelectedOrder(null);
                    }}
                  >
                    ✕ Refuser
                  </button>
                </>
              )}
              {selectedOrder.status === 'En cours' && (
                <>
                  <button
                    type="button"
                    className="admin-btn-primary"
                    onClick={() => {
                      handleStatusChange(selectedOrder._id, 'Terminé');
                      setSelectedOrder(null);
                    }}
                  >
                    ✓ Terminer
                  </button>
                  <button
                    type="button"
                    className="admin-btn-reject"
                    onClick={() => {
                      if (window.confirm('Êtes-vous sûr de vouloir annuler cette commande ? (Vous n\'avez pas reçu l\'argent)')) {
                        handleStatusChange(selectedOrder._id, 'Nouveau');
                        setSelectedOrder(null);
                      }
                    }}
                  >
                    ✕ Annuler
                  </button>
                </>
              )}
              <button
                type="button"
                className="admin-btn-secondary"
                onClick={() => setSelectedOrder(null)}
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
