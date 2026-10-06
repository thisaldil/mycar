import { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { BellIcon, CheckCircle2Icon, PlusIcon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { useResource } from '../../hooks/useResource';
import { reminderApi } from '../../services/reminderApi';
import { reminderState } from '../../utils/status';
import { RECORD_FORMS } from '../../utils/recordForms';
import { Button } from '../common/Button';
import { Tabs } from '../common/Tabs';
import { LoadingState } from '../common/LoadingState';
import { ErrorState } from '../common/ErrorState';
import { EmptyState } from '../common/EmptyState';
import { ConfirmDialog } from '../common/ConfirmDialog';
import { RecordFormModal } from '../common/RecordFormModal';
import { toast } from '../common/Toast';
import { ReminderCard } from './ReminderCard';

const config = RECORD_FORMS.reminders;
const soonest = (a, b) => (a.state.days ?? 99999) - (b.state.days ?? 99999) || (a.state.km ?? 999999) - (b.state.km ?? 999999);

const EMPTY = {
  upcoming: { icon: BellIcon, title: 'Nothing coming up', description: 'Add reminders for renewals, services and anything else you don’t want to forget.' },
  overdue: { icon: CheckCircle2Icon, title: 'Nothing overdue', description: 'You’re on top of everything. Nice.' },
  completed: { icon: CheckCircle2Icon, title: 'No completed reminders yet', description: 'Reminders you mark as done show up here.' }
};

export function RemindersPanel({ vehicle }) {
  const fmt = useFormat();
  const { items, loading, error, reload, create, update, remove, setItems } = useResource(reminderApi, { vehicleId: vehicle.id }, { label: 'Reminder' });
  const [tab, setTab] = useState('upcoming');
  const [form, setForm] = useState({ open: false, record: null });
  const [deleting, setDeleting] = useState(null);
  const [busyId, setBusyId] = useState(null);
  const [searchParams, setSearchParams] = useSearchParams();
  const initialTabSet = useRef(false);

  useEffect(() => {
    if (searchParams.get('new') === '1') {
      setForm({ open: true, record: null });
      const next = new URLSearchParams(searchParams);
      next.delete('new');
      setSearchParams(next, { replace: true });
    }
  }, [searchParams, setSearchParams]);

  const groups = useMemo(() => {
    const enriched = items.map((r) => ({ ...r, state: reminderState(r, vehicle.mileage) }));
    return {
      upcoming: enriched.filter((r) => r.state.status === 'upcoming' || r.state.status === 'due-soon').sort(soonest),
      overdue: enriched.filter((r) => r.state.status === 'overdue').sort(soonest),
      completed: enriched.filter((r) => r.state.status === 'completed').sort((a, b) => String(b.completedAt).localeCompare(String(a.completedAt)))
    };
  }, [items, vehicle.mileage]);

  // Land on "Overdue" the first time if anything is overdue.
  useEffect(() => {
    if (!initialTabSet.current && items.length) {
      initialTabSet.current = true;
      if (groups.overdue.length) setTab('overdue');
    }
  }, [items.length, groups.overdue.length]);

  const setCompleted = async (reminder, completed) => {
    setBusyId(reminder.id);
    try {
      const { reminder: saved, next } = await reminderApi.complete(reminder.id, completed);
      setItems((prev) => {
        let list = (prev || []).map((r) => r.id === saved.id ? saved : r);
        if (next) list = [...list, next];
        return list;
      });
      if (completed) {
        if (next) toast.success(`Done. Next one scheduled for ${fmt.date(next.dueDate)}.`);else
        toast.success('Marked as done', { action: { label: 'Undo', onClick: () => setCompleted(saved, false) } });
      } else {
        toast.success('Reminder reopened');
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setBusyId(null);
    }
  };

  if (loading && !items.length) return <LoadingState variant="list" label="Loading reminders" />;
  if (error && !items.length) return <ErrorState error={error} onRetry={reload} />;

  const dueSoonCount = groups.upcoming.filter((r) => r.state.status === 'due-soon').length;
  const list = groups[tab];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <p className="text-sm text-ink-soft">
          {groups.overdue.length ? <span className="font-medium text-danger">{groups.overdue.length} overdue</span> : 'Nothing overdue'}
          {' · '}
          {dueSoonCount ? <span className="font-medium text-warning">{dueSoonCount} due soon</span> : 'nothing due in the next two weeks'}
        </p>
        <Button leftIcon={PlusIcon} onClick={() => setForm({ open: true, record: null })} className="hidden sm:inline-flex">
          Add reminder
        </Button>
      </div>

      <Tabs
        ariaLabel="Reminder status"
        value={tab}
        onChange={setTab}
        tabs={[
        { id: 'upcoming', label: 'Upcoming', count: groups.upcoming.length },
        { id: 'overdue', label: 'Overdue', count: groups.overdue.length },
        { id: 'completed', label: 'Completed', count: groups.completed.length }]
        } />
      

      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {list.length ?
        <ul className="space-y-3">
            {list.map((r) =>
          <ReminderCard
            key={r.id}
            reminder={r}
            busy={busyId === r.id}
            onComplete={() => setCompleted(r, true)}
            onReopen={() => setCompleted(r, false)}
            onEdit={() => setForm({ open: true, record: r })}
            onDelete={() => setDeleting(r)} />

          )}
          </ul> :

        <EmptyState
          compact
          icon={EMPTY[tab].icon}
          title={EMPTY[tab].title}
          description={EMPTY[tab].description}
          action={
          tab === 'upcoming' ?
          <Button leftIcon={PlusIcon} onClick={() => setForm({ open: true, record: null })}>
                  Add reminder
                </Button> :
          null
          } />

        }
      </div>

      <button
        type="button"
        onClick={() => setForm({ open: true, record: null })}
        className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] right-4 z-30 flex h-14 w-14 items-center justify-center rounded-full bg-brand text-brand-on shadow-pop transition-transform duration-150 ease-out active:scale-95 sm:hidden"
        aria-label="Add reminder">
        
        <PlusIcon className="h-6 w-6" aria-hidden="true" />
      </button>

      <RecordFormModal
        open={form.open}
        onClose={() => setForm((f) => ({ ...f, open: false }))}
        config={config}
        title={form.record ? 'Edit reminder' : 'Add reminder'}
        initialValues={form.record ? { ...config.defaults(), ...form.record, dueMileage: form.record.dueMileage ?? '' } : config.defaults()}
        onSubmit={async (values) => {
          const payload = { ...values, vehicleId: vehicle.id, dueDate: values.dueDate || '', dueMileage: values.dueMileage ?? null, notes: values.notes || '' };
          delete payload.state;
          if (form.record) await update(form.record.id, payload);else
          await create({ ...payload, completed: false });
        }} />
      
      <ConfirmDialog
        open={!!deleting}
        onClose={() => setDeleting(null)}
        title="Delete this reminder?"
        message={deleting ? `“${deleting.title}” will be removed.` : ''}
        onConfirm={() => remove(deleting.id)} />
      
    </div>);

}