import * as React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const InterviewsPage: React.FC = () => {
  const mockInterviews = [
    { id: '1', company: 'Apple Inc.', role: 'Senior React Developer', date: 'Aug 15, 2026 at 2:00 PM', type: 'VIDEO', status: 'SCHEDULED' },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Interviews</h1>
          <p className="text-xs text-neutral-500 font-medium">Keep track of your scheduled interviews</p>
        </div>
        <Button variant="primary">Schedule Interview</Button>
      </div>

      <div className="flex flex-col gap-4">
        {mockInterviews.map((i) => (
          <Card key={i.id} className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="font-bold text-neutral-800 dark:text-neutral-200">{i.role}</h3>
              <span className="text-xs text-neutral-500 font-semibold">{i.company}</span>
              <p className="text-xs text-neutral-400 font-medium mt-1">{i.date}</p>
            </div>
            <div className="flex gap-2 items-center">
              <Badge variant="blue">{i.type}</Badge>
              <Badge variant="purple">{i.status}</Badge>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
