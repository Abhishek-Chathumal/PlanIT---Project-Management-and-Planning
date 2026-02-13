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
} from 'lucide-react';
import { tasksApi } from '../../api';
import type { Task } from '../../api';
import './TaskDetailPanel.css';

interface TaskDetailPanelProps {
  taskId: string;
  onClose: () => void;
  onUpdate: (task: Task) => void;
  onDelete: (taskId: string) => void;
}

const PRIORITIES = ['URGENT', 'HIGH', 'MEDIUM', 'LOW', 'NONE'] as const;
const PRIORITY_COLORS: Record<string, string> = {
  URGENT: '#ef4444',
  HIGH: '#f97316',
  MEDIUM: '#eab308',
  LOW: '#22c55e',
  NONE: '#71717a',
};

export function TaskDetailPanel({ taskId, onClose, onUpdate, onDelete }: TaskDetailPanelProps) {
  const [task, setTask] = useState<Task | null>(null);
  const [loading, setLoading] = useState(true);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<string>('MEDIUM');
  const [dueDate, setDueDate] = useState('');
  const [newSubtask, setNewSubtask] = useState('');
  const [newComment, setNewComment] = useState('');
  const [saving, setSaving] = useState(false);

  // Load full task data
  const loadTask = useCallback(async () => {
    setLoading(true);
    try {
      const data = await tasksApi.get(taskId);
      setTask(data);
      setTitle(data.title);
      setDescription(data.description ?? '');
      setPriority(data.priority);
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

  // Save field updates with debounced auto-save
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
        subtasks: (task.subtasks ?? []).map((s) => (s.id === subtaskId ? updated : s)),
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
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (loading) {
    return (
      <div className="detail-panel-overlay" onClick={onClose}>
        <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
          <div className="detail-loading">Loading…</div>
        </div>
      </div>
    );
  }

  if (!task) return null;

  const subtasks = task.subtasks ?? [];
  const comments = task.comments ?? [];
  const completedSubtasks = subtasks.filter((s) => s.completed).length;

  return (
    <div className="detail-panel-overlay" onClick={onClose}>
      <div className="detail-panel" onClick={(e) => e.stopPropagation()}>
        {/* Header */}
        <div className="detail-header">
          <h2 className="detail-panel-title">Task Details</h2>
          <div className="detail-header-actions">
            {saving && <span className="saving-indicator">Saving…</span>}
            <button className="icon-btn delete-btn" onClick={handleDelete} title="Delete task">
              <Trash2 size={16} />
            </button>
            <button className="icon-btn close-btn" onClick={onClose} title="Close">
              <X size={18} />
            </button>
          </div>
        </div>

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

          {/* Meta fields */}
          <div className="detail-meta-grid">
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
              <label>
                <Calendar size={14} />
                Due Date
              </label>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => {
                  setDueDate(e.target.value);
                  saveField('dueDate', e.target.value);
                }}
                className="meta-date-input"
              />
            </div>

            {/* Assignee (read-only for now) */}
            <div className="meta-field">
              <label>
                <User size={14} />
                Assignee
              </label>
              <span className="meta-value">{task.assignee?.displayName ?? 'Unassigned'}</span>
            </div>
          </div>

          {/* ── Subtasks ── */}
          <section className="detail-section">
            <h3 className="detail-section-title">
              <CheckSquare size={16} />
              Subtasks
              {subtasks.length > 0 && (
                <span className="subtask-progress">
                  {completedSubtasks}/{subtasks.length}
                </span>
              )}
            </h3>

            {/* Progress bar */}
            {subtasks.length > 0 && (
              <div className="subtask-progress-bar">
                <div
                  className="subtask-progress-fill"
                  style={{
                    width: `${(completedSubtasks / subtasks.length) * 100}%`,
                  }}
                />
              </div>
            )}

            <div className="subtask-list">
              {subtasks.map((subtask) => (
                <label key={subtask.id} className="subtask-item">
                  <input
                    type="checkbox"
                    checked={subtask.completed}
                    onChange={() => handleToggleSubtask(subtask.id)}
                  />
                  <span className={subtask.completed ? 'completed' : ''}>{subtask.title}</span>
                </label>
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
              <button className="icon-btn" onClick={handleAddSubtask} disabled={!newSubtask.trim()}>
                <Plus size={16} />
              </button>
            </div>
          </section>

          {/* ── Comments ── */}
          <section className="detail-section">
            <h3 className="detail-section-title">
              <MessageSquare size={16} />
              Comments
              {comments.length > 0 && <span className="comment-count">{comments.length}</span>}
            </h3>

            <div className="comments-list">
              {comments.map((comment) => (
                <div key={comment.id} className="comment-item">
                  <div className="comment-header">
                    <div className="comment-avatar">
                      {comment.author?.displayName?.charAt(0).toUpperCase() ?? '?'}
                    </div>
                    <span className="comment-author">
                      {comment.author?.displayName ?? 'Unknown'}
                    </span>
                    <span className="comment-time">
                      {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
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
        </div>
      </div>
    </div>
  );
}
