// ============================================
// AppLayout — Sidebar + content area
// ============================================
import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import {
  LayoutDashboard,
  KanbanSquare,
  LogOut,
  ChevronDown,
  FolderKanban,
  Plus,
  Users,
  Settings,
} from 'lucide-react';
import { useAuthStore } from '../stores/auth-store';
import { useWorkspaceStore } from '../stores/workspace-store';
import { CreateWorkspaceModal } from '../features/workspace/CreateWorkspaceModal';
import { CreateProjectModal } from '../features/project/CreateProjectModal';
import { NotificationCenter } from '../features/notifications/NotificationCenter';
import '../styles/layout.css';

export function AppLayout() {
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const {
    workspaces,
    selectedWorkspace,
    projects,
    fetchWorkspaces,
    selectWorkspace,
    selectProject,
  } = useWorkspaceStore();

  const [isWorkspaceModalOpen, setIsWorkspaceModalOpen] = useState(false);
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);

  useEffect(() => {
    fetchWorkspaces();
  }, [fetchWorkspaces]);

  const handleLogout = () => {
    logout();
    navigate({ to: '/login' });
  };

  return (
    <div className="app-layout">
      {/* ── Sidebar ── */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <FolderKanban size={24} />
          <h1 className="sidebar-brand">PlanIT.IO</h1>
        </div>

        {/* Workspace selector */}
        <div className="sidebar-section">
          <div className="sidebar-label-row">
            <label className="sidebar-label">Workspace</label>
            <button
              className="icon-btn"
              onClick={() => setIsWorkspaceModalOpen(true)}
              title="Create Workspace"
            >
              <Plus size={16} />
            </button>
          </div>
          <div className="workspace-select">
            <select
              value={selectedWorkspace?.id ?? ''}
              onChange={(e) => {
                const ws = workspaces.find((w) => w.id === e.target.value);
                if (ws) selectWorkspace(ws);
              }}
            >
              {workspaces.map((ws) => (
                <option key={ws.id} value={ws.id}>
                  {ws.name}
                </option>
              ))}
            </select>
            <ChevronDown size={14} className="select-chevron" />
          </div>
        </div>

        {/* Navigation */}
        <nav className="sidebar-nav">
          <Link to="/dashboard" className="nav-item" activeProps={{ className: 'nav-item active' }}>
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </Link>
          <Link to="/members" className="nav-item" activeProps={{ className: 'nav-item active' }}>
            <Users size={18} />
            <span>Members</span>
          </Link>
          <Link to="/settings" className="nav-item" activeProps={{ className: 'nav-item active' }}>
            <Settings size={18} />
            <span>Settings</span>
          </Link>

          <div className="nav-group-label-row">
            <div className="nav-group-label">Projects</div>
            <button
              className="icon-btn"
              onClick={() => setIsProjectModalOpen(true)}
              title="Create Project"
              disabled={!selectedWorkspace}
            >
              <Plus size={16} />
            </button>
          </div>
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/board/$projectId"
              params={{ projectId: project.id }}
              className="nav-item"
              activeProps={{ className: 'nav-item active' }}
              onClick={() => selectProject(project)}
            >
              <KanbanSquare size={18} />
              <span>{project.name}</span>
            </Link>
          ))}

          {projects.length === 0 && <div className="nav-empty">No projects yet</div>}
        </nav>

        {/* User footer */}
        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user?.displayName?.charAt(0).toUpperCase() ?? '?'}</div>
            <span className="user-name">{user?.displayName}</span>
          </div>
          <div className="sidebar-footer-actions">
            <NotificationCenter />
            <button className="icon-btn" onClick={handleLogout} title="Logout">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </aside>

      <main className="main-content">
        <Outlet />
      </main>

      <CreateWorkspaceModal
        isOpen={isWorkspaceModalOpen}
        onClose={() => setIsWorkspaceModalOpen(false)}
      />

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
