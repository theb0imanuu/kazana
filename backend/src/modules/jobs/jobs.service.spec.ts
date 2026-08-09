import { Test, TestingModule } from '@nestjs/testing';
import { JobsService } from './jobs.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { RemoteType, JobStatus, Priority } from '@prisma/client';

describe('JobsService', () => {
  let service: JobsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    company: {
      findFirst: jest.fn(),
    },
    job: {
      create: jest.fn(),
      count: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
    activity: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JobsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<JobsService>(JobsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-uuid';
  const jobId = 'job-uuid';
  const companyId = 'company-uuid';

  describe('create', () => {
    const createDto = {
      title: 'Frontend Engineer',
      remoteType: RemoteType.REMOTE,
      status: JobStatus.WISHLIST,
      priority: Priority.MEDIUM,
      companyId,
    };

    it('should create a job and create an activity log when company exists', async () => {
      const company = { id: companyId, name: 'Acme Corp', userId };
      const job = { id: jobId, ...createDto, userId };

      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(company);
      jest.spyOn(prisma.job, 'create').mockResolvedValue(job as any);
      jest.spyOn(prisma.activity, 'create').mockResolvedValue({} as any);

      const result = await service.create(userId, createDto);

      expect(prisma.company.findFirst).toHaveBeenCalledWith({ where: { id: companyId, userId } });
      expect(prisma.job.create).toHaveBeenCalled();
      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: {
          type: 'STATUS_CHANGE',
          content: 'Job created with status: WISHLIST',
          metadata: { newStatus: JobStatus.WISHLIST },
          userId,
          jobId,
        },
      });
      expect(result).toBe(job);
    });

    it('should throw NotFoundException if companyId does not exist or belong to user', async () => {
      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(null);

      await expect(service.create(userId, createDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const queryDto = {
      page: 1,
      limit: 10,
      search: 'Frontend',
      status: JobStatus.WISHLIST,
    };

    it('should query jobs using filters, search, and pagination limits', async () => {
      const items = [{ id: jobId, title: 'Frontend Engineer', userId }];
      jest.spyOn(prisma.job, 'count').mockResolvedValue(1);
      jest.spyOn(prisma.job, 'findMany').mockResolvedValue(items as any);

      const result = await service.findAll(userId, queryDto);

      expect(prisma.job.count).toHaveBeenCalled();
      expect(prisma.job.findMany).toHaveBeenCalledWith(expect.objectContaining({
        skip: 0,
        take: 10,
        where: expect.objectContaining({
          userId,
          status: JobStatus.WISHLIST,
          OR: expect.any(Array),
        }),
      }));
      expect(result).toEqual({
        items,
        meta: {
          total: 1,
          page: 1,
          limit: 10,
          totalPages: 1,
        },
      });
    });
  });

  describe('update', () => {
    const updateDto = {
      title: 'Senior Frontend Engineer',
      status: JobStatus.APPLIED,
    };

    it('should update job and generate a STATUS_CHANGE activity log if status changed', async () => {
      const existing = { id: jobId, title: 'Frontend Engineer', status: JobStatus.WISHLIST, userId, companyId: null };
      const updated = { ...existing, ...updateDto };

      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.job, 'update').mockResolvedValue(updated as any);
      jest.spyOn(prisma.activity, 'create').mockResolvedValue({} as any);

      const result = await service.update(userId, jobId, updateDto);

      expect(prisma.job.findFirst).toHaveBeenCalledWith({ where: { id: jobId, userId } });
      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: {
          type: 'STATUS_CHANGE',
          content: 'Job status updated from WISHLIST to APPLIED',
          metadata: { oldStatus: JobStatus.WISHLIST, newStatus: JobStatus.APPLIED },
          userId,
          jobId,
        },
      });
      expect(prisma.job.update).toHaveBeenCalled();
      expect(result).toBe(updated);
    });

    it('should not write activity logs if status is unchanged', async () => {
      const existing = { id: jobId, title: 'Frontend Engineer', status: JobStatus.WISHLIST, userId, companyId: null };
      const updated = { ...existing, title: 'New Title Only' };

      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.job, 'update').mockResolvedValue(updated as any);

      await service.update(userId, jobId, { title: 'New Title Only' });

      expect(prisma.activity.create).not.toHaveBeenCalled();
      expect(prisma.job.update).toHaveBeenCalled();
    });

    it('should throw NotFoundException if job not found or belongs to another user', async () => {
      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(null);

      await expect(service.update(userId, jobId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });
});
