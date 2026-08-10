import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getJobs, createJob, updateJob, deleteJob } from './api';
import { getCompanies } from '../companies/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { EmptyState } from '../../components/ui/EmptyState';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';
import {
  Briefcase,
  Search,
  Trash2,
  Plus,
  ArrowLeft,
  ArrowRight,
  SlidersHorizontal,
} from 'lucide-react';

const STATUS_COLUMNS = [
  { label: 'Wishlist', value: 'WISHLIST', color: 'bg-neutral-500/10 border-neutral-500/20 text-neutral-600 dark:text-neutral-400' },
  { label: 'Applied', value: 'APPLIED', color: 'bg-ios-blue/10 border-ios-blue/20 text-ios-blue' },
  { label: 'Screening', value: 'PHONE_SCREEN', color: 'bg-ios-orange/10 border-ios-orange/20 text-ios-orange' },
  { label: 'Interviewing', value: 'INTERVIEW', color: 'bg-ios-purple/10 border-ios-purple/20 text-ios-purple' },
  { label: 'Offer', value: 'OFFER', color: 'bg-ios-green/10 border-ios-green/20 text-ios-green' },
  { label: 'Accepted', value: 'ACCEPTED', color: 'bg-emerald-600/10 border-emerald-600/20 text-emerald-600' },
  { label: 'Rejected', value: 'REJECTED', color: 'bg-ios-red/10 border-ios-red/20 text-ios-red' },
  { label: 'Withdrawn', value: 'WITHDRAWN', color: 'bg-neutral-400/10 border-neutral-400/20 text-neutral-500' },
];

export const JobsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [view, setView] = React.useState('kanban'); // 'kanban' or 'list'

  // Filter and Query States
  const [search, setSearch] = React.useState('');
  const [priority, setPriority] = React.useState('');
  const [remoteType, setRemoteType] = React.useState('');
  const [page, setPage] = React.useState(1);
  const limit = 20;

  // Add Job Modal State
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [newJob, setNewJob] = React.useState({
    title: '',
    description: '',
    url: '',
    location: '',
    remoteType: 'HYBRID',
    priority: 'MEDIUM',
    status: 'WISHLIST',
    companyId: '',
    salaryMin: '',
    salaryMax: '',
  });

  const queryParams = {
    page,
    limit,
    search: search || undefined,
    priority: priority || undefined,
    remoteType: remoteType || undefined,
  };

  const {
    data: jobsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['jobs', queryParams],
    queryFn: () => getJobs(queryParams),
  });

  const { data: companiesData } = useQuery({
    queryKey: ['companiesList'],
    queryFn: () => getCompanies({ limit: 100 }),
  });

  // Create Mutation
  const createMutation = useMutation({
    mutationFn: createJob,
    onSuccess: () => {
      toast.success('Job application added!');
      setIsAddOpen(false);
      setNewJob({
        title: '',
        description: '',
        url: '',
        location: '',
        remoteType: 'HYBRID',
        priority: 'MEDIUM',
        status: 'WISHLIST',
        companyId: '',
        salaryMin: '',
        salaryMax: '',
      });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add job application');
    },
  });

  // Status Update Mutation (Optimistic Update)
  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: string }) => updateJob(id, { status }),
    onMutate: async ({ id, status }) => {
      // Cancel outgoing refetches so they don't overwrite our optimistic update
      await queryClient.cancelQueries({ queryKey: ['jobs'] });

      // Snapshot previous value
      const previousJobs = queryClient.getQueryData(['jobs', queryParams]);

      // Optimistically update query cache
      queryClient.setQueryData(['jobs', queryParams], (old: any) => {
        if (!old || !old.data) return old;
        return {
          ...old,
          data: old.data.map((job: any) => (job.id === id ? { ...job, status } : job)),
        };
      });

      return { previousJobs };
    },
    onError: (err: any, _, context) => {
      // Rollback to snapshot
      if (context?.previousJobs) {
        queryClient.setQueryData(['jobs', queryParams], context.previousJobs);
      }
      toast.error(err.response?.data?.message || 'Failed to update status');
    },
    onSuccess: () => {
      toast.success('Pipeline updated!');
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });

  // Delete Mutation
  const deleteMutation = useMutation({
    mutationFn: deleteJob,
    onSuccess: () => {
      toast.success('Job deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete job');
    },
  });

  // Drag-and-Drop Handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, targetStatus: string) => {
    e.preventDefault();
    const id = e.dataTransfer.getData('text/plain');
    if (id) {
      updateStatusMutation.mutate({ id, status: targetStatus });
    }
  };

  const jobsList = jobsData?.data || [];
  const meta = jobsData?.meta || { total: 0, page: 1, limit: 20, totalPages: 1 };
  const companiesList = companiesData?.data || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
            Jobs Pipeline
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Monitor and prioritize your submissions
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Job
        </Button>
      </div>

      {/* Search and Filters panel */}
      <Card className="p-4 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="flex flex-wrap items-center gap-3.5 w-full md:w-auto">
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
            <input
              type="text"
              placeholder="Search title, company, location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full h-11 pl-9 pr-4 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-ios-blue"
            />
          </div>

          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold focus:outline-none"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </select>

          <select
            value={remoteType}
            onChange={(e) => setRemoteType(e.target.value)}
            className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold focus:outline-none"
          >
            <option value="">All Remote Types</option>
            <option value="ONSITE">Onsite</option>
            <option value="REMOTE">Remote</option>
            <option value="HYBRID">Hybrid</option>
          </select>
        </div>

        <SegmentedControl
          options={[
            { label: 'Kanban', value: 'kanban' },
            { label: 'List View', value: 'list' },
          ]}
          value={view}
          onChange={setView}
        />
      </Card>

      {/* Jobs Board Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          <Skeleton variant="rect" className="h-96" />
          <Skeleton variant="rect" className="h-96" />
          <Skeleton variant="rect" className="h-96" />
          <Skeleton variant="rect" className="h-96" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={SlidersHorizontal}
          title="Connection Failure"
          description="Failed to load job listings. Please check your backend connection."
          action={
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : jobsList.length === 0 ? (
        <EmptyState
          icon={Briefcase}
          title="No jobs found"
          description="Create your first job application card to populate this tracking pipeline."
          action={
            <Button variant="primary" onClick={() => setIsAddOpen(true)}>
              Add Job
            </Button>
          }
        />
      ) : view === 'kanban' ? (
        /* Kanban Board View */
        <div className="flex gap-4 overflow-x-auto pb-4 items-start select-none">
          {STATUS_COLUMNS.map((col) => {
            const columnJobs = jobsList.filter((j: any) => j.status === col.value);
            return (
              <div
                key={col.value}
                onDragOver={handleDragOver}
                onDrop={(e) => handleDrop(e, col.value)}
                className="w-72 flex-shrink-0 bg-white/50 dark:bg-neutral-900/50 backdrop-blur-md rounded-ios-lg p-4 border border-ios-border-light dark:border-ios-border-dark flex flex-col gap-3 min-h-[500px]"
              >
                <div className={`flex items-center justify-between p-2 rounded-ios-md border ${col.color}`}>
                  <span className="text-xs font-bold">{col.label}</span>
                  <Badge variant="gray" className="h-5 px-2 text-[10px]">
                    {columnJobs.length}
                  </Badge>
                </div>

                <div className="flex flex-col gap-3 max-h-[600px] overflow-y-auto pr-1">
                  {columnJobs.map((job: any) => (
                    <div
                      key={job.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, job.id)}
                      className="cursor-grab active:cursor-grabbing"
                    >
                      <Card className="p-4 hover:shadow-md transition-shadow relative group">
                        <div className="flex flex-col gap-2">
                          <div>
                            <Link to={`/jobs/${job.id}`} className="hover:text-ios-blue transition-colors">
                              <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-100 truncate">
                                {job.title}
                              </h4>
                            </Link>
                            <span className="text-[10px] text-neutral-400 font-semibold block">
                              {job.company?.name || 'Company'}
                            </span>
                          </div>

                          <div className="flex justify-between items-center mt-1">
                            <Badge variant={job.priority === 'URGENT' ? 'red' : 'orange'}>
                              {job.priority}
                            </Badge>
                            <button
                              onClick={() => deleteMutation.mutate(job.id)}
                              className="text-neutral-400 hover:text-ios-red p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </Card>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* List View */
        <div className="flex flex-col gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {jobsList.map((job: any) => (
              <Card key={job.id} className="flex justify-between items-center p-4">
                <div>
                  <Link to={`/jobs/${job.id}`}>
                    <h3 className="font-bold hover:text-ios-blue transition-colors">
                      {job.title}
                    </h3>
                  </Link>
                  <p className="text-xs text-neutral-400 font-semibold">
                    {job.company?.name || 'Company'} • {job.location || 'Location'}
                  </p>
                </div>
                <div className="flex gap-2 items-center">
                  <Badge variant="blue">{job.status}</Badge>
                  <Badge variant="purple">{job.priority}</Badge>
                  <button
                    onClick={() => deleteMutation.mutate(job.id)}
                    className="text-neutral-400 hover:text-ios-red p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </Card>
            ))}
          </div>

          {/* Pagination Controls */}
          {meta.totalPages > 1 ? (
            <div className="flex justify-center items-center gap-4 mt-4">
              <Button
                variant="secondary"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                <ArrowLeft className="w-4 h-4 mr-1" />
                Previous
              </Button>
              <span className="text-xs font-semibold text-neutral-500">
                Page {page} of {meta.totalPages}
              </span>
              <Button
                variant="secondary"
                size="sm"
                disabled={page === meta.totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
                <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </div>
          ) : null}
        </div>
      )}

      {/* Add Job Modal Dialog */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Add Application Card">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const salaryMin = newJob.salaryMin ? Number(newJob.salaryMin) : undefined;
            const salaryMax = newJob.salaryMax ? Number(newJob.salaryMax) : undefined;
            createMutation.mutate({
              ...newJob,
              salaryMin,
              salaryMax,
              companyId: newJob.companyId || undefined,
            });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Job Title"
            type="text"
            required
            value={newJob.title}
            onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1 select-none">
              Company Association
            </label>
            <select
              value={newJob.companyId}
              onChange={(e) => setNewJob({ ...newJob, companyId: e.target.value })}
              className="h-11 px-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm"
            >
              <option value="">Select Company (Optional)</option>
              {companiesList.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Location"
            type="text"
            placeholder="e.g. Cupertino, CA"
            value={newJob.location}
            onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={newJob.remoteType}
              onChange={(e) => setNewJob({ ...newJob, remoteType: e.target.value })}
              className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold"
            >
              <option value="ONSITE">Onsite</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>

            <select
              value={newJob.priority}
              onChange={(e) => setNewJob({ ...newJob, priority: e.target.value })}
              className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold"
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Min Salary"
              type="number"
              value={newJob.salaryMin}
              onChange={(e) => setNewJob({ ...newJob, salaryMin: e.target.value })}
            />
            <Input
              label="Max Salary"
              type="number"
              value={newJob.salaryMax}
              onChange={(e) => setNewJob({ ...newJob, salaryMax: e.target.value })}
            />
          </div>

          <Input
            label="Application URL"
            type="url"
            value={newJob.url}
            onChange={(e) => setNewJob({ ...newJob, url: e.target.value })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Description</label>
            <textarea
              value={newJob.description}
              onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
              className="p-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm placeholder-neutral-400 focus:outline-none min-h-[80px]"
            />
          </div>

          <Button type="submit" variant="primary" className="mt-2" isLoading={createMutation.isPending}>
            Add Card
          </Button>
        </form>
      </Modal>
    </div>
  );
};
