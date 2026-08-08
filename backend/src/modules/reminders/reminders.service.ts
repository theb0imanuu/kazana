import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { QueueService } from '../../shared/queues/queue.service';
import { CreateReminderDto } from './dto/create-reminder.dto';
import { UpdateReminderDto } from './dto/update-reminder.dto';

@Injectable()
export class RemindersService {
  constructor(private readonly prisma: PrismaService, private readonly queues: QueueService) {}

  findAll(userId: string) {
    return this.prisma.reminder.findMany({
      where: { job: { userId } },
      include: { job: { select: { id: true, title: true } } },
      orderBy: { dueAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.reminder.findFirst({ where: { id, job: { userId } }, include: { job: true } });
    if (!item) throw new NotFoundException('Reminder not found');
    return item;
  }

  async create(userId: string, dto: CreateReminderDto) {
    await this.assertJob(userId, dto.jobId);
    const reminder = await this.prisma.reminder.create({
      data: { title: dto.title, dueAt: new Date(dto.dueAt), completed: dto.completed ?? false, jobId: dto.jobId },
    });
    await this.queues.reminderQueue.add('reminder.created', { reminderId: reminder.id }, { removeOnComplete: 100, removeOnFail: 100 });
    return reminder;
  }

  async update(userId: string, id: string, dto: UpdateReminderDto) {
    await this.findOne(userId, id);
    if (dto.jobId) await this.assertJob(userId, dto.jobId);
    return this.prisma.reminder.update({
      where: { id },
      data: {
        title: dto.title,
        dueAt: dto.dueAt ? new Date(dto.dueAt) : undefined,
        completed: dto.completed,
        jobId: dto.jobId,
      },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.reminder.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertJob(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({ where: { id: jobId, userId } });
    if (!job) throw new BadRequestException('Job does not belong to the current user');
  }
}
