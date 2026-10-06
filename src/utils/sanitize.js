// React escapes text content by default. These helpers add a second layer for
// values that end up in attributes (image sources, links) or long free text.

const SAFE_DATA_IMAGE = /^data:image\/(png|jpe?g|webp|gif|svg\+xml);/i;

export function safeUrl(url) {
  if (!url || typeof url !== 'string') return undefined;
  const value = url.trim();
  if (SAFE_DATA_IMAGE.test(value)) return value;
  if (value.startsWith('blob:')) return value;
  try {
    const parsed = new URL(value, window.location.origin);
    return ['http:', 'https:'].includes(parsed.protocol) ? parsed.href : undefined;
  } catch {
    return undefined;
  }
}

// eslint-disable-next-line no-control-regex
const CONTROL_CHARS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;

export function cleanText(value, max = 5000) {
  if (value == null) return '';
  return String(value).replace(CONTROL_CHARS, '').slice(0, max);
}

export function maskValue(value, visible = 4) {
  if (!value) return '';
  const s = String(value);
  if (s.length <= visible) return s;
  return `${'•'.repeat(Math.min(8, s.length - visible))}${s.slice(-visible)}`;
}