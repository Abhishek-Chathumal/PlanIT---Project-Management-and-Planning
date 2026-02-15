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
  createWorkspace: (name: string, description?: string) => Promise<void>;
  createProject: (workspaceId: string, name: string, description?: string) => Promise<void>;
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

  createWorkspace: async (name, description) => {
    const ws = await workspacesApi.create({ name, description });
    const { workspaces } = get();
    set({ workspaces: [...workspaces, ws], selectedWorkspace: ws });
    // Fetch projects for new workspace (empty)
    set({ projects: [], selectedProject: null });
  },

  createProject: async (workspaceId, name, description) => {
    const project = await projectsApi.create(workspaceId, { name, description });
    const { projects } = get();
    set({ projects: [...projects, project], selectedProject: project });
  },
}));
