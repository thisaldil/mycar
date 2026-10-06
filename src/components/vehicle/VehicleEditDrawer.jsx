import { useEffect, useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { CircleAlertIcon } from 'lucide-react';
import { useVehicles } from '../../context/VehicleContext';
import { vehicleApi } from '../../services/vehicleApi';
import { vehicleEditSchema } from '../../utils/vehicleSchema';
import { CAR_MAKES, CONDITION_LEVELS, CONDITION_SYSTEMS, FUEL_TYPES, TRANSMISSIONS } from '../../data/options';
import { Drawer } from '../common/Drawer';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { DatePicker } from '../common/DatePicker';
import { ImageUploader } from '../common/ImageUploader';
import { toast } from '../common/Toast';

function toFormValues(v) {
  return {
    make: v.make || '',
    model: v.model || '',
    variant: v.variant || '',
    year: v.year ?? '',
    registration: v.registration || '',
    vin: v.vin || '',
    color: v.color || '',
    fuelType: v.fuelType || '',
    transmission: v.transmission || '',
    mileage: v.mileage ?? '',
    serviceIntervalKm: v.serviceIntervalKm ?? 5000,
    serviceIntervalMonths: v.serviceIntervalMonths ?? '',
    lastServiceMileage: v.lastServiceMileage ?? '',
    lastServiceDate: v.lastServiceDate || '',
    condition: { ...Object.fromEntries(CONDITION_SYSTEMS.map((s) => [s.key, 'good'])), ...(v.condition || {}) },
    images: v.images?.length ? v.images : v.image ? [v.image] : []
  };
}

function Group({ title, children }) {
  return (
    <fieldset className="border-t border-line pt-5 first:border-t-0 first:pt-0">
      <legend className="mb-4 font-display text-[15px] font-semibold text-ink">{title}</legend>
      {children}
    </fieldset>);

}

export function VehicleEditDrawer({ open, onClose, vehicle, onSaved }) {
  const formId = useId();
  const { upsertVehicle } = useVehicles();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(vehicleEditSchema) });

  useEffect(() => {
    if (open && vehicle) {
      reset(toFormValues(vehicle));
      setServerError(null);
    }
  }, [open, vehicle, reset]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const updated = await vehicleApi.update(vehicle.id, {
        ...values,
        registration: (values.registration || '').toUpperCase(),
        vin: (values.vin || '').toUpperCase(),
        image: values.images[0] || null,
        mileageUpdatedAt: values.mileage !== vehicle.mileage ? new Date().toISOString().slice(0, 10) : vehicle.mileageUpdatedAt
      });
      upsertVehicle(updated);
      onSaved?.(updated);
      toast.success('Vehicle details saved');
      onClose();
    } catch (err) {
      setServerError(err.message);
    }
  });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      width="lg"
      title="Edit vehicle"
      subtitle={vehicle ? `${vehicle.year} ${vehicle.make} ${vehicle.model}` : ''}
      footer={
      <>
          <Button variant="secondary" className="flex-1 sm:flex-none" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" form={formId} className="flex-1 sm:ml-auto sm:flex-none" loading={isSubmitting}>
            Save changes
          </Button>
        </>
      }>
      
      <form id={formId} onSubmit={onSubmit} noValidate className="space-y-6">
        {serverError ?
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {serverError}
          </div> :
        null}
        <Group title="Basics">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Make" required list="edit-car-makes" error={errors.make?.message} {...register('make')} />
            <datalist id="edit-car-makes">
              {CAR_MAKES.map((m) =>
              <option key={m} value={m} />
              )}
            </datalist>
            <Input label="Model" required error={errors.model?.message} {...register('model')} />
            <Input label="Variant" error={errors.variant?.message} {...register('variant')} />
            <Input label="Year" required inputMode="numeric" error={errors.year?.message} {...register('year')} />
            <Select label="Fuel type" required options={FUEL_TYPES} placeholder="Select" error={errors.fuelType?.message} {...register('fuelType')} />
            <Select label="Transmission" required options={TRANSMISSIONS} placeholder="Select" error={errors.transmission?.message} {...register('transmission')} />
            <Input label="Mileage" required inputMode="numeric" suffix="km" error={errors.mileage?.message} {...register('mileage')} />
            <Input label="Registration" error={errors.registration?.message} {...register('registration')} />
            <Input label="VIN / chassis" error={errors.vin?.message} {...register('vin')} />
            <Input label="Colour" error={errors.color?.message} {...register('color')} />
          </div>
        </Group>
        <Group title="Service schedule">
          <div className="grid gap-4 sm:grid-cols-2">
            <Input label="Service every" required inputMode="numeric" suffix="km" error={errors.serviceIntervalKm?.message} {...register('serviceIntervalKm')} />
            <Input label="…or every" inputMode="numeric" suffix="months" error={errors.serviceIntervalMonths?.message} {...register('serviceIntervalMonths')} />
            <Input label="Last service at" inputMode="numeric" suffix="km" error={errors.lastServiceMileage?.message} {...register('lastServiceMileage')} />
            <DatePicker label="Last service date" error={errors.lastServiceDate?.message} {...register('lastServiceDate')} />
          </div>
        </Group>
        <Group title="Condition">
          <div className="grid gap-4 sm:grid-cols-2">
            {CONDITION_SYSTEMS.map((s) =>
            <Select key={s.key} label={s.label} options={CONDITION_LEVELS} {...register(`condition.${s.key}`)} />
            )}
          </div>
        </Group>
        <Group title="Photos">
          <Controller
            name="images"
            control={control}
            render={({ field }) => <ImageUploader value={field.value || []} onChange={field.onChange} max={8} altPrefix="Vehicle photo" coverLabel="Cover" />} />
          
        </Group>
      </form>
    </Drawer>);

}