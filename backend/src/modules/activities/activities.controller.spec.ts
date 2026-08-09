import { Test, TestingModule } from '@nestjs/testing';
import { ActivitiesController } from './activities.controller';
import { ActivitiesService } from './activities.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('ActivitiesController', () => {
  let controller: ActivitiesController;
  let service: ActivitiesService;

  const mockActivitiesService = {
    findAll: jest.fn(),
    createNote: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ActivitiesController],
      providers: [
        { provide: ActivitiesService, useValue: mockActivitiesService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ActivitiesController>(ActivitiesController);
    service = module.get<ActivitiesService>(ActivitiesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'user-uuid' };

  describe('findAll', () => {
    it('should call service.findAll with user ID (user isolation)', async () => {
      const expected = [{ id: 'act-1', content: 'Testing' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(user.id);
      expect(result).toBe(expected);
    });
  });

  describe('createNote', () => {
    it('should call service.createNote with user ID and DTO (user isolation)', async () => {
      const dto = { content: 'Test note', jobId: 'job-uuid' };
      const expected = { id: 'act-1', content: 'Test note', jobId: 'job-uuid', userId: user.id };
      jest.spyOn(service, 'createNote').mockResolvedValue(expected as any);

      const result = await controller.createNote(user, dto);

      expect(service.createNote).toHaveBeenCalledWith(user.id, dto);
      expect(result).toBe(expected);
    });
  });
});
