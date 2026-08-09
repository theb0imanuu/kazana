import * as React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const JobsPage: React.FC = () => {
  const mockJobs = [
    { id: '1', title: 'Senior React Developer', company: 'Apple Inc.', status: 'APPLIED', priority: 'HIGH' },
    { id: '2', title: 'Fullstack Engineer', company: 'Google LLC', status: 'INTERVIEW', priority: 'URGENT' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Jobs</h1>
          <p className="text-xs text-neutral-500 font-medium">Manage and monitor your job submissions</p>
        </div>
        <Button variant="primary">Add Job</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockJobs.map((job) => (
          <Link key={job.id} to={`/jobs/${job.id}`}>
            <Card hoverable className="flex flex-col gap-3">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-neutral-800 dark:text-neutral-200">{job.title}</h3>
                  <span className="text-xs text-neutral-500 font-medium">{job.company}</span>
                </div>
                <Badge variant={job.priority === 'URGENT' ? 'red' : 'orange'}>{job.priority}</Badge>
              </div>
              <div className="flex gap-2">
                <Badge variant="blue">{job.status}</Badge>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
