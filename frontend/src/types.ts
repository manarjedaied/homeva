// Types pour les produits
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  images?: string[];      // vient du backend
  category?: {
    _id: string;
    name: string;
  } | string;            // si non populé
  pourcentagePromo?: number;
  stockLimite?: boolean;
  // Paramètres de remise et livraison (spécifiques au produit)
  quantityDiscountEnabled?: boolean | null;
  quantityDiscountMinQuantity?: number | null;
  quantityDiscountPercentage?: number | null;
  freeDeliveryEnabled?: boolean | null;
  freeDeliveryMinQuantity?: number | null;
  customDeliveryFee?: number | null;
  createdAt?: string;
}


// Types pour les commandes
export interface Order {
  _id: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  products: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  event_id?: string;
  createdAt?: string;
  updatedAt?: string;
}

// Types pour le thème
export type Theme = 'light' | 'dark';

// Types pour la langue
export type Language = 'fr' | 'ar';

