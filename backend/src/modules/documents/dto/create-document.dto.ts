import { IsEnum, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @IsNotEmpty({ message: 'Document type is required' })
  @IsEnum(DocumentType, { message: 'Document type must be RESUME, COVER_LETTER, PORTFOLIO, or OTHER' })
  type!: DocumentType;

  @IsOptional()
  @IsUUID('4', { message: 'Job ID must be a valid UUID' })
  jobId?: string;
}
