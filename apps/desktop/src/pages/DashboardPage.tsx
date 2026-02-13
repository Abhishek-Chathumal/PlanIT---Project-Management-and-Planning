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
} from 'lucide-react';
import { useWorkspaceStore } from '../stores/workspace-store';
import { useAuthStore } from '../stores/auth-store';
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
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    totalMembers: 0,
    totalTasks: 0,
    completedTasks: 0,
    overdueTasks: 0,
  });
  const [recentTasks, setRecentTasks] = useState<Task[]>([]);

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
      const completed = all.filter((t) => t.progress === 100).length;
      const overdue = all.filter(
        (t) => t.dueDate && new Date(t.dueDate) < now && t.progress !== 100,
      ).length;

      setStats((prev) => ({
        ...prev,
        totalTasks: all.length,
        completedTasks: completed,
        overdueTasks: overdue,
      }));
      setRecentTasks(all.slice(0, 8));
    };

    loadTasks();
  }, [selectedWorkspace, projects]);

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
        <div className="stat-card stat-projects">
          <FolderKanban size={28} />
          <div>
            <span className="stat-value">{stats.totalProjects}</span>
            <span className="stat-label">Projects</span>
          </div>
        </div>
        <div className="stat-card stat-members">
          <Users size={28} />
          <div>
            <span className="stat-value">{stats.totalMembers}</span>
            <span className="stat-label">Members</span>
          </div>
        </div>
        <div className="stat-card stat-completed">
          <CheckCircle2 size={28} />
          <div>
            <span className="stat-value">{stats.completedTasks}</span>
            <span className="stat-label">Completed</span>
          </div>
        </div>
        <div className="stat-card stat-overdue">
          <AlertTriangle size={28} />
          <div>
            <span className="stat-value">{stats.overdueTasks}</span>
            <span className="stat-label">Overdue</span>
          </div>
        </div>
      </div>

      {/* Recent tasks */}
      <section className="recent-section">
        <h3 className="section-title">
          <Clock size={18} />
          Recent Tasks
        </h3>
        {recentTasks.length === 0 ? (
          <div className="empty-state">No tasks yet — create one from a project board!</div>
        ) : (
          <div className="recent-tasks-list">
            {recentTasks.map((task) => (
              <div key={task.id} className="recent-task-row">
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
          {projects.map((project) => (
            <Link
              key={project.id}
              to="/board/$projectId"
              params={{ projectId: project.id }}
              className="project-card"
            >
              <FolderKanban size={20} />
              <span>{project.name}</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}
