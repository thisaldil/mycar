import { Suspense, useEffect, useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { cn } from '../utils/cn';
import { useMediaQuery } from '../hooks/useMediaQuery';
import { LoadingState } from '../components/common/LoadingState';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { BottomNav } from './BottomNav';
import { MobileMenu } from './MobileMenu';

const COLLAPSE_KEY = 'carlife_sidebar_collapsed';

export function AppLayout() {
  const isLarge = useMediaQuery('(min-width: 1024px)');
  const [userCollapsed, setUserCollapsed] = useState(() => {
    try {
      return localStorage.getItem(COLLAPSE_KEY) === '1';
    } catch {
      return false;
    }
  });
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();
  const collapsed = !isLarge || userCollapsed;

  useEffect(() => {
    setMenuOpen(false);
    window.scrollTo({ top: 0 });
  }, [location.pathname]);

  const toggle = () => {
    setUserCollapsed((c) => {
      try {
        localStorage.setItem(COLLAPSE_KEY, c ? '0' : '1');
      } catch {

        /* ignore */}
      return !c;
    });
  };

  return (
    <div className="min-h-screen w-full bg-canvas">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-brand px-4 py-2 text-brand-on focus:not-sr-only focus:fixed focus:left-4 focus:top-4">
        
        Skip to content
      </a>
      <Sidebar collapsed={collapsed} canToggle={isLarge} onToggle={toggle} />
      <div className={cn('transition-[padding] duration-200 ease-out', collapsed ? 'md:pl-20' : 'md:pl-64')}>
        <Topbar />
        <main id="main" tabIndex={-1} className="mx-auto w-full max-w-[1400px] px-4 pb-28 pt-5 outline-none sm:px-6 md:pb-12 lg:px-8 lg:pt-8">
          <Suspense fallback={<LoadingState variant="page" />}>
            <Outlet />
          </Suspense>
        </main>
      </div>
      <BottomNav onMore={() => setMenuOpen(true)} menuOpen={menuOpen} />
      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </div>);

}