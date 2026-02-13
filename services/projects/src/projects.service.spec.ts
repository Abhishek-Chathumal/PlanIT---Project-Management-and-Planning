import { Test } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { PrismaService } from './prisma.service';

const mockProject = {
  id: 'proj-1',
  name: 'Sprint 1',
  description: 'First sprint',
  color: '#6366f1',
  status: 'ACTIVE',
  workspaceId: 'ws-1',
  boards: [],
  createdAt: new Date(),
  updatedAt: new Date(),
};

const mockPrisma = {
  project: {
    create: jest.fn(),
    findMany: jest.fn(),
    findUnique: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  },
  board: {
    create: jest.fn(),
    aggregate: jest.fn(),
  },
  bucket: {
    create: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
    aggregate: jest.fn(),
  },
};

describe('ProjectsService', () => {
  let service: ProjectsService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [ProjectsService, { provide: PrismaService, useValue: mockPrisma }],
    }).compile();

    service = module.get<ProjectsService>(ProjectsService);
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a project with boards included', async () => {
      mockPrisma.project.create.mockResolvedValue(mockProject);

      const result = await service.create({
        name: 'Sprint 1',
        workspaceId: 'ws-1',
      });

      expect(result.name).toBe('Sprint 1');
      expect(mockPrisma.project.create).toHaveBeenCalledWith(
        expect.objectContaining({
          include: { boards: true },
        }),
      );
    });
  });

  describe('findAllInWorkspace', () => {
    it('should return projects for a workspace', async () => {
      mockPrisma.project.findMany.mockResolvedValue([mockProject]);
      const result = await service.findAllInWorkspace('ws-1');
      expect(result).toHaveLength(1);
    });
  });

  describe('findOne', () => {
    it('should return project with nested boards and buckets', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(mockProject);
      const result = await service.findOne('proj-1');
      expect(result).toEqual(mockProject);
    });

    it('should throw NotFoundException for missing project', async () => {
      mockPrisma.project.findUnique.mockResolvedValue(null);
      await expect(service.findOne('bad-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('createBoard', () => {
    it('should create board with auto-incrementing position', async () => {
      mockPrisma.board.aggregate.mockResolvedValue({ _max: { position: 2 } });
      mockPrisma.board.create.mockResolvedValue({
        id: 'board-1',
        name: 'Kanban',
        projectId: 'proj-1',
        position: 3,
      });

      const result = await service.createBoard('proj-1', { name: 'Kanban' });

      expect(result.position).toBe(3);
      expect(mockPrisma.board.create).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.objectContaining({ position: 3, name: 'Kanban' }),
        }),
      );
    });
  });

  describe('createBucket', () => {
    it('should create bucket with auto-incrementing position', async () => {
      mockPrisma.bucket.aggregate.mockResolvedValue({
        _max: { position: null },
      });
      mockPrisma.bucket.create.mockResolvedValue({
        id: 'bucket-1',
        name: 'To Do',
        boardId: 'board-1',
        position: 0,
      });

      const result = await service.createBucket('board-1', { name: 'To Do' });
      expect(result.position).toBe(0);
    });
  });
});
