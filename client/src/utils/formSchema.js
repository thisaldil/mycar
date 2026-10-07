import { z } from 'zod';

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/;

const toNumberOrUndefined = (v) => {
  if (v === '' || v === null || v === undefined) return undefined;
  if (typeof v === 'number') return Number.isNaN(v) ? undefined : v;
  const cleaned = String(v).replace(/,/g, '').trim();
  return cleaned === '' ? undefined : Number(cleaned);
};

export function fieldSchema(field) {
  const { label, required } = field;
  switch (field.type) {
    case 'number':
    case 'currency':{
        let n = z.number({ required_error: `${label} is required`, invalid_type_error: `${label} must be a number` });
        n = n.min(field.min ?? 0, field.min != null ? `${label} must be at least ${field.min}` : `${label} can't be negative`);
        if (field.max != null) n = n.max(field.max, `${label} must be ${field.max} or less`);
        if (field.integer) n = n.int(`${label} must be a whole number`);
        return z.preprocess(toNumberOrUndefined, required ? n : n.optional());
      }
    case 'checkbox':
      return z.boolean().optional();
    case 'files':
    case 'images':
      return z.array(z.any()).optional();
    case 'date':
      return required ?
      z.string({ required_error: `${label} is required` }).min(1, `${label} is required`).regex(DATE_RE, 'Enter a valid date') :
      z.string().regex(DATE_RE, 'Enter a valid date').or(z.literal('')).optional();
    default:{
        const s = z.string().trim().max(field.maxLength || 2000, `${label} is too long`);
        return required ? s.min(1, `${label} is required`) : s.optional().or(z.literal(''));
      }
  }
}

/** Builds a Zod object schema from a field config array, with optional cross-field validation. */
export function buildSchema(fields, validate) {
  const shape = Object.fromEntries(fields.map((f) => [f.name, fieldSchema(f)]));
  const base = z.object(shape).passthrough();
  return validate ? base.superRefine(validate) : base;
}