import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Job, Worker } from 'bullmq';
import { ConfigService } from '@nestjs/config';
import IORedis from 'ioredis';
import { PrismaService } from '../../prisma/prisma.service';
import { REMINDER_DAILY_JOB, REMINDER_QUEUE } from './queue.constants';

@Injectable()
export class ReminderProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReminderProcessor.name);
  private worker?: Worker;

  constructor(
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
  ) {}

  onModuleInit(): void {
    const redisUrl = this.config.getOrThrow<string>('REDIS_URL');
    const connection = new IORedis(redisUrl, { maxRetriesPerRequest: null });

    this.worker = new Worker(
      REMINDER_QUEUE,
      async (job: Job) => {
        if (job.name !== REMINDER_DAILY_JOB) {
          return;
        }

        const due = await this.prisma.reminder.findMany({
          where: {
            completed: false,
            dueAt: { lte: new Date() },
          },
          include: {
            job: {
              select: {
                id: true,
                title: true,
                user: { select: { id: true, email: true, name: true } },
              },
            },
          },
          orderBy: { dueAt: 'asc' },
        });

        this.logger.log(`Reminder check found ${due.length} due reminder(s).`);
        for (const reminder of due) {
          this.logger.log(
            `Due reminder ${reminder.id}: "${reminder.title}" for ${reminder.job.user.email} / ${reminder.job.title}`,
          );
        }
      },
      { connection },
    );

    this.worker.on('failed', (job, error) => {
      this.logger.error(`Reminder job ${job?.id ?? 'unknown'} failed: ${error.message}`);
    });
  }

  async onModuleDestroy(): Promise<void> {
    await this.worker?.close();
  }
}
