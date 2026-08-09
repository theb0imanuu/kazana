import { Test, TestingModule } from '@nestjs/testing';
import { RemindersController } from './reminders.controller';
import { RemindersService } from './reminders.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('RemindersController', () => {
  let controller: RemindersController;
  let service: RemindersService;

  const mockRemindersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    complete: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [RemindersController],
      providers: [
        { provide: RemindersService, useValue: mockRemindersService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<RemindersController>(RemindersController);
    service = module.get<RemindersService>(RemindersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'user-uuid' };
  const reminderId = 'reminder-uuid';

  describe('create', () => {
    it('should call service.create with authenticated user ID (user isolation)', async () => {
      const dto = { title: 'Call recruiter', dueAt: new Date().toISOString(), jobId: 'job-uuid' };
      const expected = { id: reminderId, ...dto, userId: user.id };
      jest.spyOn(service, 'create').mockResolvedValue(expected as any);

      const result = await controller.create(user, dto);

      expect(service.create).toHaveBeenCalledWith(user.id, dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with user ID and query parameters (user isolation)', async () => {
      const query = { completed: true };
      const expected = [{ id: reminderId, title: 'Call recruiter', completed: true }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.findAll(user, query as any);

      expect(service.findAll).toHaveBeenCalledWith(user.id, query);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with user ID and reminder ID (user isolation)', async () => {
      const expected = { id: reminderId, title: 'Call recruiter' };
      jest.spyOn(service, 'findOne').mockResolvedValue(expected as any);

      const result = await controller.findOne(user, reminderId);

      expect(service.findOne).toHaveBeenCalledWith(user.id, reminderId);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with IDs and dto (user isolation)', async () => {
      const dto = { title: 'Call recruiter tomorrow' };
      const expected = { id: reminderId, title: 'Call recruiter tomorrow' };
      jest.spyOn(service, 'update').mockResolvedValue(expected as any);

      const result = await controller.update(user, reminderId, dto);

      expect(service.update).toHaveBeenCalledWith(user.id, reminderId, dto);
      expect(result).toBe(expected);
    });
  });

  describe('complete', () => {
    it('should call service.complete with IDs (user isolation)', async () => {
      const expected = { id: reminderId, completed: true };
      jest.spyOn(service, 'complete').mockResolvedValue(expected as any);

      const result = await controller.complete(user, reminderId);

      expect(service.complete).toHaveBeenCalledWith(user.id, reminderId);
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with IDs (user isolation)', async () => {
      const expected = { success: true };
      jest.spyOn(service, 'remove').mockResolvedValue(expected as any);

      const result = await controller.remove(user, reminderId);

      expect(service.remove).toHaveBeenCalledWith(user.id, reminderId);
      expect(result).toBe(expected);
    });
  });
});
