const express = require('express');
const XLSX = require('xlsx');
const router = express.Router();

function getDb(req) { return req.app.locals.db; }

router.post('/export', (req, res) => {
  const db = getDb(req);
  const { format = 'excel', stage, type, am, dateFrom, dateTo, columns } = req.body;

  let sql = 'SELECT * FROM opportunities WHERE 1=1';
  const params = [];

  if (stage?.length) { sql += ` AND stage IN (${stage.map(() => '?').join(',')})`;  params.push(...stage); }
  if (type?.length) { sql += ` AND engagement_type IN (${type.map(() => '?').join(',')})`;  params.push(...type); }
  if (am) { sql += ' AND account_manager = ?'; params.push(am); }
  if (dateFrom) { sql += ' AND date_modified >= ?'; params.push(dateFrom); }
  if (dateTo) { sql += ' AND date_modified <= ?'; params.push(dateTo); }

  const opps = db.prepare(sql + ' ORDER BY date_modified DESC').all(...params);

  const COL_HEADERS = {
    date_modified: 'Date Modified',
    client_name: 'Client Name',
    presales_update: 'Pre-Sales Update',
    account_manager: 'Account Manager',
    engagement_type: 'Engagement Type',
    proposal_shared: 'Proposal Shared',
    acv_cr: 'ACV (Cr)',
    stage: 'Stage',
    client_side_updates: 'Client Side Updates',
    date_updated: 'Date Updated',
  };

  const selectedCols = columns?.length ? columns : Object.keys(COL_HEADERS);
  const rows = opps.map(o => {
    const row = {};
    selectedCols.forEach(col => {
      const header = COL_HEADERS[col] || col;
      let val = o[col];
      if (col === 'proposal_shared') val = val ? 'Yes' : 'No';
      if (col === 'acv_cr') val = val ? `₹${val} Cr` : '₹0';
      row[header] = val ?? '';
    });
    return row;
  });

  const summaryByStage = db.prepare(`
    SELECT stage, COUNT(*) as count, SUM(acv_cr) as total_acv FROM opportunities GROUP BY stage
  `).all();
  const summaryByType = db.prepare(`
    SELECT engagement_type, COUNT(*) as count FROM opportunities GROUP BY engagement_type
  `).all();
  const summaryByAM = db.prepare(`
    SELECT account_manager, COUNT(*) as count FROM opportunities GROUP BY account_manager
  `).all();

  if (format === 'csv') {
    const ws = XLSX.utils.json_to_sheet(rows);
    const csv = XLSX.utils.sheet_to_csv(ws);
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename="opportunities.csv"');
    return res.send(csv);
  }

  const wb = XLSX.utils.book_new();
  const ws1 = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws1, 'Opportunities');

  const summaryRows = [
    { Category: 'By Stage', Name: '', Count: '', ACV: '' },
    ...summaryByStage.map(r => ({ Category: '', Name: r.stage, Count: r.count, ACV: r.total_acv?.toFixed(2) || '0' })),
    { Category: 'By Engagement Type', Name: '', Count: '', ACV: '' },
    ...summaryByType.map(r => ({ Category: '', Name: r.engagement_type, Count: r.count, ACV: '' })),
    { Category: 'By Account Manager', Name: '', Count: '', ACV: '' },
    ...summaryByAM.map(r => ({ Category: '', Name: r.account_manager, Count: r.count, ACV: '' })),
  ];
  const ws2 = XLSX.utils.json_to_sheet(summaryRows);
  XLSX.utils.book_append_sheet(wb, ws2, 'Summary');

  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.setHeader('Content-Disposition', 'attachment; filename="presales-report.xlsx"');
  res.send(buf);
});

module.exports = router;
