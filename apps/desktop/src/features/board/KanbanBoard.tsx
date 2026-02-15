import { useState } from 'react';
import {
  DndContext,
  closestCorners,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  KeyboardSensor,
  defaultDropAnimationSideEffects,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DropAnimation } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { KanbanSquare, Plus } from 'lucide-react';
import type { Bucket, Task } from '../../api';
import { BucketColumn } from './BucketColumn';
import { TaskCard } from './TaskCard';
import { TaskDetailPanel } from './TaskDetailPanel';
import { useBoardStore } from '../../stores/board-store';

interface KanbanBoardProps {
  buckets: Bucket[];
  tasksByBucket: Record<string, Task[]>;
}

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: '0.5',
      },
    },
  }),
};

export function KanbanBoard({ buckets, tasksByBucket }: KanbanBoardProps) {
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const moveTask = useBoardStore((state) => state.moveTask);
  const createTask = useBoardStore((state) => state.createTask);
  const { createBucket, updateTask, deleteTask } = useBoardStore();
  const [isCreatingBucket, setIsCreatingBucket] = useState(false);
  const [newBucketName, setNewBucketName] = useState('');

  const handleCreateBucket = () => {
    if (!newBucketName.trim()) return;
    createBucket(newBucketName);
    setNewBucketName('');
    setIsCreatingBucket(false);
  };

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5, // Require slight movement to start drag
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    if (active.data.current?.type === 'Task') {
      setActiveTask(active.data.current.task as Task);
    }
  };

  const handleDragOver = () => {
    // Optional: Helper for visual feedback during check if needed
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeData = active.data.current;

    // Check if we dropped over a bucket or a task
    let destBucketId = '';
    let newIndex = 0;

    if (over.data.current?.type === 'Bucket') {
      // Dropped directly on a bucket (container)
      destBucketId = overId;
      const tasksInDest = tasksByBucket[destBucketId] || [];
      newIndex = tasksInDest.length;
    } else if (over.data.current?.type === 'Task') {
      const overTask = over.data.current.task as Task;
      destBucketId = overTask.bucketId;

      // Calculate index
      const tasksInDest = tasksByBucket[destBucketId] || [];
      const overIndex = tasksInDest.findIndex((t) => t.id === overId);

      newIndex = overIndex >= 0 ? overIndex : 0;

      if (activeData?.task.bucketId === destBucketId) {
        const activeIndex = tasksInDest.findIndex((t) => t.id === activeId);
        if (activeIndex < newIndex) {
          // newIndex--;
        }
      }
    }

    if (destBucketId && activeData?.task) {
      const sourceBucketId = activeData.task.bucketId;
      moveTask(activeId, sourceBucketId, destBucketId, newIndex);
    }
  };

  // Find which bucket a task belongs to (for delete handler)
  const findBucketForTask = (taskId: string): string | undefined => {
    for (const [bucketId, tasks] of Object.entries(tasksByBucket)) {
      if (tasks.find((t) => t.id === taskId)) return bucketId;
    }
    return undefined;
  };

  const handleTaskUpdate = (updatedTask: Task) => {
    // Refresh the task in the board store — pick only UpdateTaskDto fields
    const bucketId = findBucketForTask(updatedTask.id);
    if (bucketId) {
      updateTask(updatedTask.id, {
        title: updatedTask.title,
        description: updatedTask.description ?? undefined,
        priority: updatedTask.priority,
        status: updatedTask.status,
        dueDate: updatedTask.dueDate ?? undefined,
        assigneeId: updatedTask.assigneeId ?? undefined,
        bucketId: updatedTask.bucketId,
      });
    }
  };

  const handleTaskDelete = (taskId: string) => {
    const bucketId = findBucketForTask(taskId);
    if (bucketId) {
      deleteTask(taskId, bucketId);
    }
    setSelectedTaskId(null);
  };

  return (
    <>
      <DndContext
        sensors={sensors}
        collisionDetection={closestCorners}
        onDragStart={handleDragStart}
        onDragOver={handleDragOver}
        onDragEnd={handleDragEnd}
      >
        <div className="board">
          {buckets.length === 0 ? (
            <div className="board-empty-state">
              <div className="empty-content">
                <div className="empty-icon">
                  <KanbanSquare size={48} />
                </div>
                <h3>Start your board</h3>
                <p>Create your first column to organize tasks.</p>
                <button className="btn btn-primary" onClick={() => createBucket('To Do')}>
                  Create "To Do" Column
                </button>
              </div>
            </div>
          ) : (
            <>
              {buckets.map((bucket) => (
                <BucketColumn
                  key={bucket.id}
                  bucket={bucket}
                  tasks={tasksByBucket[bucket.id] || []}
                  onAddTask={(title) => {
                    createTask(bucket.id, { title, priority: 'MEDIUM' });
                  }}
                  onTaskClick={(taskId) => setSelectedTaskId(taskId)}
                />
              ))}

              {/* Add Bucket Column */}
              <div className="add-bucket-column">
                {isCreatingBucket ? (
                  <div className="add-bucket-form card">
                    <input
                      autoFocus
                      className="form-input"
                      placeholder="Column name"
                      value={newBucketName}
                      onChange={(e) => setNewBucketName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleCreateBucket();
                        if (e.key === 'Escape') setIsCreatingBucket(false);
                      }}
                      onBlur={() => !newBucketName && setIsCreatingBucket(false)}
                    />
                    <div className="add-task-actions" style={{ marginTop: 8 }}>
                      <button className="btn btn-primary btn-sm" onClick={handleCreateBucket}>
                        Add
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setIsCreatingBucket(false)}
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  <button className="btn-add-bucket" onClick={() => setIsCreatingBucket(true)}>
                    <Plus size={16} />
                    <span>Add Column</span>
                  </button>
                )}
              </div>
            </>
          )}
        </div>

        <DragOverlay dropAnimation={dropAnimation}>
          {activeTask ? <TaskCard task={activeTask} /> : null}
        </DragOverlay>
      </DndContext>

      {/* Task Detail Panel */}
      {selectedTaskId && (
        <TaskDetailPanel
          taskId={selectedTaskId}
          onClose={() => setSelectedTaskId(null)}
          onUpdate={handleTaskUpdate}
          onDelete={handleTaskDelete}
        />
      )}
    </>
  );
}
