import { useId, useState } from 'react';
import { FileIcon, FileImageIcon, Loader2Icon, UploadCloudIcon, XIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { formatFileSize } from '../../utils/format';
import { MAX_FILE_BYTES, readAsDataURL, uid } from '../../utils/files';

function matchesAccept(file, accept) {
  if (!accept) return true;
  return accept.split(',').some((raw) => {
    const a = raw.trim().toLowerCase();
    if (a.endsWith('/*')) return file.type.toLowerCase().startsWith(a.slice(0, -1));
    if (a.startsWith('.')) return file.name.toLowerCase().endsWith(a);
    return file.type.toLowerCase() === a;
  });
}

/** value: [{ id, name, size, type, dataUrl?, file? }] */
export function FileUploader({ value = [], onChange, accept, multiple = true, maxFiles = 5, maxSize = MAX_FILE_BYTES, label, hint, error, required, showList = true }) {
  const inputId = useId();
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState(null);
  const shownError = error || localError;
  const helpId = `${inputId}-help`;

  const handleFiles = async (fileList) => {
    setLocalError(null);
    const files = Array.from(fileList || []);
    if (!files.length) return;
    const room = multiple ? maxFiles - value.length : 1;
    if (room <= 0) {
      setLocalError(`You can attach up to ${maxFiles} files.`);
      return;
    }
    const accepted = [];
    files.slice(0, room).forEach((f) => {
      if (f.size > maxSize) setLocalError(`${f.name} is larger than ${formatFileSize(maxSize)}.`);else
      if (!matchesAccept(f, accept)) setLocalError(`${f.name} isn't a supported file type.`);else
      accepted.push(f);
    });
    if (!accepted.length) return;
    setBusy(true);
    try {
      const items = await Promise.all(
        accepted.map(async (f) => ({
          id: uid(),
          name: f.name,
          size: f.size,
          type: f.type,
          dataUrl: f.size <= 2 * 1024 * 1024 ? await readAsDataURL(f) : null,
          file: f
        }))
      );
      onChange(multiple ? [...value, ...items] : items);
    } catch {
      setLocalError('We could not read that file. Try another one.');
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="flex flex-col gap-1.5">
      {label ?
      <p className="text-sm font-medium text-ink">
          {label}
          {required ? <span className="ml-0.5 text-danger" aria-hidden="true">*</span> : null}
        </p> :
      null}
      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          handleFiles(e.dataTransfer.files);
        }}
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center',
          'transition-colors duration-150 focus-within:border-brand focus-within:ring-4 focus-within:ring-brand/15',
          dragging ? 'border-brand bg-brand-soft' : shownError ? 'border-danger/60' : 'border-line-strong hover:border-brand/60 hover:bg-subtle'
        )}>
        
        <input
          id={inputId}
          type="file"
          className="sr-only"
          accept={accept}
          multiple={multiple}
          aria-describedby={helpId}
          aria-invalid={shownError ? true : undefined}
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = '';
          }} />
        
        {busy ?
        <Loader2Icon className="h-6 w-6 animate-spin text-brand" aria-hidden="true" /> :

        <UploadCloudIcon className="h-6 w-6 text-ink-muted" aria-hidden="true" />
        }
        <span className="text-sm text-ink">
          Drop {multiple ? 'files' : 'a file'} here or <span className="font-medium text-brand underline underline-offset-2">browse</span>
        </span>
        <span id={helpId} className="text-xs text-ink-muted">
          {hint || `Up to ${formatFileSize(maxSize)}${multiple ? ` · max ${maxFiles} files` : ''}`}
        </span>
      </label>
      {shownError ?
      <p className="text-[13px] text-danger" role="alert">
          {shownError}
        </p> :
      null}
      {showList && value.length ?
      <ul className="mt-1 space-y-2">
          {value.map((f) => {
          const Icon = f.type?.startsWith('image/') ? FileImageIcon : FileIcon;
          return (
            <li key={f.id || f.name} className="flex items-center gap-3 rounded-xl border border-line bg-subtle px-3 py-2">
                <Icon className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-ink">{f.name}</span>
                  <span className="block text-xs text-ink-muted">{formatFileSize(f.size)}</span>
                </span>
                <button
                type="button"
                onClick={() => onChange(value.filter((x) => x !== f))}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-surface hover:text-danger"
                aria-label={`Remove ${f.name}`}>
                
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </li>);

        })}
        </ul> :
      null}
    </div>);

}