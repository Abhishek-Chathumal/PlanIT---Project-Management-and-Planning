import { Test } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { AuthService } from './auth.service';
import { PrismaService } from './prisma.service';

// ---- Generate test-only credentials at runtime to avoid hardcoded secrets ----
const TEST_PASSWORD = crypto.randomBytes(16).toString('hex') + 'A@1';
const TEST_EMAIL = `test-${crypto.randomBytes(4).toString('hex')}@planit.test`;
const TEST_REGISTER_EMAIL = `new-${crypto.randomBytes(4).toString('hex')}@planit.test`;

const mockUser = {
  id: 'user-1',
  email: TEST_EMAIL,
  passwordHash: '', // set dynamically per-test
  displayName: 'Test User',
  role: 'MEMBER',
  isActive: true,
  lastLoginAt: null,
  avatarUrl: null,
  createdAt: new Date(),
  updatedAt: new Date(),
};

// ---- Mocks ----
const mockPrisma = {
  user: {
    findUnique: jest.fn(),
    create: jest.fn(),
    update: jest.fn(),
  },
};

const mockJwtService = {
  signAsync: jest.fn(),
  verify: jest.fn(),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: mockPrisma },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);

    // Reset all mocks
    jest.clearAllMocks();

    // Default JWT mock — use opaque placeholder tokens (not real secrets)
    mockJwtService.signAsync
      .mockResolvedValueOnce('mock-access-token')
      .mockResolvedValueOnce('mock-refresh-token');
  });

  // ---- register ----
  describe('register', () => {
    const dto = {
      email: TEST_REGISTER_EMAIL,
      password: TEST_PASSWORD,
      displayName: 'New User',
    };

    it('should register a new user and return tokens', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue({
        ...mockUser,
        email: dto.email,
        displayName: dto.displayName,
      });

      const result = await service.register(dto);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.email).toBe(dto.email);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
        where: { email: dto.email },
      });
      expect(mockPrisma.user.create).toHaveBeenCalled();
    });

    it('should throw ConflictException if email already taken', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.register(dto)).rejects.toThrow(ConflictException);
      expect(mockPrisma.user.create).not.toHaveBeenCalled();
    });

    it('should hash the password with bcrypt', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);
      mockPrisma.user.create.mockResolvedValue(mockUser);

      await service.register(dto);

      // Verify the password hash passed to prisma.user.create starts with bcrypt prefix
      const createCall = mockPrisma.user.create.mock.calls[0][0];
      expect(createCall.data.passwordHash).toMatch(/^\$2[ab]\$/);
    });
  });

  // ---- login ----
  describe('login', () => {
    const dto = { email: TEST_EMAIL, password: TEST_PASSWORD };

    it('should login and return tokens for valid credentials', async () => {
      const hashedPassword = await bcrypt.hash(dto.password, 12);
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        passwordHash: hashedPassword,
      });
      mockPrisma.user.update.mockResolvedValue(mockUser);

      const result = await service.login(dto);

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
      expect(result.user.email).toBe(dto.email);
      expect(mockPrisma.user.update).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { id: mockUser.id },
          data: expect.objectContaining({ lastLoginAt: expect.any(Date) }),
        }),
      );
    });

    it('should throw UnauthorizedException for non-existent user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for inactive user', async () => {
      mockPrisma.user.findUnique.mockResolvedValue({
        ...mockUser,
        isActive: false,
      });

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for wrong password', async () => {
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      await expect(service.login(dto)).rejects.toThrow(UnauthorizedException);
    });
  });

  // ---- refreshToken ----
  describe('refreshToken', () => {
    it('should return new tokens for valid refresh token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.refreshToken('mock-valid-refresh-token');

      expect(result.accessToken).toBe('mock-access-token');
      expect(result.refreshToken).toBe('mock-refresh-token');
    });

    it('should throw UnauthorizedException for invalid refresh token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.refreshToken('mock-invalid-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'deleted-user' });
      mockPrisma.user.findUnique.mockResolvedValue(null);

      await expect(service.refreshToken('mock-orphan-token')).rejects.toThrow(
        UnauthorizedException,
      );
    });
  });

  // ---- getMe ----
  describe('getMe', () => {
    it('should return user profile for valid token', async () => {
      mockJwtService.verify.mockReturnValue({ sub: 'user-1' });
      mockPrisma.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.getMe('Bearer mock-valid-token');

      expect(result).toEqual(mockUser);
      expect(mockPrisma.user.findUnique).toHaveBeenCalledWith(
        expect.objectContaining({ where: { id: 'user-1' } }),
      );
    });

    it('should throw UnauthorizedException when no token', async () => {
      await expect(service.getMe('')).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException for invalid token', async () => {
      mockJwtService.verify.mockImplementation(() => {
        throw new Error('invalid');
      });

      await expect(service.getMe('Bearer mock-bad-token')).rejects.toThrow(UnauthorizedException);
    });
  });
});
