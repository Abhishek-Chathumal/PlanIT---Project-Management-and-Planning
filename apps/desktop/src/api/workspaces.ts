// ============================================
// Workspaces API
// ============================================
import { apiFetch } from './client';

export interface Workspace {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  owner?: { id: string; displayName: string };
  members?: WorkspaceMember[];
  projects?: Project[];
  createdAt: string;
}

export interface WorkspaceMember {
  id: string;
  userId: string;
  role: string;
  user?: { id: string; displayName: string };
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  workspaceId: string;
  boards?: Board[];
}

export interface Board {
  id: string;
  name: string;
  position: number;
  projectId: string;
  buckets?: Bucket[];
}

export interface Bucket {
  id: string;
  name: string;
  position: number;
  boardId: string;
}

export const workspacesApi = {
  async list(): Promise<Workspace[]> {
    return apiFetch<Workspace[]>('/workspaces');
  },

  async get(id: string): Promise<Workspace> {
    return apiFetch<Workspace>(`/workspaces/${id}`);
  },

  async create(data: { name: string; description?: string }): Promise<Workspace> {
    return apiFetch<Workspace>('/workspaces', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export const projectsApi = {
  async listInWorkspace(workspaceId: string): Promise<Project[]> {
    return apiFetch<Project[]>(`/workspaces/${workspaceId}/projects`);
  },

  async get(id: string): Promise<Project> {
    return apiFetch<Project>(`/projects/${id}`);
  },

  async create(
    workspaceId: string,
    data: { name: string; description?: string },
  ): Promise<Project> {
    return apiFetch<Project>(`/workspaces/${workspaceId}/projects`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createBoard(projectId: string, data: { name: string }): Promise<Board> {
    return apiFetch<Board>(`/projects/${projectId}/boards`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async createBucket(boardId: string, data: { name: string }): Promise<Bucket> {
    return apiFetch<Bucket>(`/projects/boards/${boardId}/buckets`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async deleteBucket(bucketId: string): Promise<void> {
    return apiFetch<void>(`/projects/buckets/${bucketId}`, {
      method: 'DELETE',
    });
  },
};
