import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateNoteDto {
  @IsNotEmpty({ message: 'Note content is required' })
  @IsString({ message: 'Note content must be a string' })
  content!: string;

  @IsOptional()
  @IsUUID('4', { message: 'Job ID must be a valid UUID' })
  jobId?: string;
}
