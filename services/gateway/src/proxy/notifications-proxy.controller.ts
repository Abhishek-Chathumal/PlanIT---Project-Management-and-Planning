import { Controller, Get, Patch, Delete, Param, Inject, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsProxyController {
  constructor(@Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy) {}

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async findAll(@Headers('authorization') authHeader: string) {
    // TODO: extract userId from JWT
    return firstValueFrom(
      this.notificationsClient.send('notifications.findAll', { userId: 'temp', authHeader }),
    );
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async unreadCount(@Headers('authorization') authHeader: string) {
    return firstValueFrom(
      this.notificationsClient.send('notifications.unreadCount', { userId: 'temp', authHeader }),
    );
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string) {
    return firstValueFrom(this.notificationsClient.send('notifications.markRead', { id }));
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Headers('authorization') authHeader: string) {
    return firstValueFrom(
      this.notificationsClient.send('notifications.markAllRead', { userId: 'temp', authHeader }),
    );
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.notificationsClient.send('notifications.delete', { id }));
  }
}
