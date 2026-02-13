// ============================================
// PlanIT.IO — Task Types
// ============================================

export type TaskPriority = 'urgent' | 'high' | 'medium' | 'low';
export type TaskStatus = 'not-started' | 'in-progress' | 'completed' | 'blocked';

export interface Label {
    id: string;
    name: string;
    color: string;
    projectId: string;
}

export interface Subtask {
    id: string;
    taskId: string;
    title: string;
    isCompleted: boolean;
    order: number;
}

export interface Comment {
    id: string;
    taskId: string;
    authorId: string;
    content: string;
    createdAt: string;
    updatedAt: string;
}

export interface Task {
    id: string;
    bucketId: string;
    projectId: string;
    title: string;
    description?: string;
    priority: TaskPriority;
    status: TaskStatus;
    assigneeIds: string[];
    labelIds: string[];
    dueDate?: string;
    startDate?: string;
    order: number;
    subtasks: Subtask[];
    attachmentCount: number;
    commentCount: number;
    createdById: string;
    createdAt: string;
    updatedAt: string;
}
