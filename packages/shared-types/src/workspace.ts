// ============================================
// PlanIT.IO — Workspace Types
// ============================================

import type { UserRole } from './user';

export interface Workspace {
    id: string;
    name: string;
    description?: string;
    ownerId: string;
    iconUrl?: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface WorkspaceMember {
    userId: string;
    workspaceId: string;
    role: UserRole;
    joinedAt: string;
}
