import { Injectable } from '@nestjs/common';
import { JobStatus } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private readonly prisma: PrismaService) {}

  async dashboard(userId: string) {
    const [statusCounts, interviewsThisWeek, offers, totalApplications, responses] =
      await Promise.all([
        this.prisma.job.groupBy({
          by: ['status'],
          where: { userId },
          _count: { _all: true },
        }),
        this.prisma.interview.count({
          where: {
            job: { userId },
            scheduledAt: {
              gte: this.startOfWeek(),
              lt: this.endOfWeek(),
            },
          },
        }),
        this.prisma.job.count({ where: { userId, status: { in: [JobStatus.OFFER, JobStatus.ACCEPTED] } } }),
        this.prisma.job.count({ where: { userId, status: { not: JobStatus.WISHLIST } } }),
        this.prisma.job.count({
          where: {
            userId,
            status: { in: [JobStatus.PHONE_SCREEN, JobStatus.INTERVIEW, JobStatus.OFFER, JobStatus.ACCEPTED] },
          },
        }),
      ]);

    const funnel = Object.values(JobStatus).map((status) => ({
      status,
      count: statusCounts.find((item) => item.status === status)?._count._all ?? 0,
    }));

    return {
      activeApplications: await this.prisma.job.count({
        where: { userId, status: { in: [JobStatus.APPLIED, JobStatus.PHONE_SCREEN, JobStatus.INTERVIEW, JobStatus.OFFER] } },
      }),
      interviewsThisWeek,
      offersReceived: offers,
      responseRate: totalApplications ? Number(((responses / totalApplications) * 100).toFixed(1)) : 0,
      funnel,
    };
  }

  private startOfWeek() {
    const now = new Date();
    const day = now.getUTCDay();
    const diff = day === 0 ? -6 : 1 - day;
    const start = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + diff));
    return start;
  }

  private endOfWeek() {
    const start = this.startOfWeek();
    return new Date(start.getTime() + 7 * 24 * 60 * 60 * 1000);
  }
}
