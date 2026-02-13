// ============================================
// Board Store — Zustand (Kanban state + dnd)
// ============================================
import { create } from 'zustand';
import { projectsApi, tasksApi } from '../api';
import type { Board, Bucket, Task } from '../api';

interface BoardState {
  boards: Board[];
  activeBoard: Board | null;
  buckets: Bucket[];
  tasksByBucket: Record<string, Task[]>;
  isLoading: boolean;

  fetchBoard: (projectId: string) => Promise<void>;
  moveTask: (
    taskId: string,
    fromBucketId: string,
    toBucketId: string,
    newIndex: number,
  ) => Promise<void>;
  addTask: (bucketId: string, title: string) => Promise<void>;
  updateTaskInStore: (task: Task) => void;
  deleteTaskFromStore: (taskId: string) => void;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  boards: [],
  activeBoard: null,
  buckets: [],
  tasksByBucket: {},
  isLoading: false,

  fetchBoard: async (projectId) => {
    set({ isLoading: true });
    try {
      const project = await projectsApi.get(projectId);
      const boards = project.boards ?? [];
      const activeBoard = boards[0] ?? null;
      const buckets = activeBoard?.buckets ?? [];

      // Fetch tasks for each bucket in parallel
      const entries = await Promise.all(
        buckets.map(async (bucket) => {
          try {
            const tasks = await tasksApi.listByBucket(bucket.id);
            return [bucket.id, tasks] as const;
          } catch {
            return [bucket.id, []] as const;
          }
        }),
      );

      set({
        boards,
        activeBoard,
        buckets,
        tasksByBucket: Object.fromEntries(entries),
        isLoading: false,
      });
    } catch {
      set({ boards: [], activeBoard: null, buckets: [], tasksByBucket: {}, isLoading: false });
    }
  },

  moveTask: async (taskId, fromBucketId, toBucketId, newIndex) => {
    const { tasksByBucket } = get();

    // Optimistic update
    const fromTasks = [...(tasksByBucket[fromBucketId] ?? [])];
    const taskIndex = fromTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const [task] = fromTasks.splice(taskIndex, 1);
    if (!task) return;

    if (fromBucketId === toBucketId) {
      // Reorder within same bucket
      fromTasks.splice(newIndex, 0, task);
      set({
        tasksByBucket: { ...tasksByBucket, [fromBucketId]: fromTasks },
      });
    } else {
      // Move to different bucket
      const movedTask: Task = { ...task, bucketId: toBucketId };
      const toTasks = [...(tasksByBucket[toBucketId] ?? [])];
      toTasks.splice(newIndex, 0, movedTask);
      set({
        tasksByBucket: {
          ...tasksByBucket,
          [fromBucketId]: fromTasks,
          [toBucketId]: toTasks,
        },
      });
    }

    // Persist to API
    try {
      await tasksApi.update(taskId, { bucketId: toBucketId });
    } catch {
      // Revert on failure — refetch the board
      const { activeBoard } = get();
      if (activeBoard) {
        // Simple refetch to restore consistent state
        const buckets = activeBoard.buckets ?? [];
        const entries = await Promise.all(
          buckets.map(async (bucket) => {
            try {
              const tasks = await tasksApi.listByBucket(bucket.id);
              return [bucket.id, tasks] as const;
            } catch {
              return [bucket.id, []] as const;
            }
          }),
        );
        set({ tasksByBucket: Object.fromEntries(entries) });
      }
    }
  },

  addTask: async (bucketId, title) => {
    try {
      const task = await tasksApi.create({ title, bucketId });
      const { tasksByBucket } = get();
      set({
        tasksByBucket: {
          ...tasksByBucket,
          [bucketId]: [...(tasksByBucket[bucketId] ?? []), task],
        },
      });
    } catch {
      // Silently fail — could show toast in future
    }
  },

  updateTaskInStore: (task) => {
    const { tasksByBucket } = get();
    const updated: Record<string, Task[]> = {};
    for (const [bucketId, tasks] of Object.entries(tasksByBucket)) {
      updated[bucketId] = tasks.map((t) => (t.id === task.id ? task : t));
    }
    set({ tasksByBucket: updated });
  },

  deleteTaskFromStore: (taskId) => {
    const { tasksByBucket } = get();
    const updated: Record<string, Task[]> = {};
    for (const [bucketId, tasks] of Object.entries(tasksByBucket)) {
      updated[bucketId] = tasks.filter((t) => t.id !== taskId);
    }
    set({ tasksByBucket: updated });
  },
}));
