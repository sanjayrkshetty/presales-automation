require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');
const fs = require('fs');

// Fail fast if critical env vars are missing
if (!process.env.ANTHROPIC_API_KEY || process.env.ANTHROPIC_API_KEY === 'your_key_here') {
  console.warn('[WARN] ANTHROPIC_API_KEY not set — AI features will be unavailable');
}

const { initDb } = require('./db/database');
const opportunitiesRouter = require('./routes/opportunities');
const gamRouter = require('./routes/gam');
const proposalsRouter = require('./routes/proposals');
const aiRouter = require('./routes/ai');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;
const GENERATED_DIR = process.env.GENERATED_DIR || './generated';
const ALLOWED_ORIGIN = process.env.ALLOWED_ORIGIN || 'http://localhost:5173';

if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });
if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });

// Security headers
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'same-site' },
  contentSecurityPolicy: false, // handled by frontend
}));

// Lock CORS to the frontend origin only
app.use(cors({
  origin: ALLOWED_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type'],
}));

// Rate limiting — general API: 200 req/min
const apiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 200,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, slow down.' },
});

// Stricter limit on AI endpoints — these call Claude
const aiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'AI rate limit reached. Max 20 AI calls/minute.' },
});

app.use(express.json({ limit: '2mb' })); // Reduced from 10mb — no reason to accept 10mb JSON
app.use('/api', apiLimiter);
app.use('/api/ai', aiLimiter);

// Serve generated DOCX — only .docx files, no directory listing
app.use('/generated', (req, res, next) => {
  const ext = path.extname(req.path).toLowerCase();
  if (ext !== '.docx') return res.status(403).json({ error: 'Forbidden' });
  // Block path traversal
  const safe = path.normalize(req.path).replace(/^(\.\.(\/|\\|$))+/, '');
  req.url = safe;
  next();
}, express.static(path.resolve(GENERATED_DIR), { dotfiles: 'deny' }));

const db = initDb();
app.locals.db = db;

app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/gam', gamRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/reports', reportsRouter);

// Global error handler — never leak stack traces
app.use((err, req, res, next) => {
  if (err.type === 'entity.too.large') return res.status(413).json({ error: 'Payload too large' });
  if (err.code === 'LIMIT_FILE_SIZE') return res.status(413).json({ error: 'File too large (max 5MB)' });
  if (err.message?.startsWith('Only .xlsx')) return res.status(400).json({ error: err.message });
  console.error('[ERROR]', err.message);
  res.status(500).json({ error: 'Internal server error' });
});

app.listen(PORT, '127.0.0.1', () => {
  console.log(`Server running on http://127.0.0.1:${PORT} (localhost only)`);
});
