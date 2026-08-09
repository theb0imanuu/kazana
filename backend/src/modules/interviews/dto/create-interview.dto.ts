import { IsEnum, IsNotEmpty, IsOptional, IsString, IsInt, Min, IsUUID, IsISO8601 } from 'class-validator';
import { InterviewType, InterviewStatus } from '@prisma/client';

export class CreateInterviewDto {
  @IsNotEmpty({ message: 'Interview type is required' })
  @IsEnum(InterviewType, { message: 'Interview type must be PHONE, VIDEO, ONSITE, or TAKEHOME' })
  type!: InterviewType;

  @IsNotEmpty({ message: 'Scheduled date is required' })
  @IsISO8601({}, { message: 'Scheduled date must be a valid ISO 8601 date string' })
  scheduledAt!: string;

  @IsOptional()
  @IsInt({ message: 'Duration must be an integer' })
  @Min(1, { message: 'Duration must be at least 1 minute' })
  duration?: number;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @IsNotEmpty({ message: 'Interview status is required' })
  @IsEnum(InterviewStatus, { message: 'Interview status must be SCHEDULED, COMPLETED, CANCELLED, or NO_SHOW' })
  status!: InterviewStatus;

  @IsNotEmpty({ message: 'Job ID is required' })
  @IsUUID('4', { message: 'Job ID must be a valid UUID' })
  jobId!: string;

  @IsOptional()
  @IsUUID('4', { message: 'Contact ID must be a valid UUID' })
  contactId?: string;
}
