import { Test, TestingModule } from '@nestjs/testing';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { RemoteType, JobStatus, Priority } from '@prisma/client';

describe('JobsController', () => {
  let controller: JobsController;
  let service: JobsService;

  const mockJobsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    updateStatus: jest.fn(),
    updatePriority: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [JobsController],
      providers: [
        { provide: JobsService, useValue: mockJobsService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<JobsController>(JobsController);
    service = module.get<JobsService>(JobsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'user-uuid' };
  const jobId = 'job-uuid';

  describe('create', () => {
    it('should call service.create with authenticated user ID (user isolation)', async () => {
      const dto = { title: 'Engineer', remoteType: RemoteType.REMOTE, status: JobStatus.WISHLIST, priority: Priority.MEDIUM };
      const expected = { id: jobId, ...dto, userId: user.id };
      jest.spyOn(service, 'create').mockResolvedValue(expected as any);

      const result = await controller.create(user, dto);

      expect(service.create).toHaveBeenCalledWith(user.id, dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with user ID and query parameters', async () => {
      const query = { page: 1, limit: 10 };
      const expected = { items: [], meta: { total: 0, page: 1, limit: 10, totalPages: 0 } };
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.findAll(user, query as any);

      expect(service.findAll).toHaveBeenCalledWith(user.id, query);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with user ID and job ID (user isolation)', async () => {
      const expected = { id: jobId, title: 'Engineer', userId: user.id };
      jest.spyOn(service, 'findOne').mockResolvedValue(expected as any);

      const result = await controller.findOne(user, jobId);

      expect(service.findOne).toHaveBeenCalledWith(user.id, jobId);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with user ID, job ID, and dto (user isolation)', async () => {
      const dto = { title: 'Lead Engineer' };
      const expected = { id: jobId, title: 'Lead Engineer', userId: user.id };
      jest.spyOn(service, 'update').mockResolvedValue(expected as any);

      const result = await controller.update(user, jobId, dto);

      expect(service.update).toHaveBeenCalledWith(user.id, jobId, dto);
      expect(result).toBe(expected);
    });
  });

  describe('updateStatus', () => {
    it('should call service.updateStatus with user ID, job ID, and status dto (user isolation)', async () => {
      const dto = { status: JobStatus.INTERVIEW };
      const expected = { id: jobId, status: JobStatus.INTERVIEW, userId: user.id };
      jest.spyOn(service, 'updateStatus').mockResolvedValue(expected as any);

      const result = await controller.updateStatus(user, jobId, dto);

      expect(service.updateStatus).toHaveBeenCalledWith(user.id, jobId, dto);
      expect(result).toBe(expected);
    });
  });

  describe('updatePriority', () => {
    it('should call service.updatePriority with user ID, job ID, and priority dto (user isolation)', async () => {
      const dto = { priority: Priority.URGENT };
      const expected = { id: jobId, priority: Priority.URGENT, userId: user.id };
      jest.spyOn(service, 'updatePriority').mockResolvedValue(expected as any);

      const result = await controller.updatePriority(user, jobId, dto);

      expect(service.updatePriority).toHaveBeenCalledWith(user.id, jobId, dto);
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with user ID and job ID (user isolation)', async () => {
      const expected = { success: true };
      jest.spyOn(service, 'remove').mockResolvedValue(expected as any);

      const result = await controller.remove(user, jobId);

      expect(service.remove).toHaveBeenCalledWith(user.id, jobId);
      expect(result).toBe(expected);
    });
  });
});
