import { Suspense } from 'react';
import { Link, Outlet } from 'react-router-dom';
import { Logo } from '../components/common/Logo';
import { LoadingState } from '../components/common/LoadingState';
import { AUTH_IMAGE } from '../data/seed';

export function AuthLayout() {
  return (
    <div className="grid min-h-screen w-full bg-canvas lg:grid-cols-[minmax(0,1fr)_minmax(0,1.1fr)]">
      <div className="flex min-h-screen flex-col px-5 py-6 sm:px-10">
        <Link to="/login" className="w-fit rounded-xl">
          <Logo />
        </Link>
        <main className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-[400px]">
            <Suspense fallback={<LoadingState />}>
              <Outlet />
            </Suspense>
          </div>
        </main>
        <p className="text-xs text-ink-muted">© {new Date().getFullYear()} CarLife. Your data stays yours.</p>
      </div>
      <aside className="relative hidden overflow-hidden bg-sidebar lg:block" aria-hidden="true">
        <img src={AUTH_IMAGE} alt="" className="absolute inset-0 h-full w-full object-cover opacity-80" />
        <div className="absolute inset-x-8 bottom-8 rounded-2xl bg-black/55 p-8 text-white backdrop-blur-sm">
          <p className="max-w-md font-display text-[28px] font-semibold leading-tight">Every service, fill-up and renewal — in one calm place.</p>
          <p className="mt-3 max-w-md text-[15px] text-white/80">CarLife tells you what needs attention before it becomes a problem, so your car never surprises you.</p>
        </div>
      </aside>
    </div>);

}