import { del, get, put } from '@vercel/blob';
import { randomUUID } from 'node:crypto';

const allowedTypes = new Set(['application/pdf', 'image/jpeg', 'image/png', 'image/webp']);

function requireBlobToken() {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw Object.assign(new Error('Document storage is not configured.'), { status: 503 });
  }
}

export async function storeDocument({ body, contentType, extension, ownerId }) {
  requireBlobToken();
  const pathname = `documents/${ownerId}/${randomUUID()}.${extension}`;
  return put(pathname, body, {
    access: 'private',
    contentType,
    addRandomSuffix: false
  });
}

export async function readDocument(pathname) {
  requireBlobToken();
  return get(pathname, { access: 'private', useCache: false });
}

export async function removeDocument(pathname) {
  if (!pathname) return;
  requireBlobToken();
  await del(pathname);
}

export function isSupportedDocumentType(contentType) {
  return allowedTypes.has(contentType);
}

export function extensionForType(contentType) {
  const extensions = {
    'application/pdf': 'pdf',
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp'
  };
  return extensions[contentType];
}

export const maxDocumentSize = process.env.VERCEL ? 4 * 1024 * 1024 : 10 * 1024 * 1024;
