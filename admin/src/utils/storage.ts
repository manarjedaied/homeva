// Utilitaires pour la gestion du stockage local (session admin)

const ADMIN_TOKEN_KEY = 'admin_token';
const ADMIN_EMAIL_KEY = 'admin_email';

export const adminStorage = {
  setToken: (token: string) => {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  },
  getToken: (): string | null => {
    return localStorage.getItem(ADMIN_TOKEN_KEY);
  },
  removeToken: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  },
  setEmail: (email: string) => {
    localStorage.setItem(ADMIN_EMAIL_KEY, email);
  },
  getEmail: (): string | null => {
    return localStorage.getItem(ADMIN_EMAIL_KEY);
  },
  removeEmail: () => {
    localStorage.removeItem(ADMIN_EMAIL_KEY);
  },
  clear: () => {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
    localStorage.removeItem(ADMIN_EMAIL_KEY);
  },
  isAuthenticated: (): boolean => {
    return !!localStorage.getItem(ADMIN_TOKEN_KEY);
  },
};

