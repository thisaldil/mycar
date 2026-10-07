import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import api from './routes/api.js';
import { errorHandler, notFound } from './middleware/errors.js';

const app = express();
app.use(helmet());
app.use(cors({ origin: env.clientUrl, credentials: false }));
app.use(express.json({ limit: '5mb' }));
app.use(express.urlencoded({ extended: false }));
app.get('/health', (_, res) => res.json({ success: true, data: { status: 'ok' } }));
app.use('/api/auth', rateLimit({ windowMs: 15 * 60 * 1000, limit: 30, standardHeaders: true, legacyHeaders: false }));
app.use('/api', api);
app.use(notFound);
app.use(errorHandler);
export default app;
