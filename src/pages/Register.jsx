import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleAlertIcon } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { emailSchema, passwordSchema } from '../utils/validation';
import { Input } from '../components/common/Input';
import { PasswordInput } from '../components/common/PasswordInput';
import { PasswordStrength } from '../components/common/PasswordStrength';
import { Button } from '../components/common/Button';
import { toast } from '../components/common/Toast';

const schema = z.
object({
  name: z.string().trim().min(2, 'Enter your name').max(80, 'Name is too long'),
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string().min(1, 'Confirm your password')
}).
refine((v) => v.password === v.confirmPassword, { path: ['confirmPassword'], message: 'Passwords do not match' });

export function Register() {
  const { register: registerAccount } = useAuth();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    watch,
    setError,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema), mode: 'onTouched', defaultValues: { name: '', email: '', password: '', confirmPassword: '' } });

  const onSubmit = handleSubmit(async ({ name, email, password }) => {
    setServerError(null);
    try {
      await registerAccount({ name, email, password });
      toast.success('Account created. Let’s add your first vehicle.');
    } catch (err) {
      setServerError(err.message);
      if (err.fieldErrors?.email) setError('email', { message: err.fieldErrors.email });
    }
  });

  return (
    <div>
      <h1 className="text-[28px] font-bold leading-tight text-ink">Create your account</h1>
      <p className="mt-2 text-[15px] text-ink-soft">Keep every service, fill-up and renewal for your car in one place.</p>

      <form onSubmit={onSubmit} noValidate className="mt-6 space-y-4">
        {serverError ?
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {serverError}
          </div> :
        null}
        <Input label="Full name" autoComplete="name" required error={errors.name?.message} {...register('name')} />
        <Input label="Email" type="email" autoComplete="email" inputMode="email" required error={errors.email?.message} {...register('email')} />
        <div className="space-y-2">
          <PasswordInput label="Password" autoComplete="new-password" required error={errors.password?.message} hint="At least 8 characters, with a letter and a number." {...register('password')} />
          <PasswordStrength password={watch('password')} />
        </div>
        <PasswordInput label="Confirm password" autoComplete="new-password" required error={errors.confirmPassword?.message} {...register('confirmPassword')} />
        <Button type="submit" size="lg" className="w-full" loading={isSubmitting}>
          Create account
        </Button>
      </form>

      <p className="mt-6 text-center text-sm text-ink-soft">
        Already have an account?{' '}
        <Link to="/login" className="font-medium text-brand hover:underline">
          Sign in
        </Link>
      </p>
    </div>);

}