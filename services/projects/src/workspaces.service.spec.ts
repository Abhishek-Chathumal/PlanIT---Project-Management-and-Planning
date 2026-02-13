import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { WorkspacesService } from './workspaces.service';
import { PrismaService } from './prisma.service';

const mockWorkspace = {
  id: 'ws-1',
  name: 'Dev Team',
  description: 'Development workspace',
  iconUrl: null,
  ownerId: 'user-1',
  createdAt: new Date(),
  updatedAt: new Date(),
  members: [{ userId: 'user-1', role: 'OWNER' }],
};

const mockPrisma = {
  workspace: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  workspaceMember: {
    create: jest.fn(),
    deleteMany: jest.fn(),
  },
};

describe('WorkspacesService', () => {
  let service: WorkspacesService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [WorkspacesService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<WorkspacesService>(WorkspacesService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create workspace and auto-add owner as member', async () => {
      mockPrisma.workspace.create.mockResolvedValue(mockWorkspace);

      const result = await service.create({
        name: 'Dev Team',
        description: 'Development workspace',
        ownerId: 'user-1',
      });

      expect(result.name).toBe('Dev Team');
      expect(mockPrisma.workspace.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({
            members: { create: { userId: 'user-1', role: 'OWNER' } },
          }),
        }),
      );
    });
  });

  describe('findAllForUser', () => {
    it('should return workspaces where user is a member', async () => {
      mockPrisma.workspace.findMany.mockResolvedValue([mockWorkspace]);

      const result = await service.findAllForUser('user-1');

      expect(result).toHaveLength(1);
      expect(mockPrisma.workspace.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { members: { some: { userId: 'user-1' } } },
        }),
      );
    });
  });

  describe('findOne', () => {
    it('should return workspace with owner, members, and projects', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue(mockWorkspace);
      const result = await service.findOne('ws-1');
      expect(result).toEqual(mockWorkspace);
    });

    it('should throw NotFoundException for missing workspace', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue(null);
      await expect(service.findOne('not-found')).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update workspace fields', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue(mockWorkspace);
      mockPrisma.workspace.update.mockResolvedValue({
        ...mockWorkspace,
        name: 'Updated',
      });

      const result = await service.update('ws-1', { name: 'Updated' });
      expect(result.name).toBe('Updated');
    });
  });

  describe('delete', () => {
    it('should delete workspace', async () => {
      mockPrisma.workspace.findUnique.mockResolvedValue(mockWorkspace);
      mockPrisma.workspace.delete.mockResolvedValue(mockWorkspace);

      await service.delete('ws-1');
      expect(mockPrisma.workspace.delete).toHaveBeenCalledWith({
        where: { id: 'ws-1' },
      });
    });
  });

  describe('addMember', () => {
    it('should add user to workspace with specified role', async () => {
      mockPrisma.workspaceMember.create.mockResolvedValue({
        workspaceId: 'ws-1',
        userId: 'user-2',
        role: 'MEMBER',
      });

      await service.addMember('ws-1', 'user-2');
      expect(mockPrisma.workspaceMember.create).toHaveBeenCalledWith({
        data: { workspaceId: 'ws-1', userId: 'user-2', role: 'MEMBER' },
      });
    });
  });

  describe('removeMember', () => {
    it('should remove user from workspace', async () => {
      mockPrisma.workspaceMember.deleteMany.mockResolvedValue({ count: 1 });

      await service.removeMember('ws-1', 'user-2');
      expect(mockPrisma.workspaceMember.deleteMany).toHaveBeenCalledWith({
        where: { workspaceId: 'ws-1', userId: 'user-2' },
      });
    });
  });
});
