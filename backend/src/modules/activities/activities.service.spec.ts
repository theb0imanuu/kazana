import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesService } from './activities.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { ActivityType } from '@prisma/client';

describe('ActivitiesService', () => {
  let service: ActivitiesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    job: {
      findFirst: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
      create: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ActivitiesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ActivitiesService>(ActivitiesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-uuid';
  const jobId = 'job-uuid';

  describe('findAll', () => {
    it('should return all activities of the user', async () => {
      const list = [{ id: 'act-1', type: ActivityType.STATUS_CHANGE, userId }];
      jest.spyOn(prisma.activity, 'findMany').mockResolvedValue(list as any);

      const result = await service.findAll(userId);

      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toBe(list);
    });
  });

  describe('findAllByJob', () => {
    it('should return activities for a job when job belongs to user', async () => {
      const job = { id: jobId, userId };
      const list = [{ id: 'act-1', type: ActivityType.NOTE, jobId, userId }];

      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(job as any);
      jest.spyOn(prisma.activity, 'findMany').mockResolvedValue(list as any);

      const result = await service.findAllByJob(userId, jobId);

      expect(prisma.job.findFirst).toHaveBeenCalledWith({ where: { id: jobId, userId } });
      expect(prisma.activity.findMany).toHaveBeenCalledWith({
        where: { jobId, userId },
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toBe(list);
    });

    it('should throw NotFoundException if job does not exist or belong to user', async () => {
      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(null);

      await expect(service.findAllByJob(userId, jobId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('createNote', () => {
    const dto = { content: 'This is a test note', jobId };

    it('should create note when associated job belongs to user', async () => {
      const job = { id: jobId, userId };
      const createdNote = { id: 'act-1', type: ActivityType.NOTE, content: dto.content, jobId, userId };

      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(job as any);
      jest.spyOn(prisma.activity, 'create').mockResolvedValue(createdNote as any);

      const result = await service.createNote(userId, dto);

      expect(prisma.job.findFirst).toHaveBeenCalledWith({ where: { id: jobId, userId } });
      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: {
          type: 'NOTE',
          content: dto.content,
          userId,
          jobId,
        },
      });
      expect(result).toBe(createdNote);
    });

    it('should throw NotFoundException if job does not belong to user during note creation', async () => {
      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(null);

      await expect(service.createNote(userId, dto)).rejects.toThrow(NotFoundException);
    });
  });
});
