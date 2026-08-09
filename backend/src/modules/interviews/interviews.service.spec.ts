import { Test, TestingModule } from '@nestjs/testing';
import { InterviewsService } from './interviews.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { InterviewType, InterviewStatus } from '@prisma/client';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    job: {
      findFirst: jest.fn(),
    },
    contact: {
      findFirst: jest.fn(),
    },
    interview: {
      create: jest.fn(),
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
        InterviewsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-uuid';
  const jobId = 'job-uuid';
  const contactId = 'contact-uuid';
  const interviewId = 'interview-uuid';

  describe('create', () => {
    const dto = {
      type: InterviewType.VIDEO,
      scheduledAt: new Date().toISOString(),
      duration: 45,
      location: 'Zoom',
      notes: 'Technical round',
      status: InterviewStatus.SCHEDULED,
      jobId,
      contactId,
    };

    it('should create interview and activity log when job and contact exist and belong to user', async () => {
      const job = { id: jobId, title: 'Engineer', userId };
      const contact = { id: contactId, name: 'John Doe', userId };
      const createdInterview = { id: interviewId, ...dto };

      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(job as any);
      jest.spyOn(prisma.contact, 'findFirst').mockResolvedValue(contact as any);
      jest.spyOn(prisma.interview, 'create').mockResolvedValue(createdInterview as any);
      jest.spyOn(prisma.activity, 'create').mockResolvedValue({} as any);

      const result = await service.create(userId, dto);

      expect(prisma.job.findFirst).toHaveBeenCalledWith({ where: { id: jobId, userId } });
      expect(prisma.contact.findFirst).toHaveBeenCalledWith({ where: { id: contactId, userId } });
      expect(prisma.interview.create).toHaveBeenCalled();
      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: {
          type: 'INTERVIEW_SCHEDULED',
          content: expect.stringContaining('Interview (VIDEO) scheduled for'),
          metadata: {
            interviewId,
            scheduledAt: dto.scheduledAt,
            type: dto.type,
          },
          userId,
          jobId,
        },
      });
      expect(result).toBe(createdInterview);
    });

    it('should throw NotFoundException if job does not exist or belong to user', async () => {
      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
    });

    it('should throw NotFoundException if contact does not exist or belong to user', async () => {
      const job = { id: jobId, title: 'Engineer', userId };
      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(job as any);
      jest.spyOn(prisma.contact, 'findFirst').mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should list all interviews associated with the user\'s jobs', async () => {
      const list = [{ id: interviewId, type: InterviewType.VIDEO }];
      jest.spyOn(prisma.interview, 'findMany').mockResolvedValue(list as any);

      const result = await service.findAll(userId);

      expect(prisma.interview.findMany).toHaveBeenCalledWith({
        where: { job: { userId } },
        include: { job: true, contact: true },
        orderBy: { scheduledAt: 'desc' },
      });
      expect(result).toEqual(list);
    });
  });

  describe('findOne', () => {
    it('should return the interview if it belongs to user\'s jobs', async () => {
      const interview = { id: interviewId, type: InterviewType.VIDEO };
      jest.spyOn(prisma.interview, 'findFirst').mockResolvedValue(interview as any);

      const result = await service.findOne(userId, interviewId);

      expect(prisma.interview.findFirst).toHaveBeenCalledWith({
        where: { id: interviewId, job: { userId } },
        include: { job: true, contact: true },
      });
      expect(result).toBe(interview);
    });

    it('should throw NotFoundException if interview not found', async () => {
      jest.spyOn(prisma.interview, 'findFirst').mockResolvedValue(null);

      await expect(service.findOne(userId, interviewId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { notes: 'Updated notes' };

    it('should update and return interview if it belongs to user\'s jobs', async () => {
      const existing = { id: interviewId, type: InterviewType.VIDEO, jobId, contactId: null };
      const updated = { ...existing, ...updateDto };

      jest.spyOn(prisma.interview, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.interview, 'update').mockResolvedValue(updated as any);

      const result = await service.update(userId, interviewId, updateDto);

      expect(prisma.interview.findFirst).toHaveBeenCalledWith({ where: { id: interviewId, job: { userId } } });
      expect(prisma.interview.update).toHaveBeenCalled();
      expect(result).toBe(updated);
    });

    it('should throw NotFoundException if interview not found during update', async () => {
      jest.spyOn(prisma.interview, 'findFirst').mockResolvedValue(null);

      await expect(service.update(userId, interviewId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete interview if it belongs to user\'s jobs', async () => {
      const existing = { id: interviewId, jobId };
      jest.spyOn(prisma.interview, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.interview, 'delete').mockResolvedValue(existing as any);

      const result = await service.remove(userId, interviewId);

      expect(prisma.interview.findFirst).toHaveBeenCalledWith({ where: { id: interviewId, job: { userId } } });
      expect(prisma.interview.delete).toHaveBeenCalledWith({ where: { id: interviewId } });
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if interview not found during delete', async () => {
      jest.spyOn(prisma.interview, 'findFirst').mockResolvedValue(null);

      await expect(service.remove(userId, interviewId)).rejects.toThrow(NotFoundException);
    });
  });
});
