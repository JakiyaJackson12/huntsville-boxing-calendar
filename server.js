import 'dotenv/config';
import express from 'express';
import compression from 'compression';
import helmet from 'helmet';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { config, validateProductionConfig } from './src/config.js';
import { parseEventRange } from './src/dateRange.js';
import { buildDemoEvents } from './src/demoEvents.js';
import { fetchGoogleEvents } from './src/googleCalendar.js';

validateProductionConfig();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const publicDir = path.join(__dirname, 'public');
const app = express();

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      'default-src': ["'self'"],
      'script-src': ["'self'"],
      'style-src': ["'self'"],
      'img-src': ["'self'", 'data:'],
      'connect-src': ["'self'"],
      'font-src': ["'self'", 'data:'],
    },
  },
}));
app.use(compression());
app.use(express.json({ limit: '100kb' }));
app.use(express.static(publicDir, {
  maxAge: config.demoMode ? 0 : '10m',
  etag: true,
  setHeaders: (res, filePath) => {
    if (filePath.endsWith('.html') || filePath.endsWith('sw.js')) {
      res.setHeader('Cache-Control', 'no-store');
    }
  },
}));

app.get('/api/config', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({
    clubName: 'Huntsville Boxing Club',
    city: 'Huntsville, TX',
    timeZone: config.timeZone,
    demoMode: config.demoMode,
    refreshSeconds: config.refreshSeconds,
  });
});

app.get('/api/events', async (req, res) => {
  const range = parseEventRange(req.query);
  if (!range.ok) return res.status(400).json({ error: range.error });

  try {
    const allEvents = config.demoMode ? buildDemoEvents() : await fetchGoogleEvents(range.from, range.to);
    const events = allEvents.filter((event) => {
      if (event.type === 'announcement') return true;
      const start = new Date(event.start);
      return start >= range.from && start <= range.to;
    });

    res.set('Cache-Control', 'no-store');
    return res.json({
      events,
      source: config.demoMode ? 'demo' : 'google',
      syncedAt: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[calendar] unable to load events:', error);
    return res.status(502).json({ error: 'Unable to load calendar events.' });
  }
});

app.get('/api/health', (_req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ ok: true, mode: config.demoMode ? 'demo' : 'google', time: new Date().toISOString() });
});

app.use('/api', (_req, res) => {
  res.status(404).json({ error: 'API route not found.' });
});

app.use((req, res, next) => {
  if (req.method !== 'GET') return next();
  if (path.extname(req.path)) return next();
  if (!req.accepts('html')) return next();

  res.set('Cache-Control', 'no-store');
  return res.sendFile(path.join(publicDir, 'index.html'));
});

app.use((_req, res) => {
  res.status(404).type('text').send('Not found');
});

app.use((error, _req, res, _next) => {
  console.error('[server] unhandled error:', error);
  if (!res.headersSent) res.status(500).json({ error: 'Unexpected server error.' });
});

app.listen(config.port, () => {
  console.log(`HBC Calendar running at http://localhost:${config.port}`);
  console.log(`Mode: ${config.demoMode ? 'DEMO' : 'GOOGLE CALENDAR'}`);
});
