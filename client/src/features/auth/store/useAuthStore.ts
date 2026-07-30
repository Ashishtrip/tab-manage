import { create } from 'zustand';
import api from '../../../lib/api';

export interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (data: any) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set: any) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,
  login: async (data: any) => {
    const response = await api.post('/auth/login', data);
    set({ user: response.data.user, isAuthenticated: true });
  },
  signup: async (data: any) => {
    const response = await api.post('/auth/register', data);
    set({ user: response.data.user, isAuthenticated: true });
  },
  logout: async () => {
    await api.post('/auth/logout');
    set({ user: null, isAuthenticated: false });
  },
  checkAuth: async () => {
    try {
      const response = await api.get('/auth/me');
      set({ user: response.data.user, isAuthenticated: true, isLoading: false });
    } catch (error) {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));

// Listen for global unauthorized events (e.g., from Axios interceptor)
window.addEventListener('auth:unauthorized', () => {
  useAuthStore.setState({ user: null, isAuthenticated: false });
});
