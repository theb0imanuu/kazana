import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      toast.error('Please enter email and password');
      return;
    }
    setLoading(true);
    setTimeout(() => {
      login('mock-access-token', { id: 'mock-user-id', email, name: 'John Doe' });
      setLoading(false);
      toast.success('Welcome back to Kazana!');
      navigate('/');
    }, 1000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ios-bg-light dark:bg-ios-bg-dark">
      <Card className="w-full max-w-md p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold tracking-tight text-ios-blue">KAZANA</span>
          <span className="text-xs text-neutral-500 font-medium">Log in to track your job search</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Email"
            type="email"
            placeholder="name@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button type="submit" variant="primary" className="w-full" isLoading={loading}>
            Sign In
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-500 font-semibold select-none">
          Don't have an account?{' '}
          <Link to="/register" className="text-ios-blue hover:underline">
            Create an account
          </Link>
        </p>
      </Card>
    </div>
  );
};
