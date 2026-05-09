const Database = require('better-sqlite3');
const path = require('path');

const DB_PATH = process.env.DB_PATH || './data/presales.db';

function initDb() {
  const db = new Database(path.resolve(DB_PATH));
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  db.exec(`
    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      date_modified TEXT DEFAULT (date('now')),
      client_name TEXT NOT NULL,
      presales_update TEXT DEFAULT '',
      account_manager TEXT DEFAULT '',
      engagement_type TEXT DEFAULT '',
      proposal_shared INTEGER DEFAULT 0,
      acv_cr REAL DEFAULT 0,
      stage TEXT DEFAULT 'Cold',
      client_side_updates TEXT DEFAULT '',
      date_updated TEXT,
      created_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gam (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      designation TEXT DEFAULT '',
      email TEXT DEFAULT '',
      phone TEXT DEFAULT '',
      region TEXT DEFAULT '',
      updated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS proposals (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER REFERENCES opportunities(id),
      proposal_number TEXT UNIQUE NOT NULL,
      proposal_type TEXT NOT NULL,
      tier TEXT DEFAULT '',
      client_name TEXT NOT NULL,
      executive_summary TEXT DEFAULT '',
      incident_description TEXT DEFAULT '',
      billing_contact_id INTEGER REFERENCES gam(id),
      docx_filename TEXT DEFAULT '',
      generated_at TEXT DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS proposal_sequence (
      type TEXT NOT NULL,
      year INTEGER NOT NULL,
      last_seq INTEGER DEFAULT 0,
      PRIMARY KEY (type, year)
    );

    CREATE TABLE IF NOT EXISTS update_log (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      opportunity_id INTEGER REFERENCES opportunities(id),
      update_text TEXT NOT NULL,
      logged_at TEXT DEFAULT (datetime('now'))
    );
  `);

  seedGam(db);
  seedOpportunities(db);

  return db;
}

function seedGam(db) {
  const count = db.prepare('SELECT COUNT(*) as c FROM gam').get().c;
  if (count > 0) return;

  const insert = db.prepare(
    'INSERT INTO gam (name, designation, email, phone, region) VALUES (?, ?, ?, ?, ?)'
  );
  const gams = [
    ['Vijay Ranga Babu', 'Account Manager', 'vijay.rb@company.com', '+91 98765 43210', 'India'],
    ['Himanshu Chouhan', 'Account Manager', 'himanshu.c@company.com', '+91 87654 32109', 'MEE'],
    ['Abhijeet Singh', 'Director - Sales', 'abhijeet.s@company.com', '+91 99000 62038', 'India'],
    ['Mukesh H Khanwani', 'Account Manager', 'mukesh.k@company.com', '+91 76543 21098', 'SEA'],
    ['Prathima K J', 'Account Manager', 'prathima.kj@company.com', '+91 65432 10987', 'MEE'],
  ];
  gams.forEach(g => insert.run(...g));
}

function seedOpportunities(db) {
  const count = db.prepare('SELECT COUNT(*) as c FROM opportunities').get().c;
  if (count > 0) return;

  const insert = db.prepare(`
    INSERT INTO opportunities (client_name, engagement_type, stage, account_manager, acv_cr, proposal_shared, presales_update, client_side_updates, date_updated)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, date('now'))
  `);

  const opps = [
    ['Regional Bank A', 'IFI', 'Hot', 'Vijay Ranga Babu', 0.45, 1, 'Proposal submitted, awaiting review.', 'Client reviewing internally.'],
    ['Insurance Co B', 'Retainer', 'Warm', 'Himanshu Chouhan', 1.2, 1, 'Proposal shared, follow-up scheduled.', 'Budget approval pending.'],
    ['Fintech Corp C', 'CA', 'Cold', 'Mukesh H Khanwani', 0, 0, 'Initial discovery call done.', ''],
    ['Payments Ltd D', 'BAS', 'Won', 'Abhijeet Singh', 0.8, 1, 'PO received.', 'Contract signed.'],
    ['Gulf Bank E', 'PFI', 'Hot', 'Prathima K J', 0.3, 1, 'Scoping call completed.', 'Awaiting legal sign-off.'],
    ['Telecom Group F', 'IFI', 'Warm', 'Vijay Ranga Babu', 0.6, 0, 'RFP received, working on response.', 'Procurement involved.'],
    ['NBFCorp G', 'ATM', 'Cold', 'Himanshu Chouhan', 0, 0, 'Lead from conference, yet to qualify.', ''],
    ['Retail Chain H', 'BAS', 'Warm', 'Mukesh H Khanwani', 0.5, 1, 'Demo completed successfully.', 'Technical evaluation in progress.'],
    ['HealthTech I', 'Retainer', 'Lost', 'Abhijeet Singh', 0, 0, 'Lost to competitor on price.', 'Went with cheaper vendor.'],
    ['Logistics Ltd J', 'CA', 'Hot', 'Prathima K J', 0.35, 1, 'Verbal yes from CISO.', 'Paper work in progress.'],
  ];
  opps.forEach(o => insert.run(...o));
}

module.exports = { initDb };
