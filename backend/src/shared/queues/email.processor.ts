import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import IORedis from 'ioredis';
import { ConfigService } from '@nestjs/config';
import { EMAIL_QUEUE } from './queue.constants';

export interface EmailJobPayload {
  to: string;
  subject: string;
  body: string;
}

@Injectable()
export class EmailProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name);
  private worker?: Worker;

  constructor(private readonly config: ConfigService) {}

  onModuleInit(): void {
    const redisUrl = this.config.getOrThrow<string>('REDIS_URL');
    const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

    this.worker = new Worker(
      EMAIL_QUEUE,
      async (job: Job<EmailJobPayload>) => {
        this.logger.log(
          `[mock email] to=${job.data.to} subject="${job.data.subject}" bodyLength=${job.data.body.length}`,
        );
      },
      { connection },
    );

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Email job ${job?.id ?? 'unknown'} failed: ${error.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
