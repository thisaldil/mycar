import { useCallback, useEffect, useId, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ChevronRightIcon, PlusIcon } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';
import { useResource } from '../../hooks/useResource';
import { RECORD_FORMS } from '../../utils/recordForms';
import { serializeFiles } from '../../utils/files';
import { Button } from './Button';
import { Card } from './Card';
import { Table } from './Table';
import { Pagination } from './Pagination';
import { EmptyState } from './EmptyState';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { ConfirmDialog } from './ConfirmDialog';
import { RecordFormModal } from './RecordFormModal';
import { RecordDrawer } from './RecordDrawer';

function normalize(config, values) {
  const out = { ...values };
  config.fields.forEach((f) => {
    if (f.type === 'files') out[f.name] = serializeFiles(values[f.name] || []);else
    if (out[f.name] === undefined) out[f.name] = f.type === 'checkbox' ? false : f.type === 'images' ? [] : null;
  });
  return out;
}

/**
 * The shared record experience used by every module (maintenance, fuel, tyres…):
 * summary → list (table on desktop, cards on mobile) → detail drawer → edit/delete.
 */
export function RecordsView({
  vehicle,
  api,
  formKey,
  listTitle = 'History',
  addLabel = 'Add record',
  columns,
  getTitle,
  getSubtitle,
  getValue,
  cardIcon: CardIcon,
  renderItems,
  summary,
  empty = {},
  sort,
  filter,
  toolbar,
  pageSize = 10,
  canEdit,
  readOnlyReason,
  drawerExtra,
  onMutated
}) {
  const config = RECORD_FORMS[formKey];
  const headingId = useId();
  const { reload: reloadVehicles } = useVehicles();
  const { items, loading, error, reload, create, update, remove } = useResource(api, { vehicleId: vehicle.id }, {
    label: config.label,
    onChange: () => {
      reloadVehicles();
      onMutated?.();
    }
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [formState, setFormState] = useState({ open: false, record: null, preset: null });
  const [viewingId, setViewingId] = useState(null);
  const [deleting, setDeleting] = useState(null);
  const [page, setPage] = useState(1);

  const openCreate = useCallback((preset = null) => setFormState({ open: true, record: null, preset }), []);
  const openEdit = useCallback((record) => setFormState({ open: true, record, preset: null }), []);

  // Deep links such as /fuel?new=1 open the add form straight away.
  useEffect(() => {
    if (searchParams.get('new') === '1') {
      openCreate();
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams, openCreate]);

  const list = useMemo(() => {
    let l = filter ? items.filter(filter) : items;
    if (sort) l = [...l].sort(sort);
    return l;
  }, [items, filter, sort]);

  const pageCount = Math.max(1, Math.ceil(list.length / pageSize));
  const safePage = Math.min(page, pageCount);
  const paged = list.slice((safePage - 1) * pageSize, safePage * pageSize);
  const viewing = items.find((r) => r.id === viewingId) || null;
  const editable = (r) => r ? canEdit ? canEdit(r) : true : false;

  const helpers = { open: (r) => setViewingId(r.id), edit: openEdit, create: openCreate, askDelete: setDeleting, items, list };

  const initialValues = formState.record ?
  { ...config.defaults?.(vehicle), ...formState.record } :
  { ...config.defaults?.(vehicle), ...(formState.preset || {}) };

  const handleSubmit = async (values) => {
    const payload = { ...normalize(config, values), vehicleId: vehicle.id };
    if (formState.record) await update(formState.record.id, payload);else
    await create(payload);
  };

  if (loading && !items.length) return <LoadingState variant="list" label={`Loading ${listTitle.toLowerCase()}`} />;
  if (error && !items.length) return <ErrorState error={error} onRetry={reload} />;

  return (
    <div className="space-y-6">
      {items.length && summary ? summary(items, helpers) : null}

      <section aria-labelledby={headingId}>
        <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
          <h2 id={headingId} className="text-base font-semibold text-ink">
            {listTitle}
            <span className="ml-2 text-sm font-normal text-ink-muted tnum">{list.length}</span>
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {toolbar}
            <Button leftIcon={PlusIcon} onClick={() => openCreate()} className="hidden sm:inline-flex">
              {addLabel}
            </Button>
          </div>
        </div>

        {list.length === 0 ?
        <EmptyState
          icon={empty.icon}
          title={items.length ? 'Nothing matches this filter' : empty.title || 'No records yet'}
          description={items.length ? 'Try a different filter.' : empty.description}
          action={
          items.length ? null :
          <Button leftIcon={PlusIcon} onClick={() => openCreate()}>
                  {addLabel}
                </Button>

          } /> :

        renderItems ?
        renderItems(paged, helpers) :

        <>
            <Card padded={false} className="hidden overflow-hidden md:block">
              <Table columns={columns} rows={paged} onRowClick={helpers.open} caption={listTitle} />
            </Card>
            <ul className="space-y-2 md:hidden">
              {paged.map((r) =>
            <li key={r.id}>
                  <button
                type="button"
                onClick={() => helpers.open(r)}
                className="flex w-full items-center gap-3 rounded-2xl border border-line bg-surface p-4 text-left shadow-card transition-colors duration-150 hover:bg-subtle">
                
                    {CardIcon ?
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-subtle text-ink-soft">
                        <CardIcon className="h-5 w-5" aria-hidden="true" />
                      </span> :
                null}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[15px] font-medium text-ink">{getTitle(r)}</span>
                      {getSubtitle ? <span className="block truncate text-[13px] text-ink-muted">{getSubtitle(r)}</span> : null}
                    </span>
                    {getValue ? <span className="shrink-0 text-[15px] font-semibold text-ink tnum">{getValue(r)}</span> : null}
                    <ChevronRightIcon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                  </button>
                </li>
            )}
            </ul>
          </>
        }
        <Pagination page={safePage} pageSize={pageSize} total={list.length} onChange={setPage} />
      </section>

      <button
        type="button"
        onClick={() => openCreate()}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-on shadow-pop transition-transform duration-150 ease-out active:scale-95 sm:hidden"
        aria-label={addLabel}>
        
        <PlusIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      <RecordFormModal
        open={formState.open}
        onClose={() => setFormState((s) => ({ ...s, open: false }))}
        config={config}
        title={formState.record ? `Edit ${config.label.toLowerCase()}` : addLabel}
        initialValues={initialValues}
        onSubmit={handleSubmit} />
      

      <RecordDrawer
        open={!!viewing}
        record={viewing}
        onClose={() => setViewingId(null)}
        config={config}
        title={viewing ? getTitle(viewing) : ''}
        subtitle={viewing && getSubtitle ? getSubtitle(viewing) : ''}
        onEdit={editable(viewing) ? () => openEdit(viewing) : null}
        onDelete={editable(viewing) ? () => setDeleting(viewing) : null}
        readOnlyReason={viewing && !editable(viewing) ? readOnlyReason?.(viewing) : null}
        extra={viewing && drawerExtra ? drawerExtra(viewing) : null} />
      

      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title={`Delete this ${config.label.toLowerCase()}?`}
        message="This permanently removes the record and any linked expense. This can't be undone."
        onConfirm={async () => {
          const id = deleting.id;
          await remove(id);
          if (viewingId === id) setViewingId(null);
        }} />
      
    </div>);

}