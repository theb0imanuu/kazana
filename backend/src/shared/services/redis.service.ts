import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private client!: Redis;
  private isConnected = false;

  constructor(private configService: ConfigService) {
    const host = this.configService.get<string>('REDIS_HOST') || '127.0.0.1';
    const port = Number(this.configService.get<number>('REDIS_PORT')) || 6379;

    this.client = new Redis({
      host,
      port,
      maxRetriesPerRequest: null, // Required by BullMQ
      lazyConnect: true,          // Don't block startup
    });

    this.client.on('connect', () => {
      this.logger.log('Successfully connected to Redis');
      this.isConnected = true;
    });

    this.client.on('error', (err) => {
      this.logger.error(`Redis Error: ${err.message}`);
      this.isConnected = false;
    });

    this.client.on('close', () => {
      this.logger.warn('Redis connection closed');
      this.isConnected = false;
    });
  }

  async onModuleInit() {
    try {
      await this.client.connect().catch((err) => {
        this.logger.error(`Initial Redis connection failed: ${err.message}`);
      });
    } catch (err) {
      this.logger.error(`Error initiating Redis connection: ${(err as Error).message}`);
    }
  }

  async onModuleDestroy() {
    if (this.client) {
      await this.client.quit();
    }
  }

  isAlive(): boolean {
    return this.isConnected && this.client.status === 'ready';
  }

  getClient(): Redis {
    return this.client;
  }
}
