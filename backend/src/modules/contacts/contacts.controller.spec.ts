import { Test, TestingModule } from '@nestjs/testing';
import { ContactsController } from './contacts.controller';
import { ContactsService } from './contacts.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';

describe('ContactsController', () => {
  let controller: ContactsController;
  let service: ContactsService;

  const mockContactsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ContactsController],
      providers: [
        { provide: ContactsService, useValue: mockContactsService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<ContactsController>(ContactsController);
    service = module.get<ContactsService>(ContactsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'user-uuid' };
  const contactId = 'contact-uuid';

  describe('create', () => {
    it('should call service.create with authenticated user ID (user isolation)', async () => {
      const dto = { name: 'John Doe' };
      const expected = { id: contactId, ...dto, userId: user.id };
      jest.spyOn(service, 'create').mockResolvedValue(expected as any);

      const result = await controller.create(user, dto);

      expect(service.create).toHaveBeenCalledWith(user.id, dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with authenticated user ID (user isolation)', async () => {
      const expected = [{ id: contactId, name: 'John Doe', userId: user.id }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(user.id);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with contact ID and user ID (user isolation)', async () => {
      const expected = { id: contactId, name: 'John Doe', userId: user.id };
      jest.spyOn(service, 'findOne').mockResolvedValue(expected as any);

      const result = await controller.findOne(user, contactId);

      expect(service.findOne).toHaveBeenCalledWith(user.id, contactId);
      expect(result).toBe(expected);
    });
  });

  describe('update', () => {
    it('should call service.update with IDs and dto (user isolation)', async () => {
      const dto = { name: 'John Doe Updated' };
      const expected = { id: contactId, name: 'John Doe Updated', userId: user.id };
      jest.spyOn(service, 'update').mockResolvedValue(expected as any);

      const result = await controller.update(user, contactId, dto);

      expect(service.update).toHaveBeenCalledWith(user.id, contactId, dto);
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with IDs (user isolation)', async () => {
      const expected = { success: true };
      jest.spyOn(service, 'remove').mockResolvedValue(expected as any);

      const result = await controller.remove(user, contactId);

      expect(service.remove).toHaveBeenCalledWith(user.id, contactId);
      expect(result).toBe(expected);
    });
  });
});
