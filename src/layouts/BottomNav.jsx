import { NavLink } from 'react-router-dom';
import { MenuIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import { BOTTOM_NAV } from '../data/navigation';

export function BottomNav({ onMore, menuOpen }) {
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-30 border-t border-line bg-surface/95 pb-[env(safe-area-inset-bottom)] backdrop-blur md:hidden">
      <ul className="grid grid-cols-5">
        {BOTTOM_NAV.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to}>
              <NavLink
                to={item.to}
                className={({ isActive }) =>
                cn('flex h-16 flex-col items-center justify-center gap-1 text-[11px] font-medium transition-colors duration-150', isActive ? 'text-brand' : 'text-ink-muted')
                }>
                
                <Icon className="h-[22px] w-[22px]" aria-hidden="true" />
                {item.short}
              </NavLink>
            </li>);

        })}
        <li>
          <button
            type="button"
            onClick={onMore}
            aria-haspopup="dialog"
            aria-expanded={menuOpen}
            className="flex h-16 w-full flex-col items-center justify-center gap-1 text-[11px] font-medium text-ink-muted">
            
            <MenuIcon className="h-[22px] w-[22px]" aria-hidden="true" />
            More
          </button>
        </li>
      </ul>
    </nav>);

}