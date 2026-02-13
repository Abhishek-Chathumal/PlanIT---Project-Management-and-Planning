import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { WorkspacesService } from './workspaces.service';
import type { WorkspaceRole } from '@prisma/client';

@Controller()
export class WorkspacesController {
  constructor(private readonly workspacesService: WorkspacesService) {}

  @MessagePattern('workspaces.create')
  async create(@Payload() data: { name: string; description?: string; authHeader: string }) {
    // TODO: decode JWT to get ownerId from auth service
    // For now, expecting userId to be resolved at gateway level
    const { authHeader: _authHeader, ...rest } = data;
    return this.workspacesService.create({ ...rest, ownerId: 'temp-user-id' });
  }

  @MessagePattern('workspaces.findAll')
  async findAll(@Payload() _data: { authHeader: string }) {
    // TODO: decode JWT to get userId
    return this.workspacesService.findAllForUser('temp-user-id');
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
