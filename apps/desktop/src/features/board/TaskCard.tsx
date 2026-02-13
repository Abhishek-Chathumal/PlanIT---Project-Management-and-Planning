// ============================================
// TaskCard — Draggable task card
// ============================================
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { GripVertical, CheckSquare, MessageSquare, Calendar } from 'lucide-react';
import type { Task } from '../../api';

interface TaskCardProps {
  task: Task;
  isDragOverlay?: boolean;
  onClick?: () => void;
}

const PRIORITY_LABELS: Record<string, string> = {
  URGENT: 'Urgent',
  HIGH: 'High',
  MEDIUM: 'Medium',
  LOW: 'Low',
};

export function TaskCard({ task, isDragOverlay, onClick }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  const priority = (task.priority ?? 'MEDIUM').toUpperCase();
  const subtaskCount = task._count?.subtasks ?? 0;
  const commentCount = task._count?.comments ?? 0;

  const handleClick = (e: React.MouseEvent) => {
    // Only open detail if not dragging and not clicking the drag handle
    if (!isDragging && onClick) {
      const target = e.target as HTMLElement;
      if (!target.closest('.drag-handle')) {
        onClick();
      }
    }
  };

  return (
    <div
      ref={!isDragOverlay ? setNodeRef : undefined}
      style={!isDragOverlay ? style : undefined}
      className={`task-card ${isDragOverlay ? 'task-card-overlay' : ''} ${isDragging ? 'task-card-dragging' : ''}`}
      onClick={!isDragOverlay ? handleClick : undefined}
    >
      {/* Drag handle */}
      <div className="drag-handle" {...(!isDragOverlay ? { ...attributes, ...listeners } : {})}>
        <GripVertical size={14} />
      </div>

      {/* Card body */}
      <div className="task-card-body">
        <span className={`priority-badge priority-${priority.toLowerCase()}`}>
          {PRIORITY_LABELS[priority] ?? 'Medium'}
        </span>
        <p className="task-card-title">{task.title}</p>

        <div className="task-card-meta">
          {task.dueDate && (
            <span className="meta-item">
              <Calendar size={12} />
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
          {subtaskCount > 0 && (
            <span className="meta-item">
              <CheckSquare size={12} />
              {subtaskCount}
            </span>
          )}
          {commentCount > 0 && (
            <span className="meta-item">
              <MessageSquare size={12} />
              {commentCount}
            </span>
          )}
        </div>

        {task.assignee && (
          <div className="task-card-assignee">
            <div className="assignee-avatar">
              {task.assignee.displayName?.charAt(0).toUpperCase() ?? '?'}
            </div>
            <span>{task.assignee.displayName}</span>
          </div>
        )}
      </div>
    </div>
  );
}
