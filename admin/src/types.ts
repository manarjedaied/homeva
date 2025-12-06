// Types pour les produits
export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
  productCount?: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  images?: string[];
  category?: string | Category | null;
  pourcentagePromo?: number;
  stockLimite?: boolean;
  stockTotal?: number;
  orderedQuantity?: number;
  remainingStock?: number | null;
  // Paramètres de remise et livraison (spécifiques au produit)
  quantityDiscountEnabled?: boolean | null;
  quantityDiscountMinQuantity?: number | null;
  quantityDiscountPercentage?: number | null;
  freeDeliveryEnabled?: boolean | null;
  freeDeliveryMinQuantity?: number | null;
  customDeliveryFee?: number | null;
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les commandes
export interface Order {
  _id: string;
  clientName: string;
  email?: string;
  phone: string;
  address: string;
  product: string | Product;
  quantity: number;
  status: 'Nouveau' | 'En cours' | 'Terminé' | 'Annulé';
  totalPrice?: number;
  unitPrice?: number;
  unitPriceWithPromo?: number;
  subtotal?: number;
  deliveryFee?: number;
  isFreeDelivery?: boolean;
  productPromoPercentage?: number;
  quantityDiscountPercentage?: number;
  quantityDiscountAmount?: number;
  priceAfterDiscount?: number;
  createdAt?: string;
}

// Types pour le thème
export type Theme = "light" | "dark";

// Types pour la langue
export type Language = 'fr' | 'en' | 'ar';

