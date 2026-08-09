import { IsEnum, IsNotEmpty } from 'class-validator';
import { Priority } from '@prisma/client';

export class UpdatePriorityDto {
  @IsNotEmpty({ message: 'Priority is required' })
  @IsEnum(Priority, { message: 'Priority must be LOW, MEDIUM, HIGH, or URGENT' })
  priority!: Priority;
}
