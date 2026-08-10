import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getDashboardStats } from './api';
import { completeReminder } from '../reminders/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import {
  Briefcase,
  Calendar,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  CheckSquare,
} from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const queryClient = useQueryClient();

  const {
    data: stats,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['dashboardStats'],
    queryFn: getDashboardStats,
  });

  const completeMutation = useMutation({
    mutationFn: completeReminder,
    onSuccess: () => {
      toast.success('Reminder completed!');
      queryClient.invalidateQueries({ queryKey: ['dashboardStats'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to complete reminder');
    },
  });

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <div className="flex justify-between items-center">
          <div className="space-y-2 w-1/4">
            <Skeleton variant="text" className="h-8" />
            <Skeleton variant="text" className="h-4 w-2/3" />
          </div>
          <Skeleton variant="rect" className="w-24 h-10 rounded-ios-md" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Skeleton variant="rect" className="h-28 rounded-ios-lg" />
          <Skeleton variant="rect" className="h-28 rounded-ios-lg" />
          <Skeleton variant="rect" className="h-28 rounded-ios-lg" />
          <Skeleton variant="rect" className="h-28 rounded-ios-lg" />
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton variant="rect" className="h-64 lg:col-span-2 rounded-ios-lg" />
          <Skeleton variant="rect" className="h-64 rounded-ios-lg" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        icon={AlertCircle}
        title="Failed to load dashboard metrics"
        description="There was a connection issue loading your job analytics data. Please try again."
        action={
          <Button variant="primary" onClick={() => refetch()}>
            Retry Connection
          </Button>
        }
      />
    );
  }

  const {
    totalJobs = 0,
    jobsByStatus = {},
    applicationsThisMonth = 0,
    interviewsScheduled = 0,
    offers = 0,
    acceptedJobs = 0,
    conversionMetrics = { responseRate: 0, interviewConversionRate: 0, offerRate: 0 },
    upcomingInterviews = [],
    upcomingReminders = [],
    recentActivities = [],
  } = stats || {};

  // Formulate Funnel statuses list
  const funnelStages = [
    { label: 'Wishlist', key: 'WISHLIST', color: 'bg-neutral-400' },
    { label: 'Applied', key: 'APPLIED', color: 'bg-ios-blue' },
    { label: 'Screening', key: 'PHONE_SCREEN', color: 'bg-ios-orange' },
    { label: 'Interview', key: 'INTERVIEW', color: 'bg-ios-purple' },
    { label: 'Offer', key: 'OFFER', color: 'bg-ios-green' },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Your job search, beautifully organized.
          </p>
        </div>
        <Link to="/jobs">
          <Button variant="primary">Add New Application</Button>
        </Link>
      </div>

      {/* Analytics Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="flex flex-col gap-2 p-5">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Total Applications
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight">{totalJobs}</span>
            <Badge variant="blue">+{applicationsThisMonth} this month</Badge>
          </div>
        </Card>

        <Card className="flex flex-col gap-2 p-5">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Interviews Scheduled
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight">{interviewsScheduled}</span>
            <Badge variant="purple">Active</Badge>
          </div>
        </Card>

        <Card className="flex flex-col gap-2 p-5">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Offers
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight">{offers}</span>
            <Badge variant="green">+{offers} received</Badge>
          </div>
        </Card>

        <Card className="flex flex-col gap-2 p-5">
          <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider">
            Accepted
          </span>
          <div className="flex items-baseline justify-between">
            <span className="text-3xl font-extrabold tracking-tight">{acceptedJobs}</span>
            <Badge variant="green">Hired</Badge>
          </div>
        </Card>
      </div>

      {/* Funnel and Conversion Meters */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Application Funnel */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Application Funnel
            </h3>
            <p className="text-[11px] text-neutral-400">Conversion stages of active applications</p>
          </div>

          <div className="flex flex-col gap-3.5 my-2">
            {funnelStages.map((stage) => {
              const count = jobsByStatus[stage.key] || 0;
              const percent = totalJobs > 0 ? (count / totalJobs) * 100 : 0;
              return (
                <div key={stage.key} className="flex items-center gap-4">
                  <span className="w-24 text-xs font-semibold text-neutral-500">{stage.label}</span>
                  <div className="flex-1 bg-neutral-100 dark:bg-neutral-800 h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${stage.color} rounded-full transition-all duration-500`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                  <span className="w-8 text-right text-xs font-bold">{count}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Conversion Metrics */}
        <Card className="flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Conversion Metrics
            </h3>
            <p className="text-[11px] text-neutral-400">Funnel efficiency ratios</p>
          </div>

          <div className="flex flex-col gap-4 mt-2">
            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-ios-md">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-ios-blue" />
                <span className="text-xs font-semibold">Response Rate</span>
              </div>
              <span className="text-sm font-extrabold">{conversionMetrics.responseRate}%</span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-ios-md">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-ios-purple" />
                <span className="text-xs font-semibold">Interview Rate</span>
              </div>
              <span className="text-sm font-extrabold">
                {conversionMetrics.interviewConversionRate}%
              </span>
            </div>

            <div className="flex items-center justify-between p-3 bg-neutral-50 dark:bg-neutral-800/40 rounded-ios-md">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-ios-green" />
                <span className="text-xs font-semibold">Offer Rate</span>
              </div>
              <span className="text-sm font-extrabold">{conversionMetrics.offerRate}%</span>
            </div>
          </div>
        </Card>
      </div>

      {/* Timeline and Upcoming Tasks List */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activities Timeline */}
        <Card className="lg:col-span-2 flex flex-col gap-4">
          <div>
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Recent Activity
            </h3>
            <p className="text-[11px] text-neutral-400">Updates across your pipeline</p>
          </div>

          <div className="flex flex-col gap-4 mt-2 max-h-[300px] overflow-y-auto pr-2">
            {recentActivities.length === 0 ? (
              <p className="text-xs text-neutral-400 italic">No recent activity logged.</p>
            ) : (
              recentActivities.map((act: any) => (
                <div key={act.id} className="flex gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full bg-ios-blue/10 border border-ios-blue/20 flex items-center justify-center text-ios-blue">
                      <Briefcase className="w-3.5 h-3.5" />
                    </div>
                    <div className="flex-1 w-[1px] bg-ios-border-light dark:bg-ios-border-dark mt-2" />
                  </div>
                  <div className="flex-1 pb-2">
                    <p className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold">
                      {act.content}
                    </p>
                    <span className="text-[10px] text-neutral-400 font-medium">
                      {new Date(act.createdAt).toLocaleDateString()} at{' '}
                      {new Date(act.createdAt).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>

        {/* Upcoming Tasks (Interviews & Reminders) */}
        <div className="flex flex-col gap-6">
          {/* Upcoming Interviews */}
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Upcoming Interviews
            </h3>
            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
              {upcomingInterviews.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No upcoming interviews scheduled.</p>
              ) : (
                upcomingInterviews.map((int: any) => (
                  <Link key={int.id} to={`/jobs/${int.job?.id}`}>
                    <div className="flex items-center justify-between p-3 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md hover:bg-neutral-50 dark:hover:bg-neutral-800/40 transition-colors">
                      <div>
                        <h4 className="text-xs font-bold truncate max-w-[150px]">
                          {int.job?.title}
                        </h4>
                        <span className="text-[10px] text-neutral-400 font-semibold block">
                          {int.job?.company?.name || 'Company'}
                        </span>
                      </div>
                      <Badge variant="purple">
                        {new Date(int.scheduledAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </Badge>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </Card>

          {/* Upcoming Reminders */}
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Upcoming Reminders
            </h3>
            <div className="flex flex-col gap-3 max-h-[200px] overflow-y-auto pr-1">
              {upcomingReminders.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No upcoming reminders.</p>
              ) : (
                upcomingReminders.map((rem: any) => (
                  <div
                    key={rem.id}
                    className="flex items-center justify-between p-3 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md"
                  >
                    <div>
                      <h4 className="text-xs font-bold truncate max-w-[150px]">{rem.title}</h4>
                      <span className="text-[10px] text-neutral-400 font-semibold block">
                        Due:{' '}
                        {new Date(rem.dueAt).toLocaleDateString([], {
                          month: 'short',
                          day: 'numeric',
                        })}
                      </span>
                    </div>
                    <button
                      onClick={() => completeMutation.mutate(rem.id)}
                      className="w-8 h-8 rounded-full border border-neutral-200 hover:border-ios-blue hover:bg-ios-blue/10 flex items-center justify-center text-neutral-400 hover:text-ios-blue transition-colors cursor-pointer"
                    >
                      <CheckSquare className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};
