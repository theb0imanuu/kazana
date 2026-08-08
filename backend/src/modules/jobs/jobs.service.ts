import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';

@Injectable()
export class JobsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll(userId: string) {
    return this.prisma.job.findMany({
      where: { userId },
      include: {
        company: true,
        _count: { select: { interviews: true, documents: true, reminders: true } },
      },
      orderBy: [{ updatedAt: 'desc' }],
    });
  }

  async findOne(userId: string, id: string) {
    const job = await this.prisma.job.findFirst({
      where: { id, userId },
      include: {
        company: true,
        interviews: { include: { contacts: true }, orderBy: { scheduledAt: 'asc' } },
        documents: true,
        activities: { orderBy: { createdAt: 'desc' } },
        reminders: { orderBy: { dueAt: 'asc' } },
      },
    });
    if (!job) throw new NotFoundException('Job not found');
    return job;
  }

  async create(userId: string, dto: CreateJobDto) {
    await this.assertCompanyOwnership(userId, dto.companyId);
    if (dto.salaryMin !== undefined && dto.salaryMax !== undefined && dto.salaryMin > dto.salaryMax) {
      throw new BadRequestException('salaryMin cannot exceed salaryMax');
    }

    return this.prisma.job.create({
      data: {
        title: dto.title,
        description: dto.description,
        url: dto.url,
        salaryMin: dto.salaryMin,
        salaryMax: dto.salaryMax,
        salaryCurrency: dto.salaryCurrency?.toUpperCase(),
        location: dto.location,
        remoteType: dto.remoteType,
        status: dto.status,
        priority: dto.priority,
        appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
        companyId: dto.companyId,
        userId,
      },
      include: { company: true },
    });
  }

  async update(userId: string, id: string, dto: UpdateJobDto) {
    await this.findOne(userId, id);
    if (dto.companyId) await this.assertCompanyOwnership(userId, dto.companyId);
    if (dto.salaryMin !== undefined && dto.salaryMax !== undefined && dto.salaryMin > dto.salaryMax) {
      throw new BadRequestException('salaryMin cannot exceed salaryMax');
    }

    const data = {
      ...dto,
      salaryCurrency: dto.salaryCurrency?.toUpperCase(),
      appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : undefined,
    };

    return this.prisma.job.update({ where: { id }, data, include: { company: true } });
  }

  async remove(userId: string, id: string) {
    await this.findOne(userId, id);
    await this.prisma.job.delete({ where: { id } });
    return { deleted: true };
  }

  private async assertCompanyOwnership(userId: string, companyId: string) {
    const company = await this.prisma.company.findFirst({ where: { id: companyId, userId } });
    if (!company) throw new BadRequestException('Company does not belong to the current user');
  }
}
