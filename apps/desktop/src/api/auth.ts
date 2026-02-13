// ============================================
// Auth API — login, register, refresh, me
// ============================================
import { apiFetch, setTokens, clearTokens } from './client';

export interface AuthUser {
  id: string;
  email: string;
  displayName: string;
  role: string;
  avatarUrl?: string;
}

interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
}

export const authApi = {
  async register(email: string, password: string, displayName: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, displayName }),
    });
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async login(email: string, password: string): Promise<AuthResponse> {
    const data = await apiFetch<AuthResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    setTokens(data.accessToken, data.refreshToken);
    return data;
  },

  async getMe(): Promise<AuthUser> {
    return apiFetch<AuthUser>('/auth/me');
  },

  logout() {
    clearTokens();
  },
};
