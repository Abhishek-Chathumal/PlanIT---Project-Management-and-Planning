import { Test } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { PrismaService } from './prisma.service';

const mockNotification = {
  id: 'notif-1',
  type: 'TASK_ASSIGNED',
  title: 'New task assigned',
  message: 'John assigned you to "Build API"',
  read: false,
  userId: 'user-1',
  createdAt: new Date(),
};

const mockPrisma = {
  notification: {
    create: jest.fn(),
    findMany: jest.fn(),
    count: jest.fn(),
    update: jest.fn(),
    updateMany: jest.fn(),
    delete: jest.fn(),
  },
};

describe('NotificationsService', () => {
  let service: NotificationsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [NotificationsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a notification', async () => {
      mockPrisma.notification.create.mockResolvedValue(mockNotification);

      const result = await service.create({
        type: 'TASK_ASSIGNED',
        title: 'New task',
        message: 'You have a new task',
        userId: 'user-1',
      });

      expect(result).toEqual(mockNotification);
    });
  });

  describe('findAllForUser', () => {
    it('should return last 50 notifications ordered by date desc', async () => {
      mockPrisma.notification.findMany.mockResolvedValue([mockNotification]);
      const result = await service.findAllForUser('user-1');
      expect(result).toHaveLength(1);
      expect(mockPrisma.notification.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { userId: 'user-1' },
          orderBy: { createdAt: 'desc' },
          take: 50,
        }),
      );
    });
  });

  describe('getUnreadCount', () => {
    it('should return count of unread notifications', async () => {
      mockPrisma.notification.count.mockResolvedValue(5);
      const result = await service.getUnreadCount('user-1');
      expect(result).toBe(5);
    });
  });

  describe('markAsRead', () => {
    it('should set read to true', async () => {
      mockPrisma.notification.update.mockResolvedValue({
        ...mockNotification,
        read: true,
      });

      const result = await service.markAsRead('notif-1');
      expect(result.read).toBe(true);
    });
  });

  describe('markAllAsRead', () => {
    it('should update all unread notifications for user', async () => {
      mockPrisma.notification.updateMany.mockResolvedValue({ count: 3 });
      const result = await service.markAllAsRead('user-1');
      expect(result.count).toBe(3);
    });
  });

  describe('delete', () => {
    it('should delete notification', async () => {
      mockPrisma.notification.delete.mockResolvedValue(mockNotification);
      await service.delete('notif-1');
      expect(mockPrisma.notification.delete).toHaveBeenCalledWith({
        where: { id: 'notif-1' },
      });
    });
  });

  // ---- Event-driven creators ----

  describe('onTaskAssigned', () => {
    it('should create task assigned notification', async () => {
      mockPrisma.notification.create.mockResolvedValue(mockNotification);

      await service.onTaskAssigned({
        taskTitle: 'Build API',
        assigneeId: 'user-2',
        assignerName: 'John',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          type: 'TASK_ASSIGNED',
          userId: 'user-2',
        }),
      });
    });
  });

  describe('onTaskCompleted', () => {
    it('should create task completed notification', async () => {
      mockPrisma.notification.create.mockResolvedValue(mockNotification);

      await service.onTaskCompleted({
        taskTitle: 'Fix bug',
        completedBy: 'Jane',
        creatorId: 'user-1',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ type: 'TASK_COMPLETED' }),
      });
    });
  });

  describe('onWorkspaceInvite', () => {
    it('should create workspace invite notification', async () => {
      mockPrisma.notification.create.mockResolvedValue(mockNotification);

      await service.onWorkspaceInvite({
        workspaceName: 'Dev Team',
        inviterName: 'Admin',
        userId: 'user-3',
      });

      expect(mockPrisma.notification.create).toHaveBeenCalledWith({
        data: expect.objectContaining({ type: 'WORKSPACE_INVITE' }),
      });
    });
  });
});
