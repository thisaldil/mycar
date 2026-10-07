import { Controller } from 'react-hook-form';
import { cn } from '../../utils/cn';
import { useFormat } from '../../hooks/useFormat';
import { Input } from './Input';
import { Select } from './Select';
import { Textarea } from './Textarea';
import { DatePicker } from './DatePicker';
import { Checkbox } from './Checkbox';
import { FileUploader } from './FileUploader';
import { ImageUploader } from './ImageUploader';

const WIDE = ['textarea', 'files', 'images', 'checkbox'];

/** Renders form fields from a config array (see utils/recordForms.js). */
export function RecordFields({ fields, form }) {
  const { register, control, watch, formState } = form;
  const values = watch();
  const fmt = useFormat();
  const visible = fields.filter((f) => !f.showIf || f.showIf(values));

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      {visible.map((f) => {
        const error = formState.errors[f.name]?.message;
        const common = { label: f.label, required: f.required, error, hint: f.hint, placeholder: f.placeholder };
        let control_;
        switch (f.type) {
          case 'number':
            control_ = <Input {...common} inputMode={f.integer ? 'numeric' : 'decimal'} suffix={f.suffix} {...register(f.name)} />;
            break;
          case 'currency':
            control_ = <Input {...common} inputMode="decimal" prefix={fmt.currencySymbol} {...register(f.name)} />;
            break;
          case 'date':
            control_ = <DatePicker {...common} {...register(f.name)} />;
            break;
          case 'select':
            control_ = <Select {...common} options={f.options} placeholder={f.required ? undefined : f.placeholder || 'Not specified'} {...register(f.name)} />;
            break;
          case 'textarea':
            control_ = <Textarea {...common} {...register(f.name)} />;
            break;
          case 'checkbox':
            control_ = <Checkbox label={f.label} description={f.hint} {...register(f.name)} />;
            break;
          case 'files':
            control_ =
            <Controller
              name={f.name}
              control={control}
              render={({ field }) => <FileUploader label={f.label} accept={f.accept} value={field.value || []} onChange={field.onChange} error={error} />} />;


            break;
          case 'images':
            control_ =
            <Controller
              name={f.name}
              control={control}
              render={({ field }) => <ImageUploader label={f.label} value={field.value || []} onChange={field.onChange} error={error} />} />;


            break;
          default:
            control_ = <Input {...common} autoComplete="off" {...register(f.name)} />;
        }
        return (
          <div key={f.name} className={cn(WIDE.includes(f.type) && 'sm:col-span-2')}>
            {control_}
          </div>);

      })}
    </div>);

}