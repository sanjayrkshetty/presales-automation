require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');

const { initDb } = require('./db/database');
const opportunitiesRouter = require('./routes/opportunities');
const gamRouter = require('./routes/gam');
const proposalsRouter = require('./routes/proposals');
const aiRouter = require('./routes/ai');
const reportsRouter = require('./routes/reports');

const app = express();
const PORT = process.env.PORT || 3001;
const GENERATED_DIR = process.env.GENERATED_DIR || './generated';

if (!fs.existsSync(GENERATED_DIR)) fs.mkdirSync(GENERATED_DIR, { recursive: true });
if (!fs.existsSync('./data')) fs.mkdirSync('./data', { recursive: true });

app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use('/generated', express.static(path.resolve(GENERATED_DIR)));

const db = initDb();
app.locals.db = db;

app.use('/api/opportunities', opportunitiesRouter);
app.use('/api/gam', gamRouter);
app.use('/api/proposals', proposalsRouter);
app.use('/api/ai', aiRouter);
app.use('/api/reports', reportsRouter);

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
