import { GENERAL_CONDITIONS } from '../../../data/options';
import { useFormat } from '../../../hooks/useFormat';
import { todayISO } from '../../../utils/format';
import { Input } from '../../common/Input';
import { Select } from '../../common/Select';
import { DatePicker } from '../../common/DatePicker';
import { Textarea } from '../../common/Textarea';
import { StepHeading } from './StepHeading';

export function StepPurchase({ form }) {
  const { register, watch, formState } = form;
  const fmt = useFormat();
  const e = formState.errors.purchase || {};
  const type = watch('type');
  const financing = watch('purchase.financing');
  const inspected = watch('purchase.inspected');

  if (type === 'new') {
    return (
      <div>
        <StepHeading title="Purchase details" description="All optional. Warranty and financing details help us remind you before they end." />
        <div className="grid gap-4 sm:grid-cols-2">
          <DatePicker label="Purchase date" max={todayISO()} error={e.date?.message} {...register('purchase.date')} />
          <Input label="Price" inputMode="decimal" prefix={fmt.currencySymbol} error={e.price?.message} {...register('purchase.price')} />
          <Input label="Dealer" placeholder="e.g. Toyota Lanka" error={e.dealer?.message} {...register('purchase.dealer')} />
          <Input label="Warranty" placeholder="e.g. 3 years / 100,000 km" error={e.warranty?.message} {...register('purchase.warranty')} />
          <Select label="Financing" options={['None', 'Loan', 'Lease']} error={e.financing?.message} {...register('purchase.financing')} />
          {financing && financing !== 'None' ?
          <>
              <Input label="Finance provider" error={e.financeProvider?.message} {...register('purchase.financeProvider')} />
              <Input label="Monthly payment" inputMode="decimal" prefix={fmt.currencySymbol} error={e.monthlyPayment?.message} {...register('purchase.monthlyPayment')} />
            </> :
          null}
        </div>
      </div>);

  }

  return (
    <div>
      <StepHeading title="Purchase details" description="All optional, but mileage at purchase makes your running-cost numbers far more accurate." />
      <div className="grid gap-4 sm:grid-cols-2">
        <DatePicker label="Purchase date" max={todayISO()} error={e.date?.message} {...register('purchase.date')} />
        <Input label="Purchase price" inputMode="decimal" prefix={fmt.currencySymbol} error={e.price?.message} {...register('purchase.price')} />
        <Input label="Mileage at purchase" inputMode="numeric" suffix="km" error={e.mileageAtPurchase?.message} {...register('purchase.mileageAtPurchase')} />
        <Input label="Previous owners" inputMode="numeric" error={e.previousOwners?.message} {...register('purchase.previousOwners')} />
        <Input label="Seller" placeholder="Dealer or private seller" error={e.seller?.message} {...register('purchase.seller')} />
        <Select
          label="Accident history"
          options={['None reported', 'Minor, repaired', 'Major, repaired', 'Unknown']}
          placeholder="Not specified"
          error={e.accidentHistory?.message}
          {...register('purchase.accidentHistory')} />
        
        <Select label="Condition at purchase" options={GENERAL_CONDITIONS} placeholder="Not specified" error={e.condition?.message} {...register('purchase.condition')} />
        <Select label="Inspected before buying?" options={['Yes', 'No']} placeholder="Not specified" error={e.inspected?.message} {...register('purchase.inspected')} />
        {inspected === 'Yes' ?
        <Textarea className="sm:col-span-2" label="Inspection notes" placeholder="Who inspected it and what did they find?" error={e.inspectionNotes?.message} {...register('purchase.inspectionNotes')} /> :
        null}
      </div>
    </div>);

}