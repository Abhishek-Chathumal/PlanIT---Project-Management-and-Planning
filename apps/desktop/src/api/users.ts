// ============================================
// Users API
// ============================================
import { apiFetch } from './client';

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  avatarUrl?: string;
  isActive: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
}

export const usersApi = {
  async getProfile(id: string): Promise<UserProfile> {
    return apiFetch<UserProfile>(`/users/${id}`);
  },

  async updateProfile(
    id: string,
    data: { displayName?: string; avatarUrl?: string },
  ): Promise<UserProfile> {
    return apiFetch<UserProfile>(`/users/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async listAll(): Promise<UserProfile[]> {
    return apiFetch<UserProfile[]>('/users');
  },
};
