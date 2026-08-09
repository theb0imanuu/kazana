import * as React from 'react';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { toast } from '../../components/ui/Toast';

export const SettingsPage: React.FC = () => {
  const [name, setName] = React.useState('John Doe');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Settings</h1>
        <p className="text-xs text-neutral-500 font-medium">Manage your personal details and account configurations</p>
      </div>

      <Card>
        <form onSubmit={handleSave} className="flex flex-col gap-4 max-w-md">
          <Input
            label="Name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <Button type="submit" variant="primary" className="self-start">
            Save Changes
          </Button>
        </form>
      </Card>
    </div>
  );
};
