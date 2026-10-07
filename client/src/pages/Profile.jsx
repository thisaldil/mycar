import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { LogOutIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { authApi } from '../services/authApi';
import { compressImage } from '../utils/files';
import { emailSchema, passwordSchema } from '../utils/validation';
import { PageHeader } from '../components/common/PageHeader';
import { Card, CardHeader } from '../components/common/Card';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { PasswordStrength } from '../components/common/PasswordStrength';
import { Button } from '../components/common/Button';
import { Avatar } from '../components/common/Avatar';
import { toast } from '../components/common/Toast';

const profileSchema = z.object({ name: z.string().trim().min(2, 'Enter your name').max(80), email: emailSchema });
const passwordFormSchema = z.
object({ currentPassword: z.string().min(1, 'Enter your current password'), newPassword: passwordSchema, confirmPassword: z.string().min(1, 'Confirm your new password') }).
refine((v) => v.newPassword === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export function Profile() {
  const { user, setUser, logout } = useAuth();
  const navigate = useNavigate();
  const [avatar, setAvatar] = useState(user?.avatar || null);
  const profile = useForm({ resolver: zodResolver(profileSchema), defaultValues: { name: user?.name || '', email: user?.email || '' } });
  const pw = useForm({ resolver: zodResolver(passwordFormSchema), mode: 'onTouched', defaultValues: { currentPassword: '', newPassword: '', confirmPassword: '' } });

  useEffect(() => setAvatar(user?.avatar || null), [user?.avatar]);

  const saveProfile = profile.handleSubmit(async (values) => {
    try {
      const updated = await authApi.updateProfile({ ...values, avatar });
      setUser(updated);
      toast.success('Profile saved');
    } catch (err) {
      if (err.fieldErrors?.email) profile.setError('email', { message: err.fieldErrors.email });
      toast.error(err.message);
    }
  });

  const changePassword = pw.handleSubmit(async ({ currentPassword, newPassword }) => {
    try {
      await authApi.changePassword({ currentPassword, newPassword });
      pw.reset();
      toast.success('Password changed');
    } catch (err) {
      if (err.fieldErrors?.currentPassword) pw.setError('currentPassword', { message: err.fieldErrors.currentPassword });else
      toast.error(err.message);
    }
  });

  const onPhoto = async (e) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Choose an image file.');
    setAvatar(await compressImage(file, { maxSize: 400 }));
  };

  return (
    <div className="mx-auto max-w-3xl">
      <PageHeader title="Profile" description="Your account details" />
      <div className="space-y-5">
        <Card>
          <CardHeader title="Personal details" />
          <form onSubmit={saveProfile} noValidate className="space-y-4">
            <div className="flex items-center gap-4">
              <Avatar name={user?.name} src={avatar} size="lg" />
              <div className="flex gap-2">
                <label className="inline-flex h-9 cursor-pointer items-center rounded-xl border border-line bg-surface px-3 text-sm font-medium text-ink transition-colors duration-150 hover:bg-subtle focus-within:ring-4 focus-within:ring-brand/15">
                  Change photo
                  <input type="file" accept="image/*" className="sr-only" onChange={onPhoto} />
                </label>
                {avatar ? <Button variant="ghost" size="sm" onClick={() => setAvatar(null)}>Remove</Button> : null}
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Name" required autoComplete="name" error={profile.formState.errors.name?.message} {...profile.register('name')} />
              <Input label="Email" type="email" required autoComplete="email" error={profile.formState.errors.email?.message} {...profile.register('email')} />
            </div>
            <Button type="submit" loading={profile.formState.isSubmitting}>Save profile</Button>
          </form>
        </Card>
        <Card>
          <CardHeader title="Change password" />
          <form onSubmit={changePassword} noValidate className="space-y-4">
            <PasswordInput label="Current password" required error={pw.formState.errors.currentPassword?.message} {...pw.register('currentPassword')} />
            <div className="space-y-2">
              <PasswordInput label="New password" autoComplete="new-password" required error={pw.formState.errors.newPassword?.message} {...pw.register('newPassword')} />
              <PasswordStrength password={pw.watch('newPassword')} />
            </div>
            <PasswordInput label="Confirm new password" autoComplete="new-password" required error={pw.formState.errors.confirmPassword?.message} {...pw.register('confirmPassword')} />
            <Button type="submit" loading={pw.formState.isSubmitting}>Update password</Button>
          </form>
        </Card>
        <Card>
          <CardHeader title="Sign out" description="Signs you out on this device." />
          <Button variant="secondary" leftIcon={LogOutIcon} onClick={async () => {await logout();toast.success('Signed out');navigate('/login', { replace: true });}}>
            Sign out
          </Button>
        </Card>
      </div>
    </div>);

}