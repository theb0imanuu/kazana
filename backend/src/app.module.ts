import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import * as Joi from 'joi';
import databaseConfig from './config/database.config';
import azureConfig from './config/azure.config';
import jwtConfig from './config/jwt.config';
import { PrismaModule } from './prisma/prisma.module';
import { QueueModule } from './shared/queues/queue.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { JobsModule } from './modules/jobs/jobs.module';
import { CompaniesModule } from './modules/companies/companies.module';
import { ContactsModule } from './modules/contacts/contacts.module';
import { InterviewsModule } from './modules/interviews/interviews.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { ActivitiesModule } from './modules/activities/activities.module';
import { RemindersModule } from './modules/reminders/reminders.module';
import { TemplatesModule } from './modules/templates/templates.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [databaseConfig, azureConfig, jwtConfig],
      validationSchema: Joi.object({
        NODE_ENV: Joi.string().valid('development', 'test', 'production').default('development'),
        PORT: Joi.number().port().default(3000),
        CORS_ORIGIN: Joi.string().default('http://localhost:5173'),
        DATABASE_URL: Joi.string().uri({ scheme: ['postgresql', 'postgres'] }).required(),
        JWT_SECRET: Joi.string().min(32).required(),
        JWT_EXPIRES_IN: Joi.string().default('7d'),
        REDIS_URL: Joi.string().uri({ scheme: ['redis', 'rediss'] }).required(),
        AZURE_STORAGE_CONNECTION_STRING: Joi.string().allow('').default(''),
        AZURE_STORAGE_CONTAINER: Joi.string().default('documents'),
        MAX_UPLOAD_SIZE_BYTES: Joi.number().integer().positive().default(10485760),
      }),
    }),
    PrismaModule,
    QueueModule,
    AuthModule,
    UsersModule,
    JobsModule,
    CompaniesModule,
    ContactsModule,
    InterviewsModule,
    DocumentsModule,
    ActivitiesModule,
    RemindersModule,
    TemplatesModule,
    AnalyticsModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
