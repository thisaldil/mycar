import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import api from './routes/api.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
app.use(helmet());
const allowedOrigins = new Set([
  ...(env.nodeEnv === 'production' ? [] : ['http://localhost:5173']),
  ...env.clientUrl.split(',').map((origin) => origin.trim()).filter(Boolean)
]);
app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.has(origin)) return callback(null, true);
    return callback(Object.assign(new Error('Origin is not allowed.'), { status: 403 }));
  },
  credentials: false
}));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.get('/health', (_, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.use('/api', api);
app.use(notFound);
app.use(errorHandler);
export default app;
