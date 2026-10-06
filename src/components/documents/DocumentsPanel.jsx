import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FileTextIcon, TriangleAlertIcon, UploadIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { useResource } from '../../hooks/useResource';
import { documentApi } from '../../services/documentApi';
import { expiryStatus } from '../../utils/status';
import { saveBlob } from '../../utils/files';
import { DOCUMENT_CATEGORIES } from '../../data/options';
import { Button } from '../common/Button';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { toast } from '../common/Toast';
import { DocumentCard } from './DocumentCard';
import { DocumentUploadModal } from './DocumentUploadModal';
import { DocumentPreviewModal } from './DocumentPreviewModal';

export function DocumentsPanel({ vehicle }) {
  const { items, loading, error, reload, remove, setItems } = useResource(documentApi, { vehicleId: vehicle.id }, { label: 'Document' });
  const [category, setCategory] = useState('All');
  const [uploadOpen, setUploadOpen] = useState(false);
  const [preview, setPreview] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [downloadingId, setDownloadingId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setUploadOpen(true);
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const counts = useMemo(() => items.reduce((acc, d) => ({ ...acc, [d.category]: (acc[d.category] || 0) + 1 }), {}), [items]);
  const attention = items.filter((d) => d.expiryDate && ['expiring', 'expired'].includes(expiryStatus(d.expiryDate, 30)));
  const list = [...items].
  filter((d) => category === 'All' || d.category === category).
  sort((a, b) => String(b.uploadDate).localeCompare(String(a.uploadDate)));

  const download = async (doc) => {
    setDownloadingId(doc.id);
    try {
      const blob = await documentApi.getFile(doc.id);
      saveBlob(blob, doc.fileName || doc.name);
    } catch (err) {
      toast.error(err.message || 'Download failed');
    } finally {
      setDownloadingId(null);
    }
  };

  if (loading && !items.length) return <LoadingState variant="cards" label="Loading documents" rows={3} />;
  if (error && !items.length) return <ErrorState error={error} onRetry={reload} />;

  const chips = ['All', ...DOCUMENT_CATEGORIES.filter((c) => counts[c])];

  return (
    <div className="space-y-5">
      {attention.length ?
      <div role="status" className="flex items-start gap-3 rounded-2xl border border-warning/30 bg-warning-soft px-4 py-3 text-sm">
          <TriangleAlertIcon className="mt-0.5 h-4 w-4 shrink-0 text-warning" aria-hidden="true" />
          <p className="text-ink">
            <span className="font-medium">
              {attention.length} document{attention.length === 1 ? '' : 's'} need{attention.length === 1 ? 's' : ''} attention:
            </span>{' '}
            {attention.map((d) => d.name).join(', ')}
          </p>
        </div> :
      null}

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 sm:mx-0 sm:px-0" role="group" aria-label="Filter by category">
          {chips.map((c) =>
          <button
            key={c}
            type="button"
            aria-pressed={category === c}
            onClick={() => setCategory(c)}
            className={cn(
              'h-9 shrink-0 whitespace-nowrap rounded-full px-3.5 text-sm font-medium transition-colors duration-150',
              category === c ? 'bg-ink text-canvas' : 'bg-surface text-ink-soft ring-1 ring-inset ring-line hover:text-ink'
            )}>
            
              {c}
              <span className="ml-1.5 opacity-70 tnum">{c === 'All' ? items.length : counts[c]}</span>
            </button>
          )}
        </div>
        <Button leftIcon={UploadIcon} onClick={() => setUploadOpen(true)} className="hidden sm:inline-flex">
          Upload document
        </Button>
      </div>

      {list.length ?
      <ul className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {list.map((doc) =>
        <li key={doc.id}>
              <DocumentCard doc={doc} onPreview={setPreview} onDownload={download} onDelete={setDeleting} downloading={downloadingId === doc.id} />
            </li>
        )}
        </ul> :

      <EmptyState
        icon={FileTextIcon}
        title="No documents yet"
        description="Keep your registration, insurance certificate and receipts in one safe place — and get reminded before anything expires."
        action={
        <Button leftIcon={UploadIcon} onClick={() => setUploadOpen(true)}>
              Upload document
            </Button>
        } />

      }

      <button
        type="button"
        onClick={() => setUploadOpen(true)}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-on shadow-pop transition-transform duration-150 ease-out active:scale-95 sm:hidden"
        aria-label="Upload document">
        
        <UploadIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      <DocumentUploadModal
        open={uploadOpen}
        onClose={() => setUploadOpen(false)}
        vehicleId={vehicle.id}
        defaultCategory={category !== 'All' ? category : undefined}
        onUploaded={(doc) => setItems((prev) => [doc, ...(prev || [])])} />
      
      <DocumentPreviewModal doc={preview} onClose={() => setPreview(null)} onDownload={download} />
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this document?"
        message={deleting ? `“${deleting.name}” will be permanently removed.` : ''}
        onConfirm={() => remove(deleting.id)} />
      
    </div>);

}