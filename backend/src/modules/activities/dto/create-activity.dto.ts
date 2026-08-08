import { IsEnum, IsObject, IsOptional, IsString, IsUUID } from 'class-validator';
import { ActivityType } from '@prisma/client';
export class CreateActivityDto {
  @IsEnum(ActivityType) type!: ActivityType;
  @IsString() content!: string;
  @IsOptional() @IsObject() metadata?: Record<string, unknown>;
  @IsOptional() @IsUUID() jobId?: string;
}
