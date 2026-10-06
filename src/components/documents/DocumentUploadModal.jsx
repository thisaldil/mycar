import { useEffect, useId, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { CircleAlertIcon } from 'lucide-react';
import { DOCUMENT_CATEGORIES } from '../../data/options';
import { documentApi } from '../../services/documentApi';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { Input } from '../common/Input';
import { Select } from '../common/Select';
import { DatePicker } from '../common/DatePicker';
import { Textarea } from '../common/Textarea';
import { FileUploader } from '../common/FileUploader';
import { toast } from '../common/Toast';

const schema = z.object({
  file: z.array(z.any()).min(1, 'Choose a file to upload'),
  name: z.string().trim().min(1, 'Give the document a name').max(100, 'Name is too long'),
  category: z.string().min(1, 'Choose a category'),
  expiryDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Enter a valid date').optional().or(z.literal('')),
  notes: z.string().max(500, 'Notes are too long').optional().or(z.literal(''))
});

export function DocumentUploadModal({ open, onClose, vehicleId, onUploaded, defaultCategory }) {
  const formId = useId();
  const [serverError, setServerError] = useState(null);
  const {
    register,
    control,
    handleSubmit,
    reset,
    setValue,
    getValues,
    formState: { errors, isSubmitting }
  } = useForm({ resolver: zodResolver(schema) });

  useEffect(() => {
    if (open) {
      reset({ file: [], name: '', category: defaultCategory || 'Registration', expiryDate: '', notes: '' });
      setServerError(null);
    }
  }, [open, reset, defaultCategory]);

  const onSubmit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      const doc = await documentApi.upload({
        vehicleId,
        name: values.name,
        category: values.category,
        expiryDate: values.expiryDate,
        notes: values.notes,
        file: values.file[0].file
      });
      toast.success('Document uploaded');
      onUploaded(doc);
      onClose();
    } catch (err) {
      setServerError(err.message);
    }
  });

  return (
    <Modal
      open={open}
      onClose={isSubmitting ? () => {} : onClose}
      title="Upload document"
      description="Files are stored privately and only downloaded when you ask for them."
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={isSubmitting}>
            Upload
          </Button>
        </>
      }>
      
      <form id={formId} onSubmit={onSubmit} noValidate className="space-y-4">
        {serverError ?
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {serverError}
          </div> :
        null}
        <Controller
          name="file"
          control={control}
          render={({ field }) =>
          <FileUploader
            label="File"
            required
            multiple={false}
            accept="image/*,application/pdf"
            value={field.value || []}
            error={errors.file?.message}
            onChange={(files) => {
              field.onChange(files);
              if (files[0] && !getValues('name')) setValue('name', files[0].name.replace(/\.[^.]+$/, ''), { shouldValidate: true });
            }} />

          } />
        
        <div className="grid gap-4 sm:grid-cols-2">
          <Input label="Document name" required className="sm:col-span-2" error={errors.name?.message} {...register('name')} />
          <Select label="Category" required options={DOCUMENT_CATEGORIES} error={errors.category?.message} {...register('category')} />
          <DatePicker label="Expiry date" hint="We'll warn you 30 days before." error={errors.expiryDate?.message} {...register('expiryDate')} />
        </div>
        <Textarea label="Notes" rows={2} error={errors.notes?.message} {...register('notes')} />
      </form>
    </Modal>);

}