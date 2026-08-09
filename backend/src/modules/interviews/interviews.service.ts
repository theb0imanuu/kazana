import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateInterviewDto) {
    const job = await this.prisma.job.findFirst({
      where: { id: dto.jobId, userId },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (dto.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: dto.contactId, userId },
      });
      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const interview = await tx.interview.create({
        data: {
          type: dto.type,
          scheduledAt: new Date(dto.scheduledAt),
          duration: dto.duration,
          location: dto.location,
          notes: dto.notes,
          status: dto.status,
          jobId: dto.jobId,
          contactId: dto.contactId,
        },
        include: { job: true, contact: true },
      });

      // Create timeline entry as an activity log
      await tx.activity.create({
        data: {
          type: 'INTERVIEW_SCHEDULED',
          content: `Interview (${dto.type}) scheduled for ${new Date(dto.scheduledAt).toLocaleString()}`,
          metadata: {
            interviewId: interview.id,
            scheduledAt: dto.scheduledAt,
            type: dto.type,
          },
          userId,
          jobId: dto.jobId,
        },
      });

      return interview;
    });
  }

  async findAll(userId: string) {
    return this.prisma.interview.findMany({
      where: {
        job: { userId },
      },
      include: { job: true, contact: true },
      orderBy: { scheduledAt: 'desc' },
    });
  }

  async findOne(userId: string, interviewId: string) {
    const interview = await this.prisma.interview.findFirst({
      where: {
        id: interviewId,
        job: { userId },
      },
      include: { job: true, contact: true },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    return interview;
  }

  async update(userId: string, interviewId: string, dto: UpdateInterviewDto) {
    const interview = await this.prisma.interview.findFirst({
      where: {
        id: interviewId,
        job: { userId },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    if (dto.jobId && dto.jobId !== interview.jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: dto.jobId, userId },
      });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
    }

    if (dto.contactId && dto.contactId !== interview.contactId) {
      const contact = await this.prisma.contact.findFirst({
        where: { id: dto.contactId, userId },
      });
      if (!contact) {
        throw new NotFoundException('Contact not found');
      }
    }

    return this.prisma.interview.update({
      where: { id: interviewId },
      data: {
        ...(dto.type !== undefined && { type: dto.type }),
        ...(dto.scheduledAt !== undefined && { scheduledAt: new Date(dto.scheduledAt) }),
        ...(dto.duration !== undefined && { duration: dto.duration }),
        ...(dto.location !== undefined && { location: dto.location }),
        ...(dto.notes !== undefined && { notes: dto.notes }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.jobId !== undefined && { jobId: dto.jobId }),
        ...(dto.contactId !== undefined && { contactId: dto.contactId }),
      },
      include: { job: true, contact: true },
    });
  }

  async remove(userId: string, interviewId: string) {
    const interview = await this.prisma.interview.findFirst({
      where: {
        id: interviewId,
        job: { userId },
      },
    });

    if (!interview) {
      throw new NotFoundException('Interview not found');
    }

    await this.prisma.interview.delete({
      where: { id: interviewId },
    });

    return { success: true };
  }
}
