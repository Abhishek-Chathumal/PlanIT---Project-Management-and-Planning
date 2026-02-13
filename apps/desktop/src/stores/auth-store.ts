// ============================================
// Auth Store — Zustand
// ============================================
import { create } from 'zustand';
import { loadTokens, getAccessToken, authApi } from '../api';
import type { AuthUser } from '../api';

interface AuthState {
  user: AuthUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;

  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, displayName: string) => Promise<void>;
  logout: () => void;
  restoreSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: true,

  login: async (email, password) => {
    const data = await authApi.login(email, password);
    set({ user: data.user, isAuthenticated: true });
  },

  register: async (email, password, displayName) => {
    const data = await authApi.register(email, password, displayName);
    set({ user: data.user, isAuthenticated: true });
  },

  logout: () => {
    authApi.logout();
    set({ user: null, isAuthenticated: false });
  },

  restoreSession: async () => {
    loadTokens();
    if (!getAccessToken()) {
      set({ isLoading: false });
      return;
    }
    try {
      const user = await authApi.getMe();
      set({ user, isAuthenticated: true, isLoading: false });
    } catch {
      set({ user: null, isAuthenticated: false, isLoading: false });
    }
  },
}));
