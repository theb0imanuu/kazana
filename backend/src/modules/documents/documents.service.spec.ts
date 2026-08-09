import { Test, TestingModule } from '@nestjs/testing';
import { DocumentsService } from './documents.service';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../shared/services/storage.service';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';

describe('DocumentsService', () => {
  let service: DocumentsService;
  let prisma: PrismaService;
  let storage: StorageService;

  const mockPrismaService = {
    job: {
      findFirst: jest.fn(),
    },
    document: {
      create: jest.fn(),
      findFirst: jest.fn(),
      findMany: jest.fn(),
      delete: jest.fn(),
      updateMany: jest.fn(),
      update: jest.fn(),
    },
    activity: {
      create: jest.fn(),
    },
    $transaction: jest.fn((cb) => cb(mockPrismaService)),
  };

  const mockStorageService = {
    upload: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DocumentsService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: StorageService, useValue: mockStorageService },
      ],
    }).compile();

    service = module.get<DocumentsService>(DocumentsService);
    prisma = module.get<PrismaService>(PrismaService);
    storage = module.get<StorageService>(StorageService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-uuid';
  const jobId = 'job-uuid';
  const docId = 'doc-uuid';

  describe('upload', () => {
    const dto = {
      type: DocumentType.RESUME,
      jobId,
    };

    const file = {
      buffer: Buffer.from('test pdf content'),
      originalname: 'resume.pdf',
      mimetype: 'application/pdf',
      size: 1024,
    };

    it('should upload a document and save to db when job belongs to user', async () => {
      const job = { id: jobId, title: 'Engineer', userId };
      const createdDoc = {
        id: docId,
        name: file.originalname,
        type: dto.type,
        url: 'https://storage.blob.core.windows.net/container/resume.pdf',
        fileSize: file.size,
        mimeType: file.mimetype,
        userId,
        jobId,
        isDefault: false,
      };

      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(job as any);
      jest.spyOn(storage, 'upload').mockResolvedValue(createdDoc.url);
      jest.spyOn(prisma.document, 'create').mockResolvedValue(createdDoc as any);
      jest.spyOn(prisma.activity, 'create').mockResolvedValue({} as any);

      const result = await service.upload(userId, file, dto);

      expect(prisma.job.findFirst).toHaveBeenCalledWith({ where: { id: jobId, userId } });
      expect(storage.upload).toHaveBeenCalled();
      expect(prisma.document.create).toHaveBeenCalled();
      expect(prisma.activity.create).toHaveBeenCalledWith({
        data: {
          type: 'DOCUMENT_ADDED',
          content: 'Document "resume.pdf" (RESUME) added',
          metadata: {
            documentId: docId,
            name: file.originalname,
            type: dto.type,
          },
          userId,
          jobId,
        },
      });
      expect(result).toEqual({
        id: docId,
        name: file.originalname,
        url: createdDoc.url,
        size: createdDoc.fileSize,
        mimeType: createdDoc.mimeType,
        type: createdDoc.type,
        isDefault: createdDoc.isDefault,
      });
    });

    it('should throw BadRequestException if file is missing', async () => {
      await expect(service.upload(userId, null, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if MIME type is invalid', async () => {
      const invalidFile = { ...file, mimetype: 'application/octet-stream' };
      await expect(service.upload(userId, invalidFile, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if file size exceeds 5MB', async () => {
      const oversizedFile = { ...file, size: 6 * 1024 * 1024 };
      await expect(service.upload(userId, oversizedFile, dto)).rejects.toThrow(BadRequestException);
    });

    it('should throw NotFoundException if jobId does not belong to user', async () => {
      jest.spyOn(prisma.job, 'findFirst').mockResolvedValue(null);

      await expect(service.upload(userId, file, dto)).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should delete from storage and db if ownership matches', async () => {
      const doc = { id: docId, name: 'resume.pdf', url: 'http://azure.com/resume.pdf', userId };
      jest.spyOn(prisma.document, 'findFirst').mockResolvedValue(doc as any);
      jest.spyOn(storage, 'delete').mockResolvedValue(undefined);
      jest.spyOn(prisma.document, 'delete').mockResolvedValue(doc as any);

      const result = await service.remove(userId, docId);

      expect(prisma.document.findFirst).toHaveBeenCalledWith({ where: { id: docId, userId } });
      expect(storage.delete).toHaveBeenCalledWith(doc.url);
      expect(prisma.document.delete).toHaveBeenCalledWith({ where: { id: docId } });
      expect(result).toEqual({ success: true });
    });

    it('should throw NotFoundException if document not found during remove', async () => {
      jest.spyOn(prisma.document, 'findFirst').mockResolvedValue(null);

      await expect(service.remove(userId, docId)).rejects.toThrow(NotFoundException);
    });
  });

  describe('setDefault', () => {
    it('should reset isDefault for all other same-type docs and set this one to default', async () => {
      const doc = { id: docId, type: DocumentType.RESUME, userId };
      jest.spyOn(prisma.document, 'findFirst').mockResolvedValue(doc as any);
      jest.spyOn(prisma.document, 'updateMany').mockResolvedValue({ count: 1 });
      jest.spyOn(prisma.document, 'update').mockResolvedValue({ ...doc, isDefault: true } as any);

      const result = await service.setDefault(userId, docId);

      expect(prisma.document.updateMany).toHaveBeenCalledWith({
        where: { userId, type: DocumentType.RESUME, isDefault: true },
        data: { isDefault: false },
      });
      expect(prisma.document.update).toHaveBeenCalledWith({
        where: { id: docId },
        data: { isDefault: true },
      });
      expect(result.isDefault).toBe(true);
    });
  });
});
