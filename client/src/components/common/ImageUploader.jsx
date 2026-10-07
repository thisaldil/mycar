import { useId, useState } from 'react';
import { ImagePlusIcon, Loader2Icon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { compressImage } from '../../utils/files';
import { safeUrl } from '../../utils/sanitize';

/** value: string[] of image data URLs / https URLs. Images are resized client-side before upload. */
export function ImageUploader({ value = [], onChange, max = 6, label, hint, error, altPrefix = 'Photo', coverLabel }) {
  const inputId = useId();
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(null);
  const shownError = error || localError;

  const handleFiles = async (fileList) => {
    setLocalError(null);
    const files = Array.from(fileList || []).filter((f) => f.type.startsWith('image/'));
    const room = max - value.length;
    if (!files.length) return;
    if (room <= 0) {
      setLocalError(`You can add up to ${max} photos.`);
      return;
    }
    if (files.some((f) => f.size > 15 * 1024 * 1024)) {
      setLocalError('Photos must be smaller than 15 MB.');
      return;
    }
    setBusy(true);
    try {
      const images = await Promise.all(files.slice(0, room).map((f) => compressImage(f)));
      onChange([...value, ...images]);
    } catch {
      setLocalError('We could not process one of those photos.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label ? <p className="text-sm font-medium text-ink">{label}</p> : null}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {value.map((src, i) =>
        <div key={`${i}-${src.slice(-12)}`} className="group relative aspect-[4/3] overflow-hidden rounded-xl border border-line bg-subtle">
            <img src={safeUrl(src)} alt={`${altPrefix} ${i + 1}`} className="h-full w-full object-cover" />
            {i === 0 && coverLabel ?
          <span className="absolute bottom-1.5 left-1.5 rounded-md bg-black/65 px-1.5 py-0.5 text-[11px] font-medium text-white">{coverLabel}</span> :
          null}
            <button
            type="button"
            onClick={() => onChange(value.filter((_, idx) => idx !== i))}
            className="absolute right-1.5 top-1.5 flex h-7 w-7 items-center justify-center rounded-full bg-black/65 text-white transition-colors duration-150 hover:bg-black/85"
            aria-label={`Remove ${altPrefix.toLowerCase()} ${i + 1}`}>
            
              <XIcon className="h-4 w-4" aria-hidden="true" />
            </button>
          </div>
        )}
        {value.length < max ?
        <label
          className={cn(
            'flex aspect-[4/3] cursor-pointer flex-col items-center justify-center gap-1 rounded-xl border-2 border-dashed text-ink-muted',
            'transition-colors duration-150 hover:border-brand/60 hover:text-brand focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15',
            shownError ? 'border-danger/60' : 'border-line-strong'
          )}>
          
            <input
            id={inputId}
            type="file"
            accept="image/*"
            multiple
            className="sr-only"
            onChange={(e) => {
              handleFiles(e.target.files);
              e.target.value = '';
            }} />
          
            {busy ? <Loader2Icon className="h-5 w-5 animate-spin" aria-hidden="true" /> : <ImagePlusIcon className="h-5 w-5" aria-hidden="true" />}
            <span className="text-xs font-medium">Add photo</span>
          </label> :
        null}
      </div>
      {shownError ?
      <p className="text-[13px] text-danger" role="alert">
          {shownError}
        </p> :
      hint ?
      <p className="text-[13px] text-ink-muted">{hint}</p> :
      null}
    </div>);

}