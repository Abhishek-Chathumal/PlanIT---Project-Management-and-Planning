import { Controller } from '@nestjs/common';
import { MessagePattern, EventPattern, Payload } from '@nestjs/microservices';
import { NotificationsService } from './notifications.service';

@Controller()
export class NotificationsController {
  constructor(private readonly notificationsService: NotificationsService) {}

  // ---- CRUD via request-reply ----

  @MessagePattern('notifications.findAll')
  async findAll(@Payload() data: { userId: string }) {
    return this.notificationsService.findAllForUser(data.userId);
  }

  @MessagePattern('notifications.unreadCount')
  async unreadCount(@Payload() data: { userId: string }) {
    return this.notificationsService.getUnreadCount(data.userId);
  }

  @MessagePattern('notifications.markRead')
  async markRead(@Payload() data: { id: string }) {
    return this.notificationsService.markAsRead(data.id);
  }

  @MessagePattern('notifications.markAllRead')
  async markAllRead(@Payload() data: { userId: string }) {
    return this.notificationsService.markAllAsRead(data.userId);
  }

  @MessagePattern('notifications.delete')
  async delete(@Payload() data: { id: string }) {
    return this.notificationsService.delete(data.id);
  }

  // ---- Event listeners (fire-and-forget from other services) ----

  @EventPattern('event.task.assigned')
  async handleTaskAssigned(
    @Payload() data: { taskTitle: string; assigneeId: string; assignerName: string },
  ) {
    await this.notificationsService.onTaskAssigned(data);
  }

  @EventPattern('event.task.completed')
  async handleTaskCompleted(
    @Payload() data: { taskTitle: string; completedBy: string; creatorId: string },
  ) {
    await this.notificationsService.onTaskCompleted(data);
  }

  @EventPattern('event.comment.added')
  async handleCommentAdded(
    @Payload() data: { taskTitle: string; authorName: string; taskOwnerId: string },
  ) {
    await this.notificationsService.onCommentAdded(data);
  }

  @EventPattern('event.task.dueReminder')
  async handleDueDateReminder(
    @Payload() data: { taskTitle: string; userId: string; dueDate: string },
  ) {
    await this.notificationsService.onDueDateReminder(data);
  }

  @EventPattern('event.workspace.invite')
  async handleWorkspaceInvite(
    @Payload() data: { workspaceName: string; inviterName: string; userId: string },
  ) {
    await this.notificationsService.onWorkspaceInvite(data);
  }
}
