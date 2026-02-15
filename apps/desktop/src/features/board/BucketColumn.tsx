import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { MoreHorizontal, Plus } from 'lucide-react';
import type { Bucket, Task } from '../../api';
import { TaskCard } from './TaskCard';

interface BucketColumnProps {
  bucket: Bucket;
  tasks: Task[];
  onAddTask?: (title: string) => void;
  onTaskClick?: (taskId: string) => void;
}

export function BucketColumn({ bucket, tasks, onAddTask, onTaskClick }: BucketColumnProps) {
  const [isAdding, setIsAdding] = useState(false);
  const [title, setTitle] = useState('');
  const { setNodeRef } = useDroppable({
    id: bucket.id,
    data: {
      type: 'Bucket',
      bucket,
    },
  });

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!title.trim()) return;
    onAddTask?.(title);
    setTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleSubmit();
    if (e.key === 'Escape') {
      setIsAdding(false);
      setTitle('');
    }
  };

  return (
    <div className="bucket-column">
      <div className="bucket-header">
        <h3 className="bucket-title">{bucket.name}</h3>
        <div className="bucket-actions">
          <span className="bucket-count">{tasks.length}</span>
          <button className="icon-btn-sm" aria-label="Bucket options">
            <MoreHorizontal size={14} />
          </button>
        </div>
      </div>

      <div ref={setNodeRef} className="bucket-tasks">
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task.id)} />
          ))}
        </SortableContext>
      </div>

      {isAdding ? (
        <div className="add-task-form">
          <input
            autoFocus
            className="add-task-input"
            placeholder="What needs to be done?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            onBlur={() => !title && setIsAdding(false)} // Optional: close on blur if empty
          />
          <div className="add-task-actions">
            <button className="btn btn-primary btn-sm" onClick={() => handleSubmit()}>
              Add
            </button>
            <button className="btn btn-secondary btn-sm" onClick={() => setIsAdding(false)}>
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="add-task-btn" onClick={() => setIsAdding(true)}>
          <Plus size={14} />
          Add Task
        </button>
      )}
    </div>
  );
}
