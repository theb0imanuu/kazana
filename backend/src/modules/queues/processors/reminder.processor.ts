import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { Worker, Job } from 'bullmq';
import { RedisService } from '../../../shared/services/redis.service';
import { PrismaService } from '../../../prisma/prisma.service';

@Injectable()
export class ReminderProcessor implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ReminderProcessor.name);
  private worker!: Worker;

  constructor(
    private redisService: RedisService,
    private prisma: PrismaService,
  ) {}

  onModuleInit() {
    const connection = this.redisService.getClient();

    this.worker = new Worker(
      'reminder.queue',
      async (job: Job) => {
        if (job.name === 'daily-reminder-check') {
          this.logger.log('Running daily reminder checks...');
          
          const now = new Date();
          const dueReminders = await this.prisma.reminder.findMany({
            where: {
              completed: false,
              dueAt: { lte: now },
            },
            include: {
              job: {
                include: {
                  user: true,
                },
              },
            },
          });

          this.logger.log(`Found ${dueReminders.length} due and incomplete reminders.`);

          let processedCount = 0;
          let skippedCount = 0;

          for (const reminder of dueReminders) {
            const lockKey = `reminder:processed:${reminder.id}`;
            let isNew = true;
            try {
              const res = await connection.set(lockKey, 'true', 'EX', 86400, 'NX') as string | null;
              isNew = res === 'OK';
            } catch (err) {
              this.logger.error(`Redis lock check failed for reminder ${reminder.id}: ${(err as Error).message}`);
            }

            if (!isNew) {
              skippedCount++;
              continue;
            }

            const userEmail = reminder.job?.user?.email || 'Unknown User';
            const jobTitle = reminder.job?.title || 'Unknown Job';

            this.logger.log(`[Notification Alert] Reminder ID: ${reminder.id}`);
            this.logger.log(`- Title: ${reminder.title}`);
            this.logger.log(`- Due At: ${reminder.dueAt}`);
            this.logger.log(`- User Recipient: ${userEmail}`);
            this.logger.log(`- Associated Job: ${jobTitle}`);

            processedCount++;
          }

          this.logger.log(`Finished checking due reminders. Processed: ${processedCount}, Skipped/Locked: ${skippedCount}`);
          return { processedCount, skippedCount };
        }

        return { success: true };
      },
      {
        connection,
        concurrency: 2,
      },
    );

    this.worker.on('completed', (job) => {
      this.logger.log(`Reminder repeatable Check Job completed successfully`);
    });

    this.worker.on('failed', (job, err) => {
      this.logger.error(`Reminder repeatable Check Job failed with error: ${err.message}`);
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
