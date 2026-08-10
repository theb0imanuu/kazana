import * as React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getProfile, updateProfile, changePassword } from './api';
import { Card } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Input } from '../../components/ui/Input';
import { Skeleton } from '../../components/ui/Skeleton';
import { toast } from '../../components/ui/Toast';
import { User, Globe, KeyRound } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const queryClient = useQueryClient();

  // Profile Form States
  const [name, setName] = React.useState('');
  const [timezone, setTimezone] = React.useState('UTC');
  const [avatarUrl, setAvatarUrl] = React.useState('');

  // Password Form States
  const [currentPassword, setCurrentPassword] = React.useState('');
  const [newPassword, setNewPassword] = React.useState('');
  const [confirmPassword, setConfirmPassword] = React.useState('');

  const { data: profile, isLoading } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  React.useEffect(() => {
    if (profile) {
      setName(profile.name || '');
      setTimezone(profile.timezone || 'UTC');
      setAvatarUrl(profile.avatarUrl || '');
    }
  }, [profile]);

  const updateProfileMutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: (updated) => {
      toast.success('Profile updated successfully!');
      queryClient.setQueryData(['profile'], updated);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    },
  });

  const changePasswordMutation = useMutation({
    mutationFn: changePassword,
    onSuccess: () => {
      toast.success('Password changed successfully!');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Failed to update password');
    },
  });

  const handleProfileSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) {
      toast.error('Name is required');
      return;
    }
    updateProfileMutation.mutate({
      name,
      timezone,
      avatarUrl: avatarUrl || undefined,
    });
  };

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) {
      toast.error('Please enter all password fields');
      return;
    }
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    changePasswordMutation.mutate({
      currentPassword,
      newPassword,
    });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col gap-6 animate-pulse">
        <Skeleton variant="text" className="h-8 w-48" />
        <Skeleton variant="rect" className="h-64 rounded-ios-lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-neutral-800 dark:text-neutral-100">
          Settings
        </h1>
        <p className="text-xs text-neutral-500 font-medium">
          Manage your personal details, timezone, avatar, and password credentials
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Details Card */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-ios-border-light dark:border-ios-border-dark pb-2">
            <User className="w-5 h-5 text-ios-blue" />
            <h3 className="text-sm font-bold">Profile Details</h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="flex flex-col gap-4">
            <Input
              label="Full Name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />

            <div className="flex flex-col gap-1">
              <label className="text-xs font-semibold text-neutral-500 px-1 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                Timezone Preference
              </label>
              <select
                value={timezone}
                onChange={(e) => setTimezone(e.target.value)}
                className="h-11 px-3 bg-white dark:bg-neutral-800 border border-ios-border-light dark:border-ios-border-dark rounded-ios-md text-sm"
              >
                <option value="UTC">UTC (Greenwich Mean Time)</option>
                <option value="EST">EST (Eastern Standard Time)</option>
                <option value="PST">PST (Pacific Standard Time)</option>
                <option value="GMT">GMT (Greenwich Mean Time)</option>
                <option value="CET">CET (Central European Time)</option>
                <option value="IST">IST (Indian Standard Time)</option>
              </select>
            </div>

            <Input
              label="Avatar Image URL"
              type="url"
              placeholder="https://example.com/avatar.png"
              value={avatarUrl}
              onChange={(e) => setAvatarUrl(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              className="self-start mt-2"
              isLoading={updateProfileMutation.isPending}
            >
              Update Profile
            </Button>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="flex flex-col gap-4">
          <div className="flex items-center gap-2 border-b border-ios-border-light dark:border-ios-border-dark pb-2">
            <KeyRound className="w-5 h-5 text-ios-purple" />
            <h3 className="text-sm font-bold">Change Password</h3>
          </div>

          <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-4">
            <Input
              label="Current Password"
              type="password"
              required
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
            />
            <Input
              label="New Password"
              type="password"
              required
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
            />
            <Input
              label="Confirm New Password"
              type="password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />

            <Button
              type="submit"
              variant="primary"
              className="self-start mt-2"
              isLoading={changePasswordMutation.isPending}
            >
              Update Password
            </Button>
          </form>
        </Card>
      </div>
    </div>
  );
};
