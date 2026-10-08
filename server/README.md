# CarLife API

This is the Express/Mongoose API consumed by the existing React client. The client uses `VITE_API_URL` as its base URL, so set it to `http://localhost:5000/api` for local development.

## Run

1. Copy `.env.example` to `.env` and set `MONGODB_URI`, a long random `JWT_SECRET`, and `BLOB_READ_WRITE_TOKEN`.
2. Run `npm install` inside `server`.
3. Run `npm run dev` (or `npm start`).

All successful responses use `{ "success": true, "data": ... }`; errors use `{ "success": false, "message": "...", "errors": ... }`. Protected routes require `Authorization: Bearer <jwt>`.

Resources implemented: vehicles, maintenance, fuel, expenses, documents, insurance, inspections, tyres, batteries, accidents, modifications, reminders, and trips. Every resource is scoped to the authenticated user, and every record with a `vehicleId` is checked against that user's vehicles before it is read or written.

Document uploads accept PDF/JPEG/PNG/WebP files up to 10 MB locally and up to 4 MB on Vercel because of the platform request-body limit. Files are stored in private Vercel Blob storage. `GET /api/documents/:id/file` performs an ownership check before streaming a file.
