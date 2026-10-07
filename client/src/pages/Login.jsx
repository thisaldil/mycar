import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleAlertIcon, SparklesIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { USE_MOCK } from '../services/api';
import { emailSchema } from '../utils/validation';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { Checkbox } from '../components/common/Checkbox';
import { Button } from '../components/common/Button';
import { toast } from '../components/common/Toast';

const schema = z.object({
  email: emailSchema,
  password: z.string().min(1, 'Password is required'),
  rememberMe: z.boolean().optional()
});

export function Login() {
  const { login } = useAuth();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema), defaultValues: { email: '', password: '', rememberMe: true } });

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const user = await login(values);
      toast.success(`Welcome back, ${user.name.split(' ')[0]}`);
    } catch (err) {
      setServerError(err.message);
    }
  });

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight text-ink">Sign in to CarLife</h1>
      <p className="mt-2 text-[15px] text-ink-soft">Welcome back. Here's what's happening with your car.</p>

      {USE_MOCK ?
      <div className="mt-6 flex items-center gap-3 rounded-xl border border-line bg-surface p-3">
          <SparklesIcon className="h-5 w-5 shrink-0 text-brand" aria-hidden="true" />
          <div className="min-w-0 flex-1 text-sm">
            <p className="font-medium text-ink">Demo mode</p>
            <p className="truncate text-ink-muted">demo@carlife.app · Demo1234!</p>
          </div>
          <Button
          size="sm"
          variant="soft"
          onClick={() => {
            setValue('email', 'demo@carlife.app', { shouldValidate: true });
            setValue('password', 'Demo1234!', { shouldValidate: true });
          }}>
          
            Use demo
          </Button>
        </div> :
      null}

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {serverError ?
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {serverError}
          </div> :
        null}
        <Input label="Email" type="email" autoComplete="email" inputMode="email" required error={errors.email?.message} {...register('email')} />
        <PasswordInput
          label="Password"
          required
          error={errors.password?.message}
          labelAction={
          <Link to="/forgot-password" className="text-sm font-medium text-brand hover:underline">
              Forgot password?
            </Link>
          }
          {...register('password')} />
        
        <Checkbox label="Keep me signed in" description="Only on devices you trust." {...register('rememberMe')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Sign in
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        New to CarLife?{' '}
        <Link to="/register" className="font-medium text-brand hover:underline">
          Create an account
        </Link>
      </p>
    </div>);

}