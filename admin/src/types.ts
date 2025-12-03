// Types pour les produits
export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  image?: string;
  category?: string;
  stock?: number;
  createdAt?: string;
  updatedAt?: string;
}

// Types pour les commandes
export interface Order {
  _id: string;
  clientName: string;
  email: string;
  phone: string;
  address: string;
  product: string;
  quantity: number;
  status: 'Nouveau' | 'En cours' | 'Terminé';
  createdAt?: string;
}

// Types pour le thème
export type Theme = "light" | "dark";

// Types pour la langue
export type Language = 'fr' | 'en' | 'ar';

