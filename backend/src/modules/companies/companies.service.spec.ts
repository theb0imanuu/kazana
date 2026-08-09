import { Test, TestingModule } from '@nestjs/testing';
import { CompaniesService } from './companies.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('CompaniesService', () => {
  let service: CompaniesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    company: {
      create: jest.fn(),
      findMany: jest.fn(),
      findFirst: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CompaniesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<CompaniesService>(CompaniesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-uuid';
  const companyId = 'company-uuid';

  describe('create', () => {
    it('should create and return a company', async () => {
      const dto = { name: 'Acme Corp', website: 'https://acme.com' };
      const createdCompany = { id: companyId, ...dto, userId, industry: null, size: null, location: null, notes: null, logoUrl: null };

      jest.spyOn(prisma.company, 'create').mockResolvedValue(createdCompany);

      const result = await service.create(userId, dto);

      expect(prisma.company.create).toHaveBeenCalledWith({
        data: {
          name: dto.name,
          website: dto.website,
          industry: undefined,
          size: undefined,
          location: undefined,
          notes: undefined,
          logoUrl: undefined,
          userId,
        },
      });
      expect(result).toBe(createdCompany);
    });
  });

  describe('findAll', () => {
    it('should list all companies of the user', async () => {
      const companiesList = [{ id: companyId, name: 'Acme Corp', userId }];
      jest.spyOn(prisma.company, 'findMany').mockResolvedValue(companiesList);

      const result = await service.findAll(userId);

      expect(prisma.company.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(companiesList);
    });
  });

  describe('findOne', () => {
    it('should return a company if ownership matches', async () => {
      const company = { id: companyId, name: 'Acme Corp', userId };
      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(company);

      const result = await service.findOne(userId, companyId);

      expect(prisma.company.findFirst).toHaveBeenCalledWith({
        where: { id: companyId, userId },
      });
      expect(result).toBe(company);
    });

    it('should throw NotFoundException if company not found or belongs to another user', async () => {
      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(null);

      await expect(service.findOne(userId, companyId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'Acme Corp Updated' };

    it('should update and return company if ownership matches', async () => {
      const existing = { id: companyId, name: 'Acme Corp', userId };
      const updated = { ...existing, ...updateDto };

      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(existing);
      jest.spyOn(prisma.company, 'update').mockResolvedValue(updated);

      const result = await service.update(userId, companyId, updateDto);

      expect(prisma.company.findFirst).toHaveBeenCalledWith({ where: { id: companyId, userId } });
      expect(prisma.company.update).toHaveBeenCalledWith({
        where: { id: companyId },
        data: updateDto,
      });
      expect(result).toBe(updated);
    });

    it('should throw NotFoundException if company not found or belongs to another user during update', async () => {
      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(null);

      await expect(service.update(userId, companyId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete company if ownership matches', async () => {
      const existing = { id: companyId, name: 'Acme Corp', userId };
      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(existing);
      jest.spyOn(prisma.company, 'delete').mockResolvedValue(existing);

      const result = await service.remove(userId, companyId);

      expect(prisma.company.findFirst).toHaveBeenCalledWith({ where: { id: companyId, userId } });
      expect(prisma.company.delete).toHaveBeenCalledWith({ where: { id: companyId } });
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if company not found during delete', async () => {
      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(null);

      await expect(service.remove(userId, companyId)).rejects.toThrow(NotFoundException);
    });
  });
});
