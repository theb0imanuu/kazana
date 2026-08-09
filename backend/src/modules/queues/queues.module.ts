import { Global, Module } from '@nestjs/common';
import { RedisService } from '../../shared/services/redis.service';
import { QueueService } from './queue.service';
import { EmailProcessor } from './processors/email.processor';
import { ReminderProcessor } from './processors/reminder.processor';
import { PrismaModule } from '../../prisma/prisma.module';

@Global()
@Module({
  imports: [PrismaModule],
  providers: [
    RedisService,
    QueueService,
    EmailProcessor,
    ReminderProcessor,
  ],
  exports: [
    RedisService,
    QueueService,
  ],
})
export class QueuesModule {}
