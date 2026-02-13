// ============================================
// Workspace Store — Zustand
// ============================================
import { create } from 'zustand';
import { workspacesApi, projectsApi } from '../api';
import type { Workspace, Project } from '../api';

interface WorkspaceState {
  workspaces: Workspace[];
  selectedWorkspace: Workspace | null;
  projects: Project[];
  selectedProject: Project | null;
  isLoading: boolean;

  fetchWorkspaces: () => Promise<void>;
  selectWorkspace: (workspace: Workspace) => void;
  selectProject: (project: Project) => void;
  fetchProjects: (workspaceId: string) => Promise<void>;
}

export const useWorkspaceStore = create<WorkspaceState>((set, get) => ({
  workspaces: [],
  selectedWorkspace: null,
  projects: [],
  selectedProject: null,
  isLoading: false,

  fetchWorkspaces: async () => {
    set({ isLoading: true });
    try {
      const workspaces = await workspacesApi.list();
      const first = workspaces[0] ?? null;
      set({ workspaces, selectedWorkspace: first });

      // Auto-load projects for the first workspace
      if (first) {
        await get().fetchProjects(first.id);
      }
    } catch {
      set({ workspaces: [] });
    } finally {
      set({ isLoading: false });
    }
  },

  selectWorkspace: (workspace) => {
    set({ selectedWorkspace: workspace, projects: [], selectedProject: null });
    get().fetchProjects(workspace.id);
  },

  selectProject: (project) => {
    set({ selectedProject: project });
  },

  fetchProjects: async (workspaceId) => {
    try {
      const projects = await projectsApi.listInWorkspace(workspaceId);
      set({ projects, selectedProject: projects[0] ?? null });
    } catch {
      set({ projects: [] });
    }
  },
}));
