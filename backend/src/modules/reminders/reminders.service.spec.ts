import { Test, TestingModule } from '@nestjs/testing';
import { RemindersService } from './reminders.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('RemindersService', () => {
  let service: RemindersService;
  let prisma: PrismaService;

  const mockPrismaService = {
    job: {
      findFirst: jest.fn(),
    },
    reminder: {
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
        RemindersService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<RemindersService>(RemindersService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-uuid';
  const jobId = 'job-uuid';
  const reminderId = 'reminder-uuid';

  describe('create', () => {
    const dto = {
      title: 'Send follow up',
      dueAt: new Date().toISOString(),
      jobId,
    };

    it('should create a reminder and write a REMINDER_CREATED activity if job belongs to user', async () => {
      const job = { id: jobId, title: 'Engineer', userId };
      const createdReminder = { id: reminderId, ...dto, completed: false };

      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(job as any);
      jest.spyOn(prisma.reminder, 'create').mockResolvedValue(createdReminder as any);
      jest.spyOn(prisma.activity, 'create').mockResolvedValue({} as any);

      const result = await service.create(userId, dto);

      expect(prisma.job.findFirst).toHaveBeenCalledWith({ where: { id: jobId, userId } });
      expect(prisma.reminder.create).toHaveBeenCalled();
      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: {
          type: 'REMINDER_CREATED',
          content: expect.stringContaining('Reminder scheduled: "Send follow up" due by'),
          metadata: {
            reminderId,
            title: dto.title,
            dueAt: dto.dueAt,
          },
          userId,
          jobId,
        },
      });
      expect(result).toBe(createdReminder);
    });

    it('should throw NotFoundException if job does not exist or belong to user', async () => {
      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    const query = {
      completed: true,
      jobId,
      dueBefore: new Date().toISOString(),
    };

    it('should query reminders using completed, job, and due date filters', async () => {
      const list = [{ id: reminderId, title: 'Send follow up', completed: true, jobId }];
      jest.spyOn(prisma.reminder, 'findMany').mockResolvedValue(list as any);

      const result = await service.findAll(userId, query);

      expect(prisma.reminder.findMany).toHaveBeenCalledWith({
        where: expect.objectContaining({
          job: { userId },
          completed: true,
          jobId,
          dueAt: expect.any(Object),
        }),
        include: { job: true },
        orderBy: { dueAt: 'asc' },
      });
      expect(result).toBe(list);
    });
  });

  describe('findOne', () => {
    it('should return a reminder if ownership matches', async () => {
      const reminder = { id: reminderId, title: 'Follow up', jobId };
      jest.spyOn(prisma.reminder, 'findFirst').mockResolvedValue(reminder as any);

      const result = await service.findOne(userId, reminderId);

      expect(prisma.reminder.findFirst).toHaveBeenCalledWith({
        where: { id: reminderId, job: { userId } },
        include: { job: true },
      });
      expect(result).toBe(reminder);
    });

    it('should throw NotFoundException if reminder not found', async () => {
      jest.spyOn(prisma.reminder, 'findFirst').mockResolvedValue(null);

      await expect(service.findOne(userId, reminderId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { title: 'Follow up tomorrow' };

    it('should update reminder if ownership matches', async () => {
      const existing = { id: reminderId, title: 'Follow up', jobId };
      const updated = { ...existing, ...updateDto };

      jest.spyOn(prisma.reminder, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.reminder, 'update').mockResolvedValue(updated as any);

      const result = await service.update(userId, reminderId, updateDto);

      expect(prisma.reminder.findFirst).toHaveBeenCalledWith({ where: { id: reminderId, job: { userId } } });
      expect(prisma.reminder.update).toHaveBeenCalled();
      expect(result).toBe(updated);
    });
  });

  describe('complete', () => {
    it('should update completed status to true', async () => {
      const existing = { id: reminderId, title: 'Follow up', jobId, completed: false };
      const updated = { ...existing, completed: true };

      jest.spyOn(prisma.reminder, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.reminder, 'update').mockResolvedValue(updated as any);

      const result = await service.complete(userId, reminderId);

      expect(prisma.reminder.update).toHaveBeenCalledWith(expect.objectContaining({
        where: { id: reminderId },
        data: expect.objectContaining({ completed: true }),
      }));
      expect(result.completed).toBe(true);
    });
  });

  describe('remove', () => {
    it('should delete reminder if ownership matches', async () => {
      const existing = { id: reminderId, jobId };
      jest.spyOn(prisma.reminder, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.reminder, 'delete').mockResolvedValue(existing as any);

      const result = await service.remove(userId, reminderId);

      expect(prisma.reminder.findFirst).toHaveBeenCalledWith({ where: { id: reminderId, job: { userId } } });
      expect(prisma.reminder.delete).toHaveBeenCalledWith({ where: { id: reminderId } });
      expect(result).toEqual({ success: true });
    });
  });
});
