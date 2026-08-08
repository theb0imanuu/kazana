import { IsEmail, IsOptional, IsPhoneNumber, IsString, IsUrl, MaxLength, MinLength } from 'class-validator';
export class CreateContactDto {
  @IsString() @MinLength(1) @MaxLength(160) name!: string;
  @IsOptional() @IsString() @MaxLength(160) role?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsPhoneNumber(null) phone?: string;
  @IsOptional() @IsUrl() linkedin?: string;
  @IsOptional() @IsString() notes?: string;
  @IsString() companyId!: string;
}
