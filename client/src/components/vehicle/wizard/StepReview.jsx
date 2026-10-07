import { PencilIcon } from 'lucide-react';
import { useFormat } from '../../../hooks/useFormat';
import { CONDITION_LEVELS, CONDITION_SYSTEMS } from '../../../data/options';
import { healthFromCondition } from '../../../utils/status';
import { safeUrl } from '../../../utils/sanitize';
import { Button } from '../../common/Button';
import { Checkbox } from '../../common/Checkbox';
import { StatusBadge } from '../../common/StatusBadge';
import { StepHeading } from './StepHeading';

const has = (v) => v !== '' && v !== undefined && v !== null;

function Section({ title, onEdit, children }) {
  return (
    <section className="border-t border-line py-5 first:border-t-0 first:pt-0">
      <div className="mb-3 flex items-center justify-between">
        <h3 className="font-sans text-[15px] font-semibold text-ink">{title}</h3>
        <Button variant="ghost" size="sm" leftIcon={PencilIcon} onClick={onEdit} aria-label={`Edit ${title.toLowerCase()}`}>
          Edit
        </Button>
      </div>
      {children}
    </section>);

}

function Facts({ rows }) {
  const visible = rows.filter(([, v]) => has(v));
  if (!visible.length) return <p className="text-sm text-ink-muted">Skipped — you can add this later.</p>;
  return (
    <dl className="grid grid-cols-2 gap-x-4 gap-y-3 sm:grid-cols-3">
      {visible.map(([label, value]) =>
      <div key={label} className="min-w-0">
          <dt className="text-[13px] text-ink-muted">{label}</dt>
          <dd className="truncate text-sm font-medium text-ink">{value}</dd>
        </div>
      )}
    </dl>);

}

export function StepReview({ form, goTo }) {
  const fmt = useFormat();
  const v = form.watch();
  const p = v.purchase || {};
  const t = v.technical || {};
  const health = healthFromCondition(v.condition);
  const n = (x) => has(x) ? Number(String(x).replace(/,/g, '')) : null;

  return (
    <div>
      <StepHeading title="Review and save" description="Check everything looks right. You can change any of this later." />
      <Section title="Vehicle" onEdit={() => goTo(1)}>
        <Facts
          rows={[
          ['Type', v.type === 'new' ? 'New' : 'Used'],
          ['Make & model', `${v.make} ${v.model}`],
          ['Variant', v.variant],
          ['Year', v.year],
          ['Registration', v.registration?.toUpperCase()],
          ['VIN', v.vin?.toUpperCase()],
          ['Fuel', v.fuelType],
          ['Transmission', v.transmission],
          ['Mileage', has(v.mileage) ? fmt.distance(n(v.mileage)) : null],
          ['Colour', v.color]]
          } />
        
      </Section>
      <Section title="Purchase" onEdit={() => goTo(2)}>
        <Facts
          rows={[
          ['Date', has(p.date) ? fmt.date(p.date) : null],
          ['Price', has(p.price) ? fmt.money(n(p.price)) : null],
          ['Dealer', p.dealer],
          ['Seller', p.seller],
          ['Warranty', p.warranty],
          ['Financing', p.financing && p.financing !== 'None' ? `${p.financing}${p.financeProvider ? ` · ${p.financeProvider}` : ''}` : null],
          ['Previous owners', p.previousOwners],
          ['Mileage at purchase', has(p.mileageAtPurchase) ? fmt.distance(n(p.mileageAtPurchase)) : null],
          ['Accident history', p.accidentHistory],
          ['Condition', p.condition]]
          } />
        
      </Section>
      <Section title="Technical details" onEdit={() => goTo(3)}>
        <Facts
          rows={[
          ['Engine', t.engineType],
          ['Capacity', has(t.capacity) ? `${t.capacity} cc` : null],
          ['Cylinders', t.cylinders],
          ['Power', t.power],
          ['Torque', t.torque],
          ['Drive', t.driveType],
          ['Body', t.bodyType],
          ['Seats', t.seats],
          ['Doors', t.doors]]
          } />
        
      </Section>
      <Section title="Condition" onEdit={() => goTo(4)}>
        <div className="mb-3 flex items-center gap-2 text-sm text-ink-soft">
          Health score <span className="font-semibold text-ink tnum">{health.score} / 100</span>
          <StatusBadge status={health.status} size="sm" />
        </div>
        <p className="text-sm text-ink-soft">
          {CONDITION_SYSTEMS.map((s) => `${s.label}: ${CONDITION_LEVELS.find((l) => l.value === v.condition?.[s.key])?.label || '—'}`).join(' · ')}
        </p>
      </Section>
      <Section title="Documents" onEdit={() => goTo(5)}>
        {v.documents?.length ?
        <ul className="space-y-1 text-sm text-ink">
            {v.documents.map((d) =>
          <li key={d.id} className="truncate">
                {d.label || d.name} <span className="text-ink-muted">· {d.category}</span>
              </li>
          )}
          </ul> :

        <p className="text-sm text-ink-muted">No documents yet.</p>
        }
      </Section>
      <Section title="Photos" onEdit={() => goTo(6)}>
        {v.images?.length ?
        <div className="flex gap-2 overflow-x-auto">
            {v.images.map((src, i) =>
          <img key={i} src={safeUrl(src)} alt={`Vehicle photo ${i + 1}`} className="h-16 w-24 shrink-0 rounded-lg border border-line object-cover" />
          )}
          </div> :

        <p className="text-sm text-ink-muted">No photos yet.</p>
        }
      </Section>
      <div className="mt-2 rounded-xl bg-subtle px-4 py-2">
        <Checkbox label="Make this my active vehicle" description="The dashboard and records will show this car." {...form.register('makeActive')} />
      </div>
    </div>);

}