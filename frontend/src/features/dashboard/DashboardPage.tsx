import * as React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { SegmentedControl } from '../../components/ui/SegmentedControl';
import { EmptyState } from '../../components/ui/EmptyState';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Skeleton } from '../../components/ui/Skeleton';
import { Briefcase, Calendar, CheckCircle2 } from 'lucide-react';
import { toast } from '../../components/ui/Toast';

export const DashboardPage: React.FC = () => {
  const [filter, setFilter] = React.useState('all');
  const [loading, setLoading] = React.useState(false);

  const handleTestToast = () => {
    toast.success('Kazana UI tokens initialized successfully!');
  };

  React.useEffect(() => {
    if (loading) {
      const timer = setTimeout(() => setLoading(false), 1500);
      return () => clearTimeout(timer);
    }
  }, [loading]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
            Dashboard
          </h1>
          <p className="text-xs text-neutral-500 font-medium">
            Welcome to your job application tracker
          </p>
        </div>
        <Button variant="primary" onClick={handleTestToast}>
          Test Alert
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <SegmentedControl
          options={[
            { label: 'All Jobs', value: 'all' },
            { label: 'Applied', value: 'applied' },
            { label: 'Interviewing', value: 'interviewing' },
          ]}
          value={filter}
          onChange={setFilter}
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card hoverable>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Total Applications
            </span>
            <Briefcase className="w-4 h-4 text-ios-blue" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight">12</span>
          <div className="mt-2">
            <Badge variant="blue">+2 this week</Badge>
          </div>
        </Card>

        <Card hoverable>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Interviews Scheduled
            </span>
            <Calendar className="w-4 h-4 text-ios-purple" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight">3</span>
          <div className="mt-2">
            <Badge variant="purple">Next tomorrow</Badge>
          </div>
        </Card>

        <Card hoverable>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              Offers Received
            </span>
            <CheckCircle2 className="w-4 h-4 text-ios-green" />
          </div>
          <span className="text-3xl font-extrabold tracking-tight">1</span>
          <div className="mt-2">
            <Badge variant="green">Accepted</Badge>
          </div>
        </Card>
      </div>

      <div>
        <h2 className="text-sm font-bold text-neutral-800 dark:text-neutral-200 mb-3 px-1">
          Recent Activities
        </h2>
        {loading ? (
          <div className="space-y-4">
            <div className="flex flex-col gap-2">
              <Skeleton variant="text" className="w-1/4 h-3" />
              <Skeleton variant="rect" className="h-16" />
            </div>
            <div className="flex justify-center py-4">
              <LoadingSpinner size="md" />
            </div>
          </div>
        ) : (
          <EmptyState
            icon={Briefcase}
            title="No activity yet"
            description="Start by adding job applications to track your progress and interview schedules."
            action={
              <Button variant="secondary" onClick={() => setLoading(true)}>
                Refresh Dashboard
              </Button>
            }
          />
        )}
      </div>
    </div>
  );
};
