import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTemplates, createTemplate, updateTemplate, deleteTemplate } from './api';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Modal } from '../../components/ui/Modal';
import { Skeleton } from '../../components/ui/Skeleton';
import { EmptyState } from '../../components/ui/EmptyState';
import { toast } from '../../components/ui/Toast';
import { FileText, Plus, Trash2, Edit3, Eye, FileSignature } from 'lucide-react';

export const TemplatesPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isEditOpen, setIsEditOpen] = React.useState(false);
  const [previewTemplate, setPreviewTemplate] = React.useState<any>(null);

  // Form Fields
  const [name, setName] = React.useState('');
  const [subject, setSubject] = React.useState('');
  const [body, setBody] = React.useState('');
  const [type, setType] = React.useState('EMAIL');
  const [variablesInput, setVariablesInput] = React.useState('name, company, jobTitle');

  const [editingId, setEditingId] = React.useState('');

  // Preview Sandbox Inputs
  const [mockName, setMockName] = React.useState('John Doe');
  const [mockCompany, setMockCompany] = React.useState('Apple Inc.');
  const [mockJobTitle, setMockJobTitle] = React.useState('Senior React Developer');

  const {
    data: templatesData,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['templates'],
    queryFn: getTemplates,
  });

  const createMutation = useMutation({
    mutationFn: createTemplate,
    onSuccess: () => {
      toast.success('Template saved successfully!');
      setName('');
      setSubject('');
      setBody('');
      setType('EMAIL');
      setVariablesInput('name, company, jobTitle');
      setIsAddOpen(false);
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to create template');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, dto }: { id: string; dto: any }) => updateTemplate(id, dto),
    onSuccess: () => {
      toast.success('Template updated!');
      setIsEditOpen(false);
      setEditingId('');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update template');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTemplate,
    onSuccess: () => {
      toast.success('Template deleted');
      queryClient.invalidateQueries({ queryKey: ['templates'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to delete template');
    },
  });

  const parseVariables = (str: string): string[] => {
    return str
      .split(',')
      .map((v) => v.trim())
      .filter((v) => v.length > 0);
  };

  const renderPreview = (text: string) => {
    return text
      .replace(/\{\{name\}\}/g, mockName)
      .replace(/\{\{company\}\}/g, mockCompany)
      .replace(/\{\{jobTitle\}\}/g, mockJobTitle);
  };

  const handleEditClick = (template: any) => {
    setEditingId(template.id);
    setName(template.name);
    setSubject(template.subject || '');
    setBody(template.body);
    setType(template.type);
    setVariablesInput(template.variables ? template.variables.join(', ') : '');
    setIsEditOpen(true);
  };

  const templatesList = templatesData?.data || [];

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
            Document Templates
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Draft follow-ups, resumes, and follow-up email drafts
          </p>
        </div>
        <Button variant="primary" onClick={() => setIsAddOpen(true)}>
          <Plus className="w-4 h-4 mr-1.5" />
          Add Template
        </Button>
      </div>

      {/* Templates List */}
      {isLoading ? (
        <div className="space-y-4 animate-pulse">
          <Skeleton variant="rect" className="h-20 rounded-ios-md" />
          <Skeleton variant="rect" className="h-20 rounded-ios-md" />
        </div>
      ) : isError ? (
        <EmptyState
          icon={FileText}
          title="Connection Failure"
          description="Failed to load document templates. Check server connectivity."
          action={<Button variant="primary" onClick={() => refetch()}>Retry</Button>}
        />
      ) : templatesList.length === 0 ? (
        <EmptyState
          icon={FileSignature}
          title="No templates found"
          description="Save typing time by creating email draft templates with dynamic token replacement."
          action={<Button variant="primary" onClick={() => setIsAddOpen(true)}>Create Template</Button>}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {templatesList.map((tmpl: any) => (
            <Card key={tmpl.id} className="p-5 flex flex-col justify-between gap-4 group relative">
              <div className="flex flex-col gap-2">
                <div className="flex justify-between items-start">
                  <h3 className="font-bold text-neutral-800 dark:text-neutral-200">
                    {tmpl.name}
                  </h3>
                  <Badge variant="blue">{tmpl.type}</Badge>
                </div>
                {tmpl.subject ? (
                  <p className="text-xs font-semibold text-neutral-400">
                    Subject: {tmpl.subject}
                  </p>
                ) : null}
                <p className="text-xs text-neutral-500 truncate max-w-sm">
                  {tmpl.body}
                </p>
              </div>

              <div className="flex gap-2 items-center border-t border-ios-border-light dark:border-ios-border-dark pt-3">
                <Button variant="secondary" size="sm" onClick={() => handleEditClick(tmpl)}>
                  <Edit3 className="w-3.5 h-3.5 mr-1" />
                  Edit
                </Button>
                <Button variant="ghost" size="sm" onClick={() => setPreviewTemplate(tmpl)}>
                  <Eye className="w-3.5 h-3.5 mr-1" />
                  Preview
                </Button>
              </div>

              <button
                onClick={() => deleteMutation.mutate(tmpl.id)}
                className="absolute top-4 right-4 text-neutral-400 hover:text-ios-red p-2 rounded-full hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors opacity-0 group-hover:opacity-100"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </Card>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      {previewTemplate ? (
        <Modal
          isOpen={!!previewTemplate}
          onClose={() => setPreviewTemplate(null)}
          title={`Preview Sandbox: ${previewTemplate.name}`}
        >
          <div className="flex flex-col gap-4">
            {/* Mock Values Panel */}
            <div className="grid grid-cols-3 gap-2 bg-neutral-50 dark:bg-neutral-800/40 p-3.5 rounded-ios-md">
              <Input
                label="Mock Name"
                type="text"
                value={mockName}
                onChange={(e) => setMockName(e.target.value)}
              />
              <Input
                label="Mock Company"
                type="text"
                value={mockCompany}
                onChange={(e) => setMockCompany(e.target.value)}
              />
              <Input
                label="Mock Job"
                type="text"
                value={mockJobTitle}
                onChange={(e) => setMockJobTitle(e.target.value)}
              />
            </div>

            {previewTemplate.subject ? (
              <div>
                <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                  Rendered Subject
                </span>
                <p className="text-xs font-bold mt-1">
                  {renderPreview(previewTemplate.subject)}
                </p>
              </div>
            ) : null}

            <div>
              <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block">
                Rendered Body Output
              </span>
              <p className="text-xs bg-white dark:bg-neutral-900 border border-ios-border-light dark:border-ios-border-dark p-4 rounded-ios-md whitespace-pre-wrap leading-relaxed mt-1 text-neutral-600 dark:text-neutral-300">
                {renderPreview(previewTemplate.body)}
              </p>
            </div>
          </div>
        </Modal>
      ) : null}

      {/* Add Template Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Create Draft Template">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name || !body) return;
            createMutation.mutate({
              name,
              subject: subject || undefined,
              body,
              type,
              variables: parseVariables(variablesInput),
            });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Template Name"
            type="text"
            required
            placeholder="e.g. Follow up email after interview"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Template Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold"
            >
              <option value="EMAIL">Email</option>
              <option value="COVER_LETTER">Cover Letter</option>
              <option value="FOLLOW_UP">Follow Up</option>
            </select>
          </div>

          <Input
            label="Draft Subject line (Optional)"
            type="text"
            placeholder="e.g. Thanks for your time at {{company}}!"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Body Text</label>
            <textarea
              required
              placeholder="Hi {{name}},\n\nThanks for evaluating me for the {{jobTitle}} role at {{company}}..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="p-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm focus:outline-none min-h-[140px]"
            />
          </div>

          <Input
            label="Template Variables (comma separated)"
            type="text"
            placeholder="name, company, jobTitle"
            value={variablesInput}
            onChange={(e) => setVariablesInput(e.target.value)}
          />

          <Button type="submit" variant="primary" className="mt-2" isLoading={createMutation.isPending}>
            Save Template
          </Button>
        </form>
      </Modal>

      {/* Edit Template Modal */}
      <Modal isOpen={isEditOpen} onClose={() => setIsEditOpen(false)} title="Edit Draft Template">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (!name || !body) return;
            updateMutation.mutate({
              id: editingId,
              dto: {
                name,
                subject: subject || undefined,
                body,
                type,
                variables: parseVariables(variablesInput),
              },
            });
          }}
          className="flex flex-col gap-4"
        >
          <Input
            label="Template Name"
            type="text"
            required
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Template Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="h-11 px-3 bg-neutral-100 dark:bg-neutral-800 rounded-ios-md text-xs font-semibold"
            >
              <option value="EMAIL">Email</option>
              <option value="COVER_LETTER">Cover Letter</option>
              <option value="FOLLOW_UP">Follow Up</option>
            </select>
          </div>

          <Input
            label="Draft Subject line"
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
          />

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-neutral-500 px-1">Body Text</label>
            <textarea
              required
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="p-3.5 bg-white/70 dark:bg-neutral-800/70 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm focus:outline-none min-h-[140px]"
            />
          </div>

          <Input
            label="Template Variables (comma separated)"
            type="text"
            value={variablesInput}
            onChange={(e) => setVariablesInput(e.target.value)}
          />

          <Button type="submit" variant="primary" className="mt-2" isLoading={updateMutation.isPending}>
            Save Changes
          </Button>
        </form>
      </Modal>
    </div>
  );
};
