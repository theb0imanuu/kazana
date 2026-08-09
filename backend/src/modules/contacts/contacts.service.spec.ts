import { Test, TestingModule } from '@nestjs/testing';
import { ContactsService } from './contacts.service';
import { PrismaService } from '../../prisma/prisma.service';
import { NotFoundException } from '@nestjs/common';

describe('ContactsService', () => {
  let service: ContactsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    company: {
      findFirst: jest.fn(),
    },
    contact: {
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
        ContactsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ContactsService>(ContactsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-uuid';
  const contactId = 'contact-uuid';
  const companyId = 'company-uuid';

  describe('create', () => {
    const dto = {
      name: 'John Doe',
      role: 'Recruiter',
      email: 'john@example.com',
      companyId,
    };

    it('should create and return a contact if associated company exists', async () => {
      const company = { id: companyId, name: 'Acme Corp', userId };
      const createdContact = { id: contactId, ...dto, userId };

      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(company);
      jest.spyOn(prisma.contact, 'create').mockResolvedValue(createdContact as any);

      const result = await service.create(userId, dto);

      expect(prisma.company.findFirst).toHaveBeenCalledWith({ where: { id: companyId, userId } });
      expect(prisma.contact.create).toHaveBeenCalled();
      expect(result).toBe(createdContact);
    });

    it('should throw NotFoundException if companyId does not belong to user', async () => {
      jest.spyOn(prisma.company, 'findFirst').mockResolvedValue(null);

      await expect(service.create(userId, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('findAll', () => {
    it('should list all contacts of the user', async () => {
      const contactsList = [{ id: contactId, name: 'John Doe', userId }];
      jest.spyOn(prisma.contact, 'findMany').mockResolvedValue(contactsList as any);

      const result = await service.findAll(userId);

      expect(prisma.contact.findMany).toHaveBeenCalledWith({
        where: { userId },
        include: { company: true },
        orderBy: { name: 'asc' },
      });
      expect(result).toEqual(contactsList);
    });
  });

  describe('findOne', () => {
    it('should return a contact if ownership matches', async () => {
      const contact = { id: contactId, name: 'John Doe', userId };
      jest.spyOn(prisma.contact, 'findFirst').mockResolvedValue(contact as any);

      const result = await service.findOne(userId, contactId);

      expect(prisma.contact.findFirst).toHaveBeenCalledWith({
        where: { id: contactId, userId },
        include: { company: true },
      });
      expect(result).toBe(contact);
    });

    it('should throw NotFoundException if contact not found', async () => {
      jest.spyOn(prisma.contact, 'findFirst').mockResolvedValue(null);

      await expect(service.findOne(userId, contactId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    const updateDto = { name: 'John Doe Updated' };

    it('should update and return contact if ownership matches', async () => {
      const existing = { id: contactId, name: 'John Doe', userId, companyId: null };
      const updated = { ...existing, ...updateDto };

      jest.spyOn(prisma.contact, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.contact, 'update').mockResolvedValue(updated as any);

      const result = await service.update(userId, contactId, updateDto);

      expect(prisma.contact.findFirst).toHaveBeenCalledWith({ where: { id: contactId, userId } });
      expect(prisma.contact.update).toHaveBeenCalled();
      expect(result).toBe(updated);
    });

    it('should throw NotFoundException if contact not found during update', async () => {
      jest.spyOn(prisma.contact, 'findFirst').mockResolvedValue(null);

      await expect(service.update(userId, contactId, updateDto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete contact if ownership matches', async () => {
      const existing = { id: contactId, name: 'John Doe', userId };
      jest.spyOn(prisma.contact, 'findFirst').mockResolvedValue(existing as any);
      jest.spyOn(prisma.contact, 'delete').mockResolvedValue(existing as any);

      const result = await service.remove(userId, contactId);

      expect(prisma.contact.findFirst).toHaveBeenCalledWith({ where: { id: contactId, userId } });
      expect(prisma.contact.delete).toHaveBeenCalledWith({ where: { id: contactId } });
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if contact not found during delete', async () => {
      jest.spyOn(prisma.contact, 'findFirst').mockResolvedValue(null);

      await expect(service.remove(userId, contactId)).rejects.toThrow(NotFoundException);
    });
  });
});
