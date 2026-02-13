// ============================================
// KanbanBoard — dnd-kit powered drag-and-drop board
// ============================================
import { useState, useCallback } from 'react';
import {
  DndContext,
  DragOverlay,
  closestCorners,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragStartEvent, DragEndEvent, DragOverEvent } from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import { useBoardStore } from '../../stores/board-store';
import { BucketColumn } from './BucketColumn';
import { TaskCard } from './TaskCard';
import type { Task } from '../../api';
import './KanbanBoard.css';

export function KanbanBoard() {
  const { buckets, tasksByBucket, moveTask } = useBoardStore();
  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  // Find which bucket a task belongs to
  const findBucketForTask = useCallback(
    (taskId: string): string | null => {
      for (const [bucketId, tasks] of Object.entries(tasksByBucket)) {
        if (tasks.some((t) => t.id === taskId)) return bucketId;
      }
      return null;
    },
    [tasksByBucket],
  );

  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    const bucketId = findBucketForTask(active.id as string);
    if (bucketId) {
      const task = tasksByBucket[bucketId]?.find((t) => t.id === active.id);
      setActiveTask(task ?? null);
    }
  };

  const handleDragOver = (_event: DragOverEvent) => {
    // Visual feedback via DragOverlay — no state changes here
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const fromBucket = findBucketForTask(activeId);
    if (!fromBucket) return;

    // Determine target bucket: either the task's bucket or the bucket column itself
    let toBucket = findBucketForTask(overId);
    let newIndex = 0;

    if (toBucket) {
      // Dropped over another task — insert at that task's index
      const targetTasks = tasksByBucket[toBucket] ?? [];
      newIndex = targetTasks.findIndex((t) => t.id === overId);
      if (newIndex === -1) newIndex = targetTasks.length;
    } else {
      // Dropped over a bucket column
      toBucket = overId;
      newIndex = (tasksByBucket[toBucket] ?? []).length;
    }

    if (activeId === overId) return; // Dropped on itself

    moveTask(activeId, fromBucket, toBucket, newIndex);
  };

  if (buckets.length === 0) {
    return (
      <div className="board-empty">
        <p>No buckets in this board yet. Create one to get started!</p>
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={closestCorners}
      onDragStart={handleDragStart}
      onDragOver={handleDragOver}
      onDragEnd={handleDragEnd}
    >
      <div className="kanban-container">
        {buckets.map((bucket) => (
          <BucketColumn key={bucket.id} bucket={bucket} tasks={tasksByBucket[bucket.id] ?? []} />
        ))}
      </div>

      <DragOverlay dropAnimation={null}>
        {activeTask ? <TaskCard task={activeTask} isDragOverlay /> : null}
      </DragOverlay>
    </DndContext>
  );
}
