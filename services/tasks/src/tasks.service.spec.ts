import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { PrismaService } from './prisma.service';

const mockTask = {
  id: 'task-1',
  title: 'Implement auth',
  description: 'Build JWT auth flow',
  priority: 'HIGH',
  status: 'TODO',
  position: 0,
  bucketId: 'bucket-1',
  assigneeId: 'user-1',
  creatorId: 'user-1',
  dueDate: null,
  assignee: { id: 'user-1', displayName: 'Test', avatarUrl: null },
  labels: [],
  subtasks: [],
  checklists: [],
  comments: [],
  _count: { subtasks: 0, comments: 0 },
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  task: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  subtask: {
    create: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
  comment: {
    create: jest.fn(),
    delete: jest.fn(),
  },
  taskLabel: {
    create: jest.fn(),
    delete: jest.fn(),
  },
};

describe('TasksService', () => {
  let service: TasksService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [TasksService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<TasksService>(TasksService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create task with auto-incrementing position', async () => {
      mockPrisma.task.aggregate.mockResolvedValue({
        _max: { position: 5 },
      });
      mockPrisma.task.create.mockResolvedValue({ ...mockTask, position: 6 });

      const result = await service.create({
        title: 'Implement auth',
        bucketId: 'bucket-1',
        creatorId: 'user-1',
      });

      expect(result.position).toBe(6);
      expect(mockPrisma.task.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 6, title: 'Implement auth' }),
        }),
      );
    });

    it('should handle first task in bucket where position is null', async () => {
      mockPrisma.task.aggregate.mockResolvedValue({
        _max: { position: null },
      });
      mockPrisma.task.create.mockResolvedValue({ ...mockTask, position: 0 });

      const result = await service.create({
        title: 'First task',
        bucketId: 'bucket-1',
        creatorId: 'user-1',
      });

      expect(result.position).toBe(0);
    });
  });

  describe('findByBucket', () => {
    it('should return tasks ordered by position', async () => {
      mockPrisma.task.findMany.mockResolvedValue([mockTask]);
      const result = await service.findByBucket('bucket-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.task.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          orderBy: { position: 'asc' },
          where: { bucketId: 'bucket-1' },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return task with all relations', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(mockTask);
      const result = await service.findOne('task-1');
      expect(result).toEqual(mockTask);
    });

    it('should throw NotFoundException for missing task', async () => {
      mockPrisma.task.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update task fields', async () => {
      mockPrisma.task.update.mockResolvedValue({
        ...mockTask,
        title: 'Updated',
      });

      const result = await service.update('task-1', { title: 'Updated' });
      expect(result.title).toBe('Updated');
    });

    it('should parse dueDate string to Date object', async () => {
      mockPrisma.task.update.mockResolvedValue(mockTask);

      await service.update('task-1', { dueDate: '2026-03-01' });

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            dueDate: expect.any(Date),
          }),
        }),
      );
    });

    it('should set dueDate to null when empty string', async () => {
      mockPrisma.task.update.mockResolvedValue(mockTask);

      await service.update('task-1', { dueDate: '' });

      expect(mockPrisma.task.update).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ dueDate: null }),
        }),
      );
    });
  });

  describe('delete', () => {
    it('should delete task', async () => {
      mockPrisma.task.delete.mockResolvedValue(mockTask);
      await service.delete('task-1');
      expect(mockPrisma.task.delete).toHaveBeenCalledWith({
        where: { id: 'task-1' },
      });
    });
  });

  describe('addSubtask', () => {
    it('should add subtask with auto-incrementing position', async () => {
      mockPrisma.subtask.aggregate.mockResolvedValue({
        _max: { position: 2 },
      });
      mockPrisma.subtask.create.mockResolvedValue({
        id: 'sub-1',
        title: 'Sub-item',
        taskId: 'task-1',
        position: 3,
        completed: false,
      });

      const result = await service.addSubtask('task-1', {
        title: 'Sub-item',
      });
      expect(result.position).toBe(3);
    });
  });

  describe('toggleSubtask', () => {
    it('should toggle subtask completion status', async () => {
      mockPrisma.subtask.findUnique.mockResolvedValue({
        id: 'sub-1',
        completed: false,
      });
      mockPrisma.subtask.update.mockResolvedValue({
        id: 'sub-1',
        completed: true,
      });

      const result = await service.toggleSubtask('sub-1');
      expect(result.completed).toBe(true);
    });

    it('should throw NotFoundException for missing subtask', async () => {
      mockPrisma.subtask.findUnique.mockResolvedValue(null);
      await expect(service.toggleSubtask('bad')).rejects.toThrow(NotFoundException);
    });
  });

  describe('addComment', () => {
    it('should create comment with author', async () => {
      mockPrisma.comment.create.mockResolvedValue({
        id: 'comment-1',
        content: 'Looks good!',
        taskId: 'task-1',
        authorId: 'user-1',
        author: { id: 'user-1', displayName: 'Test', avatarUrl: null },
      });

      const result = await service.addComment('task-1', 'user-1', 'Looks good!');
      expect(result.content).toBe('Looks good!');
    });
  });

  describe('attachLabel / detachLabel', () => {
    it('should attach label to task', async () => {
      mockPrisma.taskLabel.create.mockResolvedValue({
        taskId: 'task-1',
        labelId: 'label-1',
      });

      await service.attachLabel('task-1', 'label-1');
      expect(mockPrisma.taskLabel.create).toHaveBeenCalledWith({
        data: { taskId: 'task-1', labelId: 'label-1' },
      });
    });

    it('should detach label from task', async () => {
      mockPrisma.taskLabel.delete.mockResolvedValue({});

      await service.detachLabel('task-1', 'label-1');
      expect(mockPrisma.taskLabel.delete).toHaveBeenCalledWith({
        where: { taskId_labelId: { taskId: 'task-1', labelId: 'label-1' } },
      });
    });
  });
});
