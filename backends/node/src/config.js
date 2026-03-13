export const config = {
  port: parseInt(process.env.PORT || '8084', 10),
  jwtSecret: process.env.JWT_SECRET || 'your-256-bit-secret-key-for-jwt-signing-change-in-prod',
  jwtExpirationMs: 86400000,
  sqlitePath: process.env.SQLITE_PATH || ':memory:',
  mongoUri: process.env.MONGO_URI || 'mongodb://localhost:27017',
};
