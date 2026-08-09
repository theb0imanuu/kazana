import { IsBoolean, IsISO8601, IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateReminderDto {
  @IsNotEmpty({ message: 'Reminder title is required' })
  @IsString({ message: 'Reminder title must be a string' })
  title!: string;

  @IsNotEmpty({ message: 'Due date is required' })
  @IsISO8601({}, { message: 'Due date must be a valid ISO 8601 date string' })
  dueAt!: string;

  @IsOptional()
  @IsBoolean({ message: 'Completed must be a boolean' })
  completed?: boolean;

  @IsNotEmpty({ message: 'Job ID is required' })
  @IsUUID('4', { message: 'Job ID must be a valid UUID' })
  jobId!: string;
}
