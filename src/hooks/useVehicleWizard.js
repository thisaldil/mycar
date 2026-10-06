import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAuth } from '../context/AuthContext';
import { useVehicles } from '../context/VehicleContext';
import { vehicleApi } from '../services/vehicleApi';
import { documentApi } from '../services/documentApi';
import { toast } from '../components/common/Toast';
import { todayISO } from '../utils/format';
import { WIZARD_DEFAULTS, compact, wizardSchema } from '../utils/vehicleSchema';

export const WIZARD_STEPS = [
{ id: 'type', title: 'Vehicle type', fields: ['type'] },
{ id: 'basic', title: 'Basic information', fields: ['make', 'model', 'variant', 'year', 'registration', 'vin', 'fuelType', 'transmission', 'mileage', 'color'] },
{ id: 'purchase', title: 'Purchase', fields: ['purchase'] },
{ id: 'technical', title: 'Technical details', optional: true, fields: ['technical'] },
{ id: 'condition', title: 'Condition', fields: ['condition'] },
{ id: 'documents', title: 'Documents', optional: true, fields: ['documents'] },
{ id: 'photos', title: 'Photos', optional: true, fields: ['images'] },
{ id: 'review', title: 'Review', fields: [] }];


function readDraft(key) {
  try {
    return JSON.parse(localStorage.getItem(key) || 'null');
  } catch {
    return null;
  }
}

export function draftKeyFor(userId) {
  return `carlife_vehicle_draft_${userId}`;
}

export function useVehicleWizard() {
  const { user } = useAuth();
  const { activeVehicles, setActiveVehicle, upsertVehicle } = useVehicles();
  const navigate = useNavigate();
  const draftKey = draftKeyFor(user?.id);
  const [draft, setDraft] = useState(() => readDraft(draftKey));
  const [step, setStep] = useState(0);
  const [maxStep, setMaxStep] = useState(0);
  const [saving, setSaving] = useState(false);

  const form = useForm({
    resolver: zodResolver(wizardSchema),
    defaultValues: { ...WIZARD_DEFAULTS, makeActive: activeVehicles.length === 0 },
    mode: 'onTouched',
    shouldUnregister: false
  });

  const scrollTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const goTo = useCallback(
    (index) => {
      if (index <= maxStep) {
        setStep(index);
        scrollTop();
      }
    },
    [maxStep]
  );

  const next = useCallback(async () => {
    const fields = WIZARD_STEPS[step].fields;
    const valid = fields.length ? await form.trigger(fields, { shouldFocus: true }) : true;
    if (!valid) return;
    if (step < WIZARD_STEPS.length - 1) {
      setStep(step + 1);
      setMaxStep((m) => Math.max(m, step + 1));
      scrollTop();
    }
  }, [form, step]);

  const back = useCallback(() => {
    setStep((s) => Math.max(0, s - 1));
    scrollTop();
  }, []);

  const saveDraft = useCallback(() => {
    // eslint-disable-next-line no-unused-vars
    const { documents, ...values } = form.getValues();
    const payload = { values, step, maxStep, savedAt: new Date().toISOString() };
    try {
      localStorage.setItem(draftKey, JSON.stringify(payload));
      toast.success('Draft saved. You can pick up where you left off.');
    } catch {
      try {
        localStorage.setItem(draftKey, JSON.stringify({ ...payload, values: { ...values, images: [] } }));
        toast.success('Draft saved without photos (they were too large to store).');
      } catch {
        toast.error('Could not save a draft on this device.');
        return;
      }
    }
    setDraft(readDraft(draftKey));
  }, [form, step, maxStep, draftKey]);

  const resumeDraft = useCallback(() => {
    if (!draft) return;
    form.reset({ ...WIZARD_DEFAULTS, ...draft.values, documents: [] });
    setStep(draft.step || 0);
    setMaxStep(draft.maxStep || draft.step || 0);
    setDraft(null);
  }, [draft, form]);

  const discardDraft = useCallback(() => {
    try {
      localStorage.removeItem(draftKey);
    } catch {

      /* ignore */}
    setDraft(null);
  }, [draftKey]);

  const finish = useMemo(
    () =>
    form.handleSubmit(
      async (values) => {
        setSaving(true);
        try {
          const vehicle = await vehicleApi.create({
            type: values.type,
            make: values.make,
            model: values.model,
            variant: values.variant || '',
            year: values.year,
            registration: (values.registration || '').toUpperCase(),
            vin: (values.vin || '').toUpperCase(),
            color: values.color || '',
            fuelType: values.fuelType,
            transmission: values.transmission,
            mileage: values.mileage,
            purchase: compact(values.purchase),
            technical: compact(values.technical),
            condition: values.condition,
            image: values.images[0] || null,
            images: values.images,
            lastServiceMileage: values.mileage,
            lastServiceDate: todayISO()
          });

          let failed = 0;
          for (const doc of values.documents) {
            try {
              // eslint-disable-next-line no-await-in-loop
              await documentApi.upload({
                vehicleId: vehicle.id,
                name: doc.label || doc.name,
                category: doc.category || 'Other',
                expiryDate: doc.expiryDate || '',
                file: doc.file
              });
            } catch {
              failed += 1;
            }
          }

          upsertVehicle(vehicle);
          if (values.makeActive || activeVehicles.length === 0) setActiveVehicle(vehicle.id);
          try {
            localStorage.removeItem(draftKey);
          } catch {

            /* ignore */}
          toast.success(`${vehicle.make} ${vehicle.model} added to your garage`);
          if (failed) toast.warning(`${failed} document${failed === 1 ? '' : 's'} could not be uploaded. Add them from the Documents tab.`);
          navigate(`/vehicles/${vehicle.id}`, { replace: true });
        } catch (err) {
          toast.error(err.message || 'Could not save the vehicle.');
        } finally {
          setSaving(false);
        }
      },
      (errors) => {
        const first = WIZARD_STEPS.findIndex((s) => s.fields.some((f) => errors[f]));
        if (first >= 0) {
          setStep(first);
          toast.error('Some details need fixing before you can finish.');
        }
      }
    ),
    [form, activeVehicles.length, setActiveVehicle, upsertVehicle, draftKey, navigate]
  );

  return { form, step, maxStep, steps: WIZARD_STEPS, next, back, goTo, saveDraft, draft, resumeDraft, discardDraft, finish, saving };
}