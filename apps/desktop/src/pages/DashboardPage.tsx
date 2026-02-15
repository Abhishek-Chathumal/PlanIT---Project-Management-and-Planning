// ============================================
// Dashboard Page
// ============================================
import { useEffect, useState } from 'react';
import { Link } from '@tanstack/react-router';
import {
  LayoutDashboard,
  FolderKanban,
  Users,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Plus,
} from 'lucide-react';
import { useWorkspaceStore } from '../stores/workspace-store';
import { useAuthStore } from '../stores/auth-store';
import { CreateProjectModal } from '../features/project/CreateProjectModal';
import { tasksApi } from '../api';
import type { Task } from '../api';
import '../styles/dashboard.css';

interface DashboardStats {
  totalProjects: number;
  totalMembers: number;
  totalTasks: number;
  completedTasks: number;
  overdueTasks: number;
}

export function DashboardPage() {
  const user = useAuthStore((s) => s.user);
  const { projects, selectedWorkspace } = useWorkspaceStore();
  const [isProjectModalOpen, setIsProjectModalOpen] = useState(false);
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);
  const [assignedTasks, setAssignedTasks] = useState<Task[]>([]);

  useEffect(() => {
    if (!selectedWorkspace) return;

    const members = selectedWorkspace.members?.length ?? 0;
    setStats((prev) => ({
      ...prev,
      totalProjects: projects.length,
      totalMembers: members,
    }));

    // Load recent tasks from all projects
    const loadTasks = async () => {
      let all: Task[] = [];
      for (const project of projects.slice(0, 5)) {
        try {
          const boards = project.boards ?? [];
          for (const board of boards) {
            for (const bucket of board.buckets ?? []) {
              const tasks = await tasksApi.listByBucket(bucket.id);
              all = all.concat(tasks);
            }
          }
        } catch {
          // Skip on error
        }
      }

      const now = new Date();
      const completed = all.filter((t) => t.status === 'DONE').length;
      const overdue = all.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.status !== 'DONE',
      ).length;

      setStats((prev) => ({
        ...prev,
        totalTasks: all.length,
        completedTasks: completed,
        overdueTasks: overdue,
      }));
      setRecentTasks(all.slice(0, 8));

      // Assigned to current user
      if (user?.id) {
        setAssignedTasks(all.filter((t) => t.assigneeId === user.id && t.status !== 'DONE'));
      }
    };

    loadTasks();
  }, [selectedWorkspace, projects, user]);

  const STATUS_ICON: Record<string, React.ReactNode> = {
    TODO: <Clock size={14} style={{ color: '#71717a' }} />,
    IN_PROGRESS: <Clock size={14} style={{ color: '#3b82f6' }} />,
    IN_REVIEW: <AlertTriangle size={14} style={{ color: '#f59e0b' }} />,
    DONE: <CheckCircle2 size={14} style={{ color: '#22c55e' }} />,
  };

  return (
    <div className="dashboard">
      <header className="dashboard-header">
        <div>
          <h2 className="dashboard-title">
            <LayoutDashboard size={24} />
            Dashboard
          </h2>
          <p className="dashboard-subtitle">
            Welcome back, <strong>{user?.displayName}</strong>
          </p>
        </div>
      </header>

      {/* Stats grid */}
      <div className="stats-grid">
        <div className="card stat-card stat-projects">
          <FolderKanban size={28} />
          <div>
            <span className="stat-value">{stats.totalProjects}</span>
            <span className="stat-label">Projects</span>
          </div>
        </div>
        <div className="card stat-card stat-tasks">
          <Clock size={28} />
          <div>
            <span className="stat-value">{stats.totalTasks}</span>
            <span className="stat-label">Total Tasks</span>
          </div>
        </div>
        <div className="card stat-card stat-members">
          <Users size={28} />
          <div>
            <span className="stat-value">{stats.totalMembers}</span>
            <span className="stat-label">Members</span>
          </div>
        </div>
        <div className="card stat-card stat-completed">
          <CheckCircle2 size={28} />
          <div>
            <span className="stat-value">{stats.completedTasks}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="card stat-card stat-overdue">
          <AlertTriangle size={28} />
          <div>
            <span className="stat-value">{stats.overdueTasks}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      {/* Assigned to Me */}
      {assignedTasks.length > 0 && (
        <section className="assigned-section">
          <h3 className="section-title">
            <Users size={18} />
            Assigned to Me
            <span className="section-badge">{assignedTasks.length}</span>
          </h3>
          <div className="assigned-tasks-list">
            {assignedTasks.map((task) => (
              <div key={task.id} className="card assigned-task-row">
                {STATUS_ICON[task.status] ?? STATUS_ICON.TODO}
                <span className="task-title">{task.title}</span>
                <span
                  className={`priority-pill priority-${(task.priority ?? 'MEDIUM').toLowerCase()}`}
                >
                  {task.priority}
                </span>
                {task.dueDate && (
                  <span
                    className={`task-due ${new Date(task.dueDate) < new Date() ? 'overdue' : ''}`}
                  >
                    {new Date(task.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Recent tasks */}
      <section className="recent-section">
        <h3 className="section-title">
          <Clock size={18} />
          Recent Tasks
        </h3>
        {recentTasks.length === 0 ? (
          <div className="card empty-state">No tasks yet — create one from a project board!</div>
        ) : (
          <div className="recent-tasks-list">
            {recentTasks.map((task) => (
              <div key={task.id} className="card recent-task-row">
                <span
                  className={`priority-dot priority-${(task.priority ?? 'MEDIUM').toLowerCase()}`}
                />
                <span className="task-title">{task.title}</span>
                {task.dueDate && (
                  <span className="task-due">{new Date(task.dueDate).toLocaleDateString()}</span>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Quick links */}
      <section className="quick-links">
        <h3 className="section-title">Projects</h3>
        <div className="project-cards">
          <button
            className="card project-card new-project-card"
            onClick={() => setIsProjectModalOpen(true)}
            title="Create New Project"
          >
            <div className="new-project-content">
              <Plus size={24} />
              <span>New Project</span>
            </div>
          </button>
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/board/$projectId"
              params={{ projectId: project.id }}
              className="card project-card"
            >
              <FolderKanban size={20} />
              <span>{project.name}</span>
            </Link>
          ))}
        </div>
      </section>

      <CreateProjectModal
        isOpen={isProjectModalOpen}
        onClose={() => setIsProjectModalOpen(false)}
      />
    </div>
  );
}
