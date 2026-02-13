import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from './prisma.service';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; description?: string; color?: string; workspaceId: string }) {
    return this.prisma.project.create({
      data,
      include: { boards: true },
    });
  }

  async findAllInWorkspace(workspaceId: string) {
    return this.prisma.project.findMany({
      where: { workspaceId },
      include: { _count: { select: { boards: true } } },
    });
  }

  async findOne(id: string) {
    const project = await this.prisma.project.findUnique({
      where: { id },
      include: {
        boards: {
          include: {
            buckets: {
              include: { _count: { select: { tasks: true } } },
              orderBy: { position: 'asc' },
            },
          },
          orderBy: { position: 'asc' },
        },
      },
    });

    if (!project) {
      throw new NotFoundException(`Project ${id} not found`);
    }
    return project;
  }

  async update(id: string, data: { name?: string; description?: string; color?: string }) {
    await this.findOne(id);
    return this.prisma.project.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.project.delete({ where: { id } });
  }

  // ---- Boards ----

  async createBoard(projectId: string, data: { name: string }) {
    const maxPos = await this.prisma.board.aggregate({
      where: { projectId },
      _max: { position: true },
    });

    return this.prisma.board.create({
      data: {
        name: data.name,
        projectId,
        position: (maxPos._max.position ?? -1) + 1,
      },
    });
  }

  // ---- Buckets ----

  async createBucket(boardId: string, data: { name: string; color?: string }) {
    const maxPos = await this.prisma.bucket.aggregate({
      where: { boardId },
      _max: { position: true },
    });

    return this.prisma.bucket.create({
      data: {
        name: data.name,
        boardId,
        color: data.color,
        position: (maxPos._max.position ?? -1) + 1,
      },
    });
  }

  async updateBucket(id: string, data: { name?: string; color?: string; position?: number }) {
    return this.prisma.bucket.update({ where: { id }, data });
  }

  async deleteBucket(id: string) {
    return this.prisma.bucket.delete({ where: { id } });
  }
}
