import 'dotenv/config';

const required = (name, fallback) => process.env[name] || fallback;

export const env = {
  port: Number(required('PORT', '5000')),
  mongoUri: process.env.MONGODB_URI,
  jwtSecret: process.env.JWT_SECRET,
  jwtExpiresIn: required('JWT_EXPIRES_IN', '12h'),
  clientUrl: required('CLIENT_URL', 'http://localhost:5173'),
  uploadDir: required('UPLOAD_DIR', 'uploads'),
  nodeEnv: required('NODE_ENV', 'development')
};

if (!env.mongoUri || !env.jwtSecret) {
  throw new Error('MONGODB_URI and JWT_SECRET must be set');
}
