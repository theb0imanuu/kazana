import * as React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Link } from 'react-router-dom';

export const CompaniesPage: React.FC = () => {
  const mockCompanies = [
    { id: '1', name: 'Apple Inc.', website: 'https://apple.com', count: 3 },
    { id: '2', name: 'Google LLC', website: 'https://google.com', count: 1 },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Companies</h1>
          <p className="text-xs text-neutral-500 font-medium">Browse companies you have applied to</p>
        </div>
        <Button variant="primary">Add Company</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {mockCompanies.map((c) => (
          <Link key={c.id} to={`/companies/${c.id}`}>
            <Card hoverable className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-neutral-800 dark:text-neutral-200">{c.name}</h3>
                <span className="text-xs text-neutral-500 font-medium">{c.website}</span>
              </div>
              <span className="text-xs font-bold bg-neutral-100 dark:bg-neutral-800 px-3 py-1 rounded-full text-neutral-600 dark:text-neutral-300">
                {c.count} active roles
              </span>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
};
