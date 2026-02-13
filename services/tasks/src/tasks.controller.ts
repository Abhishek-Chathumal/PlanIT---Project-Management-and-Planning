import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import type { TasksService } from './tasks.service';

@Controller()
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @MessagePattern('tasks.create')
  async create(
    @Payload()
    data: {
      title: string;
      description?: string;
      priority?: string;
      bucketId: string;
      assigneeId?: string;
      dueDate?: string;
      authHeader: string;
    },
  ) {
    const { authHeader: _authHeader, ...rest } = data;
    // TODO: decode JWT to get creatorId from auth service
    return this.tasksService.create({ ...rest, creatorId: 'temp-user-id' });
  }

  @MessagePattern('tasks.findByBucket')
  async findByBucket(@Payload() data: { bucketId: string }) {
    return this.tasksService.findByBucket(data.bucketId);
  }

  @MessagePattern('tasks.findOne')
  async findOne(@Payload() data: { id: string }) {
    return this.tasksService.findOne(data.id);
  }

  @MessagePattern('tasks.update')
  async update(@Payload() data: { id: string; [key: string]: unknown }) {
    const { id, ...rest } = data;
    return this.tasksService.update(id, rest);
  }

  @MessagePattern('tasks.delete')
  async delete(@Payload() data: { id: string }) {
    return this.tasksService.delete(data.id);
  }

  // ---- Subtasks ----

  @MessagePattern('subtasks.create')
  async addSubtask(@Payload() data: { taskId: string; title: string }) {
    return this.tasksService.addSubtask(data.taskId, { title: data.title });
  }

  @MessagePattern('subtasks.toggle')
  async toggleSubtask(@Payload() data: { id: string }) {
    return this.tasksService.toggleSubtask(data.id);
  }

  @MessagePattern('subtasks.delete')
  async deleteSubtask(@Payload() data: { id: string }) {
    return this.tasksService.deleteSubtask(data.id);
  }

  // ---- Comments ----

  @MessagePattern('comments.create')
  async addComment(@Payload() data: { taskId: string; content: string; authHeader: string }) {
    const { authHeader: _authHeader, ...rest } = data;
    // TODO: decode JWT to get authorId
    return this.tasksService.addComment(rest.taskId, 'temp-user-id', rest.content);
  }

  @MessagePattern('comments.delete')
  async deleteComment(@Payload() data: { id: string }) {
    return this.tasksService.deleteComment(data.id);
  }

  // ---- Labels ----

  @MessagePattern('labels.attach')
  async attachLabel(@Payload() data: { taskId: string; labelId: string }) {
    return this.tasksService.attachLabel(data.taskId, data.labelId);
  }

  @MessagePattern('labels.detach')
  async detachLabel(@Payload() data: { taskId: string; labelId: string }) {
    return this.tasksService.detachLabel(data.taskId, data.labelId);
  }
}
