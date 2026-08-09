import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class AnalyticsService {
  constructor(private prisma: PrismaService) {}

  async getDashboardStats(userId: string) {
    const now = new Date();
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // 1. Total Jobs
    const totalJobs = await this.prisma.job.count({
      where: { userId },
    });

    // 2. Jobs by Status
    const jobsByStatusRaw = await this.prisma.job.groupBy({
      by: ['status'],
      where: { userId },
      _count: { _all: true },
    });
    const jobsByStatus = jobsByStatusRaw.reduce((acc, curr) => {
      acc[curr.status] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    // 3. Jobs by Priority
    const jobsByPriorityRaw = await this.prisma.job.groupBy({
      by: ['priority'],
      where: { userId },
      _count: { _all: true },
    });
    const jobsByPriority = jobsByPriorityRaw.reduce((acc, curr) => {
      acc[curr.priority] = curr._count._all;
      return acc;
    }, {} as Record<string, number>);

    // 4. Applications Weekly & Monthly
    const applicationsThisWeek = await this.prisma.job.count({
      where: {
        userId,
        appliedAt: { gte: sevenDaysAgo },
      },
    });

    const applicationsThisMonth = await this.prisma.job.count({
      where: {
        userId,
        appliedAt: { gte: thirtyDaysAgo },
      },
    });

    // 5. Interviews Scheduled
    const interviewsScheduled = await this.prisma.interview.count({
      where: {
        status: 'SCHEDULED',
        job: { userId },
      },
    });

    // 6. Offers
    const offers = await this.prisma.job.count({
      where: {
        userId,
        status: { in: ['OFFER', 'ACCEPTED'] },
      },
    });

    // 7. Accepted
    const acceptedJobs = await this.prisma.job.count({
      where: {
        userId,
        status: 'ACCEPTED',
      },
    });

    // 8. Rejected
    const rejectedJobs = await this.prisma.job.count({
      where: {
        userId,
        status: 'REJECTED',
      },
    });

    // 9. Conversion Metrics
    const respondedJobs = await this.prisma.job.count({
      where: {
        userId,
        status: { notIn: ['WISHLIST', 'APPLIED'] },
      },
    });

    const jobsWithInterviews = await this.prisma.job.count({
      where: {
        userId,
        interviews: { some: {} },
      },
    });

    const responseRate = totalJobs > 0 ? (respondedJobs / totalJobs) * 100 : 0;
    const interviewConversionRate = totalJobs > 0 ? (jobsWithInterviews / totalJobs) * 100 : 0;
    const offerRate = totalJobs > 0 ? (offers / totalJobs) * 100 : 0;

    // 10. Upcoming Interviews
    const upcomingInterviews = await this.prisma.interview.findMany({
      where: {
        job: { userId },
        scheduledAt: { gte: now },
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: { scheduledAt: 'asc' },
      take: 5,
    });

    // 11. Upcoming Reminders
    const upcomingReminders = await this.prisma.reminder.findMany({
      where: {
        job: { userId },
        completed: false,
      },
      include: {
        job: {
          select: {
            id: true,
            title: true,
          },
        },
      },
      orderBy: { dueAt: 'asc' },
      take: 5,
    });

    // 12. Recent Activities
    const recentActivities = await this.prisma.activity.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      totalJobs,
      jobsByStatus,
      jobsByPriority,
      applicationsThisWeek,
      applicationsThisMonth,
      interviewsScheduled,
      offers,
      acceptedJobs,
      rejectedJobs,
      conversionMetrics: {
        responseRate: Math.round(responseRate * 10) / 10,
        interviewConversionRate: Math.round(interviewConversionRate * 10) / 10,
        offerRate: Math.round(offerRate * 10) / 10,
      },
      upcomingInterviews,
      upcomingReminders,
      recentActivities,
    };
  }
}
