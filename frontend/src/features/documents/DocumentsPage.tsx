import * as React from 'react';
import { Card } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';

export const DocumentsPage: React.FC = () => {
  const mockDocs = [
    { id: '1', name: 'Resume_2026.pdf', size: '142 KB', type: 'RESUME', isDefault: true },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Documents</h1>
          <p className="text-xs text-neutral-500 font-medium">Manage resumes, cover letters, and portfolios</p>
        </div>
        <Button variant="primary">Upload Document</Button>
      </div>

      <div className="flex flex-col gap-4">
        {mockDocs.map((doc) => (
          <Card key={doc.id} className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neutral-800 dark:text-neutral-200">{doc.name}</h3>
              <span className="text-xs text-neutral-500 font-semibold">{doc.size}</span>
            </div>
            <div className="flex gap-2 items-center">
              <Badge variant="blue">{doc.type}</Badge>
              {doc.isDefault ? <Badge variant="green">DEFAULT</Badge> : null}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};
