import { Global, Module } from '@nestjs/common';
import { QueueService } from './queue.service';
import { EmailProcessor } from './email.processor';
import { ReminderProcessor } from './reminder.processor';

@Global()
@Module({
  providers: [QueueService, EmailProcessor, ReminderProcessor],
  exports: [QueueService],
})
export class QueueModule {}
