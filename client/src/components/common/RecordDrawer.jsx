import { DownloadIcon, FileIcon, InfoIcon, PencilIcon, Trash2Icon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { cleanText, safeUrl } from '../../utils/sanitize';
import { dataUrlToBlob, saveBlob } from '../../utils/files';
import { formatFileSize } from '../../utils/format';
import { Drawer } from './Drawer';
import { Button } from './Button';
import { SensitiveValue } from './SensitiveValue';

function displayValue(field, value, fmt) {
  if (value === null || value === undefined || value === '') return null;
  switch (field.type) {
    case 'currency':
      return fmt.money(value, { decimals: field.decimals });
    case 'number':
      if (field.suffix === 'km') return fmt.distance(value);
      return `${fmt.number(value, field.decimals && !Number.isInteger(Number(value)) ? field.decimals : 0)}${field.suffix ? ` ${field.suffix}` : ''}`;
    case 'date':
      return fmt.date(value, 'long');
    case 'checkbox':
      return value ? 'Yes' : 'No';
    case 'select':{
        const option = (field.options || []).find((o) => typeof o === 'object' && o.value === value);
        return option ? option.label : String(value);
      }
    default:
      return cleanText(value);
  }
}

/** Detail view for a single record — the "reveal more" layer behind list rows. */
export function RecordDrawer({ open, onClose, record, config, title, subtitle, onEdit, onDelete, readOnlyReason, extra }) {
  const fmt = useFormat();
  const fields = record ? config.fields.filter((f) => !f.showIf || f.showIf(record)) : [];
  const facts = fields.
  filter((f) => !['files', 'images', 'textarea'].includes(f.type)).
  map((f) => ({ field: f, value: displayValue(f, record?.[f.name], fmt) })).
  filter((r) => r.value !== null);
  const texts = fields.filter((f) => f.type === 'textarea' && record?.[f.name]);
  const fileFields = fields.filter((f) => f.type === 'files' && record?.[f.name]?.length);
  const imageFields = fields.filter((f) => f.type === 'images' && record?.[f.name]?.length);

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={title}
      subtitle={subtitle}
      footer={
      onEdit || onDelete ?
      <>
            {onEdit ?
        <Button variant="secondary" className="flex-1" leftIcon={PencilIcon} onClick={onEdit}>
                Edit
              </Button> :
        null}
            {onDelete ?
        <Button variant="danger-ghost" leftIcon={Trash2Icon} onClick={onDelete}>
                Delete
              </Button> :
        null}
          </> :
      null
      }>
      
      {record ?
      <div className="space-y-6">
          {readOnlyReason ?
        <p className="flex items-start gap-2 rounded-xl bg-brand-soft p-3 text-sm text-brand">
              <InfoIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {readOnlyReason}
            </p> :
        null}
          {extra}
          <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
            {facts.map(({ field, value }) =>
          <div key={field.name} className="min-w-0">
                <dt className="text-[13px] text-ink-muted">{field.label}</dt>
                <dd className="mt-0.5 break-words text-[15px] font-medium text-ink">
                  {field.sensitive ? <SensitiveValue value={value} /> : value}
                </dd>
              </div>
          )}
          </dl>
          {texts.map((f) =>
        <div key={f.name}>
              <h3 className="font-sans text-[13px] font-medium text-ink-muted">{f.label}</h3>
              <p className="mt-1 whitespace-pre-line text-[15px] text-ink">{cleanText(record[f.name])}</p>
            </div>
        )}
          {fileFields.map((f) =>
        <div key={f.name}>
              <h3 className="font-sans text-[13px] font-medium text-ink-muted">{f.label}</h3>
              <ul className="mt-2 space-y-2">
                {record[f.name].map((file) =>
            <li key={file.id || file.name} className="flex items-center gap-3 rounded-xl border border-line px-3 py-2">
                    <FileIcon className="h-5 w-5 shrink-0 text-ink-muted" aria-hidden="true" />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium text-ink">{file.name}</span>
                      <span className="block text-xs text-ink-muted">{formatFileSize(file.size)}</span>
                    </span>
                    <Button
                variant="ghost"
                size="sm"
                leftIcon={DownloadIcon}
                disabled={!file.dataUrl}
                onClick={() => saveBlob(dataUrlToBlob(file.dataUrl), file.name)}>
                
                      Download
                    </Button>
                  </li>
            )}
              </ul>
            </div>
        )}
          {imageFields.map((f) =>
        <div key={f.name}>
              <h3 className="font-sans text-[13px] font-medium text-ink-muted">{f.label}</h3>
              <div className="mt-2 grid grid-cols-2 gap-2">
                {record[f.name].map((src, i) =>
            <img key={i} src={safeUrl(src)} alt={`${f.label} ${i + 1}`} className="aspect-[4/3] w-full rounded-xl border border-line object-cover" />
            )}
              </div>
            </div>
        )}
        </div> :
      null}
    </Drawer>);

}