import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateNoteDto } from './dto/create-note.dto';

@Injectable()
export class ActivitiesService {
  constructor(private prisma: PrismaService) {}

  async findAll(userId: string) {
    return this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findAllByJob(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, userId },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.activity.findMany({
      where: { jobId, userId },
      orderBy: { createdAt: 'desc' },
    });
  }

  async createNote(userId: string, dto: CreateNoteDto) {
    if (dto.jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: dto.jobId, userId },
      });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
    }

    return this.prisma.activity.create({
      data: {
        type: 'NOTE',
        content: dto.content,
        userId,
        jobId: dto.jobId,
      },
    });
  }
}
