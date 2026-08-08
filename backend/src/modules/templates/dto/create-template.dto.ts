import { IsArray, IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { TemplateType } from '@prisma/client';
export class CreateTemplateDto {
  @IsString() @MinLength(1) @MaxLength(200) name!: string;
  @IsOptional() @IsString() @MaxLength(255) subject?: string;
  @IsString() body!: string;
  @IsEnum(TemplateType) type!: TemplateType;
  @IsArray() @IsString({ each: true }) variables!: string[];
}
