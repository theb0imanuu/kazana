import { IsArray, IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';
import { TemplateType } from '@prisma/client';

export class CreateTemplateDto {
  @IsNotEmpty({ message: 'Template name is required' })
  @IsString({ message: 'Template name must be a string' })
  name!: string;

  @IsOptional()
  @IsString({ message: 'Subject must be a string' })
  subject?: string;

  @IsNotEmpty({ message: 'Body is required' })
  @IsString({ message: 'Body must be a string' })
  body!: string;

  @IsNotEmpty({ message: 'Template type is required' })
  @IsEnum(TemplateType, { message: 'Template type must be EMAIL, COVER_LETTER, or FOLLOW_UP' })
  type!: TemplateType;

  @IsOptional()
  @IsArray({ message: 'Variables must be an array of strings' })
  @IsString({ each: true, message: 'Each variable must be a string' })
  variables?: string[];
}
