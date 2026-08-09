import { Test, TestingModule } from '@nestjs/testing';
import { QueueService } from './queue.service';
import { RedisService } from '../../shared/services/redis.service';
import { Queue } from 'bullmq';

jest.mock('bullmq', () => {
  return {
    Queue: jest.fn().mockImplementation(() => {
      return {
        add: jest.fn().mockResolvedValue({ id: 'job-id' }),
        upsertJobScheduler: jest.fn().mockResolvedValue({}),
      };
    }),
  };
});

describe('QueueService', () => {
  let service: QueueService;
  let redisService: RedisService;

  const mockRedis = {
    set: jest.fn().mockResolvedValue('OK'),
  };

  const mockRedisService = {
    getClient: jest.fn(() => mockRedis),
    isAlive: jest.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        QueueService,
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    service = module.get<QueueService>(QueueService);
    redisService = module.get<RedisService>(RedisService);
    await service.onModuleInit();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('addEmailJob', () => {
    const jobData = {
      recipient: 'user@example.com',
      subject: 'Test Subject',
      template: 'Hello User',
      jobId: 'job-123',
    };

    it('should add job to queue if Redis is alive', async () => {
      jest.spyOn(redisService, 'isAlive').mockReturnValue(true);

      const result = await service.addEmailJob(jobData);
      expect(result).toBeDefined();
      expect(result.id).toBe('job-id');
    });

    it('should throw an error if Redis is not alive', async () => {
      jest.spyOn(redisService, 'isAlive').mockReturnValue(false);

      await expect(service.addEmailJob(jobData)).rejects.toThrow(
        'Email queue is currently unavailable. Please try again later.',
      );
    });
  });

  describe('addReminderCheckJob', () => {
    it('should add reminder check job to queue if Redis is alive', async () => {
      jest.spyOn(redisService, 'isAlive').mockReturnValue(true);

      const result = await service.addReminderCheckJob();
      expect(result).toBeDefined();
    });

    it('should throw an error if Redis is not alive', async () => {
      jest.spyOn(redisService, 'isAlive').mockReturnValue(false);

      await expect(service.addReminderCheckJob()).rejects.toThrow(
        'Reminder queue is currently unavailable.',
      );
    });
  });

  describe('health checks', () => {
    it('should return correct health structures for email and reminder queues', () => {
      jest.spyOn(redisService, 'isAlive').mockReturnValue(true);

      expect(service.getEmailQueueState()).toEqual({
        name: 'email.queue',
        isReady: true,
      });

      expect(service.getReminderQueueState()).toEqual({
        name: 'reminder.queue',
        isReady: true,
      });
    });
  });
});
