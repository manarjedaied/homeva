import i18n from '../i18n/config';

/**
 * Formate un prix en dinar tunisien selon la langue active
 * @param price - Le prix à formater
 * @returns Le prix formaté avec la devise appropriée (د.ت)
 */
export const formatPrice = (price: number): string => {
  const currencySymbol = i18n.t('products.currencySymbol'); // د.ت
  
  // Format: 29.990 د.ت (3 décimales pour le dinar tunisien)
  // Le symbole د.ت vient toujours après le prix en Tunisie
  return `${price.toFixed(3)} ${currencySymbol}`;
};

