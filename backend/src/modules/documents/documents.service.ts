import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { StorageService } from '../../shared/services/storage.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { randomUUID } from 'crypto';

@Injectable()
export class DocumentsService {
  private readonly allowedMimeTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/png',
    'image/jpeg',
    'text/plain',
  ];

  private readonly maxFileSizeBytes = 5 * 1024 * 1024; // 5MB

  constructor(
    private prisma: PrismaService,
    private storageService: StorageService,
  ) {}

  async upload(userId: string, file: any, dto: CreateDocumentDto) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }

    if (!this.allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: PDF, Word docs, PNG, JPEG, Plain Text`);
    }

    if (file.size > this.maxFileSizeBytes) {
      throw new BadRequestException('File size exceeds limit of 5MB');
    }

    if (dto.jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: dto.jobId, userId },
      });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
    }

    const extension = file.originalname.split('.').pop();
    const uniquePath = `${userId}/${randomUUID()}.${extension}`;

    const url = await this.storageService.upload(
      {
        buffer: file.buffer,
        originalname: file.originalname,
        mimetype: file.mimetype,
      },
      uniquePath,
    );

    const document = await this.prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
        data: {
          name: file.originalname,
          type: dto.type,
          url,
          fileSize: file.size,
          mimeType: file.mimetype,
          userId,
          jobId: dto.jobId,
        },
      });

      await tx.activity.create({
        data: {
          type: 'DOCUMENT_ADDED',
          content: `Document "${file.originalname}" (${dto.type}) added`,
          metadata: {
            documentId: doc.id,
            name: doc.name,
            type: doc.type,
          },
          userId,
          jobId: dto.jobId,
        },
      });

      return doc;
    });

    return {
      id: document.id,
      name: document.name,
      url: document.url,
      size: document.fileSize,
      mimeType: document.mimeType,
      type: document.type,
      isDefault: document.isDefault,
    };
  }

  async findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(userId: string, docId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: docId, userId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    return doc;
  }

  async remove(userId: string, docId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: docId, userId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    await this.storageService.delete(doc.url);

    await this.prisma.document.delete({
      where: { id: docId },
    });

    return { success: true };
  }

  async setDefault(userId: string, docId: string) {
    const doc = await this.prisma.document.findFirst({
      where: { id: docId, userId },
    });

    if (!doc) {
      throw new NotFoundException('Document not found');
    }

    return this.prisma.$transaction(async (tx) => {
      await tx.document.updateMany({
        where: {
          userId,
          type: doc.type,
          isDefault: true,
        },
        data: { isDefault: false },
      });

      return tx.document.update({
        where: { id: docId },
        data: { isDefault: true },
      });
    });
  }
}
