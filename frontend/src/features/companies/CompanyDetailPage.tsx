import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getCompany, updateCompany } from './api';
import { getJobs } from '../jobs/api';
import { getContacts, createContact, deleteContact } from '../contacts/api';
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
  Building2,
  Users,
  Plus,
  Trash2,
  Globe,
  Mail,
  Phone,
  Edit3,
} from 'lucide-react';

export const CompanyDetailPage: React.FC = () => {
  const { id = '' } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  // Dialog States
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [isContactOpen, setIsContactOpen] = React.useState(false);

  // Form States
  const [name, setName] = React.useState('');
  const [website, setWebsite] = React.useState('');
  const [contactName, setContactName] = React.useState('');
  const [contactRole, setContactRole] = React.useState('');
  const [contactEmail, setContactEmail] = React.useState('');
  const [contactPhone, setContactPhone] = React.useState('');
  const [contactLinkedIn, setContactLinkedIn] = React.useState('');
  const [contactNotes, setContactNotes] = React.useState('');

  // React Query Queries
  const { data: company, isLoading: isCompanyLoading } = useQuery({
    queryKey: ['company', id],
    queryFn: () => getCompany(id),
    enabled: !!id,
  });

  const { data: jobsData } = useQuery({
    queryKey: ['jobs', { companyId: id }],
    queryFn: () => getJobs({ companyId: id }),
    enabled: !!id,
  });

  const { data: contactsData } = useQuery({
    queryKey: ['contacts'],
    queryFn: getContacts,
  });

  React.useEffect(() => {
    if (company) {
      setName(company.name || '');
      setWebsite(company.website || '');
    }
  }, [company]);

  const updateMutation = useMutation({
    mutationFn: (dto: any) => updateCompany(id, dto),
    onSuccess: () => {
      toast.success('Company details updated');
      setIsEditOpen(false);
      queryClient.invalidateQueries({ queryKey: ['company', id] });
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update company');
    },
  });

  const contactMutation = useMutation({
    mutationFn: createContact,
    onSuccess: () => {
      toast.success('Contact added successfully!');
      setContactName('');
      setContactRole('');
      setContactEmail('');
      setContactPhone('');
      setContactLinkedIn('');
      setContactNotes('');
      setIsContactOpen(false);
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to add contact');
    },
  });

  const deleteContactMutation = useMutation({
    mutationFn: deleteContact,
    onSuccess: () => {
      toast.success('Contact deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['contacts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete contact');
    },
  });

  if (isCompanyLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <Skeleton variant="text" className="h-6 w-32" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Skeleton variant="rect" className="h-40 rounded-ios-lg" />
          <Skeleton variant="rect" className="h-80 lg:col-span-2 rounded-ios-lg" />
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <EmptyState
        icon={Building2}
        title="Company profile not found"
        description="This company profile does not exist or has been deleted."
        action={
          <Link to="/companies">
            <Button variant="primary">Back to companies</Button>
          </Link>
        }
      />
    );
  }

  const jobsList = jobsData?.data || [];
  const contactsList = (contactsData?.data || []).filter((c: any) => c.companyId === id);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div>
        <Link
          to="/companies"
          className="inline-flex items-center gap-1 text-xs font-semibold text-ios-blue hover:underline mb-4"
        >
          <ChevronLeft className="w-4 h-4" />
          Back to Companies
        </Link>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
              {company.name}
            </h1>
            {company.website ? (
              <a
                href={company.website}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-sm font-semibold text-ios-blue hover:underline mt-1"
              >
                <Globe className="w-4 h-4" />
                {company.website}
              </a>
            ) : null}
          </div>
          <Button variant="secondary" onClick={() => setIsEditOpen(true)}>
            <Edit3 className="w-4 h-4 mr-1.5" />
            Edit Info
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Associated Jobs */}
        <div className="flex flex-col gap-4">
          <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
            Associated Jobs ({jobsList.length})
          </h3>
          {jobsList.length === 0 ? (
            <p className="text-xs text-neutral-400 italic p-4 border border-dashed rounded-ios-lg">
              No jobs associated with this company.
            </p>
          ) : (
            <div className="flex flex-col gap-3">
              {jobsList.map((job: any) => (
                <Link key={job.id} to={`/jobs/${job.id}`}>
                  <Card hoverable className="p-4 flex flex-col gap-2">
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200 truncate">
                      {job.title}
                    </h4>
                    <div className="flex gap-2">
                      <Badge variant="blue">{job.status}</Badge>
                      <Badge variant="purple">{job.priority}</Badge>
                    </div>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>

        {/* Right Column: Associated Contacts */}
        <div className="lg:col-span-2 flex flex-col gap-4">
          <div className="flex justify-between items-center border-b border-ios-border-light dark:border-ios-border-dark pb-2">
            <h3 className="text-sm font-bold text-neutral-800 dark:text-neutral-200">
              Key Contacts ({contactsList.length})
            </h3>
            <Button variant="ghost" size="sm" className="h-8 px-2" onClick={() => setIsContactOpen(true)}>
              <Plus className="w-4.5 h-4.5 mr-1" /> Add Contact
            </Button>
          </div>

          {contactsList.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No contacts listed"
              description="Keep track of recruiters, referrers, and hiring managers at this organization."
              action={
                <Button variant="secondary" onClick={() => setIsContactOpen(true)}>
                  Add Contact
                </Button>
              }
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {contactsList.map((contact: any) => (
                <Card key={contact.id} className="p-4 flex flex-col gap-3 group relative">
                  <div>
                    <h4 className="text-xs font-bold text-neutral-800 dark:text-neutral-200">
                      {contact.name}
                    </h4>
                    <span className="text-[10px] text-neutral-400 font-semibold block">
                      {contact.role || 'No Role Stated'}
                    </span>
                  </div>

                  <div className="flex flex-col gap-1.5 border-t border-ios-border-light dark:border-ios-border-dark pt-2">
                    {contact.email ? (
                      <span className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5" />
                        {contact.email}
                      </span>
                    ) : null}
                    {contact.phone ? (
                      <span className="text-[10px] text-neutral-500 font-semibold flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5" />
                        {contact.phone}
                      </span>
                    ) : null}
                    {contact.linkedIn ? (
                      <a
                        href={contact.linkedIn}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-[10px] text-ios-blue hover:underline font-semibold flex items-center gap-1.5"
                      >
                        <Globe className="w-3.5 h-3.5" />
                        LinkedIn Profile
                      </a>
                    ) : null}
                  </div>

                  {contact.notes ? (
                    <div className="bg-neutral-50 dark:bg-neutral-800/40 p-2 rounded-ios-sm text-[10px] text-neutral-500 italic">
                      Notes: {contact.notes}
                    </div>
                  ) : null}

                  <button
                    onClick={() => deleteContactMutation.mutate(contact.id)}
                    className="absolute top-4 right-4 text-neutral-400 hover:text-ios-red p-1 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Edit Company Details Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Company Info">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name) return;
            updateMutation.mutate({ name, website: website || undefined });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Company Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Website"
            type="url"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <Button type="submit" variant="primary" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </form>
      </Modal>

      {/* Add Contact Modal */}
      <Modal isOpen={isContactOpen} onClose={() => setIsContactOpen(false)} title="Add Contact Person">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!contactName) return;
            contactMutation.mutate({
              name: contactName,
              role: contactRole || undefined,
              email: contactEmail || undefined,
              phone: contactPhone || undefined,
              linkedIn: contactLinkedIn || undefined,
              notes: contactNotes || undefined,
              companyId: id,
            });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Contact Name"
            type="text"
            required
            placeholder="e.g. Sarah Jenkins"
            value={contactName}
            onChange={(e) => setContactName(e.target.value)}
          />

          <Input
            label="Job Role"
            type="text"
            placeholder="e.g. Lead Technical Recruiter"
            value={contactRole}
            onChange={(e) => setContactRole(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <Input
              label="Email"
              type="email"
              placeholder="sarah@company.com"
              value={contactEmail}
              onChange={(e) => setContactEmail(e.target.value)}
            />
            <Input
              label="Phone Number"
              type="tel"
              placeholder="+1 (555) 019-2834"
              value={contactPhone}
              onChange={(e) => setContactPhone(e.target.value)}
            />
          </div>

          <Input
            label="LinkedIn URL"
            type="url"
            placeholder="https://linkedin.com/in/username"
            value={contactLinkedIn}
            onChange={(e) => setContactLinkedIn(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Notes</label>
            <textarea
              placeholder="e.g. Met on Slack channel..."
              value={contactNotes}
              onChange={(e) => setContactNotes(e.target.value)}
              className="p-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm focus:outline-none min-h-[80px]"
            />
          </div>

          <Button type="submit" variant="primary" className="mt-2" isLoading={contactMutation.isPending}>
            Add Contact
          </Button>
        </form>
      </Modal>
    </div>
  );
};
