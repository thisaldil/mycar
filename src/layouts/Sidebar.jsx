import { Link, NavLink } from 'react-router-dom';
import { PanelLeftCloseIcon, PanelLeftOpenIcon } from 'lucide-react';
import { cn } from '../utils/cn';
import { NAV_GROUPS, NAV_ITEMS } from '../data/navigation';
import { Logo } from '../components/common/Logo';
import { Tooltip } from '../components/common/Tooltip';

function SidebarLink({ item, collapsed }) {
  const Icon = item.icon;
  return (
    <Tooltip content={item.label} side="right" disabled={!collapsed} className="w-full">
      <NavLink
        to={item.to}
        aria-label={collapsed ? item.label : undefined}
        className={({ isActive }) =>
        cn(
          'relative flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium transition-colors duration-150',
          collapsed && 'justify-center px-0',
          isActive ? 'bg-white/10 text-sidebar-ink' : 'text-sidebar-muted hover:bg-white/5 hover:text-sidebar-ink'
        )
        }>
        
        {({ isActive }) =>
        <>
            {isActive ? <span className="absolute left-0 top-2 h-6 w-[3px] rounded-r-full bg-brand" aria-hidden="true" /> : null}
            <Icon className="h-[18px] w-[18px] shrink-0" aria-hidden="true" />
            {!collapsed ? <span className="truncate">{item.label}</span> : null}
          </>
        }
      </NavLink>
    </Tooltip>);

}

export function Sidebar({ collapsed, canToggle, onToggle }) {
  return (
    <aside
      aria-label="Main navigation"
      className={cn(
        'fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-sidebar-line bg-sidebar transition-[width] duration-200 ease-out md:flex',
        collapsed ? 'w-20' : 'w-64'
      )}>
      
      <div className={cn('flex h-16 shrink-0 items-center', collapsed ? 'justify-center' : 'px-5')}>
        <Link to="/dashboard" className="rounded-xl" aria-label="CarLife dashboard">
          <Logo inverted showText={!collapsed} />
        </Link>
      </div>
      <nav className="no-scrollbar flex-1 overflow-y-auto px-3 pb-4 pt-2">
        {NAV_GROUPS.map((group) =>
        <div key={group.id} className="mb-5 last:mb-0">
            {group.label ?
          collapsed ?
          <div className="mx-3 mb-2 h-px bg-sidebar-line" aria-hidden="true" /> :

          <p className="px-3 pb-1.5 text-xs font-medium text-sidebar-muted/80">{group.label}</p> :

          null}
            <ul className="space-y-0.5">
              {group.items.map((item) =>
            <li key={item.to}>
                  <SidebarLink item={item} collapsed={collapsed} />
                </li>
            )}
            </ul>
          </div>
        )}
      </nav>
      <div className="space-y-0.5 border-t border-sidebar-line p-3">
        <SidebarLink item={NAV_ITEMS.settings} collapsed={collapsed} />
        {canToggle ?
        <button
          type="button"
          onClick={onToggle}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className={cn(
            'flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-medium text-sidebar-muted transition-colors duration-150 hover:bg-white/5 hover:text-sidebar-ink',
            collapsed && 'justify-center px-0'
          )}>
          
            {collapsed ? <PanelLeftOpenIcon className="h-[18px] w-[18px]" aria-hidden="true" /> : <PanelLeftCloseIcon className="h-[18px] w-[18px]" aria-hidden="true" />}
            {!collapsed ? 'Collapse' : null}
          </button> :
        null}
      </div>
    </aside>);

}