// ============================================
// PlanIT.IO — API Gateway (HTTP → NATS Proxy)
// ============================================
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { HealthController } from './health/health.controller';
import { AuthProxyController } from './proxy/auth-proxy.controller';
import { UsersProxyController } from './proxy/users-proxy.controller';
import { WorkspacesProxyController } from './proxy/workspaces-proxy.controller';
import { ProjectsProxyController } from './proxy/projects-proxy.controller';
import { TasksProxyController } from './proxy/tasks-proxy.controller';
import { NotificationsProxyController } from './proxy/notifications-proxy.controller';

const NATS_URL = process.env.NATS_URL || 'nats://localhost:4222';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '../../.env',
    }),
    ClientsModule.register([
      {
        name: 'AUTH_SERVICE',
        transport: Transport.NATS,
        options: { servers: [NATS_URL] },
      },
      {
        name: 'USERS_SERVICE',
        transport: Transport.NATS,
        options: { servers: [NATS_URL] },
      },
      {
        name: 'PROJECTS_SERVICE',
        transport: Transport.NATS,
        options: { servers: [NATS_URL] },
      },
      {
        name: 'TASKS_SERVICE',
        transport: Transport.NATS,
        options: { servers: [NATS_URL] },
      },
      {
        name: 'NOTIFICATIONS_SERVICE',
        transport: Transport.NATS,
        options: { servers: [NATS_URL] },
      },
    ]),
  ],
  controllers: [
    HealthController,
    AuthProxyController,
    UsersProxyController,
    WorkspacesProxyController,
    ProjectsProxyController,
    TasksProxyController,
    NotificationsProxyController,
  ],
})
export class AppModule {}
