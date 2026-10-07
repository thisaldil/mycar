import { FileIcon, XIcon } from 'lucide-react';
import { DOCUMENT_CATEGORIES } from '../../../data/options';
import { formatFileSize } from '../../../utils/format';
import { FileUploader } from '../../common/FileUploader';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { DatePicker } from '../../common/DatePicker';
import { StepHeading } from './StepHeading';

function guessCategory(name = '') {
  const n = name.toLowerCase();
  if (/insur|policy/.test(n)) return 'Insurance';
  if (/regist|\bcr\b|licen|revenue/.test(n)) return 'Registration';
  if (/invoice|sale|purchase|agreement|receipt/.test(n)) return 'Purchase';
  if (/service|maint/.test(n)) return 'Service';
  if (/emission|inspect|roadworth/.test(n)) return 'Inspection';
  if (/warrant/.test(n)) return 'Warranty';
  if (/loan|lease|financ/.test(n)) return 'Finance';
  return 'Other';
}

export function StepDocuments({ form }) {
  const { watch, setValue } = form;
  const docs = watch('documents') || [];

  const update = (id, patch) =>
  setValue(
    'documents',
    docs.map((d) => d.id === id ? { ...d, ...patch } : d),
    { shouldDirty: true }
  );

  const onFiles = (list) =>
  setValue(
    'documents',
    list.map((f) => ({ ...f, category: f.category || guessCategory(f.name), label: f.label ?? f.name.replace(/\.[^.]+$/, ''), expiryDate: f.expiryDate || '' })),
    { shouldDirty: true }
  );

  return (
    <div>
      <StepHeading title="Documents" description="Optional. Upload your registration, insurance certificate or purchase papers. Add an expiry date and we'll remind you before it lapses." />
      <FileUploader value={docs} onChange={onFiles} accept="image/*,application/pdf" maxFiles={10} showList={false} hint="PDF or images, up to 5 MB each" />
      {docs.length ?
      <ul className="mt-5 space-y-3">
          {docs.map((d) =>
        <li key={d.id} className="rounded-2xl border border-line p-4">
              <div className="mb-3 flex items-center gap-3">
                <FileIcon className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
                <span className="min-w-0 flex-1 truncate text-sm text-ink-soft">
                  {d.name} · {formatFileSize(d.size)}
                </span>
                <button
              type="button"
              onClick={() =>
              setValue(
                'documents',
                docs.filter((x) => x.id !== d.id),
                { shouldDirty: true }
              )
              }
              className="flex h-8 w-8 items-center justify-center rounded-lg text-ink-muted transition-colors duration-150 hover:bg-subtle hover:text-danger"
              aria-label={`Remove ${d.name}`}>
              
                  <XIcon className="h-4 w-4" aria-hidden="true" />
                </button>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Input label="Name" value={d.label} onChange={(e) => update(d.id, { label: e.target.value })} />
                <Select label="Category" options={DOCUMENT_CATEGORIES} value={d.category} onChange={(e) => update(d.id, { category: e.target.value })} />
                <DatePicker label="Expiry (optional)" value={d.expiryDate} onChange={(e) => update(d.id, { expiryDate: e.target.value })} />
              </div>
            </li>
        )}
        </ul> :
      null}
    </div>);

}