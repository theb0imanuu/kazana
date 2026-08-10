import * as React from 'react';
import { Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getDocuments, uploadDocument, deleteDocument, toggleDefaultDocument } from './api';
import { getJobs } from '../jobs/api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import { FileText, Plus, Trash2, CloudUpload } from 'lucide-react';

export const DocumentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isUploadOpen, setIsUploadOpen] = React.useState(false);
  
  // Form states
  const [file, setFile] = React.useState<File | null>(null);
  const [type, setType] = React.useState('RESUME');
  const [jobId, setJobId] = React.useState('');

  const {
    data: docsData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['documents'],
    queryFn: getDocuments,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobsList'],
    queryFn: () => getJobs({ limit: 100 }),
  });

  const uploadMutation = useMutation({
    mutationFn: (fd: FormData) => uploadDocument(fd),
    onSuccess: () => {
      toast.success('Document uploaded successfully!');
      setFile(null);
      setJobId('');
      setIsUploadOpen(false);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to upload document');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: () => {
      toast.success('Document deleted');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete document');
    },
  });

  const toggleDefaultMutation = useMutation({
    mutationFn: toggleDefaultDocument,
    onSuccess: () => {
      toast.success('Default document preference updated');
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update default preference');
    },
  });

  const docsList = docsData?.data || [];
  const jobsList = jobsData?.data || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
            Documents
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Manage and attach resumes, cover letters, and portfolios
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsUploadOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Upload Document
        </Button>
      </div>

      {/* Main List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <Skeleton variant="rect" className="h-16 rounded-ios-md" />
          <Skeleton variant="rect" className="h-16 rounded-ios-md" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={FileText}
          title="Connection Failure"
          description="Failed to load document index. Please check your backend connection."
          action={<Button variant="primary" onClick={() => refetch()}>Retry</Button>}
        />
      ) : docsList.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No documents uploaded"
          description="Keep your job application materials synchronized. Upload your first resume or cover letter."
          action={<Button variant="primary" onClick={() => setIsUploadOpen(true)}>Upload Document</Button>}
        />
      ) : (
        <div className="flex flex-col gap-4">
          {docsList.map((doc: any) => (
            <Card key={doc.id} className="flex items-center justify-between p-5 group relative">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-full bg-ios-blue/10 flex items-center justify-center text-ios-blue border border-ios-blue/20">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-bold text-neutral-800 dark:text-neutral-200 hover:text-ios-blue transition-colors text-sm"
                  >
                    {doc.name}
                  </a>
                  <span className="text-[10px] text-neutral-400 font-semibold block mt-0.5">
                    {(doc.size / 1024).toFixed(1)} KB • {doc.mimeType}
                  </span>
                  {doc.job ? (
                    <span className="text-[10px] text-neutral-500 font-medium block mt-1">
                      Associated with job:{' '}
                      <Link to={`/jobs/${doc.jobId}`} className="text-ios-blue hover:underline">
                        {doc.job?.title} ({doc.job?.company?.name || 'Company'})
                      </Link>
                    </span>
                  ) : null}
                </div>
              </div>

              <div className="flex gap-2.5 items-center pr-8">
                <Badge variant="blue">{doc.type}</Badge>
                {doc.isDefault ? (
                  <Badge variant="green">DEFAULT</Badge>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 text-[10px] font-bold border border-ios-blue/20 hover:bg-ios-blue/10 text-ios-blue"
                    onClick={() => toggleDefaultMutation.mutate(doc.id)}
                  >
                    Set Default
                  </Button>
                )}
              </div>

              <button
                onClick={() => deleteMutation.mutate(doc.id)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-ios-red p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Upload Document Modal */}
      <Modal isOpen={isUploadOpen} onClose={() => setIsUploadOpen(false)} title="Upload Document">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!file) {
              toast.error('Please select a file to upload');
              return;
            }
            const fd = new FormData();
            fd.append('file', file);
            fd.append('type', type);
            if (jobId) {
              fd.append('jobId', jobId);
            }
            uploadMutation.mutate(fd);
          }}
          className="flex flex-col gap-4"
        >
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Document Category</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold focus:outline-none"
            >
              <option value="RESUME">Resume</option>
              <option value="COVER_LETTER">Cover Letter</option>
              <option value="PORTFOLIO">Portfolio</option>
              <option value="OTHER">Other</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Job Association (Optional)</label>
            <select
              value={jobId}
              onChange={(e) => setJobId(e.target.value)}
              className="h-11 px-3 bg-white border border-ios-border-light dark:bg-neutral-800 dark:border-ios-border-dark rounded-ios-md text-sm"
            >
              <option value="">Do not associate with a Job</option>
              {jobsList.map((j: any) => (
                <option key={j.id} value={j.id}>
                  {j.title} ({j.company?.name || 'Company'})
                </option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-2 p-6 border border-dashed border-ios-border-light dark:border-ios-border-dark rounded-ios-lg items-center justify-center bg-neutral-50/40 dark:bg-neutral-900/10">
            <CloudUpload className="w-8 h-8 text-neutral-400" />
            <input
              type="file"
              required
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="text-xs text-neutral-500 focus:outline-none mt-2"
            />
          </div>

          <Button type="submit" variant="primary" className="mt-2" isLoading={uploadMutation.isPending}>
            Upload to Cloud
          </Button>
        </form>
      </Modal>
    </div>
  );
};
