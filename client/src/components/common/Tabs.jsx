import { useId, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '../../utils/cn';

/** tabs: [{ id, label, icon?, count? }] — pair with <div role="tabpanel" id={`panel-${id}`} aria-labelledby={`tab-${id}`}> */
export function Tabs({ tabs, value, onChange, ariaLabel, className }) {
  const layoutId = useId();
  const refs = useRef({});

  const onKeyDown = (e, index) => {
    let next = null;
    if (e.key === 'ArrowRight') next = (index + 1) % tabs.length;
    if (e.key === 'ArrowLeft') next = (index - 1 + tabs.length) % tabs.length;
    if (e.key === 'Home') next = 0;
    if (e.key === 'End') next = tabs.length - 1;
    if (next == null) return;
    e.preventDefault();
    const tab = tabs[next];
    onChange(tab.id);
    refs.current[tab.id]?.focus();
  };

  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn('no-scrollbar -mx-4 flex gap-1 overflow-x-auto border-b border-line px-4 sm:mx-0 sm:px-0', className)}>
      
      {tabs.map((tab, index) => {
        const active = tab.id === value;
        const Icon = tab.icon;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              refs.current[tab.id] = el;
            }}
            id={`tab-${tab.id}`}
            type="button"
            role="tab"
            aria-selected={active}
            aria-controls={`panel-${tab.id}`}
            tabIndex={active ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={(e) => onKeyDown(e, index)}
            className={cn(
              'relative flex h-11 shrink-0 items-center gap-2 whitespace-nowrap rounded-t-lg px-3 text-sm font-medium transition-colors duration-150',
              active ? 'text-ink' : 'text-ink-muted hover:text-ink'
            )}>
            
            {Icon ? <Icon className="h-4 w-4" aria-hidden="true" /> : null}
            {tab.label}
            {tab.count != null ?
            <span className={cn('rounded-full px-1.5 text-xs tnum', active ? 'bg-brand-soft text-brand' : 'bg-subtle text-ink-muted')}>
                {tab.count}
              </span> :
            null}
            {active ?
            <motion.span
              layoutId={layoutId}
              className="absolute inset-x-2 -bottom-px h-0.5 rounded-full bg-brand"
              transition={{ type: 'spring', stiffness: 500, damping: 40 }} /> :

            null}
          </button>);

      })}
    </div>);

}