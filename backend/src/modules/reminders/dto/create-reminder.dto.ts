import { IsBoolean, IsDateString, IsOptional, IsString, IsUUID, MaxLength, MinLength } from 'class-validator';
export class CreateReminderDto {
  @IsString() @MinLength(1) @MaxLength(255) title!: string;
  @IsDateString() dueAt!: string;
  @IsOptional() @IsBoolean() completed?: boolean;
  @IsUUID() jobId!: string;
}
