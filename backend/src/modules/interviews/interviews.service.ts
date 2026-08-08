import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateInterviewDto } from './dto/create-interview.dto';
import { UpdateInterviewDto } from './dto/update-interview.dto';

@Injectable()
export class InterviewsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.interview.findMany({
      where: { job: { userId } },
      include: { job: { include: { company: true } }, contacts: true },
      orderBy: { scheduledAt: 'asc' },
    });
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.interview.findFirst({
      where: { id, job: { userId } },
      include: { job: { include: { company: true } }, contacts: true },
    });
    if (!item) throw new NotFoundException('Interview not found');
    return item;
  }

  async create(userId: string, dto: CreateInterviewDto) {
    await this.assertJob(userId, dto.jobId);
    await this.assertContacts(userId, dto.contactIds ?? []);
    return this.prisma.interview.create({
      data: {
        type: dto.type,
        scheduledAt: new Date(dto.scheduledAt),
        duration: dto.duration,
        location: dto.location,
        notes: dto.notes,
        status: dto.status,
        jobId: dto.jobId,
        contacts: dto.contactIds ? { connect: dto.contactIds.map((id) => ({ id })) } : undefined,
      },
      include: { job: true, contacts: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateInterviewDto) {
    await this.findOne(userId, id);
    if (dto.jobId) await this.assertJob(userId, dto.jobId);
    if (dto.contactIds) await this.assertContacts(userId, dto.contactIds);

    return this.prisma.interview.update({
      where: { id },
      data: {
        type: dto.type,
        scheduledAt: dto.scheduledAt ? new Date(dto.scheduledAt) : undefined,
        duration: dto.duration,
        location: dto.location,
        notes: dto.notes,
        status: dto.status,
        jobId: dto.jobId,
        contacts: dto.contactIds ? { set: dto.contactIds.map((id) => ({ id })) } : undefined,
      },
      include: { job: true, contacts: true },
    });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.interview.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertJob(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({ where: { id: jobId, userId } });
    if (!job) throw new BadRequestException('Job does not belong to the current user');
  }

  private async assertContacts(userId: string, ids: string[]) {
    if (!ids.length) return;
    const count = await this.prisma.contact.count({ where: { id: { in: ids }, userId } });
    if (count !== ids.length) throw new BadRequestException('One or more contacts do not belong to the current user');
  }
}
