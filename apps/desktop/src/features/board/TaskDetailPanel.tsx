// ============================================
// TaskDetailPanel — Slide-out detail editor
// ============================================
import { useEffect, useState, useCallback } from 'react';
import {
  X,
  Calendar,
  Flag,
  User,
  CheckSquare,
  Plus,
  MessageSquare,
  Send,
  Trash2,
  Clock,
  Activity,
  AlertTriangle,
  Tag,
} from 'lucide-react';
import { tasksApi } from '../../api';
import type { Task, Subtask } from '../../api';
import './TaskDetailPanel.css';

interface TaskDetailPanelProps {
  taskId: string;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW'] as const;
const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
  NONE: '#71717a',
};

const STATUSES = ['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'] as const;
const STATUS_LABELS: Record<string, string> = {
  TODO: 'To Do',
  IN_PROGRESS: 'In Progress',
  IN_REVIEW: 'In Review',
  DONE: 'Done',
};
const STATUS_COLORS: Record<string, string> = {
  TODO: '#71717a',
  IN_PROGRESS: '#3b82f6',
  IN_REVIEW: '#f59e0b',
  DONE: '#22c55e',
};

export function TaskDetailPanel({ taskId, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [status, setStatus] = useState<string>('TODO');
  const [dueDate, setDueDate] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [activeTab, setActiveTab] = useState<'subtasks' | 'comments'>('subtasks');

  // Load full task data
  const loadTask = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.get(taskId);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description ?? '');
      setPriority(data.priority);
      setStatus(data.status ?? 'TODO');
      setDueDate(data.dueDate ? data.dueDate.slice(0, 10) : '');
    } catch {
      // Could show error toast
    } finally {
      setLoading(false);
    }
  }, [taskId]);

  useEffect(() => {
    loadTask();
  }, [loadTask]);

  // Save field updates
  const saveField = async (field: string, value: string) => {
    if (!task) return;
    setSaving(true);
    try {
      const updated = await tasksApi.update(task.id, { [field]: value || null });
      setTask(updated);
      onUpdate(updated);
    } catch {
      // Revert on error
    } finally {
      setSaving(false);
    }
  };

  // Subtask handlers
  const handleAddSubtask = async () => {
    if (!task || !newSubtask.trim()) return;
    try {
      const subtask = await tasksApi.addSubtask(task.id, newSubtask.trim());
      setTask({
        ...task,
        subtasks: [...(task.subtasks ?? []), subtask],
      });
      setNewSubtask('');
    } catch {
      // Silent
    }
  };

  const handleToggleSubtask = async (subtaskId: string) => {
    if (!task) return;
    try {
      const updated = await tasksApi.toggleSubtask(task.id, subtaskId);
      setTask({
        ...task,
        subtasks: (task.subtasks ?? []).map((s: Subtask) => (s.id === subtaskId ? updated : s)),
      });
    } catch {
      // Silent
    }
  };

  const handleDeleteSubtask = async (subtaskId: string) => {
    if (!task) return;
    try {
      await tasksApi.deleteSubtask(task.id, subtaskId);
      setTask({
        ...task,
        subtasks: (task.subtasks ?? []).filter((s: Subtask) => s.id !== subtaskId),
      });
    } catch {
      // Silent
    }
  };

  // Comment handler
  const handleAddComment = async () => {
    if (!task || !newComment.trim()) return;
    try {
      const comment = await tasksApi.addComment(task.id, newComment.trim());
      setTask({
        ...task,
        comments: [...(task.comments ?? []), comment],
      });
      setNewComment('');
    } catch {
      // Silent
    }
  };

  // Delete handler
  const handleDelete = async () => {
    if (!task) return;
    try {
      await tasksApi.delete(task.id);
      onDelete(task.id);
      onClose();
    } catch {
      // Silent
    }
  };

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: globalThis.KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (confirmDelete) {
          setConfirmDelete(false);
        } else {
          onClose();
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, confirmDelete]);

  if (loading) {
    return (
      <div className="detail-panel-overlay" onClick={onClose}>
        <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
          <div className="detail-loading">
            <div className="loading-spinner" />
            <span>Loading task…</span>
          </div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const subtasks = task.subtasks ?? [];
  const comments = task.comments ?? [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const subtaskProgress =
    subtasks.length > 0 ? Math.round((completedSubtasks / subtasks.length) * 100) : 0;

  // Due date urgency
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && status !== 'DONE';

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-header">
          <div className="detail-header-left">
            <span className="detail-task-id">#{task.id.slice(-6)}</span>
            <div
              className="detail-status-badge"
              style={{
                backgroundColor: STATUS_COLORS[status] + '22',
                color: STATUS_COLORS[status],
              }}
            >
              {STATUS_LABELS[status] ?? status}
            </div>
          </div>
          <div className="detail-header-actions">
            {saving && <span className="saving-indicator">Saving…</span>}
            <button
              className="icon-btn delete-btn"
              onClick={() => setConfirmDelete(true)}
              title="Delete task"
            >
              <Trash2 size={16} />
            </button>
            <button className="icon-btn close-btn" onClick={onClose} title="Close (Esc)">
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Delete confirmation */}
        {confirmDelete && (
          <div className="confirm-delete-bar">
            <AlertTriangle size={16} />
            <span>Delete this task permanently?</span>
            <button className="btn btn-danger btn-sm" onClick={handleDelete}>
              Delete
            </button>
            <button className="btn btn-ghost btn-sm" onClick={() => setConfirmDelete(false)}>
              Cancel
            </button>
          </div>
        )}

        <div className="detail-body">
          {/* Title */}
          <input
            className="detail-title-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onBlur={() => {
              if (title !== task.title) saveField('title', title);
            }}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.currentTarget.blur();
              }
            }}
            placeholder="Task title…"
          />

          {/* Description */}
          <textarea
            className="detail-description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            onBlur={() => {
              if (description !== (task.description ?? '')) {
                saveField('description', description);
              }
            }}
            placeholder="Add a description…"
            rows={4}
          />

          {/* Meta fields — 2x2 grid */}
          <div className="detail-meta-grid">
            {/* Status */}
            <div className="meta-field">
              <label>
                <Activity size={14} style={{ color: STATUS_COLORS[status] }} />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => {
                  setStatus(e.target.value);
                  saveField('status', e.target.value);
                }}
                className="meta-select"
              >
                {STATUSES.map((s) => (
                  <option key={s} value={s}>
                    {STATUS_LABELS[s]}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div className="meta-field">
              <label>
                <Flag size={14} style={{ color: PRIORITY_COLORS[priority] }} />
                Priority
              </label>
              <select
                value={priority}
                onChange={(e) => {
                  setPriority(e.target.value);
                  saveField('priority', e.target.value);
                }}
                className="meta-select"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p.charAt(0) + p.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>

            {/* Due date */}
            <div className="meta-field">
              <label className={isOverdue ? 'overdue-label' : ''}>
                <Calendar size={14} />
                Due Date
                {isOverdue && <span className="overdue-badge">OVERDUE</span>}
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  saveField('dueDate', e.target.value);
                }}
                className={`meta-date-input ${isOverdue ? 'overdue' : ''}`}
              />
            </div>

            {/* Assignee */}
            <div className="meta-field">
              <label>
                <User size={14} />
                Assignee
              </label>
              <span className="meta-value">{task.assignee?.displayName ?? 'Unassigned'}</span>
            </div>
          </div>

          {/* Created/Updated metadata */}
          <div className="detail-metadata">
            <div className="metadata-item">
              <Clock size={12} />
              <span>
                Created {new Date(task.createdAt).toLocaleDateString()}{' '}
                {new Date(task.createdAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
            <div className="metadata-item">
              <Clock size={12} />
              <span>
                Updated {new Date(task.updatedAt).toLocaleDateString()}{' '}
                {new Date(task.updatedAt).toLocaleTimeString([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          </div>

          {/* ── Tab bar ── */}
          <div className="detail-tabs">
            <button
              className={`tab-btn ${activeTab === 'subtasks' ? 'active' : ''}`}
              onClick={() => setActiveTab('subtasks')}
            >
              <CheckSquare size={14} />
              Subtasks
              {subtasks.length > 0 && (
                <span className="tab-badge">
                  {completedSubtasks}/{subtasks.length}
                </span>
              )}
            </button>
            <button
              className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
              onClick={() => setActiveTab('comments')}
            >
              <MessageSquare size={14} />
              Comments
              {comments.length > 0 && <span className="tab-badge">{comments.length}</span>}
            </button>
          </div>

          {/* ── Subtasks Tab ── */}
          {activeTab === 'subtasks' && (
            <section className="detail-section">
              {/* Progress bar */}
              {subtasks.length > 0 && (
                <div className="subtask-progress-section">
                  <div className="subtask-progress-header">
                    <span className="progress-label">Progress</span>
                    <span className="progress-value">{subtaskProgress}%</span>
                  </div>
                  <div className="subtask-progress-bar">
                    <div
                      className={`subtask-progress-fill ${subtaskProgress === 100 ? 'complete' : ''}`}
                      style={{ width: `${subtaskProgress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="subtask-list">
                {subtasks.map((subtask) => (
                  <div
                    key={subtask.id}
                    className={`subtask-item ${subtask.completed ? 'is-completed' : ''}`}
                  >
                    <label className="subtask-check-label">
                      <input
                        type="checkbox"
                        checked={subtask.completed}
                        onChange={() => handleToggleSubtask(subtask.id)}
                      />
                      <span className={subtask.completed ? 'completed' : ''}>{subtask.title}</span>
                    </label>
                    <button
                      className="icon-btn subtask-delete-btn"
                      onClick={() => handleDeleteSubtask(subtask.id)}
                      title="Delete subtask"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                ))}
              </div>

              <div className="add-subtask-row">
                <input
                  placeholder="Add a subtask…"
                  value={newSubtask}
                  onChange={(e) => setNewSubtask(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleAddSubtask();
                  }}
                  className="add-subtask-input"
                />
                <button
                  className="icon-btn add-btn"
                  onClick={handleAddSubtask}
                  disabled={!newSubtask.trim()}
                >
                  <Plus size={16} />
                </button>
              </div>
            </section>
          )}

          {/* ── Comments Tab ── */}
          {activeTab === 'comments' && (
            <section className="detail-section">
              <div className="comments-list">
                {comments.length === 0 && (
                  <div className="empty-section">
                    <MessageSquare size={20} />
                    <span>No comments yet</span>
                  </div>
                )}
                {comments.map((comment) => (
                  <div key={comment.id} className="comment-item">
                    <div className="comment-header">
                      <div className="comment-avatar">
                        {comment.author?.displayName?.charAt(0).toUpperCase() ?? '?'}
                      </div>
                      <div className="comment-meta">
                        <span className="comment-author">
                          {comment.author?.displayName ?? 'Unknown'}
                        </span>
                        <span className="comment-time">
                          {new Date(comment.createdAt).toLocaleDateString()}{' '}
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                    </div>
                    <p className="comment-content">{comment.content}</p>
                  </div>
                ))}
              </div>

              <div className="add-comment-row">
                <textarea
                  placeholder="Write a comment…"
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={2}
                  className="add-comment-input"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                      handleAddComment();
                    }
                  }}
                />
                <button
                  className="send-btn"
                  onClick={handleAddComment}
                  disabled={!newComment.trim()}
                  title="Send (Ctrl+Enter)"
                >
                  <Send size={16} />
                </button>
              </div>
            </section>
          )}

          {/* ── Labels Section ── */}
          {(task.labels ?? []).length > 0 && (
            <section className="detail-section labels-section">
              <h3 className="detail-section-title">
                <Tag size={14} />
                Labels
              </h3>
              <div className="labels-list">
                {(task.labels ?? []).map((tl) => (
                  <span
                    key={tl.label?.id ?? tl.id}
                    className="label-chip-large"
                    style={{ backgroundColor: tl.label?.color ?? '#6366f1' }}
                  >
                    {tl.label?.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
}
