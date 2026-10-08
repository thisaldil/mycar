import app from '../src/app.js';
import { connectDb } from '../src/config/db.js';

export default async function handler(req, res) {
  try {
    await connectDb();
    return app(req, res);
  } catch (error) {
    if (!res.headersSent) {
      return res.status(503).json({ success: false, message: 'Database temporarily unavailable.' });
    }
    return undefined;
  }
}
