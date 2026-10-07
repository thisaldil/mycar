import { useEffect, useId, useMemo, useRef, useState } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronDownIcon, CircleAlertIcon } from 'lucide-react';
import { cn } from '../../utils/cn';
import { buildSchema } from '../../utils/formSchema';
import { Modal } from './Modal';
import { Button } from './Button';
import { RecordFields } from './RecordFields';

const hasContent = (v) => Array.isArray(v) ? v.length > 0 : v !== null && v !== undefined && v !== '';

export function RecordFormModal({ open, onClose, config, initialValues, onSubmit, title, submitLabel = 'Save' }) {
  const formId = useId();
  const schema = useMemo(() => buildSchema(config.fields, config.validate), [config]);
  const form = useForm({ resolver: zodResolver(schema), defaultValues: initialValues, mode: 'onTouched' });
  const { handleSubmit, reset, setValue, setError, control, formState } = form;
  const [serverError, setServerError] = useState(null);
  const primary = config.fields.filter((f) => !f.advanced);
  const advanced = config.fields.filter((f) => f.advanced);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const skipCompute = useRef(true);

  useEffect(() => {
    if (!open) return;
    skipCompute.current = true;
    reset(initialValues);
    setServerError(null);
    setShowAdvanced(advanced.some((f) => hasContent(initialValues?.[f.name])));
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  // Reveal advanced fields if validation fails there.
  useEffect(() => {
    if (advanced.some((f) => formState.errors[f.name])) setShowAdvanced(true);
  }, [formState.errors]); // eslint-disable-line react-hooks/exhaustive-deps

  // Derived fields (e.g. fuel total = litres × price).
  const deps = useMemo(() => [...new Set((config.computed || []).flatMap((c) => c.deps))], [config]);
  const depValues = useWatch({ control, name: deps.length ? deps : ['__none__'] });
  const depKey = JSON.stringify(depValues);
  useEffect(() => {
    if (!open || !config.computed) return;
    if (skipCompute.current) {
      skipCompute.current = false;
      return;
    }
    const values = Object.fromEntries(deps.map((d, i) => [d, depValues?.[i]]));
    config.computed.forEach((c) => {
      const next = c.fn(values);
      if (next !== undefined) setValue(c.name, next, { shouldValidate: formState.isSubmitted });
    });
  }, [depKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const submit = handleSubmit(async (values) => {
    setServerError(null);
    try {
      await onSubmit(values);
      onClose();
    } catch (err) {
      setServerError(err.message || 'Could not save. Please try again.');
      if (err.fieldErrors) {
        Object.entries(err.fieldErrors).forEach(([name, message]) => setError(name, { type: 'server', message: String(message) }));
      }
    }
  });

  return (
    <Modal
      open={open}
      onClose={formState.isSubmitting ? () => {} : onClose}
      title={title}
      size="md"
      footer={
      <>
          <Button variant="secondary" onClick={onClose} disabled={formState.isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" form={formId} loading={formState.isSubmitting}>
            {submitLabel}
          </Button>
        </>
      }>
      
      <form id={formId} onSubmit={submit} noValidate className="space-y-5">
        {serverError ?
        <div role="alert" className="flex items-start gap-2 rounded-xl bg-danger-soft px-3 py-2.5 text-sm text-danger">
            <CircleAlertIcon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            {serverError}
          </div> :
        null}
        <RecordFields fields={primary} form={form} />
        {advanced.length ?
        <div className="border-t border-line pt-4">
            <button
            type="button"
            aria-expanded={showAdvanced}
            onClick={() => setShowAdvanced((s) => !s)}
            className="flex w-full items-center justify-between gap-3 rounded-lg py-1 text-left text-sm font-medium text-ink">
            
              <span className="min-w-0">
                More details
                <span className="ml-1.5 font-normal text-ink-muted">
                  {advanced.
                slice(0, 3).
                map((f) => f.label.toLowerCase()).
                join(', ')}
                  {advanced.length > 3 ? '…' : ''}
                </span>
              </span>
              <ChevronDownIcon className={cn('h-4 w-4 shrink-0 text-ink-muted transition-transform duration-200 ease-out', showAdvanced && 'rotate-180')} aria-hidden="true" />
            </button>
            <AnimatePresence initial={false}>
              {showAdvanced ?
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22, ease: [0.23, 1, 0.32, 1] }}
              className="-mx-1 overflow-hidden px-1">
              
                  <div className="pb-1 pt-4">
                    <RecordFields fields={advanced} form={form} />
                  </div>
                </motion.div> :
            null}
            </AnimatePresence>
          </div> :
        null}
      </form>
    </Modal>);

}