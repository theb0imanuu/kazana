import * as React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getInterviews, createInterview, updateInterview, deleteInterview } from './api';
import { getJobs } from '../jobs/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import {
  Calendar as CalendarIcon,
  Plus,
  Trash2,
  CheckCircle2,
  Video,
  Phone,
  Building,
  FileText,
  MapPin,
  Clock,
} from 'lucide-react';

export const InterviewsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = React.useState('list'); // 'list' or 'calendar'
  const [isAddOpen, setIsAddOpen] = React.useState(false);

  // Form Fields
  const [jobId, setJobId] = React.useState('');
  const [type, setType] = React.useState('VIDEO');
  const [scheduledAt, setScheduledAt] = React.useState('');
  const [duration, setDuration] = React.useState(45);
  const [location, setLocation] = React.useState('');
  const [notes, setNotes] = React.useState('');

  const {
    data: interviewsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['interviews'],
    queryFn: () => getInterviews(),
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobsList'],
    queryFn: () => getJobs({ limit: 100 }),
  });

  const createMutation = useMutation({
    mutationFn: createInterview,
    onSuccess: () => {
      toast.success('Interview scheduled successfully!');
      setJobId('');
      setType('VIDEO');
      setScheduledAt('');
      setDuration(45);
      setLocation('');
      setNotes('');
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    },
  });

  const completeMutation = useMutation({
    mutationFn: ({ id }: { id: string }) => updateInterview(id, { status: 'COMPLETED' }),
    onSuccess: () => {
      toast.success('Interview marked as completed!');
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to complete interview');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteInterview,
    onSuccess: () => {
      toast.success('Interview removed');
      queryClient.invalidateQueries({ queryKey: ['interviews'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to remove interview');
    },
  });

  const interviewsList = interviewsData?.data || [];
  const jobsList = jobsData?.data || [];

  // Calendar parameters
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth(); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfMonth = (year: number, month: number) => {
    return new Date(year, month, 1).getDay();
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayIndex = getFirstDayOfMonth(currentYear, currentMonth);
  
  const daysArray = [];
  // Padding cells before the 1st
  for (let i = 0; i < firstDayIndex; i++) {
    daysArray.push(null);
  }
  // Days of month
  for (let d = 1; d <= daysInMonth; d++) {
    daysArray.push(d);
  }

  const getIcon = (t: string) => {
    switch (t) {
      case 'VIDEO': return <Video className="w-4 h-4 text-ios-blue" />;
      case 'PHONE': return <Phone className="w-4 h-4 text-ios-green" />;
      case 'ONSITE': return <Building className="w-4 h-4 text-ios-orange" />;
      default: return <FileText className="w-4 h-4 text-neutral-400" />;
    }
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
            Interviews
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Monitor mock evaluations, screenings, and take-homes
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Schedule
        </Button>
      </div>

      {/* Switcher Card */}
      <Card className="p-4 flex justify-between items-center">
        <span className="text-xs font-bold text-neutral-500">
          {view === 'calendar' ? `${monthNames[currentMonth]} ${currentYear}` : 'Upcoming events'}
        </span>
        <SegmentedControl
          options={[
            { label: 'List View', value: 'list' },
            { label: 'Calendar Grid', value: 'calendar' },
          ]}
          value={view}
          onChange={setView}
        />
      </Card>

      {/* Main Content */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <Skeleton variant="rect" className="h-16 rounded-ios-md" />
          <Skeleton variant="rect" className="h-16 rounded-ios-md" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={CalendarIcon}
          title="Connection Failure"
          description="Failed to load interview logs. Please check your backend connection."
          action={<Button variant="primary" onClick={() => refetch()}>Retry</Button>}
        />
      ) : interviewsList.length === 0 ? (
        <EmptyState
          icon={CalendarIcon}
          title="No interviews scheduled"
          description="Click Schedule to track technical evaluations, phone screenings, or onsite meetings."
          action={<Button variant="primary" onClick={() => setIsAddOpen(true)}>Schedule Interview</Button>}
        />
      ) : view === 'list' ? (
        /* List View */
        <div className="flex flex-col gap-4">
          {interviewsList.map((int: any) => (
            <Card key={int.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-5 group relative">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-ios-purple/10 flex items-center justify-center text-ios-purple border border-ios-purple/20">
                  {getIcon(int.type)}
                </div>
                <div>
                  <Link to={`/jobs/${int.job?.id}`}>
                    <h3 className="font-bold text-neutral-800 dark:text-neutral-200 hover:text-ios-blue transition-colors">
                      {int.job?.title || 'Job Submission'}
                    </h3>
                  </Link>
                  <span className="text-xs text-neutral-500 font-semibold block">
                    {int.job?.company?.name || 'Company Name'}
                  </span>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-[10px] text-neutral-400 font-semibold">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {new Date(int.scheduledAt).toLocaleString()} ({int.duration} mins)
                    </span>
                    {int.location ? (
                      <span className="flex items-center gap-1">
                        <MapPin className="w-3.5 h-3.5" />
                        {int.location}
                      </span>
                    ) : null}
                  </div>
                </div>
              </div>

              <div className="flex gap-2.5 items-center self-end md:self-center pr-8">
                <Badge variant={int.status === 'SCHEDULED' ? 'purple' : 'green'}>
                  {int.status}
                </Badge>
                {int.status === 'SCHEDULED' ? (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs font-bold text-ios-green border border-ios-green/20 bg-ios-green/5 hover:bg-ios-green/10"
                    onClick={() => completeMutation.mutate({ id: int.id })}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                    Complete
                  </Button>
                ) : null}
              </div>

              <button
                onClick={() => deleteMutation.mutate(int.id)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-ios-red p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      ) : (
        /* Calendar Monthly Grid View */
        <Card className="p-6">
          <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold text-neutral-400 mb-3 uppercase tracking-wider">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {daysArray.map((day, idx) => {
              if (day === null) {
                return <div key={`pad-${idx}`} className="h-20 bg-neutral-50/20 dark:bg-neutral-900/10 rounded-ios-sm border border-transparent" />;
              }

              // Match interviews on this day
              const dayInterviews = interviewsList.filter((int: any) => {
                const sDate = new Date(int.scheduledAt);
                return (
                  sDate.getFullYear() === currentYear &&
                  sDate.getMonth() === currentMonth &&
                  sDate.getDate() === day
                );
              });

              return (
                <div
                  key={`day-${day}`}
                  className="h-20 p-1.5 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md bg-white dark:bg-neutral-900 flex flex-col gap-1 overflow-y-auto"
                >
                  <span className="text-xs font-bold text-neutral-400 dark:text-neutral-500">
                    {day}
                  </span>
                  {dayInterviews.map((int: any) => (
                    <Link
                      key={int.id}
                      to={`/jobs/${int.job?.id}`}
                      className="text-[9px] font-extrabold truncate bg-ios-purple/10 border border-ios-purple/20 text-ios-purple p-1 rounded-ios-sm block hover:bg-ios-purple/25 transition-colors"
                      title={`${int.type} Interview - ${int.job?.title}`}
                    >
                      {int.type}: {int.job?.company?.name || 'Job'}
                    </Link>
                  ))}
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Schedule Interview Modal Dialog */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule Interview">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!jobId || !scheduledAt) return;
            createMutation.mutate({
              jobId,
              type,
              scheduledAt: new Date(scheduledAt).toISOString(),
              duration: Number(duration),
              location: location || undefined,
              notes: notes || undefined,
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Job Application Link</label>
            <select
              required
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="h-11 px-3 bg-white border border-ios-border-light dark:bg-neutral-800 dark:border-ios-border-dark rounded-ios-md text-sm"
            >
              <option value="">Select Job Application</option>
              {jobsList.map((j: any) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.company?.name || 'Company'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Interview Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold focus:outline-none"
            >
              <option value="PHONE">Phone</option>
              <option value="VIDEO">Video</option>
              <option value="ONSITE">Onsite</option>
              <option value="TAKEHOME">Take-home</option>
            </select>
          </div>

          <Input
            label="Schedule Date & Time"
            type="datetime-local"
            required
            value={scheduledAt}
            onChange={(e) => setScheduledAt(e.target.value)}
          />

          <Input
            label="Duration (minutes)"
            type="number"
            required
            value={duration}
            onChange={(e) => setDuration(Number(e.target.value))}
          />

          <Input
            label="Location / Meeting Link"
            type="text"
            placeholder="Zoom, Google Meet, or address"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="p-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm focus:outline-none min-h-[80px]"
            />
          </div>

          <Button type="submit" variant="primary" className="mt-2" isLoading={createMutation.isPending}>
            Schedule Meeting
          </Button>
        </form>
      </Modal>
    </div>
  );
};
