import { Injectable, NotFoundException } from '@nestjs/common';
import type { PrismaService } from './prisma.service';
import type { WorkspaceRole } from '@prisma/client';

@Injectable()
export class WorkspacesService {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: { name: string; description?: string; ownerId: string }) {
    return this.prisma.workspace.create({
      data: {
        name: data.name,
        description: data.description,
        ownerId: data.ownerId,
        members: {
          create: { userId: data.ownerId, role: 'OWNER' },
        },
      },
      include: { members: true },
    });
  }

  async findAllForUser(userId: string) {
    return this.prisma.workspace.findMany({
      where: { members: { some: { userId } } },
      include: { _count: { select: { projects: true, members: true } } },
    });
  }

  async findOne(id: string) {
    const workspace = await this.prisma.workspace.findUnique({
      where: { id },
      include: {
        owner: { select: { id: true, displayName: true, email: true } },
        members: {
          include: {
            user: { select: { id: true, displayName: true, email: true, avatarUrl: true } },
          },
        },
        projects: true,
      },
    });

    if (!workspace) {
      throw new NotFoundException(`Workspace ${id} not found`);
    }
    return workspace;
  }

  async update(id: string, data: { name?: string; description?: string }) {
    await this.findOne(id);
    return this.prisma.workspace.update({ where: { id }, data });
  }

  async delete(id: string) {
    await this.findOne(id);
    return this.prisma.workspace.delete({ where: { id } });
  }

  async addMember(workspaceId: string, userId: string, role: WorkspaceRole = 'MEMBER') {
    return this.prisma.workspaceMember.create({
      data: { workspaceId, userId, role },
    });
  }

  async removeMember(workspaceId: string, userId: string) {
    return this.prisma.workspaceMember.deleteMany({
      where: { workspaceId, userId },
    });
  }
}
