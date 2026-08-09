import { Module } from '@nestjs/common';
import { JobsController } from './jobs.controller';
import { JobsService } from './jobs.service';
import { PrismaModule } from '../../prisma/prisma.module';
import { ActivitiesModule } from '../activities/activities.module';

@Module({
  imports: [PrismaModule, ActivitiesModule],
  controllers: [JobsController],
  providers: [JobsService],
  exports: [JobsService],
})
export class JobsModule {}
