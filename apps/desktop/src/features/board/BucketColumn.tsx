// ============================================
// BucketColumn — Droppable bucket column
// ============================================
import { useState } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Plus } from 'lucide-react';
import { TaskCard } from './TaskCard';
import { useBoardStore } from '../../stores/board-store';
import type { Bucket, Task } from '../../api';

interface BucketColumnProps {
  bucket: Bucket;
  tasks: Task[];
  onTaskClick?: (taskId: string) => void;
}

export function BucketColumn({ bucket, tasks, onTaskClick }: BucketColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: bucket.id });
  const addTask = useBoardStore((s) => s.addTask);
  const [isAdding, setIsAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const handleAddTask = async () => {
    if (!newTitle.trim()) return;
    await addTask(bucket.id, newTitle.trim());
    setNewTitle('');
    setIsAdding(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') handleAddTask();
    if (e.key === 'Escape') {
      setIsAdding(false);
      setNewTitle('');
    }
  };

  return (
    <div ref={setNodeRef} className={`bucket-column ${isOver ? 'bucket-over' : ''}`}>
      <div className="bucket-header">
        <h3 className="bucket-title">{bucket.name}</h3>
        <span className="bucket-count">{tasks.length}</span>
      </div>

      <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
        <div className="bucket-tasks">
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onClick={() => onTaskClick?.(task.id)} />
          ))}
        </div>
      </SortableContext>

      {/* Add task inline */}
      {isAdding ? (
        <div className="add-task-form">
          <input
            autoFocus
            type="text"
            placeholder="Task title…"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            className="add-task-input"
          />
          <div className="add-task-actions">
            <button className="btn-add" onClick={handleAddTask}>
              Add
            </button>
            <button
              className="btn-cancel"
              onClick={() => {
                setIsAdding(false);
                setNewTitle('');
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <button className="add-task-btn" onClick={() => setIsAdding(true)}>
          <Plus size={16} />
          Add task
        </button>
      )}
    </div>
  );
}
