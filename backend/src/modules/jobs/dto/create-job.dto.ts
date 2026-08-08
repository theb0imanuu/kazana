import { IsDateString, IsEnum, IsInt, IsNumber, IsOptional, IsString, IsUrl, MaxLength, Min, MinLength } from 'class-validator';
import { JobStatus, Priority, RemoteType } from '@prisma/client';

export class CreateJobDto {
  @IsString() @MinLength(1) @MaxLength(200) title!: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsUrl() url?: string;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) salaryMin?: number;
  @IsOptional() @IsNumber({ maxDecimalPlaces: 2 }) @Min(0) salaryMax?: number;
  @IsOptional() @IsString() @MaxLength(3) salaryCurrency?: string;
  @IsOptional() @IsString() @MaxLength(200) location?: string;
  @IsOptional() @IsEnum(RemoteType) remoteType?: RemoteType;
  @IsOptional() @IsEnum(JobStatus) status?: JobStatus;
  @IsOptional() @IsEnum(Priority) priority?: Priority;
  @IsOptional() @IsDateString() appliedAt?: string;
  @IsString() companyId!: string;
}
