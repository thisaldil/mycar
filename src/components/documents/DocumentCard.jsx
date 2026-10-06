import { DownloadIcon, EyeIcon, FileImageIcon, FileTextIcon, Trash2Icon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { expiryStatus } from '../../utils/status';
import { formatFileSize } from '../../utils/format';
import { Button } from '../common/Button';
import { StatusBadge } from '../common/StatusBadge';

export function DocumentCard({ doc, onPreview, onDownload, onDelete, downloading }) {
  const fmt = useFormat();
  const status = doc.expiryDate ? expiryStatus(doc.expiryDate, 30) : 'no-expiry';
  const Icon = doc.fileType?.startsWith('image/') ? FileImageIcon : FileTextIcon;

  return (
    <article className="flex h-full flex-col rounded-2xl border border-line bg-surface p-5 shadow-card">
      <div className="flex items-start gap-3">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-brand-soft text-brand">
          <Icon className="h-5 w-5" aria-hidden="true" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate text-[15px] font-semibold text-ink" title={doc.name}>
            {doc.name}
          </h3>
          <p className="truncate text-sm text-ink-muted">
            {doc.category}
            {doc.fileSize ? ` · ${formatFileSize(doc.fileSize)}` : ''}
          </p>
        </div>
      </div>
      <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
        <div>
          <dt className="text-ink-muted">Uploaded</dt>
          <dd className="mt-0.5 text-ink">{fmt.date(doc.uploadDate)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Expiry</dt>
          <dd className="mt-0.5 text-ink">{doc.expiryDate ? fmt.date(doc.expiryDate) : 'None'}</dd>
        </div>
      </dl>
      <div className="mt-3">
        <StatusBadge status={status} label={status === 'expiring' ? `Expires ${fmt.relative(doc.expiryDate)}` : undefined} size="sm" />
      </div>
      <div className="flex-1" />
      <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
        <Button size="sm" variant="secondary" className="flex-1" leftIcon={EyeIcon} onClick={() => onPreview(doc)}>
          Preview
        </Button>
        <Button size="icon-sm" variant="ghost" onClick={() => onDownload(doc)} loading={downloading} aria-label={`Download ${doc.name}`}>
          {downloading ? null : <DownloadIcon aria-hidden="true" />}
        </Button>
        <Button size="icon-sm" variant="danger-ghost" onClick={() => onDelete(doc)} aria-label={`Delete ${doc.name}`}>
          <Trash2Icon aria-hidden="true" />
        </Button>
      </div>
    </article>);

}