import { useEffect, useId, useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleAlertIcon, GaugeIcon, RouteIcon } from 'lucide-react';
import { useFormat } from '../../hooks/useFormat';
import { vehicleApi } from '../../services/vehicleApi';
import { tripApi } from '../../services/tripApi';
import { formatNumber, todayISO } from '../../utils/format';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { DatePicker } from '../common/DatePicker';
import { SegmentedControl } from '../common/SegmentedControl';
import { toast } from '../common/Toast';

const toNum = (v) => v === '' || v == null ? null : Number(String(v).replace(/,/g, ''));

/** Two ways to keep mileage current: type the odometer, or log a trip distance. */
export function UpdateMileageModal({ open, onClose, vehicle, onUpdated }) {
  const fmt = useFormat();
  const formId = useId();
  const [mode, setMode] = useState('reading');
  const [serverError, setServerError] = useState(null);
  const ctxRef = useRef({ mode, min: vehicle?.mileage || 0 });
  ctxRef.current = { mode, min: vehicle?.mileage || 0 };

  const [schema] = useState(() =>
  z.
  object({ mileage: z.any(), distance: z.any(), purpose: z.string().max(80).optional(), date: z.string().optional() }).
  superRefine((v, ctx) => {
    const { mode: m, min } = ctxRef.current;
    if (m === 'reading') {
      const n = toNum(v.mileage);
      if (n == null || Number.isNaN(n)) ctx.addIssue({ code: 'custom', path: ['mileage'], message: 'Enter the reading on your odometer' });else
      if (n < min) ctx.addIssue({ code: 'custom', path: ['mileage'], message: `Must be at least ${formatNumber(min)} km` });
    } else {
      const d = toNum(v.distance);
      if (d == null || Number.isNaN(d) || d <= 0 || d > 3000) ctx.addIssue({ code: 'custom', path: ['distance'], message: 'Enter a distance between 1 and 3,000 km' });
      if (!v.date) ctx.addIssue({ code: 'custom', path: ['date'], message: 'Date is required' });
    }
  })
  );

  const {
    register,
    handleSubmit,
    reset,
    watch,
    clearErrors,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({ mileage: '', distance: '', purpose: '', date: todayISO() });
      setServerError(null);
    }
  }, [open, reset]);

  useEffect(() => {
    clearErrors();
    setServerError(null);
  }, [mode, clearErrors]);

  const distance = toNum(watch('distance')) || 0;

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      if (mode === 'reading') {
        const mileage = toNum(values.mileage);
        await vehicleApi.updateMileage(vehicle.id, mileage);
        toast.success(`Odometer updated to ${fmt.distance(mileage)}`);
      } else {
        const d = toNum(values.distance);
        await tripApi.create({ vehicleId: vehicle.id, date: values.date, distance: d, purpose: values.purpose?.trim() || 'Trip' });
        toast.success(`${fmt.distance(d)} trip logged`);
      }
      onUpdated?.();
      onClose();
    } catch (err) {
      setServerError(err.message);
    }
  });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Update mileage"
      description={vehicle ? `Currently ${fmt.distance(vehicle.mileage)}` : undefined}
      size="sm"
      footer={
      <>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            {mode === 'reading' ? 'Update odometer' : 'Log trip'}
          </Button>
        </>
      }>
      
      <SegmentedControl
        fullWidth
        ariaLabel="How do you want to update mileage?"
        value={mode}
        onChange={setMode}
        options={[
        { value: 'reading', label: 'Odometer', icon: GaugeIcon },
        { value: 'trip', label: 'Add a trip', icon: RouteIcon }]
        } />
      
      <form id={formId} onSubmit={onSubmit} noValidate className="mt-5 space-y-4">
        {serverError ?
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {serverError}
          </div> :
        null}
        {mode === 'reading' ?
        <Input label="New odometer reading" inputMode="numeric" suffix="km" required error={errors.mileage?.message} {...register('mileage')} /> :

        <>
            <Input
            label="Distance driven"
            inputMode="decimal"
            suffix="km"
            required
            error={errors.distance?.message}
            hint={distance > 0 ? `New odometer: ${fmt.distance((vehicle?.mileage || 0) + distance)}` : undefined}
            {...register('distance')} />
          
            <Input label="Purpose" placeholder="e.g. Commute" error={errors.purpose?.message} {...register('purpose')} />
            <DatePicker label="Date" required max={todayISO()} error={errors.date?.message} {...register('date')} />
          </>
        }
      </form>
    </Modal>);

}