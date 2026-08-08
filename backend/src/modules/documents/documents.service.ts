import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { DocumentType } from '@prisma/client';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../prisma/prisma.service';
import { BlobStorageService } from './blob-storage.service';
import { CreateDocumentDto } from './dto/create-document.dto';
import { UpdateDocumentDto } from './dto/update-document.dto';

@Injectable()
export class DocumentsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly storage: BlobStorageService,
    private readonly config: ConfigService,
  ) {}

  findAll(userId: string) {
    return this.prisma.document.findMany({
      where: { userId },
      include: { job: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.document.findFirst({ where: { id, userId } });
    if (!item) throw new NotFoundException('Document not found');
    return item;
  }

  async upload(userId: string, file: Express.Multer.File, dto: CreateDocumentDto) {
    if (!file) throw new BadRequestException('A file is required');

    const maxSize = this.config.get<number>('MAX_UPLOAD_SIZE_BYTES', 10 * 1024 * 1024);
    if (file.size > maxSize) throw new BadRequestException(`File exceeds the ${maxSize} byte limit`);

    const allowed = new Set([
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/png',
      'image/jpeg',
    ]);
    if (!allowed.has(file.mimetype)) throw new BadRequestException('Unsupported file type');

    if (dto.jobId) {
      const job = await this.prisma.job.findFirst({ where: { id: dto.jobId, userId } });
      if (!job) throw new BadRequestException('Job does not belong to the current user');
    }

    const uploaded = await this.storage.upload(userId, file);

    if (dto.isDefault) {
      await this.prisma.document.updateMany({
        where: { userId, type: dto.type ?? DocumentType.OTHER },
        data: { isDefault: false },
      });
    }

    return this.prisma.document.create({
      data: {
        name: file.originalname,
        type: dto.type ?? DocumentType.OTHER,
        url: uploaded.url,
        fileSize: file.size,
        mimeType: file.mimetype,
        isDefault: dto.isDefault ?? false,
        userId,
        jobId: dto.jobId,
      },
    });
  }

  async update(userId: string, id: string, dto: UpdateDocumentDto) {
    const existing = await this.findOne(userId, id);

    if (dto.jobId) {
      const job = await this.prisma.job.findFirst({ where: { id: dto.jobId, userId } });
      if (!job) throw new BadRequestException('Job does not belong to the current user');
    }

    if (dto.isDefault) {
      await this.prisma.document.updateMany({
        where: { userId, type: dto.type ?? existing.type },
        data: { isDefault: false },
      });
    }

    return this.prisma.document.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.document.delete({ where: { id } });
    return { deleted: true };
  }
}
