export const ok = (res, data, message = undefined, status = 200) => res.status(status).json({ success: true, ...(message ? { message } : {}), data });
export const id = (value) => value?.toString();
