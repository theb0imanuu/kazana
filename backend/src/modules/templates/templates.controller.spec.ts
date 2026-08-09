import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesController } from './templates.controller';
import { TemplatesService } from './templates.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { TemplateType } from '@prisma/client';

describe('TemplatesController', () => {
  let controller: TemplatesController;
  let service: TemplatesService;

  const mockTemplatesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [TemplatesController],
      providers: [
        { provide: TemplatesService, useValue: mockTemplatesService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<TemplatesController>(TemplatesController);
    service = module.get<TemplatesService>(TemplatesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'user-uuid' };
  const templateId = 'template-uuid';

  describe('create', () => {
    it('should call service.create with authenticated user ID (user isolation)', async () => {
      const dto = { name: 'Intro Email', body: 'Hello {{name}}', type: TemplateType.EMAIL };
      const expected = { id: templateId, ...dto, userId: user.id };
      jest.spyOn(service, 'create').mockResolvedValue(expected as any);

      const result = await controller.create(user, dto);

      expect(service.create).toHaveBeenCalledWith(user.id, dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with user ID (user isolation)', async () => {
      const expected = [{ id: templateId, name: 'Intro Email' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(user.id);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with user ID and template ID (user isolation)', async () => {
      const expected = { id: templateId, name: 'Intro Email' };
      jest.spyOn(service, 'findOne').mockResolvedValue(expected as any);

      const result = await controller.findOne(user, templateId);

      expect(service.findOne).toHaveBeenCalledWith(user.id, templateId);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with IDs and dto (user isolation)', async () => {
      const dto = { name: 'New Intro Email' };
      const expected = { id: templateId, name: 'New Intro Email' };
      jest.spyOn(service, 'update').mockResolvedValue(expected as any);

      const result = await controller.update(user, templateId, dto);

      expect(service.update).toHaveBeenCalledWith(user.id, templateId, dto);
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with IDs (user isolation)', async () => {
      const expected = { success: true };
      jest.spyOn(service, 'remove').mockResolvedValue(expected as any);

      const result = await controller.remove(user, templateId);

      expect(service.remove).toHaveBeenCalledWith(user.id, templateId);
      expect(result).toBe(expected);
    });
  });
});
