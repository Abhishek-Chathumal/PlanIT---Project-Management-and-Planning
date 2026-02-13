import { Module } from '@nestjs/common';
import { WorkspacesController } from './workspaces.controller';
import { WorkspacesService } from './workspaces.service';
import { ProjectsController } from './projects.controller';
import { ProjectsService } from './projects.service';
import { PrismaService } from './prisma.service';

@Module({
  controllers: [WorkspacesController, ProjectsController],
  providers: [WorkspacesService, ProjectsService, PrismaService],
})
export class ProjectsModule {}
