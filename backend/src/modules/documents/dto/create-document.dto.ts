import { IsBoolean, IsEnum, IsOptional, IsString, IsUUID, MaxLength } from 'class-validator';
import { DocumentType } from '@prisma/client';

export class CreateDocumentDto {
  @IsOptional() @IsEnum(DocumentType) type?: DocumentType;
  @IsOptional() @IsBoolean() isDefault?: boolean;
  @IsOptional() @IsUUID() jobId?: string;
}
