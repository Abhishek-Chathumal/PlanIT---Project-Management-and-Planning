import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  GripVertical,
  Calendar,
  User as UserIcon,
  CheckSquare,
  MessageSquare,
  Tag,
} from 'lucide-react';
import type { Task } from '../../api';
import './TaskCard.css';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
}

export function TaskCard({ task, onClick }: TaskCardProps) {
  const { setNodeRef, attributes, listeners, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: {
      type: 'Task',
      task,
    },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  if (isDragging) {
    return <div ref={setNodeRef} style={style} className="task-card is-dragging" />;
  }

  const priorityClass = task.priority
    ? `priority-${task.priority.toLowerCase()}`
    : 'priority-medium';

  // Subtask progress
  const subtasks = task.subtasks ?? [];
  const subtaskCount = task._count?.subtasks ?? subtasks.length;
  const completedSubtasks = subtasks.filter((s) => s.completed).length;
  const hasSubtasks = subtaskCount > 0;
  const subtaskProgress =
    hasSubtasks && subtasks.length > 0
      ? Math.round((completedSubtasks / subtasks.length) * 100)
      : 0;

  // Comment count
  const commentCount = task._count?.comments ?? task.comments?.length ?? 0;

  // Labels
  const labels = task.labels ?? [];

  // Due date urgency
  const isOverdue = task.dueDate && new Date(task.dueDate) < new Date() && task.status !== 'DONE';

  return (
    <div ref={setNodeRef} style={style} className={`task-card ${priorityClass}`} onClick={onClick}>
      <div className="task-header">
        <div className="drag-handle" {...attributes} {...listeners}>
          <GripVertical size={14} />
        </div>
        {task.priority && task.priority !== 'NONE' && (
          <span className={`task-badge badge-${task.priority.toLowerCase()}`}>{task.priority}</span>
        )}
      </div>

      {/* Label chips */}
      {labels.length > 0 && (
        <div className="task-labels">
          {labels.slice(0, 3).map((tl) => (
            <span
              key={tl.label?.id ?? tl.id}
              className="label-chip"
              style={{ backgroundColor: tl.label?.color ?? '#6366f1' }}
            >
              {tl.label?.name}
            </span>
          ))}
          {labels.length > 3 && <span className="label-chip label-more">+{labels.length - 3}</span>}
        </div>
      )}

      <div className="task-content">
        <h4 className="task-title">{task.title}</h4>

        {task.description && (
          <p className="task-description-preview">
            {task.description.length > 60
              ? task.description.substring(0, 60) + '...'
              : task.description}
          </p>
        )}

        {/* Subtask progress bar */}
        {hasSubtasks && subtasks.length > 0 && (
          <div className="task-subtask-progress">
            <div className="subtask-bar-track">
              <div className="subtask-bar-fill" style={{ width: `${subtaskProgress}%` }} />
            </div>
          </div>
        )}

        <div className="task-meta">
          {task.dueDate && (
            <div className={`meta-item due-date ${isOverdue ? 'overdue' : ''}`}>
              <Calendar size={12} />
              <span>{new Date(task.dueDate).toLocaleDateString()}</span>
            </div>
          )}

          {/* Subtask count badge */}
          {hasSubtasks && (
            <div className="meta-item subtask-count">
              <CheckSquare size={12} />
              <span>
                {completedSubtasks}/{subtaskCount}
              </span>
            </div>
          )}

          {/* Comment count badge */}
          {commentCount > 0 && (
            <div className="meta-item comment-count">
              <MessageSquare size={12} />
              <span>{commentCount}</span>
            </div>
          )}

          {/* Label count (if no chips shown) */}
          {labels.length === 0 && (task._count as Record<string, number>)?.labels ? (
            <div className="meta-item label-count">
              <Tag size={12} />
              <span>{(task._count as Record<string, number>).labels}</span>
            </div>
          ) : null}

          <div className="task-footer">
            <div className="task-id">#{task.id.slice(-4)}</div>
            {task.assignee ? (
              <div className="assignee-avatar" title={task.assignee.displayName || 'Assignee'}>
                {task.assignee.displayName
                  ? task.assignee.displayName.charAt(0).toUpperCase()
                  : '?'}
              </div>
            ) : (
              <div className="assignee-placeholder">
                <UserIcon size={12} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
