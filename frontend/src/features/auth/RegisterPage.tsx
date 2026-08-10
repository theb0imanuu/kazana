import * as React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Card } from '../../components/ui/Card';
import { toast } from '../../components/ui/Toast';

import { useMutation } from '@tanstack/react-query';
import { registerUser } from './api';

export const RegisterPage: React.FC = () => {
  const navigate = useNavigate();
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');

  const mutation = useMutation({
    mutationFn: registerUser,
    onSuccess: () => {
      toast.success('Account created successfully! Please log in.');
      navigate('/login');
    },
    onError: (err: any) => {
      const msg = err.response?.data?.message || 'Failed to create account. Please try again.';
      toast.error(msg);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) {
      toast.error('Please fill in all fields');
      return;
    }
    mutation.mutate({ name, email, password });
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-ios-bg-light dark:bg-ios-bg-dark">
      <Card className="w-full max-w-md p-8 flex flex-col gap-6">
        <div className="flex flex-col items-center gap-1">
          <span className="text-2xl font-bold tracking-tight text-ios-blue">KAZANA</span>
          <span className="text-xs text-neutral-500 font-medium">Create your account to get started</span>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            label="Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
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
          <Button type="submit" variant="primary" className="w-full" isLoading={mutation.isPending}>
            Sign Up
          </Button>
        </form>

        <p className="text-center text-xs text-neutral-500 font-semibold select-none">
          Already have an account?{' '}
          <Link to="/login" className="text-ios-blue hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};
