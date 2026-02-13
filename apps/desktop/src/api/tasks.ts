// ============================================
// Tasks API
// ============================================
import { apiFetch } from './client';

export interface Task {
  id: string;
  title: string;
  description: string | null;
  priority: 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' | 'NONE';
  status: string;
  position: number;
  bucketId: string;
  assigneeId: string | null;
  creatorId: string;
  dueDate: string | null;
  assignee?: { id: string; displayName: string } | null;
  subtasks?: Subtask[];
  comments?: Comment[];
  labels?: TaskLabel[];
  _count?: { subtasks: number; comments: number };
  createdAt: string;
  updatedAt: string;
}

export interface Subtask {
  id: string;
  title: string;
  completed: boolean;
  position: number;
}

export interface Comment {
  id: string;
  content: string;
  authorId: string;
  author?: { id: string; displayName: string };
  createdAt: string;
}

export interface TaskLabel {
  id: string;
  label: { id: string; name: string; color: string };
}

export const tasksApi = {
  async listByBucket(bucketId: string): Promise<Task[]> {
    return apiFetch<Task[]>(`/buckets/${bucketId}/tasks`);
  },

  async get(id: string): Promise<Task> {
    return apiFetch<Task>(`/tasks/${id}`);
  },

  async create(data: {
    title: string;
    description?: string;
    priority?: string;
    bucketId: string;
    assigneeId?: string;
    dueDate?: string;
  }): Promise<Task> {
    return apiFetch<Task>('/tasks', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(
    id: string,
    data: Partial<
      Pick<
        Task,
        'title' | 'description' | 'priority' | 'status' | 'dueDate' | 'assigneeId' | 'bucketId'
      >
    >,
  ): Promise<Task> {
    return apiFetch<Task>(`/tasks/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string): Promise<void> {
    return apiFetch<void>(`/tasks/${id}`, { method: 'DELETE' });
  },

  async addSubtask(taskId: string, title: string): Promise<Subtask> {
    return apiFetch<Subtask>(`/tasks/${taskId}/subtasks`, {
      method: 'POST',
      body: JSON.stringify({ title }),
    });
  },

  async toggleSubtask(taskId: string, subtaskId: string): Promise<Subtask> {
    return apiFetch<Subtask>(`/tasks/${taskId}/subtasks/${subtaskId}/toggle`, {
      method: 'PATCH',
    });
  },

  async addComment(taskId: string, content: string): Promise<Comment> {
    return apiFetch<Comment>(`/tasks/${taskId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },
};
