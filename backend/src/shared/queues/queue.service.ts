import { Injectable, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Queue } from 'bullmq';
import IORedis from 'ioredis';
import { EMAIL_QUEUE, REMINDER_DAILY_JOB, REMINDER_QUEUE } from './queue.constants';

@Injectable()
export class QueueService implements OnModuleDestroy {
  private readonly connection: IORedis;
  readonly emailQueue: Queue;
  readonly reminderQueue: Queue;

  constructor(private readonly config: ConfigService) {
    const redisUrl = this.config.getOrThrow<string>('REDIS_URL');
    this.connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

    this.emailQueue = new Queue(EMAIL_QUEUE, { connection: this.connection });
    this.reminderQueue = new Queue(REMINDER_QUEUE, { connection: this.connection });
  }

  async scheduleDailyReminderCheck(): Promise<void> {
    await this.reminderQueue.add(
      REMINDER_DAILY_JOB,
      {},
      {
        repeat: { every: 24 * 60 * 60 * 1000 },
        jobId: REMINDER_DAILY_JOB,
        removeOnComplete: 100,
        removeOnFail: 100,
      },
    );
  }

  async onModuleDestroy(): Promise<void> {
    await Promise.all([this.emailQueue.close(), this.reminderQueue.close()]);
    await this.connection.quit();
  }
}
