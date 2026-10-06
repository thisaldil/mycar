import { useEffect, useState } from 'react';
import { DownloadIcon, FileQuestionIcon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { documentApi } from '../../services/documentApi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';

/** Fetches the file as an authorised Blob and shows it via a short-lived object URL. */
export function DocumentPreviewModal({ doc, onClose, onDownload }) {
  const fmt = useFormat();
  const [state, setState] = useState({ loading: false, url: null, type: null, error: null });
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!doc) return undefined;
    let active = true;
    let objectUrl = null;
    setState({ loading: true, url: null, type: null, error: null });
    documentApi.
    getFile(doc.id).
    then((blob) => {
      objectUrl = URL.createObjectURL(blob);
      if (active) setState({ loading: false, url: objectUrl, type: blob.type, error: null });
    }).
    catch((error) => active && setState({ loading: false, url: null, type: null, error }));
    return () => {
      active = false;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [doc?.id, attempt]); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <Modal
      open={!!doc}
      onClose={onClose}
      size="lg"
      title={doc?.name || 'Document'}
      description={doc ? `${doc.category} · uploaded ${fmt.date(doc.uploadDate)}` : undefined}
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
          <Button leftIcon={DownloadIcon} onClick={() => onDownload(doc)}>
            Download
          </Button>
        </>
      }>
      
      {state.loading ?
      <LoadingState label="Loading preview…" /> :
      state.error ?
      <ErrorState title="Couldn't load this file" error={state.error} onRetry={() => setAttempt((a) => a + 1)} /> :
      state.url && state.type?.startsWith('image/') ?
      <img src={state.url} alt={doc?.name} className="mx-auto max-h-[65vh] rounded-xl border border-line bg-subtle object-contain" /> :
      state.url && state.type === 'application/pdf' ?
      <iframe title={doc?.name} src={state.url} className="h-[65vh] w-full rounded-xl border border-line" /> :
      state.url ?
      <div className="flex flex-col items-center gap-3 py-12 text-center">
          <FileQuestionIcon className="h-8 w-8 text-ink-muted" aria-hidden="true" />
          <p className="text-sm text-ink-soft">Preview isn't available for this file type. Download it to open.</p>
        </div> :
      null}
    </Modal>);

}