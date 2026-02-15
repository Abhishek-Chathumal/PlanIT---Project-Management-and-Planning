// ============================================
// Board Page — Kanban board with drag-and-drop
// ============================================
import { useEffect, useMemo, useState } from 'react';
import { useParams } from '@tanstack/react-router';
import {
  KanbanSquare,
  Filter,
  BarChart3,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ListTodo,
} from 'lucide-react';
import { useBoardStore } from '../stores/board-store';
import { useWorkspaceStore } from '../stores/workspace-store';
import { KanbanBoard } from '../features/board/KanbanBoard';
import '../styles/board.css';

type PriorityFilter = 'ALL' | 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW';

export function BoardPage() {
  const { projectId } = useParams({ strict: false });
  const selectedProject = useWorkspaceStore((s) => s.selectedProject);
  const projects = useWorkspaceStore((s) => s.projects);
  const { isLoading, fetchBoard, buckets, tasksByBucket } = useBoardStore();
  const [priorityFilter, setPriorityFilter] = useState<PriorityFilter>('ALL');
  const [showFilters, setShowFilters] = useState(false);

  // Resolve project name from store or fallback
  const projectName = useMemo(() => {
    if (selectedProject?.name) return selectedProject.name;
    const found = projects.find((p) => p.id === projectId);
    return found?.name ?? 'Board';
  }, [selectedProject, projects, projectId]);

  useEffect(() => {
    if (projectId) {
      fetchBoard(projectId);
    }
  }, [projectId, fetchBoard]);

  // Calculate stats
  const allTasks = useMemo(() => {
    return Object.values(tasksByBucket).flat();
  }, [tasksByBucket]);

  const stats = useMemo(() => {
    const total = allTasks.length;
    const done = allTasks.filter((t) => t.status === 'DONE').length;
    const inProgress = allTasks.filter((t) => t.status === 'IN_PROGRESS').length;
    const overdue = allTasks.filter(
      (t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE',
    ).length;
    return { total, done, inProgress, overdue };
  }, [allTasks]);

  // Apply priority filter
  const filteredTasksByBucket = useMemo(() => {
    if (priorityFilter === 'ALL') return tasksByBucket;
    const filtered: Record<string, typeof allTasks> = {};
    for (const [bucketId, tasks] of Object.entries(tasksByBucket)) {
      filtered[bucketId] = tasks.filter((t) => t.priority === priorityFilter);
    }
    return filtered;
  }, [tasksByBucket, priorityFilter, allTasks]);

  if (isLoading) {
    return (
      <div className="board-loading">
        <div className="loading-spinner" />
        <p>Loading board…</p>
      </div>
    );
  }

  return (
    <div className="board-page">
      <header className="board-header">
        <div className="board-header-left">
          <KanbanSquare size={22} />
          <h2>{projectName}</h2>
        </div>

        <div className="board-header-right">
          {/* Stats chips */}
          {stats.total > 0 && (
            <div className="board-stats">
              <div className="stat-chip" title="Total tasks">
                <ListTodo size={13} />
                <span>{stats.total}</span>
              </div>
              <div className="stat-chip stat-progress" title="In progress">
                <Clock size={13} />
                <span>{stats.inProgress}</span>
              </div>
              <div className="stat-chip stat-done" title="Completed">
                <CheckCircle2 size={13} />
                <span>{stats.done}</span>
              </div>
              {stats.overdue > 0 && (
                <div className="stat-chip stat-overdue" title="Overdue">
                  <AlertTriangle size={13} />
                  <span>{stats.overdue}</span>
                </div>
              )}
            </div>
          )}

          {/* Filter toggle */}
          <button
            className={`btn-toolbar ${showFilters ? 'active' : ''}`}
            onClick={() => setShowFilters(!showFilters)}
            title="Filter tasks"
          >
            <Filter size={15} />
          </button>
        </div>
      </header>

      {/* Filter bar */}
      {showFilters && (
        <div className="board-filter-bar">
          <span className="filter-label">
            <BarChart3 size={13} />
            Priority:
          </span>
          {(['ALL', 'URGENT', 'HIGH', 'MEDIUM', 'LOW'] as PriorityFilter[]).map((p) => (
            <button
              key={p}
              className={`filter-chip ${priorityFilter === p ? 'active' : ''} ${p !== 'ALL' ? `filter-${p.toLowerCase()}` : ''}`}
              onClick={() => setPriorityFilter(p)}
            >
              {p === 'ALL' ? 'All' : p.charAt(0) + p.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      )}

      <KanbanBoard buckets={buckets} tasksByBucket={filteredTasksByBucket} />
    </div>
  );
}
