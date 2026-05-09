const TYPE_MAP = {
  'IFI': 'IFI',
  'Retainer': 'RET',
  'BAS': 'BAS',
  'CA': 'CA',
  'PFI': 'PFI',
  'ATM': 'ATM',
  'Deep and Dark Web': 'DDW',
};

function getNextProposalNumber(db, engagementType) {
  const code = TYPE_MAP[engagementType] || 'GEN';
  const year = new Date().getFullYear();

  const row = db.prepare(
    'SELECT last_seq FROM proposal_sequence WHERE type = ? AND year = ?'
  ).get(code, year);

  const next = (row?.last_seq ?? 0) + 1;

  db.prepare(
    'INSERT OR REPLACE INTO proposal_sequence (type, year, last_seq) VALUES (?, ?, ?)'
  ).run(code, year, next);

  return `SISA/DFIR/${code}/${year}/${String(next).padStart(3, '0')}`;
}

module.exports = { getNextProposalNumber };
