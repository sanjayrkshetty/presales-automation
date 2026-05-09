const express = require('express');
const router = express.Router();

function getDb(req) { return req.app.locals.db; }

router.get('/', (req, res) => {
  res.json(getDb(req).prepare('SELECT * FROM gam ORDER BY name').all());
});

router.post('/', (req, res) => {
  const db = getDb(req);
  const { name, designation, email, phone, region } = req.body;
  if (!name) return res.status(400).json({ error: 'name required' });
  const result = db.prepare(
    'INSERT INTO gam (name, designation, email, phone, region) VALUES (?, ?, ?, ?, ?)'
  ).run(name, designation || '', email || '', phone || '', region || '');
  res.json(db.prepare('SELECT * FROM gam WHERE id = ?').get(result.lastInsertRowid));
});

router.put('/:id', (req, res) => {
  const db = getDb(req);
  const { name, designation, email, phone, region } = req.body;
  db.prepare(`
    UPDATE gam SET
      name = COALESCE(?, name),
      designation = COALESCE(?, designation),
      email = COALESCE(?, email),
      phone = COALESCE(?, phone),
      region = COALESCE(?, region),
      updated_at = datetime('now')
    WHERE id = ?
  `).run(name, designation, email, phone, region, req.params.id);
  res.json(db.prepare('SELECT * FROM gam WHERE id = ?').get(req.params.id));
});

router.delete('/:id', (req, res) => {
  getDb(req).prepare('DELETE FROM gam WHERE id = ?').run(req.params.id);
  res.json({ ok: true });
});

router.post('/import', (req, res) => {
  const db = getDb(req);
  const { text } = req.body;
  if (!text) return res.status(400).json({ error: 'text required' });

  const lines = text.trim().split('\n').filter(l => l.trim());
  let imported = 0;

  lines.forEach(line => {
    const parts = line.includes('\t')
      ? line.split('\t')
      : line.split(',');
    const [name, designation, email, phone, region] = parts.map(p => p.trim());
    if (!name) return;

    const existing = db.prepare('SELECT id FROM gam WHERE name = ?').get(name);
    if (existing) {
      db.prepare(`
        UPDATE gam SET designation = ?, email = ?, phone = ?, region = ?, updated_at = datetime('now')
        WHERE id = ?
      `).run(designation || '', email || '', phone || '', region || '', existing.id);
    } else {
      db.prepare(
        'INSERT INTO gam (name, designation, email, phone, region) VALUES (?, ?, ?, ?, ?)'
      ).run(name, designation || '', email || '', phone || '', region || '');
    }
    imported++;
  });

  res.json({ ok: true, imported });
});

module.exports = router;
