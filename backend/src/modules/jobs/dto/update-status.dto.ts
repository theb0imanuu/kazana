import { IsEnum, IsNotEmpty } from 'class-validator';
import { JobStatus } from '@prisma/client';

export class UpdateStatusDto {
  @IsNotEmpty({ message: 'Job status is required' })
  @IsEnum(JobStatus, { message: 'Job status must be a valid status' })
  status!: JobStatus;
}
