import { Test, TestingModule } from '@nestjs/testing';
import { AnalyticsService } from './analytics.service';
import { PrismaService } from '../../prisma/prisma.service';

describe('AnalyticsService', () => {
  let service: AnalyticsService;
  let prisma: PrismaService;

  const mockPrismaService = {
    job: {
      count: jest.fn(),
      groupBy: jest.fn(),
    },
    interview: {
      count: jest.fn(),
      findMany: jest.fn(),
    },
    reminder: {
      findMany: jest.fn(),
    },
    activity: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AnalyticsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<AnalyticsService>(AnalyticsService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const userId = 'user-1';

  describe('getDashboardStats', () => {
    it('should aggregate metrics strictly scoped to user', async () => {
      jest.spyOn(prisma.job, 'count').mockImplementation(async (args: any) => {
        // Enforce user isolation check in mock
        expect(args.where.userId).toBe(userId);

        if (args.where.status?.in) return 2; // offers (OFFER or ACCEPTED)
        if (args.where.status === 'ACCEPTED') return 1;
        if (args.where.status === 'REJECTED') return 1;
        if (args.where.status?.notIn) return 3; // responded jobs
        if (args.where.appliedAt) return 2; // weekly/monthly applications
        if (args.where.interviews) return 2; // jobs with interviews
        return 5; // total jobs
      });

      jest.spyOn(prisma.job, 'groupBy').mockImplementation(async (args: any) => {
        expect(args.where.userId).toBe(userId);
        if (args.by.includes('status')) {
          return [
            { status: 'APPLIED', _count: { _all: 3 } },
            { status: 'ACCEPTED', _count: { _all: 2 } },
          ];
        }
        if (args.by.includes('priority')) {
          return [
            { priority: 'HIGH', _count: { _all: 4 } },
            { priority: 'MEDIUM', _count: { _all: 1 } },
          ];
        }
        return [];
      });

      jest.spyOn(prisma.interview, 'count').mockImplementation(async (args: any) => {
        expect(args.where.job.userId).toBe(userId);
        return 1;
      });

      jest.spyOn(prisma.interview, 'findMany').mockImplementation(async (args: any) => {
        expect(args.where.job.userId).toBe(userId);
        return [];
      });

      jest.spyOn(prisma.reminder, 'findMany').mockImplementation(async (args: any) => {
        expect(args.where.job.userId).toBe(userId);
        return [];
      });

      jest.spyOn(prisma.activity, 'findMany').mockImplementation(async (args: any) => {
        expect(args.where.userId).toBe(userId);
        return [];
      });

      const stats = await service.getDashboardStats(userId);

      expect(stats.totalJobs).toBe(5);
      expect(stats.jobsByStatus).toEqual({ APPLIED: 3, ACCEPTED: 2 });
      expect(stats.jobsByPriority).toEqual({ HIGH: 4, MEDIUM: 1 });
      expect(stats.applicationsThisWeek).toBe(2);
      expect(stats.interviewsScheduled).toBe(1);
      expect(stats.offers).toBe(2);
      expect(stats.acceptedJobs).toBe(1);
      expect(stats.rejectedJobs).toBe(1);

      // response rate = 3/5 * 100 = 60
      // interview conversion rate = 2/5 * 100 = 40
      // offer rate = 2/5 * 100 = 40
      expect(stats.conversionMetrics).toEqual({
        responseRate: 60,
        interviewConversionRate: 40,
        offerRate: 40,
      });
    });
  });
});
