import { Test } from '@nestjs/testing';
import { AuthService } from '../src/modules/auth/auth.service';
import { PrismaService } from '../src/prisma/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

describe('AuthService', () => {
  it('does not expose passwordHash in a sanitized user', async () => {
    const prisma = {
      user: {
        findUnique: jest.fn().mockResolvedValue({
          id: 'user-id',
          email: 'user@example.com',
          name: 'Test User',
          passwordHash: '$2b$10$example',
        }),
      },
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prisma },
        { provide: JwtService, useValue: { signAsync: jest.fn().mockResolvedValue('token') } },
        { provide: ConfigService, useValue: { getOrThrow: jest.fn().mockReturnValue('secret'), get: jest.fn().mockReturnValue('7d') } },
      ],
    }).compile();

    const service = moduleRef.get(AuthService);
    const result = await service.me('user-id');

    expect(result).not.toHaveProperty('passwordHash');
    expect(result.email).toBe('user@example.com');
  });
});
