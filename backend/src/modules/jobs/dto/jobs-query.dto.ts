import { IsEnum, IsOptional, IsString, IsUUID, IsInt, Min, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';
import { RemoteType, JobStatus, Priority } from '@prisma/client';

export class JobsQueryDto {
  @IsOptional()
  @IsString()
  search?: string;

  @IsOptional()
  @IsEnum(RemoteType)
  remoteType?: RemoteType;

  @IsOptional()
  @IsEnum(JobStatus)
  status?: JobStatus;

  @IsOptional()
  @IsEnum(Priority)
  priority?: Priority;

  @IsOptional()
  @IsString()
  location?: string;

  @IsOptional()
  @IsUUID('4')
  companyId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  minSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  maxSalary?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 10;
}
