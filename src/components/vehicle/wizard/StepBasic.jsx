import { CAR_MAKES, FUEL_TYPES, TRANSMISSIONS } from '../../../data/options';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { StepHeading } from './StepHeading';

export function StepBasic({ form }) {
  const { register, formState } = form;
  const e = formState.errors;
  return (
    <div>
      <StepHeading title="The basics" description="These identify your car and power reminders. Make, model, year, fuel, transmission and mileage are required." />
      <div className="grid gap-4 sm:grid-cols-2">
        <Input label="Make" required list="car-makes" autoComplete="off" placeholder="e.g. Toyota" error={e.make?.message} {...register('make')} />
        <datalist id="car-makes">
          {CAR_MAKES.map((m) =>
          <option key={m} value={m} />
          )}
        </datalist>
        <Input label="Model" required placeholder="e.g. Aqua" error={e.model?.message} {...register('model')} />
        <Input label="Variant" placeholder="e.g. S Style Black" error={e.variant?.message} {...register('variant')} />
        <Input label="Year" required inputMode="numeric" placeholder="e.g. 2018" error={e.year?.message} {...register('year')} />
        <Select label="Fuel type" required options={FUEL_TYPES} placeholder="Select fuel type" error={e.fuelType?.message} {...register('fuelType')} />
        <Select label="Transmission" required options={TRANSMISSIONS} placeholder="Select transmission" error={e.transmission?.message} {...register('transmission')} />
        <Input label="Current mileage" required inputMode="numeric" suffix="km" placeholder="e.g. 85200" error={e.mileage?.message} {...register('mileage')} />
        <Input label="Registration number" placeholder="e.g. CBH-7821" autoCapitalize="characters" error={e.registration?.message} {...register('registration')} />
        <Input
          label="VIN / chassis number"
          autoCapitalize="characters"
          hint="Found on your registration certificate or windscreen."
          error={e.vin?.message}
          {...register('vin')} />
        
        <Input label="Colour" placeholder="e.g. Silver metallic" error={e.color?.message} {...register('color')} />
      </div>
    </div>);

}