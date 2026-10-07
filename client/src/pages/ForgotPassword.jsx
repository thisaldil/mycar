import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { ArrowLeftIcon, CircleAlertIcon, MailCheckIcon } from 'lucide-react';
import { authApi } from '../services/authApi';
import { emailSchema } from '../utils/validation';
import { Input } from '../components/common/Input';
import { Button } from '../components/common/Button';
import { ButtonLink } from '../components/common/ButtonLink';

const schema = z.object({ email: emailSchema });

export function ForgotPassword() {
  const [sent, setSent] = useState(null);
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '' } });

  const onSubmit = handleSubmit(async ({ email }) => {
    setServerError(null);
    try {
      const result = await authApi.forgotPassword(email);
      setSent({ email, devResetToken: result?.devResetToken });
    } catch (err) {
      setServerError(err.message);
    }
  });

  if (sent) {
    return (
      <div role="status">
        <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success-soft text-success">
          <MailCheckIcon className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="mt-5 text-[28px] font-bold leading-tight text-ink">Check your inbox</h1>
        <p className="mt-2 text-[15px] text-ink-soft">
          If an account exists for <span className="font-medium text-ink">{sent.email}</span>, we've sent a link to reset your password. It expires in 1 hour.
        </p>
        {sent.devResetToken ?
        <div className="mt-6 rounded-xl border border-line bg-surface p-4 text-sm">
            <p className="font-medium text-ink">Demo mode</p>
            <p className="mt-0.5 text-ink-muted">No email is sent in demo mode. Open the reset link directly:</p>
            <ButtonLink to={`/reset-password?token=${encodeURIComponent(sent.devResetToken)}`} variant="soft" size="sm" className="mt-3">
              Open reset link
            </ButtonLink>
          </div> :
        null}
        <ButtonLink to="/login" variant="secondary" size="lg" className="mt-6 w-full" leftIcon={ArrowLeftIcon}>
          Back to sign in
        </ButtonLink>
      </div>);

  }

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight text-ink">Forgot your password?</h1>
      <p className="mt-2 text-[15px] text-ink-soft">Enter the email you signed up with and we'll send you a reset link.</p>
      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {serverError ?
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {serverError}
          </div> :
        null}
        <Input label="Email" type="email" autoComplete="email" inputMode="email" required error={errors.email?.message} {...register('email')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Send reset link
        </Button>
      </form>
      <p className="mt-6 text-center text-sm">
        <Link to="/login" className="inline-flex items-center gap-1 font-medium text-brand hover:underline">
          <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
          Back to sign in
        </Link>
      </p>
    </div>);

}