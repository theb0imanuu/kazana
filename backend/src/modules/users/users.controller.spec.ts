import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    getProfile: jest.fn(),
    updateProfile: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        { provide: UsersService, useValue: mockUsersService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getProfile', () => {
    it('should retrieve profile using authenticated user ID (enforcing user isolation)', async () => {
      const authenticatedUser = { id: 'user-123' };
      const expectedProfile = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'John Doe',
      };

      jest.spyOn(service, 'getProfile').mockResolvedValue(expectedProfile);

      const result = await controller.getProfile(authenticatedUser);

      expect(service.getProfile).toHaveBeenCalledWith('user-123');
      expect(result).toBe(expectedProfile);
    });
  });

  describe('updateProfile', () => {
    it('should update profile using authenticated user ID (enforcing user isolation)', async () => {
      const authenticatedUser = { id: 'user-123' };
      const updateDto = { name: 'New Name' };
      const expectedResult = {
        id: 'user-123',
        email: 'user@example.com',
        name: 'New Name',
      };

      jest.spyOn(service, 'updateProfile').mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(authenticatedUser, updateDto);

      expect(service.updateProfile).toHaveBeenCalledWith('user-123', updateDto);
      expect(result).toBe(expectedResult);
    });
  });

  describe('changePassword', () => {
    it('should change password using authenticated user ID (enforcing user isolation)', async () => {
      const authenticatedUser = { id: 'user-123' };
      const changePasswordDto = {
        currentPassword: 'password123',
        newPassword: 'newpassword123',
      };
      const expectedResult = { message: 'Password changed successfully' };

      jest.spyOn(service, 'changePassword').mockResolvedValue(expectedResult);

      const result = await controller.changePassword(authenticatedUser, changePasswordDto);

      expect(service.changePassword).toHaveBeenCalledWith('user-123', changePasswordDto);
      expect(result).toBe(expectedResult);
    });
  });
});
