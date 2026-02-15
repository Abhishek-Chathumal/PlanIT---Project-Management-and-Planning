/* eslint-disable no-undef */
import { create } from 'zustand';
import { projectsApi, tasksApi } from '../api';
import type { Board, Bucket, Task } from '../api';

interface CreateTaskDto {
  title: string;
  bucketId: string;
  description?: string;
  priority?: Task['priority'];
  assigneeId?: string;
  dueDate?: string;
}

interface UpdateTaskDto {
  title?: string;
  description?: string;
  priority?: Task['priority'];
  status?: string;
  dueDate?: string;
  assigneeId?: string;
  bucketId?: string;
  position?: number;
}

interface BoardState {
  currentBoard: Board | null;
  currentProjectId: string | null;
  buckets: Bucket[];
  tasksByBucket: Record<string, Task[]>;
  isLoading: boolean;
  error: string | null;

  fetchBoard: (projectId: string) => Promise<void>;
  createBucket: (name: string) => Promise<void>;
  deleteBucket: (bucketId: string) => Promise<void>;
  createTask: (bucketId: string, data: Omit<CreateTaskDto, 'bucketId'>) => Promise<void>;
  updateTask: (taskId: string, data: UpdateTaskDto) => Promise<void>;
  moveTask: (
    taskId: string,
    sourceBucketId: string,
    destBucketId: string,
    newIndex: number,
  ) => Promise<void>;
  deleteTask: (taskId: string, bucketId: string) => Promise<void>;
}

export const useBoardStore = create<BoardState>((set, get) => ({
  currentBoard: null,
  currentProjectId: null,
  buckets: [],
  tasksByBucket: {},
  isLoading: false,
  error: null,

  fetchBoard: async (projectId: string) => {
    set({ isLoading: true, error: null, currentProjectId: projectId });
    try {
      const project = await projectsApi.get(projectId);
      const board = project.boards?.[0] ?? null;

      if (!board) {
        set({ currentBoard: null, buckets: [], tasksByBucket: {}, isLoading: false });
        return;
      }

      set({ currentBoard: board, buckets: board.buckets || [] });

      // Parallel fetch tasks for each bucket
      const tasksMap: Record<string, Task[]> = {};
      await Promise.all(
        (board.buckets || []).map(async (bucket) => {
          const tasks = await tasksApi.listByBucket(bucket.id);
          tasksMap[bucket.id] = tasks;
        }),
      );

      set({ tasksByBucket: tasksMap, isLoading: false });
    } catch (error) {
      console.error('Failed to fetch board:', error);
      set({ error: 'Failed to load board', isLoading: false });
    }
  },

  createBucket: async (name: string) => {
    let { currentBoard } = get();
    const { currentProjectId, buckets } = get();

    // Auto-create a board if the project has none yet
    if (!currentBoard && currentProjectId) {
      try {
        const newBoard = await projectsApi.createBoard(currentProjectId, { name: 'Board' });
        set({ currentBoard: newBoard });
        currentBoard = newBoard;
      } catch (error) {
        console.error('Failed to auto-create board:', error);
        return;
      }
    }

    if (!currentBoard) return;

    try {
      const newBucket = await projectsApi.createBucket(currentBoard.id, { name });
      set({
        buckets: [...buckets, newBucket],
        tasksByBucket: { ...get().tasksByBucket, [newBucket.id]: [] },
      });
    } catch (error) {
      console.error('Failed to create bucket:', error);
    }
  },

  deleteBucket: async (bucketId: string) => {
    try {
      await projectsApi.deleteBucket(bucketId);
      const newBuckets = get().buckets.filter((b) => b.id !== bucketId);
      const { [bucketId]: _deleted, ...rest } = get().tasksByBucket;
      set({ buckets: newBuckets, tasksByBucket: rest });
    } catch (error) {
      console.error('Failed to delete bucket', error);
    }
  },

  createTask: async (bucketId: string, data: Omit<CreateTaskDto, 'bucketId'>) => {
    try {
      // Cast data to any because types overlap but might be slightly loose in api call
      const newTask = await tasksApi.create({ ...data, bucketId } as Parameters<
        typeof tasksApi.create
      >[0]);
      const currentTasks = get().tasksByBucket[bucketId] || [];
      set({
        tasksByBucket: {
          ...get().tasksByBucket,
          [bucketId]: [...currentTasks, newTask],
        },
      });
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  },

  updateTask: async (taskId: string, data: UpdateTaskDto) => {
    try {
      await tasksApi.update(taskId, data as Parameters<typeof tasksApi.update>[1]);
      const { tasksByBucket } = get();

      // Find bucket containing task
      let targetBucketId: string | undefined;
      for (const [bId, tasks] of Object.entries(tasksByBucket)) {
        if (tasks.find((t) => t.id === taskId)) {
          targetBucketId = bId;
          break;
        }
      }

      if (targetBucketId && tasksByBucket[targetBucketId]) {
        set({
          tasksByBucket: {
            ...tasksByBucket,
            [targetBucketId]: tasksByBucket[targetBucketId]!.map((t) =>
              t.id === taskId ? { ...t, ...data } : t,
            ),
          },
        });
      }
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  },

  moveTask: async (
    taskId: string,
    sourceBucketId: string,
    destBucketId: string,
    newIndex: number,
  ) => {
    const { tasksByBucket } = get();
    const sourceTasks = [...(tasksByBucket[sourceBucketId] || [])];

    const taskIndex = sourceTasks.findIndex((t) => t.id === taskId);
    if (taskIndex === -1) return;

    const [task] = sourceTasks.splice(taskIndex, 1);
    if (!task) return;

    task.bucketId = destBucketId;

    if (sourceBucketId === destBucketId) {
      // Same bucket: insert back into the already-spliced array
      sourceTasks.splice(newIndex, 0, task);
      set({
        tasksByBucket: {
          ...tasksByBucket,
          [sourceBucketId]: sourceTasks,
        },
      });
    } else {
      // Cross-bucket: insert into an independent copy of the destination
      const destTasks = [...(tasksByBucket[destBucketId] || [])];
      destTasks.splice(newIndex, 0, task);
      set({
        tasksByBucket: {
          ...tasksByBucket,
          [sourceBucketId]: sourceTasks,
          [destBucketId]: destTasks,
        },
      });
    }

    try {
      await tasksApi.update(taskId, { bucketId: destBucketId, position: newIndex });
    } catch (error) {
      console.error('Failed to move task', error);
      // Revert would go here
    }
  },

  deleteTask: async (taskId: string, bucketId: string) => {
    try {
      await tasksApi.delete(taskId);
      const currentBucketTasks = get().tasksByBucket[bucketId] || [];
      set({
        tasksByBucket: {
          ...get().tasksByBucket,
          [bucketId]: currentBucketTasks.filter((t) => t.id !== taskId),
        },
      });
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  },
}));
