import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { getCompanies, createCompany, deleteCompany } from './api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import { Building2, Plus, Search, Trash2, Globe } from 'lucide-react';

export const CompaniesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = React.useState('');
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [name, setName] = React.useState('');
  const [website, setWebsite] = React.useState('');

  const queryParams = {
    search: search || undefined,
  };

  const {
    data: companiesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['companies', queryParams],
    queryFn: () => getCompanies(queryParams),
  });

  const createMutation = useMutation({
    mutationFn: createCompany,
    onSuccess: () => {
      toast.success('Company profile created!');
      setName('');
      setWebsite('');
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create company');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteCompany,
    onSuccess: () => {
      toast.success('Company deleted successfully');
      queryClient.invalidateQueries({ queryKey: ['companies'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete company');
    },
  });

  const companiesList = companiesData?.data || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
            Companies
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Browse companies you have applied to
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Company
        </Button>
      </div>

      {/* Search Filter Card */}
      <Card className="p-4 flex gap-4 items-center">
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-3.5 w-4 h-4 text-neutral-400" />
          <input
            type="text"
            placeholder="Search company profiles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-11 pl-9 pr-4 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold placeholder-neutral-400 focus:outline-none focus:ring-1 focus:ring-ios-blue"
          />
        </div>
      </Card>

      {/* Grid List */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-pulse">
          <Skeleton variant="rect" className="h-28 rounded-ios-lg" />
          <Skeleton variant="rect" className="h-28 rounded-ios-lg" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={Building2}
          title="Connection Failure"
          description="Failed to load companies. Please check your backend connection."
          action={
            <Button variant="primary" onClick={() => refetch()}>
              Retry
            </Button>
          }
        />
      ) : companiesList.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No companies found"
          description="Add a company to start linking jobs and managing company-specific contacts."
          action={
            <Button variant="primary" onClick={() => setIsAddOpen(true)}>
              Add Company
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {companiesList.map((c: any) => (
            <Card key={c.id} className="flex justify-between items-center group relative p-5">
              <div>
                <Link to={`/companies/${c.id}`}>
                  <h3 className="font-bold hover:text-ios-blue transition-colors text-neutral-800 dark:text-neutral-200">
                    {c.name}
                  </h3>
                </Link>
                {c.website ? (
                  <a
                    href={c.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-neutral-400 hover:text-ios-blue font-semibold mt-1"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    {c.website}
                  </a>
                ) : null}
              </div>

              <button
                onClick={() => deleteMutation.mutate(c.id)}
                className="text-neutral-400 hover:text-ios-red p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Add Company Modal Dialog */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Company Profile">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name) return;
            createMutation.mutate({ name, website: website || undefined });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Company Name"
            type="text"
            required
            placeholder="e.g. Apple Inc."
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Input
            label="Website URL"
            type="url"
            placeholder="https://apple.com"
            value={website}
            onChange={(e) => setWebsite(e.target.value)}
          />
          <Button type="submit" variant="primary" className="mt-2" isLoading={createMutation.isPending}>
            Create Profile
          </Button>
        </form>
      </Modal>
    </div>
  );
};
