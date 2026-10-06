# CarLife — Client

A React + Vite frontend for managing your vehicles: services, fuel, expenses, documents, insurance, inspections, tyres, battery, accidents, modifications, reminders and reports.

## Stack
React 18, Vite, Tailwind CSS 3, React Router 6, Axios, React Hook Form + Zod, Recharts, Sonner, Framer Motion, Lucide icons.

## Install & run
```bash
npm install
cp .env.example .env    # set VITE_API_URL to your Express API, e.g. http://localhost:5000/api
npm run dev
```
Add `index.html` in the project root if you don't have one yet:
```html
<!doctype html>
<html lang="en"><head><meta charset="UTF-8" /><meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover" /><title>CarLife</title></head>
<body><div id="root"></div><script type="module" src="/main.jsx"></script></body></html>
```

**Demo mode:** if `VITE_API_URL` is empty, a built-in mock backend (`services/mockAdapter.js`) stores data in localStorage. Sign in with `demo@carlife.app` / `Demo1234!`.

## Structure
`services/` Axios instance + one API module per resource · `context/` Auth, Settings, Vehicles · `components/common/` design system · `components/<module>/` feature panels · `pages/` one per route · `routes/` routing and guards · `layouts/` app shell · `utils/` formatting, schemas, analytics · `data/` options, navigation, demo seed.

## API contract (Express)
Responses: `{ success, data, message, errors? }`. Auth: `Authorization: Bearer <JWT>`. A 401 on a private route signs the user out.

- `POST /auth/login | /auth/register | /auth/forgot-password | /auth/reset-password`, `GET /auth/me`, `PUT /auth/profile`, `PUT /auth/change-password`, `POST /auth/logout`
- `PUT /users/me/settings`, `GET /users/me/export`
- `GET/POST /vehicles`, `GET/PUT/DELETE /vehicles/:id`, `PATCH /vehicles/:id/archive`, `PATCH /vehicles/:id/mileage`, `GET /vehicles/:id/summary`, `GET /vehicles/:id/timeline`
- `GET/POST` + `GET/PUT/DELETE /:id` for `/maintenance /fuel /expenses /documents /insurance /inspections /tyres /batteries /accidents /modifications /reminders /trips` (filter with `?vehicleId=`)
- `POST /documents` (multipart, field `file`), `GET /documents/:id/file` (Blob)
- `PATCH /reminders/:id/complete`, `GET /reports/summary?vehicleId&range=12m|ytd|all`

The mock adapter shows the expected shape of every response, including linked expenses created from fuel, service and insurance records.

## Security notes
Only the JWT is stored (localStorage if "Keep me signed in", otherwise sessionStorage). Passwords are never stored. Expired tokens are rejected on the client. Private routes are guarded. Documents are fetched as authorised Blobs instead of public URLs. Displayed URLs are sanitised.
