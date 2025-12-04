import { Product, Order, Category } from '../types';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

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
  login: (email: string, password: string): Promise<{ message: string }> =>
    fetchAPI<{ message: string }>('/admin/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }),
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

