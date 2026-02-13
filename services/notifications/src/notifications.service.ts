import { Injectable } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { NotificationType } from '@prisma/client';

@Injectable()
export class NotificationsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { type: NotificationType; title: string; message: string; userId: string }) {
    return this.prisma.notification.create({ data });
  }

  async findAllForUser(userId: string) {
    return this.prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  }

  async getUnreadCount(userId: string) {
    return this.prisma.notification.count({
      where: { userId, read: false },
    });
  }

  async markAsRead(id: string) {
    return this.prisma.notification.update({
      where: { id },
      data: { read: true },
    });
  }

  async markAllAsRead(userId: string) {
    return this.prisma.notification.updateMany({
      where: { userId, read: false },
      data: { read: true },
    });
  }

  async delete(id: string) {
    return this.prisma.notification.delete({ where: { id } });
  }

  // ---- Event-driven notification creators ----

  async onTaskAssigned(data: { taskTitle: string; assigneeId: string; assignerName: string }) {
    return this.create({
      type: 'TASK_ASSIGNED',
      title: 'New task assigned',
      message: `${data.assignerName} assigned you to "${data.taskTitle}"`,
      userId: data.assigneeId,
    });
  }

  async onTaskCompleted(data: { taskTitle: string; completedBy: string; creatorId: string }) {
    return this.create({
      type: 'TASK_COMPLETED',
      title: 'Task completed',
      message: `${data.completedBy} completed "${data.taskTitle}"`,
      userId: data.creatorId,
    });
  }

  async onCommentAdded(data: { taskTitle: string; authorName: string; taskOwnerId: string }) {
    return this.create({
      type: 'COMMENT_ADDED',
      title: 'New comment',
      message: `${data.authorName} commented on "${data.taskTitle}"`,
      userId: data.taskOwnerId,
    });
  }

  async onDueDateReminder(data: { taskTitle: string; userId: string; dueDate: string }) {
    return this.create({
      type: 'DUE_DATE_REMINDER',
      title: 'Task due soon',
      message: `"${data.taskTitle}" is due on ${data.dueDate}`,
      userId: data.userId,
    });
  }

  async onWorkspaceInvite(data: { workspaceName: string; inviterName: string; userId: string }) {
    return this.create({
      type: 'WORKSPACE_INVITE',
      title: 'Workspace invitation',
      message: `${data.inviterName} invited you to "${data.workspaceName}"`,
      userId: data.userId,
    });
  }
}
