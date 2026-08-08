import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateActivityDto } from './dto/create-activity.dto';
import { UpdateActivityDto } from './dto/update-activity.dto';

@Injectable()
export class ActivitiesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.activity.findMany({
      where: { userId },
      include: { job: { select: { id: true, title: true } } },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(userId: string, id: string) {
    const item = await this.prisma.activity.findFirst({ where: { id, userId }, include: { job: true } });
    if (!item) throw new NotFoundException('Activity not found');
    return item;
  }

  async create(userId: string, dto: CreateActivityDto) {
    if (dto.jobId) {
      const job = await this.prisma.job.findFirst({ where: { id: dto.jobId, userId } });
      if (!job) throw new BadRequestException('Job does not belong to the current user');
    }
    return this.prisma.activity.create({ data: { ...dto, userId } });
  }

  async update(userId: string, id: string, dto: UpdateActivityDto) {
    await this.findOne(userId, id);
    return this.prisma.activity.update({ where: { id }, data: dto });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.activity.delete({ where: { id } });
    return { deleted: true };
  }
}
