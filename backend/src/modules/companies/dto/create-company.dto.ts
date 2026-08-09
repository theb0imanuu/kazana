import { IsNotEmpty, IsOptional, IsString, IsUrl } from 'class-validator';

export class CreateCompanyDto {
  @IsNotEmpty({ message: 'Company name is required' })
  @IsString({ message: 'Company name must be a string' })
  name!: string;

  @IsOptional()
  @IsUrl({}, { message: 'Website must be a valid URL' })
  website?: string;

  @IsOptional()
  @IsString({ message: 'Industry must be a string' })
  industry?: string;

  @IsOptional()
  @IsString({ message: 'Size must be a string' })
  size?: string;

  @IsOptional()
  @IsString({ message: 'Location must be a string' })
  location?: string;

  @IsOptional()
  @IsString({ message: 'Notes must be a string' })
  notes?: string;

  @IsOptional()
  @IsUrl({}, { message: 'Logo URL must be a valid URL' })
  logoUrl?: string;
}
