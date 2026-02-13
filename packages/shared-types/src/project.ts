// ============================================
// PlanIT.IO — Project Types
// ============================================

export type ProjectStatus = 'active' | 'on-hold' | 'completed' | 'archived';

export interface Project {
    id: string;
    workspaceId: string;
    name: string;
    description?: string;
    status: ProjectStatus;
    color?: string;
    iconEmoji?: string;
    ownerId: string;
    isArchived: boolean;
    createdAt: string;
    updatedAt: string;
}
