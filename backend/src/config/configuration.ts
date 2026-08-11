import { plainToInstance } from 'class-transformer';
import { IsEnum, IsNumber, IsString, IsNotEmpty, IsOptional, validateSync } from 'class-validator';

export enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
  Provision = 'provision',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  NODE_ENV: Environment = Environment.Development;

  @IsNumber()
  PORT: number = 3000;

  @IsString()
  @IsNotEmpty()
  DATABASE_URL!: string;

  @IsOptional()
  @IsString()
  REDIS_HOST?: string;

  @IsOptional()
  @IsNumber()
  REDIS_PORT?: number;

  @IsOptional()
  @IsString()
  REDIS_URL?: string;

  @IsString()
  @IsNotEmpty()
  JWT_SECRET!: string;

  @IsString()
  @IsNotEmpty()
  JWT_EXPIRES_IN!: string;

  @IsOptional()
  @IsString()
  AZURE_STORAGE_CONNECTION_STRING?: string;

  @IsOptional()
  @IsString()
  AZURE_STORAGE_CONTAINER?: string;
}

export function validate(config: Record<string, unknown>) {
  if (!config.REDIS_URL && !config.REDIS_HOST) {
    throw new Error('Environment validation failed: Either REDIS_URL or REDIS_HOST must be defined');
  }

  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    {
      ...config,
      PORT: config.PORT ? Number(config.PORT) : 3000,
      REDIS_PORT: config.REDIS_PORT ? Number(config.REDIS_PORT) : 6379,
    },
    { enableImplicitConversion: true }
  );

  const errors = validateSync(validatedConfig, { skipMissingProperties: false });

  if (errors.length > 0) {
    throw new Error(`Environment validation failed: ${errors.toString()}`);
  }
  return validatedConfig;
}
