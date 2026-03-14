import express from 'express';
import cors from 'cors';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import fetch from 'node-fetch';
import { config, getBackendBaseUrl } from './config.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
let openapiSpec;
try {
  openapiSpec = JSON.parse(readFileSync(join(__dirname, '..', 'openapi.json'), 'utf8'));
} catch {
  openapiSpec = { openapi: '3.0.0', info: { title: 'BFF API', version: '1.0' }, paths: {} };
}

const app = express();
app.use(cors({ origin: true, credentials: true }));
app.use(express.json());
app.use(cookieParser());
app.use(
  session({
    secret: config.sessionSecret,
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, maxAge: 86400000 },
  })
);

const X_DB_TYPE = 'X-DB-Type';

app.use('/docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, { customSiteTitle: 'BFF API' }));
app.get('/openapi.json', (req, res) => res.json(openapiSpec));

async function proxyToBackend(lang, db, path, options = {}) {
  const base = getBackendBaseUrl(lang);
  const url = `${base}${path}`;
  const headers = {
    'Content-Type': 'application/json',
    [X_DB_TYPE]: db === 'mongo' ? 'mongo' : 'sql',
    ...options.headers,
  };
  const res = await fetch(url, { ...options, headers });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = text;
  }
  return { status: res.status, body, headers: res.headers };
}

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, lang = 'java', db = 'sql' } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    const { status, body } = await proxyToBackend(lang, db, '/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (status !== 200) {
      return res.status(status).json(body || { error: 'register failed' });
    }
    req.session.lang = lang;
    req.session.db = db;
    req.session.token = body.token;
    return res.json(body);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, lang = 'java', db = 'sql' } = req.body || {};
    if (!email || !password) {
      return res.status(400).json({ error: 'email and password required' });
    }
    const { status, body } = await proxyToBackend(lang, db, '/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    if (status !== 200) {
      return res.status(status).json(body || { error: 'login failed' });
    }
    req.session.lang = lang;
    req.session.db = db;
    req.session.token = body.token;
    return res.json(body);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
});

app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  return res.json({ ok: true });
});

app.all('/api/tasks*', async (req, res) => {
  try {
    if (!req.session?.token) {
      return res.status(401).json({ error: 'not authenticated' });
    }
    const lang = req.session.lang || 'java';
    const db = req.session.db || 'sql';
    const path = req.path;
    const { status, body } = await proxyToBackend(lang, db, path, {
      method: req.method,
      headers: { Authorization: `Bearer ${req.session.token}` },
      body: req.method !== 'GET' && req.body ? JSON.stringify(req.body) : undefined,
    });
    res.status(status);
    if (typeof body === 'object') return res.json(body);
    return res.send(body);
  } catch (e) {
    return res.status(502).json({ error: e.message });
  }
});

app.get('/api/me', (req, res) => {
  if (!req.session?.token) return res.status(401).json({ error: 'not authenticated' });
  return res.json({ lang: req.session.lang, db: req.session.db });
});

app.listen(config.port, () => {
  console.log(`BFF listening on port ${config.port}`);
});
