// ============================================
// Notifications API
// ============================================
import { apiFetch } from './client';

export interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  read: boolean;
  userId: string;
  createdAt: string;
}

export const notificationsApi = {
  async list(): Promise<Notification[]> {
    return apiFetch<Notification[]>('/notifications');
  },

  async unreadCount(): Promise<number> {
    return apiFetch<number>('/notifications/unread-count');
  },

  async markRead(id: string): Promise<Notification> {
    return apiFetch<Notification>(`/notifications/${id}/read`, { method: 'PATCH' });
  },

  async markAllRead(): Promise<void> {
    return apiFetch<void>('/notifications/read-all', { method: 'PATCH' });
  },

  async remove(id: string): Promise<void> {
    return apiFetch<void>(`/notifications/${id}`, { method: 'DELETE' });
  },
};
