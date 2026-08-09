import { Test, TestingModule } from '@nestjs/testing';
import { RedisService } from './redis.service';
import { ConfigService } from '@nestjs/config';

describe('RedisService', () => {
  let service: RedisService;

  const mockConfigService = {
    get: jest.fn((key) => {
      if (key === 'REDIS_HOST') return '127.0.0.1';
      if (key === 'REDIS_PORT') return 6379;
      return null;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RedisService,
        { provide: ConfigService, useValue: mockConfigService },
      ],
    }).compile();

    service = module.get<RedisService>(RedisService);
  });

  afterEach(async () => {
    if (service) {
      await service.onModuleDestroy();
    }
  });

  it('should compile and expose client and health metrics', () => {
    expect(service).toBeDefined();
    expect(service.getClient()).toBeDefined();
    expect(service.isAlive()).toBe(false);
  });
});
