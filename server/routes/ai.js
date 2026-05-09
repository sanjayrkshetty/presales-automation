const express = require('express');
const router = express.Router();
const claude = require('../services/claudeService');

function aiError(err) {
  if (err.message?.includes('credit balance')) return 'AI unavailable: insufficient Anthropic credits. Add credits at console.anthropic.com.';
  return err.message;
}

router.post('/followup', async (req, res) => {
  try {
    const { engagement_type, stage, days_since_update, client_side_updates } = req.body;
    const message = await claude.generateFollowUp({ engagement_type, stage, days_since_update, client_side_updates });
    res.json({ message });
  } catch (err) {
    res.json({ message: null, error: aiError(err) });
  }
});

router.post('/executive-summary', async (req, res) => {
  try {
    const { engagement_type, tier, context } = req.body;
    const summary = await claude.generateExecutiveSummary({ engagement_type, tier, context });
    res.json({ summary });
  } catch (err) {
    res.json({ summary: null, error: aiError(err) });
  }
});

router.post('/incident-scope', async (req, res) => {
  try {
    const { incident_description } = req.body;
    const result = await claude.generateIncidentScope(incident_description);
    res.json(result);
  } catch (err) {
    res.json({ objectives: [], scope: [], error: aiError(err) });
  }
});

router.post('/chase-stale', async (req, res) => {
  try {
    const db = req.app.locals.db;
    const opps = db.prepare(`
      SELECT * FROM opportunities
      WHERE stage NOT IN ('Won', 'Lost')
      AND (
        (stage = 'Hot' AND (julianday('now') - julianday(COALESCE(date_updated, created_at))) >= 7)
        OR (stage = 'Warm' AND (julianday('now') - julianday(COALESCE(date_updated, created_at))) >= 14)
        OR (stage = 'Cold' AND (julianday('now') - julianday(COALESCE(date_updated, created_at))) >= 21)
      )
    `).all();

    const results = await Promise.all(opps.map(async opp => {
      const days = Math.floor(
        (Date.now() - new Date(opp.date_updated || opp.created_at).getTime()) / 86400000
      );
      let message = null;
      let error = null;
      try {
        message = await claude.generateFollowUp({
          engagement_type: opp.engagement_type,
          stage: opp.stage,
          days_since_update: days,
          client_side_updates: opp.client_side_updates,
        });
      } catch (err) {
        error = aiError(err);
      }
      return { opportunity: opp, message, error, days };
    }));

    res.json(results);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
