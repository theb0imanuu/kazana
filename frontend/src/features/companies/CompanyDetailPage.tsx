import * as React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Card } from '../../components/ui/Card';
import { ChevronLeft } from 'lucide-react';

export const CompanyDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  return (
    <div className="flex flex-col gap-6">
      <div>
        <Link to="/companies" className="inline-flex items-center gap-1 text-xs font-semibold text-ios-blue hover:underline mb-4">
          <ChevronLeft className="w-4 h-4" />
          Back to Companies
        </Link>
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Company Details</h1>
            <p className="text-xs text-neutral-500 font-medium">Viewing details for company ID: {id}</p>
          </div>
          <Button variant="secondary">Edit Company</Button>
        </div>
      </div>

      <Card className="flex flex-col gap-4">
        <div>
          <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">Company Name</span>
          <h3 className="text-lg font-bold">Apple Inc.</h3>
        </div>
        <div className="border-t border-ios-border-light dark:border-ios-border-dark pt-4">
          <span className="text-xs font-bold text-neutral-500 block">Website</span>
          <a href="https://apple.com" target="_blank" rel="noopener noreferrer" className="text-sm text-ios-blue hover:underline">
            https://apple.com
          </a>
        </div>
      </Card>
    </div>
  );
};
