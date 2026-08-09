import { IsBoolean, IsISO8601, IsOptional, IsUUID } from 'class-validator';
import { Transform } from 'class-transformer';

export class RemindersQueryDto {
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  completed?: boolean;

  @IsOptional()
  @IsISO8601()
  dueBefore?: string;

  @IsOptional()
  @IsISO8601()
  dueAfter?: string;

  @IsOptional()
  @IsUUID('4')
  jobId?: string;
}
