import { useState } from 'react';
import { EyeIcon, EyeOffIcon } from 'lucide-react';
import { maskValue } from '../../utils/sanitize';

/** Masks identifiers like policy numbers until the user chooses to reveal them. */
export function SensitiveValue({ value, visibleChars = 4 }) {
  const [shown, setShown] = useState(false);
  if (!value) return '—';
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="tnum">{shown ? value : maskValue(value, visibleChars)}</span>
      <button
        type="button"
        onClick={() => setShown((s) => !s)}
        className="flex h-7 w-7 items-center justify-center rounded-md text-ink-muted transition-colors duration-150 hover:bg-subtle hover:text-ink"
        aria-label={shown ? 'Hide value' : 'Reveal value'}
        aria-pressed={shown}>
        
        {shown ? <EyeOffIcon className="h-4 w-4" aria-hidden="true" /> : <EyeIcon className="h-4 w-4" aria-hidden="true" />}
      </button>
    </span>);

}