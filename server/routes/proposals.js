const express = require('express');
const path = require('path');
const fs = require('fs');
const router = express.Router();
const { getNextProposalNumber } = require('../services/proposalNumber');
const { generateIFI, generateRetainer, generateBAS } = require('../services/docxGenerator');
const claude = require('../services/claudeService');

function getDb(req) { return req.app.locals.db; }

const GENERATED_DIR = process.env.GENERATED_DIR || './generated';

router.get('/', (req, res) => {
  const db = getDb(req);
  const proposals = db.prepare(`
    SELECT p.*, g.name as billing_name, g.designation as billing_designation,
           g.email as billing_email, g.phone as billing_phone
    FROM proposals p
    LEFT JOIN gam g ON p.billing_contact_id = g.id
    ORDER BY p.generated_at DESC
  `).all();
  res.json(proposals);
});

const VALID_PROPOSAL_TYPES = ['IFI', 'Retainer', 'BAS', 'CA', 'PFI', 'ATM', 'Deep and Dark Web', 'Other'];
const VALID_TIERS = ['Essential', 'Enterprise', 'Elite', ''];

router.post('/generate', async (req, res) => {
  try {
    const db = getDb(req);
    const {
      opportunity_id, proposal_type, tier, client_name,
      executive_summary, incident_description, billing_contact_id,
    } = req.body;

    if (!client_name || typeof client_name !== 'string' || !client_name.trim())
      return res.status(400).json({ error: 'client_name required' });
    if (!proposal_type || !VALID_PROPOSAL_TYPES.includes(proposal_type))
      return res.status(400).json({ error: `proposal_type must be one of: ${VALID_PROPOSAL_TYPES.join(', ')}` });
    if (tier && !VALID_TIERS.includes(tier))
      return res.status(400).json({ error: `tier must be one of: Essential, Enterprise, Elite` });
    if (client_name.length > 200)
      return res.status(400).json({ error: 'client_name too long (max 200 chars)' });
    if (executive_summary && executive_summary.length > 5000)
      return res.status(400).json({ error: 'executive_summary too long (max 5000 chars)' });

    const proposal_number = getNextProposalNumber(db, proposal_type);

    const billingContact = billing_contact_id
      ? db.prepare('SELECT * FROM gam WHERE id = ?').get(billing_contact_id)
      : null;

    let buffer;

    if (proposal_type === 'IFI' || proposal_type === 'CA' || proposal_type === 'PFI') {
      let objectives = [], scope = [], challenges = [];
      if (incident_description) {
        try {
          const scopeData = await claude.generateIncidentScope(incident_description);
          objectives = scopeData.objectives || [];
          scope = scopeData.scope || [];
          challenges = await claude.generateChallenges(incident_description);
        } catch (e) {
          console.warn('AI scope generation failed, using empty:', e.message);
        }
      }
      buffer = await generateIFI({
        client_name, proposal_number, executive_summary, incident_description,
        billing_contact: billingContact, objectives, scope, challenges,
      });
    } else if (proposal_type === 'Retainer') {
      buffer = await generateRetainer({
        client_name, proposal_number, executive_summary,
        billing_contact: billingContact, tier,
      });
    } else if (proposal_type === 'BAS') {
      let scope_areas = [];
      const context = incident_description || executive_summary;
      if (context) {
        try {
          const basScope = await claude.generateBASScope(context);
          scope_areas = basScope.scope_areas || [];
        } catch (e) {
          console.warn('BAS scope generation failed:', e.message);
        }
      }
      buffer = await generateBAS({
        client_name, proposal_number, executive_summary,
        billing_contact: billingContact, scope_areas,
      });
    } else {
      buffer = await generateIFI({
        client_name, proposal_number, executive_summary, incident_description,
        billing_contact: billingContact, objectives: [], scope: [], challenges: [],
      });
    }

    const safeNum = proposal_number.replace(/\//g, '_');
    const filename = `${safeNum}.docx`;
    const filepath = path.resolve(GENERATED_DIR, filename);
    fs.writeFileSync(filepath, buffer);

    const result = db.prepare(`
      INSERT INTO proposals
        (opportunity_id, proposal_number, proposal_type, tier, client_name,
         executive_summary, incident_description, billing_contact_id, docx_filename)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      opportunity_id || null, proposal_number, proposal_type, tier || '',
      client_name, executive_summary || '', incident_description || '',
      billing_contact_id || null, filename
    );

    res.json({
      proposal_id: result.lastInsertRowid,
      proposal_number,
      download_url: `/generated/${filename}`,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id/download', (req, res) => {
  const db = getDb(req);
  const proposal = db.prepare('SELECT * FROM proposals WHERE id = ?').get(req.params.id);
  if (!proposal) return res.status(404).json({ error: 'Not found' });

  const filepath = path.resolve(GENERATED_DIR, proposal.docx_filename);
  if (!fs.existsSync(filepath)) return res.status(404).json({ error: 'File not found' });

  res.download(filepath, proposal.docx_filename);
});

module.exports = router;
