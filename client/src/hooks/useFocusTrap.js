import { useEffect, useRef } from 'react';

const FOCUSABLE =
'a[href],button:not([disabled]),textarea:not([disabled]),input:not([disabled]):not([type="hidden"]),select:not([disabled]),[tabindex]:not([tabindex="-1"])';

// Stack of open overlays so only the top-most one reacts to Escape / Tab.
const stack = [];
let lockedOverflow = null;

export function useFocusTrap(open, containerRef, onClose) {
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!open) return undefined;
    const token = {};
    stack.push(token);
    const previous = document.activeElement;
    if (stack.length === 1) {
      lockedOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }

    const focusables = () => Array.from(containerRef.current?.querySelectorAll(FOCUSABLE) || []);
    const timer = setTimeout(() => {
      const node = containerRef.current;
      const auto = node?.querySelector('[data-autofocus]');
      (auto || focusables()[0] || node)?.focus?.();
    }, 40);

    const onKey = (e) => {
      if (stack[stack.length - 1] !== token) return;
      if (e.key === 'Escape') {
        e.stopPropagation();
        onCloseRef.current?.();
      }
      if (e.key === 'Tab') {
        const items = focusables();
        if (!items.length) return;
        const first = items[0];
        const last = items[items.length - 1];
        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    };
    document.addEventListener('keydown', onKey);

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      const i = stack.indexOf(token);
      if (i >= 0) stack.splice(i, 1);
      if (stack.length === 0) document.body.style.overflow = lockedOverflow || '';
      if (previous && typeof previous.focus === 'function') previous.focus();
    };
  }, [open, containerRef]);
}