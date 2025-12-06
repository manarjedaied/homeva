import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { adminSettingsAPI, Settings } from '../services/api';

export const AdminSettings: React.FC = () => {
  const { t } = useTranslation();
  const [settings, setSettings] = useState<Settings>({
    quantityDiscountEnabled: true,
    quantityDiscountMinQuantity: 2,
    quantityDiscountPercentage: 5,
    freeDeliveryEnabled: true,
    freeDeliveryMinQuantity: 3,
    defaultDeliveryFee: 7,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const data = await adminSettingsAPI.get();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      setMessage({ type: 'error', text: 'Erreur lors du chargement des paramètres' });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    try {
      await adminSettingsAPI.update(settings);
      setMessage({ type: 'success', text: 'Paramètres enregistrés avec succès !' });
      setTimeout(() => setMessage(null), 3000);
    } catch (error: any) {
      console.error('Error updating settings:', error);
      setMessage({ 
        type: 'error', 
        text: error.message || 'Erreur lors de l\'enregistrement des paramètres' 
      });
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (field: keyof Settings, value: any) => {
    setSettings(prev => ({ ...prev, [field]: value }));
  };

  if (loading) {
    return (
      <div className="admin-settings">
        <div className="loading-container">
          <div className="loading-spinner"></div>
          <p>{t('common.loading')}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-settings">
      <div className="admin-page-header">
        <div>
          <h1 className="admin-page-title">Paramètres de commande</h1>
          <p className="admin-page-subtitle">
            Configurez les règles de remise et de livraison
          </p>
        </div>
      </div>

      {message && (
        <div className={`settings-message ${message.type}`}>
          {message.text}
        </div>
      )}

      <form onSubmit={handleSubmit} className="admin-form settings-form">
        <div className="admin-form-content">
          {/* Section Remise quantité */}
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title">Remise quantité</h2>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.quantityDiscountEnabled}
                  onChange={(e) => handleChange('quantityDiscountEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {settings.quantityDiscountEnabled ? 'Activée' : 'Désactivée'}
                </span>
              </label>
            </div>
            <div className="settings-section-content">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Quantité minimale pour la remise
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.quantityDiscountMinQuantity}
                  onChange={(e) => handleChange('quantityDiscountMinQuantity', parseInt(e.target.value) || 1)}
                  className="admin-form-input"
                  disabled={!settings.quantityDiscountEnabled}
                  required
                />
                <p className="admin-form-hint">
                  Nombre de produits minimum pour bénéficier de la remise
                </p>
              </div>
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Pourcentage de remise (%)
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  step="0.1"
                  value={settings.quantityDiscountPercentage}
                  onChange={(e) => handleChange('quantityDiscountPercentage', parseFloat(e.target.value) || 0)}
                  className="admin-form-input"
                  disabled={!settings.quantityDiscountEnabled}
                  required
                />
                <p className="admin-form-hint">
                  Pourcentage de remise appliqué (ex: 5 pour 5%)
                </p>
              </div>
            </div>
          </div>

          {/* Section Livraison gratuite */}
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title">Livraison gratuite</h2>
              <label className="settings-toggle">
                <input
                  type="checkbox"
                  checked={settings.freeDeliveryEnabled}
                  onChange={(e) => handleChange('freeDeliveryEnabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                <span className="toggle-label">
                  {settings.freeDeliveryEnabled ? 'Activée' : 'Désactivée'}
                </span>
              </label>
            </div>
            <div className="settings-section-content">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Quantité minimale pour la livraison gratuite
                </label>
                <input
                  type="number"
                  min="1"
                  value={settings.freeDeliveryMinQuantity}
                  onChange={(e) => handleChange('freeDeliveryMinQuantity', parseInt(e.target.value) || 1)}
                  className="admin-form-input"
                  disabled={!settings.freeDeliveryEnabled}
                  required
                />
                <p className="admin-form-hint">
                  Nombre de produits minimum pour bénéficier de la livraison gratuite
                </p>
              </div>
            </div>
          </div>

          {/* Section Frais de livraison */}
          <div className="settings-section">
            <div className="settings-section-header">
              <h2 className="settings-section-title">Frais de livraison</h2>
            </div>
            <div className="settings-section-content">
              <div className="admin-form-group">
                <label className="admin-form-label">
                  Frais de livraison par défaut (د.ت)
                </label>
                <input
                  type="number"
                  min="0"
                  step="0.001"
                  value={settings.defaultDeliveryFee}
                  onChange={(e) => handleChange('defaultDeliveryFee', parseFloat(e.target.value) || 0)}
                  className="admin-form-input"
                  required
                />
                <p className="admin-form-hint">
                  Montant des frais de livraison appliqué par défaut
                </p>
              </div>
            </div>
          </div>

          {/* Résumé des règles */}
          <div className="settings-summary">
            <h3 className="settings-summary-title">Résumé des règles actuelles</h3>
            <div className="settings-summary-content">
              {settings.quantityDiscountEnabled ? (
                <div className="summary-item">
                  <span className="summary-icon">💰</span>
                  <span className="summary-text">
                    Remise de <strong>{settings.quantityDiscountPercentage}%</strong> à partir de{' '}
                    <strong>{settings.quantityDiscountMinQuantity}</strong> produit(s)
                  </span>
                </div>
              ) : (
                <div className="summary-item disabled">
                  <span className="summary-icon">💰</span>
                  <span className="summary-text">Remise quantité désactivée</span>
                </div>
              )}
              {settings.freeDeliveryEnabled ? (
                <div className="summary-item">
                  <span className="summary-icon">🚚</span>
                  <span className="summary-text">
                    Livraison gratuite à partir de <strong>{settings.freeDeliveryMinQuantity}</strong> produit(s)
                  </span>
                </div>
              ) : (
                <div className="summary-item disabled">
                  <span className="summary-icon">🚚</span>
                  <span className="summary-text">Livraison gratuite désactivée</span>
                </div>
              )}
              <div className="summary-item">
                <span className="summary-icon">📦</span>
                <span className="summary-text">
                  Frais de livraison par défaut: <strong>{settings.defaultDeliveryFee.toFixed(3)} د.ت</strong>
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="admin-form-actions">
          <button
            type="submit"
            className="admin-btn-primary"
            disabled={saving}
          >
            {saving ? 'Enregistrement...' : 'Enregistrer les paramètres'}
          </button>
        </div>
      </form>
    </div>
  );
};

