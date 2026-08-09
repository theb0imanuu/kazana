import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { ChevronLeft } from 'lucide-react';

export const JobDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/jobs" className="inline-flex items-center gap-1 text-xs font-semibold text-ios-blue hover:underline mb-4">
          <ChevronLeft className="w-4 h-4" />
          Back to Jobs
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Job Details</h1>
            <p className="text-xs text-neutral-500 font-medium">Viewing details for job ID: {id}</p>
          </div>
          <Button variant="secondary">Edit Job</Button>
        </div>
      </div>

      <Card className="flex flex-col gap-4">
        <div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Role Title</span>
          <h3 className="text-lg font-bold">Senior Web Developer</h3>
        </div>
        <div className="grid grid-cols-2 gap-4 border-t border-ios-border-light dark:border-ios-border-dark pt-4">
          <div>
            <span className="text-xs font-bold text-neutral-500 block">Status</span>
            <Badge variant="blue" className="mt-1">INTERVIEW</Badge>
          </div>
          <div>
            <span className="text-xs font-bold text-neutral-500 block">Priority</span>
            <Badge variant="orange" className="mt-1">HIGH</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
};
