import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeftIcon, ArrowRightIcon, CheckIcon, FileClockIcon, SaveIcon } from 'lucide-react';
import { useVehicleWizard } from '../../../hooks/useVehicleWizard';
import { formatRelativeDays } from '../../../utils/format';
import { Button } from '../../common/Button';
import { WizardProgress } from './WizardProgress';
import { StepType } from './StepType';
import { StepBasic } from './StepBasic';
import { StepPurchase } from './StepPurchase';
import { StepTechnical } from './StepTechnical';
import { StepCondition } from './StepCondition';
import { StepDocuments } from './StepDocuments';
import { StepPhotos } from './StepPhotos';
import { StepReview } from './StepReview';

const STEP_COMPONENTS = [StepType, StepBasic, StepPurchase, StepTechnical, StepCondition, StepDocuments, StepPhotos, StepReview];

export function AddVehicleWizard() {
  const w = useVehicleWizard();
  const { form, step, steps } = w;
  const isLast = step === steps.length - 1;
  const StepComponent = STEP_COMPONENTS[step];

  const onSubmit = (e) => {
    e.preventDefault();
    if (isLast) w.finish();else
    w.next();
  };

  return (
    <div>
      {w.draft ?
      <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-brand/20 bg-brand-soft p-4 sm:flex-row sm:items-center">
          <FileClockIcon className="hidden h-5 w-5 shrink-0 text-brand sm:block" aria-hidden="true" />
          <div className="min-w-0 flex-1">
            <p className="font-medium text-ink">You have a saved draft</p>
            <p className="truncate text-sm text-ink-soft">
              {[w.draft.values?.make, w.draft.values?.model].filter(Boolean).join(' ') || 'Untitled vehicle'} · saved {formatRelativeDays(w.draft.savedAt)}
            </p>
          </div>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={w.discardDraft}>
              Discard
            </Button>
            <Button size="sm" onClick={w.resumeDraft}>
              Resume draft
            </Button>
          </div>
        </div> :
      null}

      <div className="grid gap-6 lg:grid-cols-[250px_minmax(0,1fr)] xl:gap-10">
        <WizardProgress steps={steps} current={step} maxStep={w.maxStep} onSelect={w.goTo} />

        <form onSubmit={onSubmit} noValidate className="min-w-0">
          <div className="rounded-2xl border border-line bg-surface shadow-card">
            <div className="p-5 sm:p-8">
              <p className="mb-4 hidden text-sm font-medium text-ink-muted tnum lg:block">
                Step {step + 1} of {steps.length}
              </p>
              <AnimatePresence mode="wait" initial={false}>
                <motion.div key={step} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.15, ease: 'easeOut' }}>
                  <StepComponent form={form} goTo={w.goTo} />
                </motion.div>
              </AnimatePresence>
            </div>
            <div className="sticky bottom-[calc(4rem+env(safe-area-inset-bottom))] z-10 flex items-center gap-2 rounded-b-2xl border-t border-line bg-surface/95 px-4 py-3 backdrop-blur sm:px-8 md:bottom-0">
              <Button variant="secondary" onClick={w.back} disabled={step === 0} aria-label="Back">
                <ArrowLeftIcon className="h-4 w-4" aria-hidden="true" />
                <span className="hidden sm:inline">Back</span>
              </Button>
              <Button variant="ghost" onClick={w.saveDraft} leftIcon={SaveIcon}>
                <span className="hidden sm:inline">Save draft</span>
                <span className="sm:hidden">Draft</span>
              </Button>
              <div className="ml-auto flex gap-2">
                {steps[step].optional && !isLast ?
                <Button variant="ghost" onClick={w.next} className="hidden sm:inline-flex">
                    Skip
                  </Button> :
                null}
                <Button type="submit" loading={w.saving} rightIcon={isLast ? CheckIcon : ArrowRightIcon}>
                  {isLast ? 'Finish & save' : 'Continue'}
                </Button>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>);

}