import { Loader2Icon } from 'lucide-react';
import { Logo } from '../components/common/Logo';

export function FullScreenLoader() {
  return (
    <div role="status" className="flex min-h-screen w-full flex-col items-center justify-center gap-5 bg-canvas">
      <Logo />
      <Loader2Icon className="h-5 w-5 animate-spin text-ink-muted" aria-hidden="true" />
      <span className="sr-only">Loading CarLife</span>
    </div>);

}