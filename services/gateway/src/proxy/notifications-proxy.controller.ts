// ============================================
// Notifications Proxy Controller — extracts userId from JWT
// ============================================
import { Controller, Get, Patch, Delete, Param, Inject, Headers } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { JwtService } from '@nestjs/jwt';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Notifications')
@ApiBearerAuth()
@Controller('notifications')
export class NotificationsProxyController {
  constructor(
    @Inject('NOTIFICATIONS_SERVICE') private readonly notificationsClient: ClientProxy,
    private readonly jwtService: JwtService,
  ) {}

  /** Extract the userId (sub claim) from an Authorization header. */
  private extractUserId(authHeader: string): string {
    const token = authHeader?.replace('Bearer ', '');
    const payload = this.jwtService.verify(token, {
      secret: process.env.JWT_SECRET || 'jwt-secret-change-me',
    });
    return payload.sub;
  }

  @Get()
  @ApiOperation({ summary: 'Get all notifications for current user' })
  async findAll(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return firstValueFrom(this.notificationsClient.send('notifications.findAll', { userId }));
  }

  @Get('unread-count')
  @ApiOperation({ summary: 'Get unread notification count' })
  async unreadCount(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return firstValueFrom(this.notificationsClient.send('notifications.unreadCount', { userId }));
  }

  @Patch(':id/read')
  @ApiOperation({ summary: 'Mark notification as read' })
  async markRead(@Param('id') id: string) {
    return firstValueFrom(this.notificationsClient.send('notifications.markRead', { id }));
  }

  @Patch('read-all')
  @ApiOperation({ summary: 'Mark all notifications as read' })
  async markAllRead(@Headers('authorization') authHeader: string) {
    const userId = this.extractUserId(authHeader);
    return firstValueFrom(this.notificationsClient.send('notifications.markAllRead', { userId }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete notification' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.notificationsClient.send('notifications.delete', { id }));
  }
}
