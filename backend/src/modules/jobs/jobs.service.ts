import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CreateJobDto } from './dto/create-job.dto';
import { UpdateJobDto } from './dto/update-job.dto';
import { JobsQueryDto } from './dto/jobs-query.dto';
import { UpdateStatusDto } from './dto/update-status.dto';
import { UpdatePriorityDto } from './dto/update-priority.dto';

@Injectable()
export class JobsService {
  constructor(private prisma: PrismaService) {}

  async create(userId: string, dto: CreateJobDto) {
    if (dto.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: dto.companyId, userId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    return this.prisma.$transaction(async (tx) => {
      const job = await tx.job.create({
        data: {
          title: dto.title,
          description: dto.description,
          url: dto.url,
          salaryMin: dto.salaryMin,
          salaryMax: dto.salaryMax,
          salaryCurrency: dto.salaryCurrency,
          location: dto.location,
          remoteType: dto.remoteType,
          status: dto.status,
          priority: dto.priority,
          appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : null,
          companyId: dto.companyId,
          userId,
        },
        include: { company: true },
      });

      // Create initial activity log
      await tx.activity.create({
        data: {
          type: 'STATUS_CHANGE',
          content: `Job created with status: ${dto.status}`,
          metadata: {
            newStatus: dto.status,
          },
          userId,
          jobId: job.id,
        },
      });

      return job;
    });
  }

  async findAll(userId: string, query: JobsQueryDto) {
    const where: any = { userId };

    if (query.remoteType) {
      where.remoteType = query.remoteType;
    }
    if (query.status) {
      where.status = query.status;
    }
    if (query.priority) {
      where.priority = query.priority;
    }
    if (query.location) {
      where.location = { contains: query.location, mode: 'insensitive' };
    }
    if (query.companyId) {
      where.companyId = query.companyId;
    }
    if (query.minSalary !== undefined) {
      where.salaryMin = { gte: query.minSalary };
    }
    if (query.maxSalary !== undefined) {
      where.salaryMax = { lte: query.maxSalary };
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { description: { contains: query.search, mode: 'insensitive' } },
        { location: { contains: query.search, mode: 'insensitive' } },
        { company: { name: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const skip = (query.page - 1) * query.limit;
    const take = query.limit;

    const [total, items] = await Promise.all([
      this.prisma.job.count({ where }),
      this.prisma.job.findMany({
        where,
        include: { company: true },
        skip,
        take,
        orderBy: { appliedAt: 'desc' },
      }),
    ]);

    return {
      items,
      meta: {
        total,
        page: query.page,
        limit: query.limit,
        totalPages: Math.ceil(total / query.limit),
      },
    };
  }

  async findOne(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, userId },
      include: { company: true },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    return job;
  }

  async update(userId: string, jobId: string, dto: UpdateJobDto) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, userId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    if (dto.companyId && dto.companyId !== job.companyId) {
      const company = await this.prisma.company.findFirst({
        where: { id: dto.companyId, userId },
      });
      if (!company) {
        throw new NotFoundException('Company not found');
      }
    }

    const statusChanged = dto.status && dto.status !== job.status;

    return this.prisma.$transaction(async (tx) => {
      if (statusChanged) {
        await tx.activity.create({
          data: {
            type: 'STATUS_CHANGE',
            content: `Job status updated from ${job.status} to ${dto.status}`,
            metadata: {
              oldStatus: job.status,
              newStatus: dto.status,
            },
            userId,
            jobId,
          },
        });
      }

      return tx.job.update({
        where: { id: jobId },
        data: {
          ...(dto.title !== undefined && { title: dto.title }),
          ...(dto.description !== undefined && { description: dto.description }),
          ...(dto.url !== undefined && { url: dto.url }),
          ...(dto.salaryMin !== undefined && { salaryMin: dto.salaryMin }),
          ...(dto.salaryMax !== undefined && { salaryMax: dto.salaryMax }),
          ...(dto.salaryCurrency !== undefined && { salaryCurrency: dto.salaryCurrency }),
          ...(dto.location !== undefined && { location: dto.location }),
          ...(dto.remoteType !== undefined && { remoteType: dto.remoteType }),
          ...(dto.status !== undefined && { status: dto.status }),
          ...(dto.priority !== undefined && { priority: dto.priority }),
          ...(dto.appliedAt !== undefined && { appliedAt: dto.appliedAt ? new Date(dto.appliedAt) : null }),
          ...(dto.companyId !== undefined && { companyId: dto.companyId }),
        },
        include: { company: true },
      });
    });
  }

  async updateStatus(userId: string, jobId: string, dto: UpdateStatusDto) {
    return this.update(userId, jobId, { status: dto.status });
  }

  async updatePriority(userId: string, jobId: string, dto: UpdatePriorityDto) {
    return this.update(userId, jobId, { priority: dto.priority });
  }

  async remove(userId: string, jobId: string) {
    const job = await this.prisma.job.findFirst({
      where: { id: jobId, userId },
    });

    if (!job) {
      throw new NotFoundException('Job not found');
    }

    await this.prisma.job.delete({
      where: { id: jobId },
    });

    return { success: true };
  }
}
