import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Param,
  Body,
  Query,
  Inject,
  Headers,
} from '@nestjs/common';
import type { ClientProxy } from '@nestjs/microservices';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';

@ApiTags('Tasks')
@ApiBearerAuth()
@Controller('tasks')
export class TasksProxyController {
  constructor(@Inject('TASKS_SERVICE') private readonly tasksClient: ClientProxy) {}

  @Post()
  @ApiOperation({ summary: 'Create a new task' })
  async create(
    @Body()
    data: {
      title: string;
      description?: string;
      priority?: string;
      bucketId: string;
      assigneeId?: string;
      dueDate?: string;
    },
    @Headers('authorization') authHeader: string,
  ) {
    return firstValueFrom(this.tasksClient.send('tasks.create', { ...data, authHeader }));
  }

  @Get()
  @ApiOperation({ summary: 'List tasks by bucket' })
  async findByBucket(@Query('bucketId') bucketId: string) {
    return firstValueFrom(this.tasksClient.send('tasks.findByBucket', { bucketId }));
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task with all details' })
  async findOne(@Param('id') id: string) {
    return firstValueFrom(this.tasksClient.send('tasks.findOne', { id }));
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update task' })
  async update(@Param('id') id: string, @Body() data: Record<string, unknown>) {
    return firstValueFrom(this.tasksClient.send('tasks.update', { id, ...data }));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete task' })
  async delete(@Param('id') id: string) {
    return firstValueFrom(this.tasksClient.send('tasks.delete', { id }));
  }

  // ---- Subtasks ----

  @Post(':id/subtasks')
  @ApiOperation({ summary: 'Add subtask to task' })
  async addSubtask(@Param('id') id: string, @Body() data: { title: string }) {
    return firstValueFrom(this.tasksClient.send('subtasks.create', { taskId: id, ...data }));
  }

  @Patch('subtasks/:id/toggle')
  @ApiOperation({ summary: 'Toggle subtask completion' })
  async toggleSubtask(@Param('id') id: string) {
    return firstValueFrom(this.tasksClient.send('subtasks.toggle', { id }));
  }

  @Delete('subtasks/:id')
  @ApiOperation({ summary: 'Delete subtask' })
  async deleteSubtask(@Param('id') id: string) {
    return firstValueFrom(this.tasksClient.send('subtasks.delete', { id }));
  }

  // ---- Comments ----

  @Post(':id/comments')
  @ApiOperation({ summary: 'Add comment to task' })
  async addComment(
    @Param('id') id: string,
    @Body() data: { content: string },
    @Headers('authorization') authHeader: string,
  ) {
    return firstValueFrom(
      this.tasksClient.send('comments.create', { taskId: id, ...data, authHeader }),
    );
  }

  @Delete('comments/:id')
  @ApiOperation({ summary: 'Delete comment' })
  async deleteComment(@Param('id') id: string) {
    return firstValueFrom(this.tasksClient.send('comments.delete', { id }));
  }

  // ---- Labels ----

  @Post(':id/labels/:labelId')
  @ApiOperation({ summary: 'Attach label to task' })
  async addLabel(@Param('id') id: string, @Param('labelId') labelId: string) {
    return firstValueFrom(this.tasksClient.send('labels.attach', { taskId: id, labelId }));
  }

  @Delete(':id/labels/:labelId')
  @ApiOperation({ summary: 'Remove label from task' })
  async removeLabel(@Param('id') id: string, @Param('labelId') labelId: string) {
    return firstValueFrom(this.tasksClient.send('labels.detach', { taskId: id, labelId }));
  }
}
