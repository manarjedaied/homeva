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
  createdAt?: string;
  updatedAt?: string;
}

// Types pour le thème
export type Theme = 'light' | 'dark';

// Types pour la langue
export type Language = 'fr' | 'ar';

