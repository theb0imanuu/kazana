import { Controller, Get, Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { validate } from './config/configuration';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { QueuesModule } from './modules/queues/queues.module';
import { RedisService } from './shared/services/redis.service';
import { QueueService } from './modules/queues/queue.service';

@Controller('health')
export class HealthController {
  constructor(
    private readonly redisService: RedisService,
    private readonly queueService: QueueService,
  ) {}

  @Get()
  check() {
    const redisAlive = this.redisService.isAlive();
    return {
      status: redisAlive ? 'ok' : 'degraded',
      timestamp: new Date().toISOString(),
      redis: {
        status: redisAlive ? 'connected' : 'disconnected',
      },
      queues: {
        email: this.queueService.getEmailQueueState(),
        reminder: this.queueService.getReminderQueueState(),
      },
    };
  }
}

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate,
    }),
    PrismaModule,
    AuthModule,
    UsersModule,
    CompaniesModule,
    JobsModule,
    ContactsModule,
    InterviewsModule,
    DocumentsModule,
    ActivitiesModule,
    RemindersModule,
    TemplatesModule,
    QueuesModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
