import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';
import type { TaskPriority } from '@prisma/client';

@Injectable()
export class TasksService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: {
    title: string;
    description?: string;
    priority?: string;
    bucketId: string;
    assigneeId?: string;
    creatorId: string;
    dueDate?: string;
  }) {
    const maxPos = await this.prisma.task.aggregate({
      where: { bucketId: data.bucketId },
      _max: { position: true },
    });

    return this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        priority: (data.priority as TaskPriority) ?? 'MEDIUM',
        bucketId: data.bucketId,
        assigneeId: data.assigneeId,
        creatorId: data.creatorId,
        dueDate: data.dueDate ? new Date(data.dueDate) : undefined,
        position: (maxPos._max.position ?? -1) + 1,
      },
      include: {
        assignee: { select: { id: true, displayName: true, avatarUrl: true } },
        labels: { include: { label: true } },
        _count: { select: { subtasks: true, comments: true } },
      },
    });
  }

  async findByBucket(bucketId: string) {
    return this.prisma.task.findMany({
      where: { bucketId },
      orderBy: { position: 'asc' },
      include: {
        assignee: { select: { id: true, displayName: true, avatarUrl: true } },
        labels: { include: { label: true } },
        _count: { select: { subtasks: true, comments: true } },
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: {
        assignee: { select: { id: true, displayName: true, avatarUrl: true } },
        creator: { select: { id: true, displayName: true } },
        labels: { include: { label: true } },
        subtasks: { orderBy: { position: 'asc' } },
        checklists: {
          include: { items: { orderBy: { position: 'asc' } } },
          orderBy: { position: 'asc' },
        },
        comments: {
          include: {
            author: { select: { id: true, displayName: true, avatarUrl: true } },
          },
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    if (!task) {
      throw new NotFoundException(`Task ${id} not found`);
    }
    return task;
  }

  async update(id: string, data: Record<string, unknown>) {
    const { dueDate, ...rest } = data;
    return this.prisma.task.update({
      where: { id },
      data: {
        ...rest,
        ...(dueDate !== undefined && {
          dueDate: dueDate ? new Date(dueDate as string) : null,
        }),
      },
    });
  }

  async delete(id: string) {
    return this.prisma.task.delete({ where: { id } });
  }

  // ---- Subtasks ----

  async addSubtask(taskId: string, data: { title: string }) {
    const maxPos = await this.prisma.subtask.aggregate({
      where: { taskId },
      _max: { position: true },
    });

    return this.prisma.subtask.create({
      data: {
        title: data.title,
        taskId,
        position: (maxPos._max.position ?? -1) + 1,
      },
    });
  }

  async toggleSubtask(id: string) {
    const subtask = await this.prisma.subtask.findUnique({ where: { id } });
    if (!subtask) throw new NotFoundException(`Subtask ${id} not found`);
    return this.prisma.subtask.update({
      where: { id },
      data: { completed: !subtask.completed },
    });
  }

  async deleteSubtask(id: string) {
    return this.prisma.subtask.delete({ where: { id } });
  }

  // ---- Comments ----

  async addComment(taskId: string, authorId: string, content: string) {
    return this.prisma.comment.create({
      data: { content, taskId, authorId },
      include: {
        author: { select: { id: true, displayName: true, avatarUrl: true } },
      },
    });
  }

  async deleteComment(id: string) {
    return this.prisma.comment.delete({ where: { id } });
  }

  // ---- Labels ----

  async attachLabel(taskId: string, labelId: string) {
    return this.prisma.taskLabel.create({
      data: { taskId, labelId },
    });
  }

  async detachLabel(taskId: string, labelId: string) {
    return this.prisma.taskLabel.delete({
      where: { taskId_labelId: { taskId, labelId } },
    });
  }
}
