// ============================================
// PlanIT.IO — User Types
// ============================================

export type UserRole = 'owner' | 'admin' | 'member' | 'viewer';

export interface User {
    id: string;
    email: string;
    displayName: string;
    avatarUrl?: string;
    role: UserRole;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface UserPreferences {
    userId: string;
    theme: 'light' | 'dark' | 'system';
    language: string;
    notificationsEnabled: boolean;
    emailNotifications: boolean;
}
