import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException, BadRequestException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

describe('UsersService', () => {
  let service: UsersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    user: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    const userId = 'user-uuid';

    it('should return a safe user profile without passwordHash if user exists', async () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        name: 'Test User',
        avatarUrl: null,
        timezone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

      const result = await service.getProfile(userId);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.id).toBe(userId);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.getProfile(userId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('updateProfile', () => {
    const userId = 'user-uuid';
    const updateDto = {
      name: 'New Name',
      timezone: 'America/New_York',
      avatarUrl: 'https://example.com/avatar.jpg',
    };

    it('should update user and return safe user if user exists', async () => {
      const existingUser = {
        id: userId,
        email: 'test@example.com',
        passwordHash: 'hashedpassword',
        name: 'Test User',
        avatarUrl: null,
        timezone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const updatedUser = {
        ...existingUser,
        ...updateDto,
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(existingUser);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(updatedUser);

      const result = await service.updateProfile(userId, updateDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prisma.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: updateDto,
      });
      expect(result).not.toHaveProperty('passwordHash');
      expect(result.name).toBe(updateDto.name);
      expect(result.timezone).toBe(updateDto.timezone);
      expect(result.avatarUrl).toBe(updateDto.avatarUrl);
    });

    it('should throw NotFoundException if user does not exist during update', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.updateProfile(userId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('changePassword', () => {
    const userId = 'user-uuid';
    const changePasswordDto = {
      currentPassword: 'password123',
      newPassword: 'newpassword123',
    };

    it('should change password successfully when current password matches', async () => {
      const currentHashed = await bcrypt.hash(changePasswordDto.currentPassword, 10);
      const user = {
        id: userId,
        email: 'test@example.com',
        passwordHash: currentHashed,
        name: 'Test User',
        avatarUrl: null,
        timezone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);
      jest.spyOn(prisma.user, 'update').mockResolvedValue(user);

      const result = await service.changePassword(userId, changePasswordDto);

      expect(prisma.user.findUnique).toHaveBeenCalledWith({ where: { id: userId } });
      expect(prisma.user.update).toHaveBeenCalled();
      expect(result).toHaveProperty('message', 'Password changed successfully');
    });

    it('should throw BadRequestException when current password does not match', async () => {
      const differentHashed = await bcrypt.hash('different_password', 10);
      const user = {
        id: userId,
        email: 'test@example.com',
        passwordHash: differentHashed,
        name: 'Test User',
        avatarUrl: null,
        timezone: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(user);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(BadRequestException);
      expect(prisma.user.update).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException if user does not exist during password change', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);

      await expect(service.changePassword(userId, changePasswordDto)).rejects.toThrow(NotFoundException);
    });
  });
});
