import { Test, TestingModule } from '@nestjs/testing';
import { TemplatesService } from './templates.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';
import { TemplateType } from '@prisma/client';

describe('TemplatesService', () => {
  let service: TemplatesService;
  let prisma: PrismaService;

  const mockPrismaService = {
    template: {
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
        TemplatesService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<TemplatesService>(TemplatesService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-uuid';
  const templateId = 'template-uuid';

  describe('create', () => {
    const dto = {
      name: 'Intro Email',
      subject: 'Applying at {{company}}',
      body: 'Hello {{name}}, I would like to apply for {{jobTitle}}.',
      type: TemplateType.EMAIL,
    };

    it('should create template and parse placeholder variables automatically', async () => {
      const created = { id: templateId, ...dto, variables: ['company', 'name', 'jobTitle'], userId };
      jest.spyOn(prisma.template, 'create').mockResolvedValue(created as any);

      const result = await service.create(userId, dto);

      expect(prisma.template.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          name: dto.name,
          subject: dto.subject,
          body: dto.body,
          type: dto.type,
          variables: expect.arrayContaining(['company', 'name', 'jobTitle']),
          userId,
        }),
      });
      expect(result).toBe(created);
    });

    it('should combine user-supplied variables and parsed placeholders', async () => {
      const dtoWithVars = { ...dto, variables: ['extraVar'] };
      const created = { id: templateId, ...dtoWithVars, variables: ['company', 'name', 'jobTitle', 'extraVar'], userId };
      jest.spyOn(prisma.template, 'create').mockResolvedValue(created as any);

      const result = await service.create(userId, dtoWithVars);

      expect(prisma.template.create).toHaveBeenCalledWith({
        data: expect.objectContaining({
          variables: expect.arrayContaining(['company', 'name', 'jobTitle', 'extraVar']),
        }),
      });
      expect(result).toBe(created);
    });
  });

  describe('findAll', () => {
    it('should return all templates for a user', async () => {
      const list = [{ id: templateId, name: 'Intro Email', userId }];
      jest.spyOn(prisma.template, 'findMany').mockResolvedValue(list as any);

      const result = await service.findAll(userId);

      expect(prisma.template.findMany).toHaveBeenCalledWith({
        where: { userId },
        orderBy: { name: 'asc' },
      });
      expect(result).toBe(list);
    });
  });

  describe('findOne', () => {
    it('should return a template if ownership matches', async () => {
      const template = { id: templateId, name: 'Intro Email', userId };
      jest.spyOn(prisma.template, 'findFirst').mockResolvedValue(template as any);

      const result = await service.findOne(userId, templateId);

      expect(prisma.template.findFirst).toHaveBeenCalledWith({ where: { id: templateId, userId } });
      expect(result).toBe(template);
    });

    it('should throw NotFoundException if template does not exist or belongs to another user', async () => {
      jest.spyOn(prisma.template, 'findFirst').mockResolvedValue(null);

      await expect(service.findOne(userId, templateId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update template fields and re-parse placeholders if body/subject updates', async () => {
      const existing = {
        id: templateId,
        name: 'Intro Email',
        subject: 'Applying at {{company}}',
        body: 'Hello {{name}}',
        variables: ['company', 'name'],
        userId,
      };

      const updateDto = {
        body: 'Hello {{name}}, let us talk about {{jobTitle}}.',
      };

      const updated = {
        ...existing,
        body: updateDto.body,
        variables: ['company', 'name', 'jobTitle'],
      };

      jest.spyOn(prisma.template, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.template, 'update').mockResolvedValue(updated as any);

      const result = await service.update(userId, templateId, updateDto);

      expect(prisma.template.findFirst).toHaveBeenCalledWith({ where: { id: templateId, userId } });
      expect(prisma.template.update).toHaveBeenCalledWith({
        where: { id: templateId },
        data: expect.objectContaining({
          body: updateDto.body,
          variables: expect.arrayContaining(['company', 'name', 'jobTitle']),
        }),
      });
      expect(result).toBe(updated);
    });
  });

  describe('remove', () => {
    it('should delete template if ownership matches', async () => {
      const existing = { id: templateId, userId };
      jest.spyOn(prisma.template, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.template, 'delete').mockResolvedValue(existing as any);

      const result = await service.remove(userId, templateId);

      expect(prisma.template.findFirst).toHaveBeenCalledWith({ where: { id: templateId, userId } });
      expect(prisma.template.delete).toHaveBeenCalledWith({ where: { id: templateId } });
      expect(result).toEqual({ success: true });
    });
  });
});
