import { useId, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon } from 'lucide-react';
import { cn } from '../../utils/cn';

/** items: [{ id, title, subtitle?, icon?, content }] */
export function Accordion({ items, defaultOpen = [], className }) {
  const [open, setOpen] = useState(() => new Set(defaultOpen));
  const baseId = useId();

  const toggle = (id) =>
  setOpen((prev) => {
    const next = new Set(prev);
    if (next.has(id)) next.delete(id);else
    next.add(id);
    return next;
  });

  return (
    <div className={cn('divide-y divide-line overflow-hidden rounded-2xl border border-line bg-surface shadow-card', className)}>
      {items.map((item) => {
        const isOpen = open.has(item.id);
        const Icon = item.icon;
        const headerId = `${baseId}-${item.id}-h`;
        const panelId = `${baseId}-${item.id}-p`;
        return (
          <div key={item.id}>
            <h3 className="font-sans">
              <button
                id={headerId}
                type="button"
                aria-expanded={isOpen}
                aria-controls={panelId}
                onClick={() => toggle(item.id)}
                className="flex w-full items-center gap-3 px-5 py-4 text-left transition-colors duration-150 hover:bg-subtle">
                
                {Icon ?
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-soft">
                    <Icon className="h-[18px] w-[18px]" aria-hidden="true" />
                  </span> :
                null}
                <span className="min-w-0 flex-1">
                  <span className="block text-[15px] font-semibold text-ink">{item.title}</span>
                  {item.subtitle ? <span className="block truncate text-[13px] text-ink-muted">{item.subtitle}</span> : null}
                </span>
                <ChevronDownIcon
                  className={cn('h-5 w-5 shrink-0 text-ink-muted transition-transform duration-200 ease-out', isOpen && 'rotate-180')}
                  aria-hidden="true" />
                
              </button>
            </h3>
            <AnimatePresence initial={false}>
              {isOpen ?
              <motion.div
                id={panelId}
                role="region"
                aria-labelledby={headerId}
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
                className="overflow-hidden">
                
                  <div className="px-5 pb-5">{item.content}</div>
                </motion.div> :
              null}
            </AnimatePresence>
          </div>);

      })}
    </div>);

}