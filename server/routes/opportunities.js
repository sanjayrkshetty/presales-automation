const express = require('express');
const multer = require('multer');
const XLSX = require('xlsx');
const router = express.Router();
const upload = multer({ storage: multer.memoryStorage() });

function getDb(req) { return req.app.locals.db; }

router.get('/', (req, res) => {
  const db = getDb(req);
  const { stage, type, am, q, dateFrom, dateTo, proposal_shared } = req.query;

  let sql = 'SELECT * FROM opportunities WHERE 1=1';
  const params = [];

  if (stage) {
    const stages = stage.split(',').map(s => s.trim());
    sql += ` AND stage IN (${stages.map(() => '?').join(',')})`;
    params.push(...stages);
  }
  if (type) {
    const types = type.split(',').map(t => t.trim());
    sql += ` AND engagement_type IN (${types.map(() => '?').join(',')})`;
    params.push(...types);
  }
  if (am) { sql += ' AND account_manager = ?'; params.push(am); }
  if (q) { sql += ' AND client_name LIKE ?'; params.push(`%${q}%`); }
  if (dateFrom) { sql += ' AND date_modified >= ?'; params.push(dateFrom); }
  if (dateTo) { sql += ' AND date_modified <= ?'; params.push(dateTo); }
  if (proposal_shared === 'yes') { sql += ' AND proposal_shared = 1'; }
  if (proposal_shared === 'no') { sql += ' AND proposal_shared = 0'; }

  sql += ' ORDER BY date_modified DESC';
  res.json(db.prepare(sql).all(...params));
});

router.post('/', (req, res) => {
  const db = getDb(req);
  const { client_name, presales_update, account_manager, engagement_type,
    proposal_shared, acv_cr, stage, client_side_updates } = req.body;

  if (!client_name) return res.status(400).json({ error: 'client_name required' });

  const result = db.prepare(`
    INSERT INTO opportunities (client_name, presales_update, account_manager, engagement_type,
      proposal_shared, acv_cr, stage, client_side_updates, date_updated, date_modified)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, date('now'), date('now'))
  `).run(client_name, presales_update || '', account_manager || '', engagement_type || '',
    proposal_shared ? 1 : 0, acv_cr || 0, stage || 'Cold', client_side_updates || '');

  res.json(db.prepare('SELECT * FROM opportunities WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const db = getDb(req);
  const { client_name, presales_update, account_manager, engagement_type,
    proposal_shared, acv_cr, stage, client_side_updates } = req.body;

  db.prepare(`
    UPDATE opportunities SET
      client_name = COALESCE(?, client_name),
      presales_update = COALESCE(?, presales_update),
      account_manager = COALESCE(?, account_manager),
      engagement_type = COALESCE(?, engagement_type),
      proposal_shared = COALESCE(?, proposal_shared),
      acv_cr = COALESCE(?, acv_cr),
      stage = COALESCE(?, stage),
      client_side_updates = COALESCE(?, client_side_updates),
      date_modified = date('now'),
      date_updated = date('now')
    WHERE id = ?
  `).run(client_name, presales_update, account_manager, engagement_type,
    proposal_shared != null ? (proposal_shared ? 1 : 0) : null,
    acv_cr, stage, client_side_updates, req.params.id);

  res.json(db.prepare('SELECT * FROM opportunities WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  const db = getDb(req);
  db.prepare('DELETE FROM opportunities WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.put('/:id/updates', (req, res) => {
  const db = getDb(req);
  const { update_text } = req.body;
  if (!update_text) return res.status(400).json({ error: 'update_text required' });
  db.prepare('INSERT INTO update_log (opportunity_id, update_text) VALUES (?, ?)').run(req.params.id, update_text);
  db.prepare("UPDATE opportunities SET date_updated = date('now'), date_modified = date('now') WHERE id = ?").run(req.params.id);
  res.json({ ok: true });
});

router.get('/:id/updates', (req, res) => {
  const db = getDb(req);
  res.json(db.prepare('SELECT * FROM update_log WHERE opportunity_id = ? ORDER BY logged_at DESC').all(req.params.id));
});

router.post('/bulk-stage', (req, res) => {
  const db = getDb(req);
  const { ids, stage } = req.body;
  if (!ids?.length || !stage) return res.status(400).json({ error: 'ids and stage required' });
  const stmt = db.prepare("UPDATE opportunities SET stage = ?, date_modified = date('now') WHERE id = ?");
  ids.forEach(id => stmt.run(stage, id));
  res.json({ ok: true, updated: ids.length });
});

router.post('/bulk-proposal-shared', (req, res) => {
  const db = getDb(req);
  const { ids } = req.body;
  if (!ids?.length) return res.status(400).json({ error: 'ids required' });
  const stmt = db.prepare("UPDATE opportunities SET proposal_shared = 1, date_modified = date('now') WHERE id = ?");
  ids.forEach(id => stmt.run(id));
  res.json({ ok: true, updated: ids.length });
});

router.post('/import', upload.single('file'), (req, res) => {
  try {
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    const rows = XLSX.utils.sheet_to_json(ws);

    const COLUMN_MAP = {
      'Client Name': 'client_name',
      'Pre-Sales Update': 'presales_update',
      'Account Manager': 'account_manager',
      'Engagement Type': 'engagement_type',
      'Proposal Shared': 'proposal_shared',
      'ACV (Cr)': 'acv_cr',
      'Stage': 'stage',
      'Client Side Updates': 'client_side_updates',
    };

    const db = getDb(req);
    const insert = db.prepare(`
      INSERT INTO opportunities (client_name, presales_update, account_manager, engagement_type,
        proposal_shared, acv_cr, stage, client_side_updates, date_updated)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, date('now'))
    `);

    let imported = 0;
    rows.forEach(row => {
      const mapped = {};
      Object.entries(COLUMN_MAP).forEach(([col, field]) => {
        if (row[col] != null) mapped[field] = row[col];
      });
      if (!mapped.client_name) return;
      insert.run(
        mapped.client_name, mapped.presales_update || '', mapped.account_manager || '',
        mapped.engagement_type || '', mapped.proposal_shared ? 1 : 0,
        parseFloat(mapped.acv_cr) || 0, mapped.stage || 'Cold', mapped.client_side_updates || ''
      );
      imported++;
    });

    res.json({ ok: true, imported });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
