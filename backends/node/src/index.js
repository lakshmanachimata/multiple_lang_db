import express from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Database from 'better-sqlite3';
import { MongoClient } from 'mongodb';
import { config } from './config.js';
import { dbTypeMiddleware } from './middleware/dbType.js';
import { jwtAuthMiddleware } from './middleware/jwtAuth.js';
import { createRepositoryFactory } from './repositories/factory.js';
import { createAuthRouter } from './routes/auth.js';
import { createTasksRouter } from './routes/tasks.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
let openapiSpec;
try {
  openapiSpec = JSON.parse(readFileSync(join(__dirname, '..', 'openapi.json'), 'utf8'));
} catch {
  openapiSpec = { openapi: '3.0.0', info: { title: 'API', version: '1.0' }, paths: {} };
}

const db = new Database(config.sqlitePath);
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    email TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL
  );
  CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    user_id TEXT NOT NULL,
    created_at TEXT
  );
`);

let mongoDb = null;
try {
  const mongoClient = new MongoClient(config.mongoUri);
  await mongoClient.connect();
  mongoDb = mongoClient.db('taskdb');
} catch (err) {
  console.warn('MongoDB not connected:', err.message);
}

const factory = createRepositoryFactory(db, mongoDb);

const app = express();
app.use(cors());
app.use(express.json());
app.use(dbTypeMiddleware);

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { customSiteTitle: 'Node Backend API' }));
app.get('/openapi.json', (req, res) => res.json(openapiSpec));

app.use('/api/auth', createAuthRouter(factory));
app.use('/api/tasks', createTasksRouter(factory, jwtAuthMiddleware));

app.listen(config.port, () => {
  console.log(`Node backend listening on port ${config.port}`);
});
