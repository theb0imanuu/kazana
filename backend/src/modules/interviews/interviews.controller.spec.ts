import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsController } from './interviews.controller';
import { InterviewsService } from './interviews.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { InterviewType, InterviewStatus } from '@prisma/client';

describe('InterviewsController', () => {
  let controller: InterviewsController;
  let service: InterviewsService;

  const mockInterviewsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [InterviewsController],
      providers: [
        { provide: InterviewsService, useValue: mockInterviewsService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<InterviewsController>(InterviewsController);
    service = module.get<InterviewsService>(InterviewsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'user-uuid' };
  const interviewId = 'interview-uuid';

  describe('create', () => {
    it('should call service.create with authenticated user ID (user isolation)', async () => {
      const dto = {
        type: InterviewType.VIDEO,
        scheduledAt: new Date().toISOString(),
        status: InterviewStatus.SCHEDULED,
        jobId: 'job-uuid',
      };
      const expected = { id: interviewId, ...dto, userId: user.id };
      jest.spyOn(service, 'create').mockResolvedValue(expected as any);

      const result = await controller.create(user, dto);

      expect(service.create).toHaveBeenCalledWith(user.id, dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with authenticated user ID (user isolation)', async () => {
      const expected = [{ id: interviewId, type: InterviewType.VIDEO }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(user.id);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with interview ID and user ID (user isolation)', async () => {
      const expected = { id: interviewId, type: InterviewType.VIDEO };
      jest.spyOn(service, 'findOne').mockResolvedValue(expected as any);

      const result = await controller.findOne(user, interviewId);

      expect(service.findOne).toHaveBeenCalledWith(user.id, interviewId);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with IDs and dto (user isolation)', async () => {
      const dto = { notes: 'Updated Zoom link' };
      const expected = { id: interviewId, notes: 'Updated Zoom link' };
      jest.spyOn(service, 'update').mockResolvedValue(expected as any);

      const result = await controller.update(user, interviewId, dto);

      expect(service.update).toHaveBeenCalledWith(user.id, interviewId, dto);
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with IDs (user isolation)', async () => {
      const expected = { success: true };
      jest.spyOn(service, 'remove').mockResolvedValue(expected as any);

      const result = await controller.remove(user, interviewId);

      expect(service.remove).toHaveBeenCalledWith(user.id, interviewId);
      expect(result).toBe(expected);
    });
  });
});
