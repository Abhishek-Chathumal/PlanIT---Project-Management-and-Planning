// ============================================
// AppLayout — Sidebar + content area
// ============================================
import { useEffect } from 'react';
import { Outlet, Link, useNavigate } from '@tanstack/react-router';
import { LayoutDashboard, KanbanSquare, LogOut, ChevronDown, FolderKanban } from 'lucide-react';
import { useAuthStore } from '../stores/auth-store';
import { useWorkspaceStore } from '../stores/workspace-store';
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
          <label className="sidebar-label">Workspace</label>
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

          <div className="nav-group-label">Projects</div>
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
          <button className="logout-btn" onClick={handleLogout} title="Logout">
            <LogOut size={18} />
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
}
