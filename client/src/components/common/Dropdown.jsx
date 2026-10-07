import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { cn } from '../../utils/cn';

const EASE = [0.23, 1, 0.32, 1];
const ITEM = 'flex w-full items-center gap-2.5 rounded-lg px-3 py-2.5 text-left text-sm transition-colors duration-100 focus:outline-none';

/**
 * Accessible menu. `trigger(props, open)` must spread props onto a button.
 * items: [{ label, icon, onSelect, to, danger, disabled } | { type: 'divider' } | { type: 'label', label }]
 * children may be a function (close) => node for custom panels (e.g. notifications).
 */
export function Dropdown({ trigger, items = [], align = 'end', className, menuClassName, children, role = 'menu' }) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef(null);
  const triggerRef = useRef(null);
  const menuRef = useRef(null);
  const id = useId();
  const close = useCallback(() => setOpen(false), []);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => {
      if (!rootRef.current?.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('touchstart', onDown);
    const t = setTimeout(() => {
      const first = menuRef.current?.querySelector('[role="menuitem"]:not([disabled])');
      if (first && role === 'menu') first.focus();
    }, 30);
    return () => {
      clearTimeout(t);
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('touchstart', onDown);
    };
  }, [open, role]);

  const onKeyDown = (e) => {
    if (!open) return;
    if (e.key === 'Escape') {
      e.stopPropagation();
      setOpen(false);
      triggerRef.current?.focus();
    } else if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      const els = Array.from(menuRef.current?.querySelectorAll('[role="menuitem"]:not([disabled])') || []);
      if (!els.length) return;
      e.preventDefault();
      const i = els.indexOf(document.activeElement);
      const next = e.key === 'ArrowDown' ? (i + 1) % els.length : (i - 1 + els.length) % els.length;
      els[next].focus();
    } else if (e.key === 'Tab') {
      setOpen(false);
    }
  };

  const triggerProps = {
    ref: triggerRef,
    'aria-haspopup': role === 'menu' ? 'menu' : 'dialog',
    'aria-expanded': open,
    'aria-controls': open ? id : undefined,
    onClick: () => setOpen((o) => !o)
  };

  return (
    <div ref={rootRef} className={cn('relative', className)} onKeyDown={onKeyDown}>
      {trigger(triggerProps, open)}
      <AnimatePresence>
        {open ?
        <motion.div
          ref={menuRef}
          id={id}
          role={role}
          initial={{ opacity: 0, y: -4, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -4, scale: 0.98 }}
          transition={{ duration: 0.15, ease: EASE }}
          className={cn(
            'absolute z-40 mt-2 min-w-[14rem] overflow-hidden rounded-xl border border-line bg-surface p-1 shadow-pop',
            align === 'end' ? 'right-0 origin-top-right' : 'left-0 origin-top-left',
            menuClassName
          )}>
          
            {typeof children === 'function' ? children(close) : children}
            {items.map((item, index) => {
            if (item.type === 'divider') return <div key={`d-${index}`} className="my-1 h-px bg-line" role="separator" />;
            if (item.type === 'label')
            return (
              <p key={`l-${index}`} className="px-3 pb-1 pt-2 text-xs font-medium text-ink-muted">
                    {item.label}
                  </p>);

            const Icon = item.icon;
            const cls = cn(
              ITEM,
              item.danger ? 'text-danger hover:bg-danger-soft focus:bg-danger-soft' : 'text-ink hover:bg-subtle focus:bg-subtle',
              item.disabled && 'pointer-events-none opacity-50',
              item.active && 'font-medium'
            );
            const content =
            <>
                  {Icon ? <Icon className={cn('h-4 w-4 shrink-0', item.danger ? '' : 'text-ink-muted')} aria-hidden="true" /> : null}
                  <span className="min-w-0 flex-1 truncate">{item.label}</span>
                  {item.trailing}
                </>;

            if (item.to) {
              return (
                <Link key={item.label} to={item.to} role="menuitem" className={cls} onClick={close}>
                    {content}
                  </Link>);

            }
            return (
              <button
                key={item.label}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                className={cls}
                onClick={() => {
                  close();
                  item.onSelect?.();
                }}>
                
                  {content}
                </button>);

          })}
          </motion.div> :
        null}
      </AnimatePresence>
    </div>);

}