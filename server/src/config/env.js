import 'dotenv/config';

const required = (name, fallback) => process.env[name] || fallback;
const nodeEnv = required('NODE_ENV', 'development');

export const env = {
  port: Number(required('PORT', '5000')),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: required('JWT_EXPIRES_IN', '12h'),
  clientUrl: process.env.CLIENT_URL || (nodeEnv === 'production' ? '' : 'http://localhost:5173'),
  nodeEnv
};

if (!env.mongoUri || !env.jwtSecret) {
  throw new Error('MONGODB_URI and JWT_SECRET must be set');
}
if (env.nodeEnv === 'production' && !env.clientUrl) {
  throw new Error('CLIENT_URL must be set in production');
}
