import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { WorkspacesService } from './workspaces.service';
import type { WorkspaceRole } from '@prisma/client';

@Controller()
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @MessagePattern('workspaces.create')
  async create(@Payload() data: { name: string; description?: string; ownerId: string }) {
    return this.workspacesService.create(data);
  }

  @MessagePattern('workspaces.findAll')
  async findAll(@Payload() data: { userId: string }) {
    return this.workspacesService.findAllForUser(data.userId);
  }

  @MessagePattern('workspaces.findOne')
  async findOne(@Payload() data: { id: string }) {
    return this.workspacesService.findOne(data.id);
  }

  @MessagePattern('workspaces.update')
  async update(@Payload() data: { id: string; name?: string; description?: string }) {
    const { id, ...rest } = data;
    return this.workspacesService.update(id, rest);
  }

  @MessagePattern('workspaces.delete')
  async delete(@Payload() data: { id: string }) {
    return this.workspacesService.delete(data.id);
  }

  @MessagePattern('workspaces.addMember')
  async addMember(@Payload() data: { workspaceId: string; userId: string; role?: string }) {
    return this.workspacesService.addMember(
      data.workspaceId,
      data.userId,
      data.role as WorkspaceRole,
    );
  }

  @MessagePattern('workspaces.removeMember')
  async removeMember(@Payload() data: { workspaceId: string; userId: string }) {
    return this.workspacesService.removeMember(data.workspaceId, data.userId);
  }
}
