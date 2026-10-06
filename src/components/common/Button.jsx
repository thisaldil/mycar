import { forwardRef } from 'react';
import { Loader2Icon } from 'lucide-react';
import { cn } from '../../utils/cn';

const VARIANTS = {
  primary: 'bg-brand text-brand-on hover:bg-brand/90',
  secondary: 'border border-line bg-surface text-ink hover:border-line-strong hover:bg-subtle',
  soft: 'bg-brand-soft text-brand hover:bg-brand/15',
  ghost: 'text-ink-soft hover:bg-subtle hover:text-ink',
  danger: 'bg-danger text-danger-on hover:bg-danger/90',
  'danger-ghost': 'text-danger hover:bg-danger-soft',
  dark: 'bg-ink text-canvas hover:bg-ink/90'
};

const SIZES = {
  sm: 'h-9 gap-1.5 px-3 text-sm',
  md: 'h-11 gap-2 px-4 text-sm',
  lg: 'h-12 gap-2 px-5 text-[15px]',
  icon: 'h-11 w-11 [&>svg]:h-5 [&>svg]:w-5',
  'icon-sm': 'h-9 w-9 [&>svg]:h-[18px] [&>svg]:w-[18px]'
};

export function buttonClasses({ variant = 'primary', size = 'md', className } = {}) {
  return cn(
    'inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-xl font-medium',
    'transition-[background-color,color,border-color,transform,opacity] duration-150 ease-out active:scale-[0.97]',
    'disabled:pointer-events-none disabled:opacity-50',
    VARIANTS[variant],
    SIZES[size],
    className
  );
}

export const Button = forwardRef(function Button(
{ variant = 'primary', size = 'md', loading = false, leftIcon: LeftIcon, rightIcon: RightIcon, className, children, disabled, type = 'button', ...props },
ref)
{
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={buttonClasses({ variant, size, className })}
      {...props}>
      
      {loading ?
      <Loader2Icon className="h-4 w-4 animate-spin" aria-hidden="true" /> :
      LeftIcon ?
      <LeftIcon className="h-4 w-4" aria-hidden="true" /> :
      null}
      {children}
      {RightIcon && !loading ? <RightIcon className="h-4 w-4" aria-hidden="true" /> : null}
    </button>);

});