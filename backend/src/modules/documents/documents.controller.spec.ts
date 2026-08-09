import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsController } from './documents.controller';
import { DocumentsService } from './documents.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
import { DocumentType } from '@prisma/client';

describe('DocumentsController', () => {
  let controller: DocumentsController;
  let service: DocumentsService;

  const mockDocumentsService = {
    upload: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    remove: jest.fn(),
    setDefault: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DocumentsController],
      providers: [
        { provide: DocumentsService, useValue: mockDocumentsService },
        Reflector,
      ],
    })
      .overrideGuard(JwtAuthGuard)
      .useValue({ canActivate: () => true })
      .compile();

    controller = module.get<DocumentsController>(DocumentsController);
    service = module.get<DocumentsService>(DocumentsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const user = { id: 'user-uuid' };
  const docId = 'doc-uuid';

  describe('upload', () => {
    it('should call service.upload with user ID and file payload (user isolation)', async () => {
      const dto = { type: DocumentType.RESUME };
      const file = { originalname: 'resume.pdf' } as any;
      const expected = { id: docId, name: 'resume.pdf', url: 'http://azure.com/resume.pdf' };

      jest.spyOn(service, 'upload').mockResolvedValue(expected as any);

      const result = await controller.upload(user, file, dto);

      expect(service.upload).toHaveBeenCalledWith(user.id, file, dto);
      expect(result).toBe(expected);
    });
  });

  describe('findAll', () => {
    it('should call service.findAll with user ID (user isolation)', async () => {
      const expected = [{ id: docId, name: 'resume.pdf' }];
      jest.spyOn(service, 'findAll').mockResolvedValue(expected as any);

      const result = await controller.findAll(user);

      expect(service.findAll).toHaveBeenCalledWith(user.id);
      expect(result).toBe(expected);
    });
  });

  describe('findOne', () => {
    it('should call service.findOne with user ID and document ID (user isolation)', async () => {
      const expected = { id: docId, name: 'resume.pdf' };
      jest.spyOn(service, 'findOne').mockResolvedValue(expected as any);

      const result = await controller.findOne(user, docId);

      expect(service.findOne).toHaveBeenCalledWith(user.id, docId);
      expect(result).toBe(expected);
    });
  });

  describe('remove', () => {
    it('should call service.remove with user ID and document ID (user isolation)', async () => {
      const expected = { success: true };
      jest.spyOn(service, 'remove').mockResolvedValue(expected as any);

      const result = await controller.remove(user, docId);

      expect(service.remove).toHaveBeenCalledWith(user.id, docId);
      expect(result).toBe(expected);
    });
  });

  describe('setDefault', () => {
    it('should call service.setDefault with user ID and document ID (user isolation)', async () => {
      const expected = { id: docId, name: 'resume.pdf', isDefault: true };
      jest.spyOn(service, 'setDefault').mockResolvedValue(expected as any);

      const result = await controller.setDefault(user, docId);

      expect(service.setDefault).toHaveBeenCalledWith(user.id, docId);
      expect(result).toBe(expected);
    });
  });
});
