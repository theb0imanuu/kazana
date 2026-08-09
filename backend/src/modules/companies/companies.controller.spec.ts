import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesController } from './companies.controller';
import { CompaniesService } from './companies.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('CompaniesController', () => {
  let controller: CompaniesController;
  let service: CompaniesService;

  const mockCompaniesService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CompaniesController],
      providers: [
        { provide: CompaniesService, useValue: mockCompaniesService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<CompaniesController>(CompaniesController);
    service = module.get<CompaniesService>(CompaniesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'user-uuid' };
  const companyId = 'company-uuid';

  describe('create', () => {
    it('should call service.create with authenticated user ID (user isolation)', async () => {
      const dto = { name: 'Acme Corp' };
      const expected = { id: companyId, ...dto, userId: user.id };
      jest.spyOn(service, 'create').mockResolvedValue(expected as any);

      const result = await controller.create(user, dto);

      expect(service.create).toHaveBeenCalledWith(user.id, dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with authenticated user ID (user isolation)', async () => {
      const expected = [{ id: companyId, name: 'Acme Corp', userId: user.id }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(user.id);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with company ID and user ID (user isolation)', async () => {
      const expected = { id: companyId, name: 'Acme Corp', userId: user.id };
      jest.spyOn(service, 'findOne').mockResolvedValue(expected as any);

      const result = await controller.findOne(user, companyId);

      expect(service.findOne).toHaveBeenCalledWith(user.id, companyId);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with IDs and dto (user isolation)', async () => {
      const dto = { name: 'Acme Corp Updated' };
      const expected = { id: companyId, name: 'Acme Corp Updated', userId: user.id };
      jest.spyOn(service, 'update').mockResolvedValue(expected as any);

      const result = await controller.update(user, companyId, dto);

      expect(service.update).toHaveBeenCalledWith(user.id, companyId, dto);
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with IDs (user isolation)', async () => {
      const expected = { success: true };
      jest.spyOn(service, 'remove').mockResolvedValue(expected as any);

      const result = await controller.remove(user, companyId);

      expect(service.remove).toHaveBeenCalledWith(user.id, companyId);
      expect(result).toBe(expected);
    });
  });
});
