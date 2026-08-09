import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue } from 'bullmq';
import { RedisService } from '../../shared/services/redis.service';
import { EmailJobData } from './processors/email.processor';

@Injectable()
export class QueueService implements OnModuleInit {
  private readonly logger = new Logger(QueueService.name);
  private emailQueue!: Queue;
  private reminderQueue!: Queue;

  constructor(private redisService: RedisService) {}

  async onModuleInit() {
    const connection = this.redisService.getClient();

    this.emailQueue = new Queue('email.queue', {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 100 },
      },
    });

    this.reminderQueue = new Queue('reminder.queue', {
      connection,
      defaultJobOptions: {
        removeOnComplete: { count: 100 },
        removeOnFail: { count: 100 },
      },
    });

    try {
      await this.reminderQueue.upsertJobScheduler(
        'daily-reminder-check-scheduler',
        {
          pattern: '0 0 * * *',
        },
        {
          name: 'daily-reminder-check',
          data: {},
        },
      );
      this.logger.log('Daily repeatable reminder check job scheduled successfully');
    } catch (err) {
      this.logger.error(`Failed to schedule repeatable daily reminder check job: ${(err as Error).message}`);
    }
  }

  async addEmailJob(data: EmailJobData) {
    if (!this.redisService.isAlive()) {
      this.logger.error('Failed to queue email job: Redis connection is down');
      throw new Error('Email queue is currently unavailable. Please try again later.');
    }

    try {
      return await this.emailQueue.add('send-email', data, {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
      });
    } catch (error) {
      this.logger.error(`Error adding email job: ${(error as Error).message}`);
      throw error;
    }
  }

  async addReminderCheckJob() {
    if (!this.redisService.isAlive()) {
      throw new Error('Reminder queue is currently unavailable.');
    }

    try {
      return await this.reminderQueue.add('daily-reminder-check', {});
    } catch (error) {
      this.logger.error(`Error adding reminder check job: ${(error as Error).message}`);
      throw error;
    }
  }

  getEmailQueueState() {
    return {
      name: 'email.queue',
      isReady: this.redisService.isAlive(),
    };
  }

  getReminderQueueState() {
    return {
      name: 'reminder.queue',
      isReady: this.redisService.isAlive(),
    };
  }
}
