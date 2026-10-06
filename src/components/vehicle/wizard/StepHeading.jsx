export function StepHeading({ title, description }) {
  return (
    <div className="mb-6">
      <h2 className="text-xl font-bold text-ink sm:text-2xl">{title}</h2>
      {description ? <p className="mt-1 text-sm text-ink-soft">{description}</p> : null}
    </div>);

}