import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { RedisService } from '../../../shared/services/redis.service';

export interface EmailJobData {
  recipient: string;
  subject: string;
  template: string;
  jobId?: string;
}

@Injectable()
export class EmailProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmailProcessor.name);
  private worker!: Worker;

  constructor(private redisService: RedisService) {}

  onModuleInit() {
    const connection = this.redisService.getClient();

    this.worker = new Worker<EmailJobData>(
      'email.queue',
      async (job: Job<EmailJobData>) => {
        const { recipient, subject, template, jobId } = job.data;
        this.logger.log(`Processing Email Job #${job.id}:`);
        this.logger.log(`- Recipient: ${recipient}`);
        this.logger.log(`- Subject: ${subject}`);
        this.logger.log(`- Job ID: ${jobId || 'N/A'}`);
        this.logger.log(`- Template Body Preview: ${template.substring(0, 100)}...`);

        return { success: true, loggedAt: new Date().toISOString() };
      },
      {
        connection,
        concurrency: 5,
        limiter: {
          max: 10,
          duration: 1000,
        },
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Email Job #${job?.id} completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Email Job #${job?.id} failed with error: ${err.message}`);
    });

    this.worker.on('error', (err) => {
      this.logger.error(`Worker error: ${err.message}`);
    });
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
    }
  }
}
