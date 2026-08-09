import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';
import { RemindersQueryDto } from './dto/reminders-query.dto';

@Injectable()
export class RemindersService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateReminderDto) {
    const job = await this.prisma.job.findFirst({
      where: { id: dto.jobId, userId },
    });
    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return this.prisma.$transaction(async (tx) => {
      const reminder = await tx.reminder.create({
        data: {
          title: dto.title,
          dueAt: new Date(dto.dueAt),
          completed: dto.completed ?? false,
          jobId: dto.jobId,
        },
        include: { job: true },
      });

      // Create activity
      await tx.activity.create({
        data: {
          type: 'REMINDER_CREATED',
          content: `Reminder scheduled: "${dto.title}" due by ${new Date(dto.dueAt).toLocaleString()}`,
          metadata: {
            reminderId: reminder.id,
            title: reminder.title,
            dueAt: dto.dueAt,
          },
          userId,
          jobId: dto.jobId,
        },
      });

      return reminder;
    });
  }

  async findAll(userId: string, query: RemindersQueryDto) {
    const where: any = {
      job: { userId },
    };

    if (query.completed !== undefined) {
      where.completed = query.completed;
    }
    if (query.jobId) {
      where.jobId = query.jobId;
    }
    if (query.dueBefore) {
      where.dueAt = { ...where.dueAt, lte: new Date(query.dueBefore) };
    }
    if (query.dueAfter) {
      where.dueAt = { ...where.dueAt, gte: new Date(query.dueAfter) };
    }

    return this.prisma.reminder.findMany({
      where,
      include: { job: true },
      orderBy: { dueAt: 'asc' },
    });
  }

  async findOne(userId: string, reminderId: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: {
        id: reminderId,
        job: { userId },
      },
      include: { job: true },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    return reminder;
  }

  async update(userId: string, reminderId: string, dto: UpdateReminderDto) {
    const reminder = await this.prisma.reminder.findFirst({
      where: {
        id: reminderId,
        job: { userId },
      },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    if (dto.jobId && dto.jobId !== reminder.jobId) {
      const job = await this.prisma.job.findFirst({
        where: { id: dto.jobId, userId },
      });
      if (!job) {
        throw new NotFoundException('Job not found');
      }
    }

    return this.prisma.reminder.update({
      where: { id: reminderId },
      data: {
        ...(dto.title !== undefined && { title: dto.title }),
        ...(dto.dueAt !== undefined && { dueAt: new Date(dto.dueAt) }),
        ...(dto.completed !== undefined && { completed: dto.completed }),
        ...(dto.jobId !== undefined && { jobId: dto.jobId }),
      },
      include: { job: true },
    });
  }

  async complete(userId: string, reminderId: string) {
    return this.update(userId, reminderId, { completed: true });
  }

  async remove(userId: string, reminderId: string) {
    const reminder = await this.prisma.reminder.findFirst({
      where: {
        id: reminderId,
        job: { userId },
      },
    });

    if (!reminder) {
      throw new NotFoundException('Reminder not found');
    }

    await this.prisma.reminder.delete({
      where: { id: reminderId },
    });

    return { success: true };
  }
}
