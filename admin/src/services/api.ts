import { Product, Order, Category } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000';

// Fonction pour construire l'URL complète d'une image
export const getImageUrl = (imagePath: string | undefined | null): string => {
  if (!imagePath) return '';
  // Si l'URL est déjà complète (commence par http), la retourner telle quelle
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  // Utiliser le chemin relatif pour que le proxy Vite le gère
  // Le proxy redirigera automatiquement vers le backend
  return imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
};

// Fonction utilitaire pour les appels API
async function fetchAPI<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const { body, headers: incomingHeaders, ...rest } = options;
  const isFormData = body instanceof FormData;

  let headers: HeadersInit | undefined = incomingHeaders;
  if (incomingHeaders instanceof Headers) {
    if (!isFormData && !incomingHeaders.has('Content-Type')) {
      incomingHeaders.set('Content-Type', 'application/json');
    }
    headers = incomingHeaders;
  } else {
    headers = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...(incomingHeaders || {}),
    };
  }

  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    body,
    headers,
    ...rest,
  });

  if (!response.ok) {
    // Essayer d'extraire le message d'erreur du body
    let errorMessage = response.statusText;
    try {
      const errorData = await response.json();
      if (errorData.message) {
        errorMessage = errorData.message;
      }
    } catch {
      // Si le body n'est pas du JSON, utiliser statusText
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

// API Admin
export const adminAPI = {
  login: (email: string, password: string) =>
    fetchAPI('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
refresh: (refreshToken: string) =>
    fetchAPI('/admin/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }, // important
      body: JSON.stringify({ refreshToken }), // clé exactement comme attendue par le backend
    }),


  logout: () =>
    fetchAPI('/admin/logout', { method: 'POST' }),
};


// API Products (Admin)
export const adminProductAPI = {
  getAll: async (): Promise<Product[]> => {
    const products = await fetchAPI<Product[]>('/products');
    return products.map((product) => ({
      ...product,
      image: product.image ?? product.images?.[0],
    }));
  },
  getById: (id: string): Promise<Product> => fetchAPI<Product>(`/products/${id}`),
  create: (product: FormData): Promise<Product> =>
    fetchAPI<Product>('/products', {
      method: 'POST',
      body: product,
    }),
  update: (id: string, product: FormData | Partial<Product>): Promise<Product> => {
    const body = product instanceof FormData ? product : JSON.stringify(product);
    return fetchAPI<Product>(`/products/${id}`, {
      method: 'PUT',
      body,
    });
  },
  delete: (id: string): Promise<void> =>
    fetchAPI<void>(`/products/${id}`, {
      method: 'DELETE',
    }),
};

export const adminCategoryAPI = {
  getAll: (options?: { includeInactive?: boolean }): Promise<Category[]> => {
    const includeInactive = options?.includeInactive ?? true;
    const query = includeInactive ? '?includeInactive=true' : '';
    return fetchAPI<Category[]>(`/categories${query}`);
  },
  create: (payload: { name: string; description?: string; isActive?: boolean }): Promise<Category> =>
    fetchAPI<Category>('/categories', {
      method: 'POST',
      body: JSON.stringify(payload),
    }),
  update: (id: string, payload: Partial<Category>): Promise<Category> =>
    fetchAPI<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload),
    }),
  delete: (id: string): Promise<void> =>
    fetchAPI<void>(`/categories/${id}`, {
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

export const adminSettingsAPI = {
  get: (): Promise<Settings> => fetchAPI<Settings>('/settings'),
  update: (settings: Partial<Settings>): Promise<Settings> =>
    fetchAPI<Settings>('/settings', {
      method: 'PUT',
      body: JSON.stringify(settings),
    }),
};

