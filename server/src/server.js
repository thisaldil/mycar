import dns from 'node:dns';
dns.setServers(['8.8.8.8', '1.1.1.1']);

import app from './app.js';
import { connectDb } from './config/db.js';
import { env } from './config/env.js';

await connectDb();
app.listen(env.port, () => console.log(`CarLife API listening on port ${env.port}`));