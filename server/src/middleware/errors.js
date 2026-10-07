export function notFound(req, res) {
  res.status(404).json({ success: false, message: 'Route not found.' });
}

export function errorHandler(error, req, res, next) {
  if (res.headersSent) return next(error);
  const status = error.status || (error.name === 'ValidationError' ? 400 : error.code === 11000 ? 409 : 500);
  const body = { success: false, message: status === 500 && process.env.NODE_ENV === 'production' ? 'Internal server error.' : error.message };
  if (error.name === 'ValidationError') body.errors = Object.fromEntries(Object.entries(error.errors).map(([key, value]) => [key, value.message]));
  res.status(status).json(body);
}
