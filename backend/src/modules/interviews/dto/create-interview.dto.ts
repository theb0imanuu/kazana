import { IsArray, IsEnum, IsInt, IsOptional, IsString, IsUUID, Min } from 'class-validator';
import { InterviewStatus, InterviewType } from '@prisma/client';

export class CreateInterviewDto {
  @IsEnum(InterviewType) type!: InterviewType;
  @IsString() scheduledAt!: string;
  @IsInt() @Min(1) duration!: number;
  @IsOptional() @IsString() location?: string;
  @IsOptional() @IsString() notes?: string;
  @IsOptional() @IsEnum(InterviewStatus) status?: InterviewStatus;
  @IsUUID() jobId!: string;
  @IsOptional() @IsArray() @IsUUID('4', { each: true }) contactIds?: string[];
}
