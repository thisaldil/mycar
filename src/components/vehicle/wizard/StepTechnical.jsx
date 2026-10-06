import { ASPIRATION_TYPES, BODY_TYPES, DRIVE_TYPES } from '../../../data/options';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { StepHeading } from './StepHeading';

export function StepTechnical({ form }) {
  const { register, formState } = form;
  const e = formState.errors.technical || {};
  return (
    <div>
      <StepHeading title="Technical details" description="Optional. Skip this if you're not sure — you can fill it in later from the vehicle's Details tab." />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        <Input label="Engine" placeholder="e.g. 1NZ-FXE hybrid" className="sm:col-span-2 xl:col-span-1" error={e.engineType?.message} {...register('technical.engineType')} />
        <Input label="Engine capacity" inputMode="numeric" suffix="cc" error={e.capacity?.message} {...register('technical.capacity')} />
        <Input label="Cylinders" inputMode="numeric" error={e.cylinders?.message} {...register('technical.cylinders')} />
        <Select label="Aspiration" options={ASPIRATION_TYPES} placeholder="Not specified" {...register('technical.aspiration')} />
        <Input label="Power" placeholder="e.g. 100 hp" error={e.power?.message} {...register('technical.power')} />
        <Input label="Torque" placeholder="e.g. 111 Nm" error={e.torque?.message} {...register('technical.torque')} />
        <Input label="Gears" placeholder="e.g. e-CVT, 6-speed" error={e.gears?.message} {...register('technical.gears')} />
        <Select label="Drive type" options={DRIVE_TYPES} placeholder="Not specified" {...register('technical.driveType')} />
        <Select label="Body type" options={BODY_TYPES} placeholder="Not specified" {...register('technical.bodyType')} />
        <Input label="Seats" inputMode="numeric" error={e.seats?.message} {...register('technical.seats')} />
        <Input label="Doors" inputMode="numeric" error={e.doors?.message} {...register('technical.doors')} />
      </div>
    </div>);

}