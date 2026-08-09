import { IsEnum, IsNotEmpty, IsOptional, IsString, IsISO8601, IsUUID, IsUrl, IsNumber } from 'class-validator';
import { RemoteType, JobStatus, Priority } from '@prisma/client';

export class CreateJobDto {
  @IsNotEmpty({ message: 'Job title is required' })
  @IsString({ message: 'Job title must be a string' })
  title!: string;

  @IsOptional()
  @IsString({ message: 'Description must be a string' })
  description?: string;

  @IsOptional()
  @IsUrl({}, { message: 'URL must be a valid URL' })
  url?: string;

  @IsOptional()
  @IsNumber({}, { message: 'Minimum salary must be a number' })
  salaryMin?: number;

  @IsOptional()
  @IsNumber({}, { message: 'Maximum salary must be a number' })
  salaryMax?: number;

  @IsOptional()
  @IsString({ message: 'Salary currency must be a string' })
  salaryCurrency?: string;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsNotEmpty({ message: 'Remote type is required' })
  @IsEnum(RemoteType, { message: 'Remote type must be ONSITE, HYBRID, or REMOTE' })
  remoteType!: RemoteType;

  @IsNotEmpty({ message: 'Job status is required' })
  @IsEnum(JobStatus, { message: 'Job status must be a valid status' })
  status!: JobStatus;

  @IsNotEmpty({ message: 'Priority is required' })
  @IsEnum(Priority, { message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' })
  priority!: Priority;

  @IsOptional()
  @IsISO8601({}, { message: 'Applied date must be a valid ISO 8601 date string' })
  appliedAt?: string;

  @IsOptional()
  @IsUUID('4', { message: 'Company ID must be a valid UUID' })
  companyId?: string;
}
