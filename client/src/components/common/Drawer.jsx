import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { Button } from './Button';

const EASE = [0.23, 1, 0.32, 1];
const WIDTHS = { sm: 'max-w-sm', md: 'max-w-md', lg: 'max-w-xl' };

function DrawerPanel({ onClose, title, subtitle, children, footer, side, width, headerExtra }) {
  const ref = useRef(null);
  const titleId = useId();
  useFocusTrap(true, ref, onClose);
  const offset = side === 'left' ? '-100%' : '100%';

  return (
    <div className="fixed inset-0 z-50">
      <motion.div
        className="absolute inset-0 bg-black/45"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.2 }}
        onClick={onClose}
        aria-hidden="true" />
      
      <motion.aside
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        tabIndex={-1}
        className={cn(
          'absolute inset-y-0 flex w-full flex-col bg-surface shadow-pop outline-none',
          side === 'left' ? 'left-0' : 'right-0',
          WIDTHS[width]
        )}
        initial={{ x: offset }}
        animate={{ x: 0 }}
        exit={{ x: offset }}
        transition={{ duration: 0.28, ease: EASE }}>
        
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
          <div className="min-w-0">
            <h2 id={titleId} className="truncate text-lg font-semibold text-ink">
              {title}
            </h2>
            {subtitle ? <p className="mt-0.5 text-sm text-ink-soft">{subtitle}</p> : null}
            {headerExtra}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close panel" className="-mr-2">
            <XIcon aria-hidden="true" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto px-5 py-5">{children}</div>
        {footer ?
        <div className="flex gap-2 border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">{footer}</div> :
        null}
      </motion.aside>
    </div>);

}

export function Drawer({ open, onClose, title, subtitle, children, footer, side = 'right', width = 'md', headerExtra }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open ?
      <DrawerPanel onClose={onClose} title={title} subtitle={subtitle} footer={footer} side={side} width={width} headerExtra={headerExtra}>
          {children}
        </DrawerPanel> :
      null}
    </AnimatePresence>,
    document.body
  );
}