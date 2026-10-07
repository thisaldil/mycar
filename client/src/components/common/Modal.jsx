import { useId, useRef } from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useFocusTrap } from '../../hooks/useFocusTrap';
import { Button } from './Button';

const SIZES = { sm: 'sm:max-w-md', md: 'sm:max-w-xl', lg: 'sm:max-w-3xl', xl: 'sm:max-w-5xl' };
const EASE = [0.23, 1, 0.32, 1];

function ModalPanel({ onClose, title, description, children, footer, size, closeOnBackdrop, bodyClassName }) {
  const ref = useRef(null);
  const titleId = useId();
  const descId = useId();
  useFocusTrap(true, ref, onClose);

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:p-6">
      <motion.div
        className="absolute inset-0 bg-black/50"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.18 }}
        onClick={closeOnBackdrop ? onClose : undefined}
        aria-hidden="true" />
      
      <motion.div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={description ? descId : undefined}
        tabIndex={-1}
        className={cn('relative flex max-h-[92dvh] w-full flex-col rounded-t-3xl bg-surface shadow-pop outline-none sm:rounded-2xl', SIZES[size])}
        initial={{ opacity: 0, y: 28, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 20, scale: 0.98 }}
        transition={{ duration: 0.24, ease: EASE }}>
        
        <div className="mx-auto mt-2 h-1 w-10 rounded-full bg-line-strong sm:hidden" aria-hidden="true" />
        <div className="flex items-start justify-between gap-4 border-b border-line px-5 pb-4 pt-3 sm:px-6 sm:pt-5">
          <div className="min-w-0">
            <h2 id={titleId} className="text-lg font-semibold text-ink">
              {title}
            </h2>
            {description ?
            <p id={descId} className="mt-0.5 text-sm text-ink-soft">
                {description}
              </p> :
            null}
          </div>
          <Button variant="ghost" size="icon-sm" onClick={onClose} aria-label="Close dialog" className="-mr-2">
            <XIcon aria-hidden="true" />
          </Button>
        </div>
        <div className={cn('flex-1 overflow-y-auto px-5 py-5 sm:px-6', bodyClassName)}>{children}</div>
        {footer ?
        <div className="flex flex-col-reverse gap-2 border-t border-line px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4 sm:flex-row sm:justify-end sm:px-6 sm:pb-4">
            {footer}
          </div> :
        null}
      </motion.div>
    </div>);

}

export function Modal({ open, onClose, title, description, children, footer, size = 'md', closeOnBackdrop = true, bodyClassName }) {
  if (typeof document === 'undefined') return null;
  return createPortal(
    <AnimatePresence>
      {open ?
      <ModalPanel
        onClose={onClose}
        title={title}
        description={description}
        footer={footer}
        size={size}
        closeOnBackdrop={closeOnBackdrop}
        bodyClassName={bodyClassName}>
        
          {children}
        </ModalPanel> :
      null}
    </AnimatePresence>,
    document.body
  );
}