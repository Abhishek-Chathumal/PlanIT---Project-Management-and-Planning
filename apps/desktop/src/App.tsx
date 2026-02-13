import { useState, useEffect, useCallback } from 'react';
import { AuthScreen } from './components/AuthScreen';
import { loadTokens, getAccessToken, authApi, workspacesApi, projectsApi, tasksApi } from './api';
import type { AuthUser, Workspace, Project, Board, Bucket, Task } from './api';
import './styles/App.css';

function App() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [authChecked, setAuthChecked] = useState(false);

  // Try to restore session on mount
  useEffect(() => {
    loadTokens();
    if (getAccessToken()) {
      authApi
        .getMe()
        .then((u) => setUser(u))
        .catch(() => setUser(null))
        .finally(() => setAuthChecked(true));
    } else {
      setAuthChecked(true);
    }
  }, []);

  if (!authChecked) {
    return (
      <div className="app loading-screen">
        <div className="loading-spinner" />
        <p>Loading…</p>
      </div>
    );
  }

  if (!user) {
    return <AuthScreen onAuthenticated={setUser} />;
  }

  return (
    <MainApp
      user={user}
      onLogout={() => {
        authApi.logout();
        setUser(null);
      }}
    />
  );
}

// ────────────────────────────────────────────
// Main App (after auth)
// ────────────────────────────────────────────
function MainApp({ user, onLogout }: { user: AuthUser; onLogout: () => void }) {
  const [currentView, setCurrentView] = useState<'dashboard' | 'board'>('dashboard');
  const [workspaces, setWorkspaces] = useState<Workspace[]>([]);
  const [selectedWorkspace, setSelectedWorkspace] = useState<Workspace | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  // Fetch workspaces on mount
  useEffect(() => {
    workspacesApi
      .list()
      .then((ws) => {
        setWorkspaces(ws);
        if (ws.length > 0) setSelectedWorkspace(ws[0] ?? null);
      })
      .catch(() => setWorkspaces([]));
  }, []);

  // Fetch projects when workspace changes
  useEffect(() => {
    if (!selectedWorkspace) {
      setProjects([]);
      return;
    }
    projectsApi
      .listInWorkspace(selectedWorkspace.id)
      .then((p) => {
        setProjects(p);
        if (p.length > 0) setSelectedProject(p[0] ?? null);
      })
      .catch(() => setProjects([]));
  }, [selectedWorkspace]);

  return (
    <div className="app">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-header">
          <div className="logo">
            <span className="logo-icon">🚀</span>
            <h1 className="logo-text">PlanIT.IO</h1>
          </div>
        </div>

        {/* Workspace Selector */}
        <div className="workspace-selector">
          <select
            value={selectedWorkspace?.id ?? ''}
            onChange={(e) => {
              const ws = workspaces.find((w) => w.id === e.target.value);
              setSelectedWorkspace(ws ?? null);
            }}
          >
            {workspaces.map((ws) => (
              <option key={ws.id} value={ws.id}>
                {ws.name}
              </option>
            ))}
          </select>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${currentView === 'dashboard' ? 'active' : ''}`}
            onClick={() => setCurrentView('dashboard')}
          >
            <span className="nav-icon">📊</span>
            <span>Dashboard</span>
          </button>
          <button
            className={`nav-item ${currentView === 'board' ? 'active' : ''}`}
            onClick={() => setCurrentView('board')}
          >
            <span className="nav-icon">📋</span>
            <span>Board</span>
          </button>

          {/* Project list */}
          <div className="nav-section-title">Projects</div>
          {projects.map((p) => (
            <button
              key={p.id}
              className={`nav-item ${selectedProject?.id === p.id ? 'active' : ''}`}
              onClick={() => {
                setSelectedProject(p);
                setCurrentView('board');
              }}
            >
              <span className="nav-icon">📁</span>
              <span>{p.name}</span>
            </button>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="user-info">
            <div className="user-avatar">{user.displayName.charAt(0).toUpperCase()}</div>
            <span className="user-name">{user.displayName}</span>
          </div>
          <button className="logout-btn" onClick={onLogout} title="Sign Out">
            ⏻
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        <header className="top-bar">
          <h2 className="page-title">
            {currentView === 'dashboard' ? 'Dashboard' : (selectedProject?.name ?? 'Project Board')}
          </h2>
          <div className="top-bar-actions">
            <button className="btn btn-primary" onClick={() => setCurrentView('board')}>
              + New Task
            </button>
          </div>
        </header>

        <div className="content-area">
          {currentView === 'dashboard' ? (
            <DashboardView workspace={selectedWorkspace} projects={projects} />
          ) : (
            <BoardView project={selectedProject} />
          )}
        </div>
      </main>
    </div>
  );
}

// ────────────────────────────────────────────
// Dashboard View — live stats
// ────────────────────────────────────────────
function DashboardView({
  workspace,
  projects,
}: {
  workspace: Workspace | null;
  projects: Project[];
}) {
  return (
    <div className="dashboard">
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-value">{projects.length}</div>
          <div className="stat-label">Projects</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{workspace?.members?.length ?? 0}</div>
          <div className="stat-label">Members</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">—</div>
          <div className="stat-label">Tasks</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">—</div>
          <div className="stat-label">Completed</div>
        </div>
      </div>

      <div className="welcome-card">
        <h3>Welcome to PlanIT.IO</h3>
        <p>
          {workspace
            ? `You're viewing "${workspace.name}". Select a project from the sidebar or switch to Board view.`
            : 'Create your first workspace to get started.'}
        </p>
      </div>
    </div>
  );
}

// ────────────────────────────────────────────
// Board View — live task data
// ────────────────────────────────────────────
function BoardView({ project }: { project: Project | null }) {
  const [fullProject, setFullProject] = useState<Project | null>(null);
  const [bucketTasks, setBucketTasks] = useState<Record<string, Task[]>>({});

  // Fetch full project with boards + buckets
  useEffect(() => {
    if (!project) return;
    projectsApi
      .get(project.id)
      .then((p) => setFullProject(p))
      .catch(() => setFullProject(null));
  }, [project]);

  // Fetch tasks per-bucket
  const loadTasks = useCallback(async (buckets: Bucket[]) => {
    const entries = await Promise.all(
      buckets.map(async (b) => {
        try {
          const tasks = await tasksApi.listByBucket(b.id);
          return [b.id, tasks] as const;
        } catch {
          return [b.id, []] as const;
        }
      }),
    );
    setBucketTasks(Object.fromEntries(entries));
  }, []);

  useEffect(() => {
    if (!fullProject?.boards) return;
    const allBuckets = fullProject.boards.flatMap((b: Board) => b.buckets ?? []);
    if (allBuckets.length > 0) loadTasks(allBuckets);
  }, [fullProject, loadTasks]);

  if (!project) {
    return (
      <div className="empty-state">
        <p>Select a project to view the board.</p>
      </div>
    );
  }

  const boards = fullProject?.boards ?? [];
  const firstBoard = boards[0];
  const buckets = firstBoard?.buckets ?? [];

  return (
    <div className="board">
      {buckets.length === 0 ? (
        <div className="empty-state">
          <p>No buckets yet. Create boards and buckets for this project.</p>
        </div>
      ) : (
        buckets.map((bucket: Bucket) => (
          <div key={bucket.id} className="bucket">
            <div className="bucket-header">
              <h3 className="bucket-title">{bucket.name}</h3>
              <span className="bucket-count">{bucketTasks[bucket.id]?.length ?? 0}</span>
            </div>
            <div className="bucket-tasks">
              {(bucketTasks[bucket.id] ?? []).map((task: Task) => (
                <div key={task.id} className="task-card">
                  <p className="task-title">{task.title}</p>
                  {task.priority !== 'NONE' && (
                    <span className={`task-priority priority-${task.priority.toLowerCase()}`}>
                      {task.priority}
                    </span>
                  )}
                  {task.assignee && (
                    <span className="task-assignee">{task.assignee.displayName}</span>
                  )}
                  {task._count && task._count.subtasks > 0 && (
                    <span className="task-subtasks">📋 {task._count.subtasks}</span>
                  )}
                </div>
              ))}
            </div>
            <button className="add-task-btn">+ Add task</button>
          </div>
        ))
      )}
    </div>
  );
}

export default App;
