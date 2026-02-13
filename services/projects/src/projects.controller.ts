import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { ProjectsService } from './projects.service';

@Controller()
export class ProjectsController {
  constructor(private readonly projectsService: ProjectsService) {}

  @MessagePattern('projects.create')
  async create(
    @Payload() data: { name: string; description?: string; color?: string; workspaceId: string },
  ) {
    return this.projectsService.create(data);
  }

  @MessagePattern('projects.findAll')
  async findAll(@Payload() data: { workspaceId: string }) {
    return this.projectsService.findAllInWorkspace(data.workspaceId);
  }

  @MessagePattern('projects.findOne')
  async findOne(@Payload() data: { id: string }) {
    return this.projectsService.findOne(data.id);
  }

  @MessagePattern('projects.update')
  async update(
    @Payload() data: { id: string; name?: string; description?: string; color?: string },
  ) {
    const { id, ...rest } = data;
    return this.projectsService.update(id, rest);
  }

  @MessagePattern('projects.delete')
  async delete(@Payload() data: { id: string }) {
    return this.projectsService.delete(data.id);
  }

  // ---- Boards ----

  @MessagePattern('boards.create')
  async createBoard(@Payload() data: { projectId: string; name: string }) {
    return this.projectsService.createBoard(data.projectId, { name: data.name });
  }

  // ---- Buckets ----

  @MessagePattern('buckets.create')
  async createBucket(@Payload() data: { boardId: string; name: string; color?: string }) {
    const { boardId, ...rest } = data;
    return this.projectsService.createBucket(boardId, rest);
  }

  @MessagePattern('buckets.update')
  async updateBucket(
    @Payload() data: { id: string; name?: string; color?: string; position?: number },
  ) {
    const { id, ...rest } = data;
    return this.projectsService.updateBucket(id, rest);
  }

  @MessagePattern('buckets.delete')
  async deleteBucket(@Payload() data: { id: string }) {
    return this.projectsService.deleteBucket(data.id);
  }
}
