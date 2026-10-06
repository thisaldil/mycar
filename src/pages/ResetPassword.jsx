import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleAlertIcon, KeyRoundIcon, ShieldCheckIcon } from 'lucide-react';
import { authApi } from '../services/authApi';
import { passwordSchema } from '../utils/validation';
import { PasswordInput } from '../components/common/PasswordInput';
import { PasswordStrength } from '../components/common/PasswordStrength';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';

const schema = z.
object({ password: passwordSchema, confirmPassword: z.string().min(1, 'Confirm your new password') }).
refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export function ResetPassword() {
  const [params] = useSearchParams();
  const token = params.get('token');
  const [done, setDone] = useState(false);
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: { password: '', confirmPassword: '' } });

  const onSubmit = handleSubmit(async ({ password }) => {
    setServerError(null);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
    } catch (err) {
      setServerError(err.message);
    }
  });

  if (!token) {
    return (
      <div role="alert">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-danger-soft text-danger">
          <KeyRoundIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-[28px] font-bold leading-tight text-ink">This link isn't valid</h1>
        <p className="mt-2 text-[15px] text-ink-soft">The reset link is missing or incomplete. Request a new one to continue.</p>
        <ButtonLink to="/forgot-password" size="lg" className="mt-6 w-full">
          Request a new link
        </ButtonLink>
      </div>);

  }

  if (done) {
    return (
      <div role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-soft text-success">
          <ShieldCheckIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-[28px] font-bold leading-tight text-ink">Password updated</h1>
        <p className="mt-2 text-[15px] text-ink-soft">You can now sign in with your new password.</p>
        <ButtonLink to="/login" size="lg" className="mt-6 w-full">
          Sign in
        </ButtonLink>
      </div>);

  }

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight text-ink">Choose a new password</h1>
      <p className="mt-2 text-[15px] text-ink-soft">Make it something you haven't used here before.</p>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {serverError ?
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <span>
              {serverError}{' '}
              <a href="/forgot-password" className="font-medium underline">
                Request a new link
              </a>
            </span>
          </div> :
        null}
        <div className="space-y-2">
          <PasswordInput label="New password" autoComplete="new-password" required error={errors.password?.message} {...register('password')} />
          <PasswordStrength password={watch('password')} />
        </div>
        <PasswordInput label="Confirm new password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Update password
        </Button>
      </form>
    </div>);

}