import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getJob, updateJob } from './api';
import { getJobActivities, createNoteActivity } from '../activities/api';
import { getReminders, createReminder, completeReminder, deleteReminder } from '../reminders/api';
import { getInterviews, createInterview, deleteInterview } from '../interviews/api';
import { getDocuments, uploadDocument, deleteDocument } from '../documents/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import {
  ChevronLeft,
  Calendar,
  Plus,
  Trash2,
  CheckSquare,
  FileText,
  MessageSquare,
  DollarSign,
  MapPin,
  ExternalLink,
  Edit3,
  Briefcase,
} from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Dialog States
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isNoteOpen, setIsNoteOpen] = React.useState(false);
  const [isReminderOpen, setIsReminderOpen] = React.useState(false);
  const [isInterviewOpen, setIsInterviewOpen] = React.useState(false);
  const [isDocOpen, setIsDocOpen] = React.useState(false);

  // Form States
  const [editFields, setEditFields] = React.useState<any>({});
  const [noteContent, setNoteContent] = React.useState('');
  const [reminderTitle, setReminderTitle] = React.useState('');
  const [reminderDue, setReminderDue] = React.useState('');
  const [interviewType, setInterviewType] = React.useState('VIDEO');
  const [interviewScheduled, setInterviewScheduled] = React.useState('');
  const [interviewDuration, setInterviewDuration] = React.useState(45);
  const [interviewLocation, setInterviewLocation] = React.useState('');
  const [interviewNotes, setInterviewNotes] = React.useState('');
  const [uploadFile, setUploadFile] = React.useState<File | null>(null);
  const [uploadType, setUploadType] = React.useState('RESUME');

  // React Query Queries
  const { data: job, isLoading: isJobLoading } = useQuery({
    queryKey: ['job', id],
    queryFn: () => getJob(id),
    enabled: !!id,
  });

  const { data: activities = [] } = useQuery({
    queryKey: ['activities', id],
    queryFn: () => getJobActivities(id),
    enabled: !!id,
  });

  const { data: remindersData } = useQuery({
    queryKey: ['reminders', { jobId: id }],
    queryFn: () => getReminders({ jobId: id }),
    enabled: !!id,
  });

  const { data: interviewsData } = useQuery({
    queryKey: ['interviews', { jobId: id }],
    queryFn: () => getInterviews({ jobId: id }),
    enabled: !!id,
  });

  const { data: docsData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => getDocuments(),
  });

  // Load edit fields once job is fetched
  React.useEffect(() => {
    if (job) {
      setEditFields({
        title: job.title || '',
        description: job.description || '',
        url: job.url || '',
        location: job.location || '',
        remoteType: job.remoteType || 'HYBRID',
        priority: job.priority || 'MEDIUM',
        status: job.status || 'WISHLIST',
        salaryMin: job.salaryMin || '',
        salaryMax: job.salaryMax || '',
      });
    }
  }, [job]);

  const updateMutation = useMutation({
    mutationFn: (dto: any) => updateJob(id, dto),
    onSuccess: () => {
      toast.success('Job details updated');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['job', id] });
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update job details');
    },
  });

  const noteMutation = useMutation({
    mutationFn: createNoteActivity,
    onSuccess: () => {
      toast.success('Note added');
      setNoteContent('');
      setIsNoteOpen(false);
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add note');
    },
  });

  const reminderMutation = useMutation({
    mutationFn: createReminder,
    onSuccess: () => {
      toast.success('Reminder task added');
      setReminderTitle('');
      setReminderDue('');
      setIsReminderOpen(false);
      queryClient.invalidateQueries({ queryKey: ['reminders', { jobId: id }] });
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add reminder');
    },
  });

  const completeReminderMutation = useMutation({
    mutationFn: completeReminder,
    onSuccess: () => {
      toast.success('Reminder completed');
      queryClient.invalidateQueries({ queryKey: ['reminders', { jobId: id }] });
    },
  });

  const deleteReminderMutation = useMutation({
    mutationFn: deleteReminder,
    onSuccess: () => {
      toast.success('Reminder deleted');
      queryClient.invalidateQueries({ queryKey: ['reminders', { jobId: id }] });
    },
  });

  const interviewMutation = useMutation({
    mutationFn: createInterview,
    onSuccess: () => {
      toast.success('Interview scheduled');
      setInterviewScheduled('');
      setInterviewLocation('');
      setInterviewNotes('');
      setIsInterviewOpen(false);
      queryClient.invalidateQueries({ queryKey: ['interviews', { jobId: id }] });
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to schedule interview');
    },
  });

  const deleteInterviewMutation = useMutation({
    mutationFn: deleteInterview,
    onSuccess: () => {
      toast.success('Interview deleted');
      queryClient.invalidateQueries({ queryKey: ['interviews', { jobId: id }] });
    },
  });

  const docMutation = useMutation({
    mutationFn: (fd: FormData) => uploadDocument(fd),
    onSuccess: () => {
      toast.success('Document uploaded');
      setUploadFile(null);
      setIsDocOpen(false);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      queryClient.invalidateQueries({ queryKey: ['activities', id] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Upload failed');
    },
  });

  const deleteDocMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
  });

  if (isJobLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <Skeleton variant="text" className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton variant="rect" className="h-80 rounded-ios-lg" />
          <Skeleton variant="rect" className="h-80 lg:col-span-2 rounded-ios-lg" />
        </div>
      </div>
    );
  }

  if (!job) {
    return (
      <EmptyState
        icon={Briefcase}
        title="Job not found"
        description="This job application does not exist or has been deleted."
        action={
          <Link to="/jobs">
            <Button variant="primary">Back to pipeline</Button>
          </Link>
        }
      />
    );
  }

  const reminders = remindersData?.data || [];
  const interviews = interviewsData?.data || [];
  const jobDocs = (docsData?.data || []).filter((d: any) => d.jobId === id);

  return (
    <div className="flex flex-col gap-6">
      {/* Back to Pipeline */}
      <div>
        <Link
          to="/jobs"
          className="inline-flex items-center gap-1 text-xs font-semibold text-ios-blue hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Pipeline
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
              {job.title}
            </h1>
            <span className="text-sm font-semibold text-neutral-500 block">
              {job.company?.name || 'Company Name'}
            </span>
          </div>
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
            <Edit3 className="w-4 h-4 mr-1.5" />
            Edit Card
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Parameters and Info */}
        <div className="flex flex-col gap-6">
          <Card className="flex flex-col gap-4">
            <h3 className="text-sm font-bold border-b border-ios-border-light dark:border-ios-border-dark pb-2">
              Parameters
            </h3>

            <div className="flex flex-col gap-3">
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Status
                </span>
                <div className="flex gap-2 mt-1">
                  <Badge variant="blue">{job.status}</Badge>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Priority
                </span>
                <div className="flex gap-2 mt-1">
                  <Badge variant={job.priority === 'URGENT' ? 'red' : 'orange'}>
                    {job.priority}
                  </Badge>
                </div>
              </div>

              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Remote Type
                </span>
                <div className="flex gap-2 mt-1">
                  <Badge variant="gray">{job.remoteType}</Badge>
                </div>
              </div>

              {job.location ? (
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Location
                  </span>
                  <div className="flex items-center gap-1 text-xs font-semibold text-neutral-600 dark:text-neutral-300 mt-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {job.location}
                  </div>
                </div>
              ) : null}

              {job.salaryMin || job.salaryMax ? (
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Salary Range
                  </span>
                  <div className="flex items-center gap-0.5 text-xs font-semibold text-neutral-600 dark:text-neutral-300 mt-1">
                    <DollarSign className="w-3.5 h-3.5" />
                    {job.salaryMin ? Number(job.salaryMin).toLocaleString() : '?'} -{' '}
                    {job.salaryMax ? Number(job.salaryMax).toLocaleString() : '?'}
                  </div>
                </div>
              ) : null}

              {job.url ? (
                <div>
                  <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                    Listing Url
                  </span>
                  <a
                    href={job.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-ios-blue hover:underline mt-1"
                  >
                    Open Post
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ) : null}
            </div>
          </Card>

          {/* Description Block */}
          {job.description ? (
            <Card className="flex flex-col gap-3">
              <h3 className="text-sm font-bold">Description</h3>
              <p className="text-xs text-neutral-600 dark:text-neutral-400 whitespace-pre-wrap leading-relaxed">
                {job.description}
              </p>
            </Card>
          ) : null}
        </div>

        {/* Right Column: Timelines & Tasks */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          {/* Reminders / Tasks Checklist */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-ios-border-light dark:border-ios-border-dark pb-2">
              <h3 className="text-sm font-bold">Tasks & Reminders</h3>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsReminderOpen(true)}>
                <Plus className="w-4.5 h-4.5 mr-1" /> Add Task
              </Button>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {reminders.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No tasks scheduled.</p>
              ) : (
                reminders.map((rem: any) => (
                  <div
                    key={rem.id}
                    className="flex items-center justify-between p-3 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md"
                  >
                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => completeReminderMutation.mutate(rem.id)}
                        className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                          rem.completed
                            ? 'bg-ios-green border-ios-green text-white'
                            : 'border-neutral-300 hover:border-ios-green'
                        }`}
                      >
                        {rem.completed ? <CheckSquare className="w-3.5 h-3.5" /> : null}
                      </button>
                      <span
                        className={`text-xs font-semibold ${
                          rem.completed ? 'line-through text-neutral-400' : ''
                        }`}
                      >
                        {rem.title}
                      </span>
                    </div>

                    <button
                      onClick={() => deleteReminderMutation.mutate(rem.id)}
                      className="text-neutral-400 hover:text-ios-red p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Documents attachments */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-ios-border-light dark:border-ios-border-dark pb-2">
              <h3 className="text-sm font-bold">Resumes & Cover Letters</h3>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsDocOpen(true)}>
                <Plus className="w-4.5 h-4.5 mr-1" /> Add Doc
              </Button>
            </div>

            <div className="flex flex-col gap-2 max-h-[220px] overflow-y-auto pr-1">
              {jobDocs.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No attachments uploaded.</p>
              ) : (
                jobDocs.map((doc: any) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between p-3 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md"
                  >
                    <div className="flex items-center gap-2.5">
                      <FileText className="w-4.5 h-4.5 text-neutral-400" />
                      <div>
                        <a
                          href={doc.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-xs font-bold text-ios-blue hover:underline block"
                        >
                          {doc.name}
                        </a>
                        <span className="text-[10px] text-neutral-400 font-semibold block">
                          {doc.mimeType} • {(doc.size / 1024).toFixed(1)} KB
                        </span>
                      </div>
                    </div>

                    <button
                      onClick={() => deleteDocMutation.mutate(doc.id)}
                      className="text-neutral-400 hover:text-ios-red p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Interviews Schedule */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-ios-border-light dark:border-ios-border-dark pb-2">
              <h3 className="text-sm font-bold">Scheduled Interviews</h3>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsInterviewOpen(true)}>
                <Plus className="w-4.5 h-4.5 mr-1" /> Add Interview
              </Button>
            </div>

            <div className="flex flex-col gap-3 max-h-[220px] overflow-y-auto pr-1">
              {interviews.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No interviews scheduled yet.</p>
              ) : (
                interviews.map((int: any) => (
                  <div
                    key={int.id}
                    className="flex items-center justify-between p-3 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md"
                  >
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-ios-purple" />
                      <div>
                        <h4 className="text-xs font-bold">{int.type} Interview</h4>
                        <span className="text-[10px] text-neutral-400 font-semibold block">
                          {new Date(int.scheduledAt).toLocaleString()} ({int.duration} mins)
                        </span>
                        {int.location ? (
                          <span className="text-[9px] text-neutral-400 font-medium block">
                            Location: {int.location}
                          </span>
                        ) : null}
                      </div>
                    </div>

                    <button
                      onClick={() => deleteInterviewMutation.mutate(int.id)}
                      className="text-neutral-400 hover:text-ios-red p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Activity / Notes timeline */}
          <Card className="flex flex-col gap-4">
            <div className="flex items-center justify-between border-b border-ios-border-light dark:border-ios-border-dark pb-2">
              <h3 className="text-sm font-bold">Timeline & Notes</h3>
              <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsNoteOpen(true)}>
                <Plus className="w-4.5 h-4.5 mr-1" /> Add Note
              </Button>
            </div>

            <div className="flex flex-col gap-4 mt-2 max-h-[300px] overflow-y-auto pr-2">
              {activities.length === 0 ? (
                <p className="text-xs text-neutral-400 italic">No history logged.</p>
              ) : (
                activities.map((act: any) => (
                  <div key={act.id} className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className="w-7 h-7 rounded-full bg-ios-blue/10 border border-ios-blue/20 flex items-center justify-center text-ios-blue">
                        <MessageSquare className="w-3.5 h-3.5" />
                      </div>
                      <div className="flex-1 w-[1px] bg-ios-border-light dark:bg-ios-border-dark mt-2" />
                    </div>
                    <div className="flex-1 pb-2">
                      <p className="text-xs text-neutral-700 dark:text-neutral-300 font-semibold">
                        {act.content}
                      </p>
                      <span className="text-[10px] text-neutral-400 font-medium">
                        {new Date(act.createdAt).toLocaleString()}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Job Details Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Job Details">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            const salaryMin = editFields.salaryMin ? Number(editFields.salaryMin) : undefined;
            const salaryMax = editFields.salaryMax ? Number(editFields.salaryMax) : undefined;
            updateMutation.mutate({ ...editFields, salaryMin, salaryMax });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Job Title"
            type="text"
            required
            value={editFields.title}
            onChange={(e) => setEditFields({ ...editFields, title: e.target.value })}
          />

          <Input
            label="Location"
            type="text"
            value={editFields.location}
            onChange={(e) => setEditFields({ ...editFields, location: e.target.value })}
          />

          <div className="grid grid-cols-2 gap-4">
            <select
              value={editFields.remoteType}
              onChange={(e) => setEditFields({ ...editFields, remoteType: e.target.value })}
              className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold"
            >
              <option value="ONSITE">Onsite</option>
              <option value="REMOTE">Remote</option>
              <option value="HYBRID">Hybrid</option>
            </select>

            <select
              value={editFields.priority}
              onChange={(e) => setEditFields({ ...editFields, priority: e.target.value })}
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
              value={editFields.salaryMin}
              onChange={(e) => setEditFields({ ...editFields, salaryMin: e.target.value })}
            />
            <Input
              label="Max Salary"
              type="number"
              value={editFields.salaryMax}
              onChange={(e) => setEditFields({ ...editFields, salaryMax: e.target.value })}
            />
          </div>

          <Input
            label="Listing URL"
            type="url"
            value={editFields.url}
            onChange={(e) => setEditFields({ ...editFields, url: e.target.value })}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Description</label>
            <textarea
              value={editFields.description}
              onChange={(e) => setEditFields({ ...editFields, description: e.target.value })}
              className="p-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm placeholder-neutral-400 focus:outline-none min-h-[80px]"
            />
          </div>

          <Button type="submit" variant="primary" className="mt-2" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Add Note Modal */}
      <Modal isOpen={isNoteOpen} onClose={() => setIsNoteOpen(false)} title="Add Note">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!noteContent) return;
            noteMutation.mutate({ content: noteContent, jobId: id });
          }}
          className="flex flex-col gap-4"
        >
          <textarea
            placeholder="Type your notes here..."
            value={noteContent}
            onChange={(e) => setNoteContent(e.target.value)}
            className="p-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm focus:outline-none min-h-[120px]"
            required
          />
          <Button type="submit" variant="primary" isLoading={noteMutation.isPending}>
            Add Note
          </Button>
        </form>
      </Modal>

      {/* Add Task Modal */}
      <Modal isOpen={isReminderOpen} onClose={() => setIsReminderOpen(false)} title="Add Reminder Task">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!reminderTitle || !reminderDue) return;
            reminderMutation.mutate({
              title: reminderTitle,
              dueAt: new Date(reminderDue).toISOString(),
              jobId: id,
            });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Task Name"
            type="text"
            required
            placeholder="e.g. Prep interview deck"
            value={reminderTitle}
            onChange={(e) => setReminderTitle(e.target.value)}
          />
          <Input
            label="Due Date & Time"
            type="datetime-local"
            required
            value={reminderDue}
            onChange={(e) => setReminderDue(e.target.value)}
          />
          <Button type="submit" variant="primary" isLoading={reminderMutation.isPending}>
            Create Task
          </Button>
        </form>
      </Modal>

      {/* Schedule Interview Modal */}
      <Modal isOpen={isInterviewOpen} onClose={() => setIsInterviewOpen(false)} title="Schedule Interview">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!interviewScheduled) return;
            interviewMutation.mutate({
              type: interviewType,
              scheduledAt: new Date(interviewScheduled).toISOString(),
              duration: Number(interviewDuration),
              location: interviewLocation || undefined,
              notes: interviewNotes || undefined,
              jobId: id,
            });
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Interview Type</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value)}
              className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold"
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
            value={interviewScheduled}
            onChange={(e) => setInterviewScheduled(e.target.value)}
          />

          <Input
            label="Duration (minutes)"
            type="number"
            required
            value={interviewDuration}
            onChange={(e) => setInterviewDuration(Number(e.target.value))}
          />

          <Input
            label="Location / Meeting link"
            type="text"
            placeholder="Google Meet, Zoom, or Office Room"
            value={interviewLocation}
            onChange={(e) => setInterviewLocation(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Meeting Notes</label>
            <textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              className="p-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm focus:outline-none min-h-[80px]"
            />
          </div>

          <Button type="submit" variant="primary" isLoading={interviewMutation.isPending}>
            Schedule Meeting
          </Button>
        </form>
      </Modal>

      {/* Upload Document Modal */}
      <Modal isOpen={isDocOpen} onClose={() => setIsDocOpen(false)} title="Upload Document Attachment">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!uploadFile) return;
            const fd = new FormData();
            fd.append('file', uploadFile);
            fd.append('type', uploadType);
            fd.append('jobId', id);
            docMutation.mutate(fd);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Document Type</label>
            <select
              value={uploadType}
              onChange={(e) => setUploadType(e.target.value)}
              className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold"
            >
              <option value="RESUME">Resume</option>
              <option value="COVER_LETTER">Cover Letter</option>
              <option value="PORTFOLIO">Portfolio</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Select File</label>
            <input
              type="file"
              required
              onChange={(e) => setUploadFile(e.target.files?.[0] || null)}
              className="p-2 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-xs"
            />
          </div>

          <Button type="submit" variant="primary" isLoading={docMutation.isPending}>
            Upload Document
          </Button>
        </form>
      </Modal>
    </div>
  );
};
