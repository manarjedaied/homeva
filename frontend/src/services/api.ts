import { Product, Order } from '../types';

const API_BASE_URL = '/api';

// Fonction utilitaire pour les appels API
async function fetchAPI<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.statusText}`);
  }

  return response.json();
}

// API Products
export const productAPI = {
  getAll: (): Promise<Product[]> => fetchAPI<Product[]>('/products'),
  getById: (id: string): Promise<Product> => fetchAPI<Product>(`/products/${id}`),
  create: (product: Omit<Product, '_id' | 'createdAt' | 'updatedAt'>): Promise<Product> =>
    fetchAPI<Product>('/products', {
      method: 'POST',
      body: JSON.stringify(product),
    }),
  update: (id: string, product: Partial<Product>): Promise<Product> =>
    fetchAPI<Product>(`/products/${id}`, {
      method: 'PUT',
      body: JSON.stringify(product),
    }),
  delete: (id: string): Promise<void> =>
    fetchAPI<void>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

// API Orders
export const orderAPI = {
  getAll: (): Promise<Order[]> => fetchAPI<Order[]>('/orders'),
  create: (order: Omit<Order, '_id' | 'createdAt' | 'updatedAt'>): Promise<Order> =>
    fetchAPI<Order>('/orders', {
      method: 'POST',
      body: JSON.stringify(order),
    }),
  updateStatus: (id: string, status: Order['status']): Promise<Order> =>
    fetchAPI<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

// API Settings
export interface Settings {
  _id?: string;
  quantityDiscountEnabled: boolean;
  quantityDiscountMinQuantity: number;
  quantityDiscountPercentage: number;
  freeDeliveryEnabled: boolean;
  freeDeliveryMinQuantity: number;
  defaultDeliveryFee: number;
  createdAt?: string;
  updatedAt?: string;
}

export const settingsAPI = {
  get: (): Promise<Settings> => fetchAPI<Settings>('/settings'),
};

