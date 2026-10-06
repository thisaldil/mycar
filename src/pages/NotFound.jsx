import { ArrowLeftIcon, MapPinOffIcon } from 'lucide-react';
import { ButtonLink } from '../components/common/ButtonLink';

export function NotFound() {
  return (
    <main className="flex min-h-screen w-full flex-col items-center justify-center bg-canvas px-6 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-brand">
        <MapPinOffIcon className="h-7 w-7" aria-hidden="true" />
      </span>
      <h1 className="mt-6 text-3xl font-bold text-ink">Wrong turn</h1>
      <p className="mt-2 max-w-sm text-[15px] text-ink-soft">We couldn't find that page. It may have moved, or the link might be mistyped.</p>
      <ButtonLink to="/dashboard" className="mt-6" leftIcon={ArrowLeftIcon}>
        Back to dashboard
      </ButtonLink>
    </main>);

}