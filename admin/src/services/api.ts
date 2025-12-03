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

// API Admin
export const adminAPI = {
  login: (email: string, password: string): Promise<{ message: string }> =>
    fetchAPI<{ message: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
};

// API Products (Admin)
export const adminProductAPI = {
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

// API Orders (Admin)
export const adminOrderAPI = {
  getAll: (): Promise<Order[]> => fetchAPI<Order[]>('/orders'),
  updateStatus: (id: string, status: string): Promise<Order> =>
    fetchAPI<Order>(`/orders/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status }),
    }),
};

