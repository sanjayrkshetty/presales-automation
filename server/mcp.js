#!/usr/bin/env node
/**
 * presales-automation MCP Server
 * Exposes the DFIR pre-sales pipeline to Claude Desktop / Cursor / any MCP client.
 *
 * Usage (add to claude_desktop_config.json):
 *   {
 *     "mcpServers": {
 *       "presales": {
 *         "command": "node",
 *         "args": ["C:/Users/sanja/Documents/presales-automation/server/mcp.js"],
 *         "env": {
 *           "DB_PATH": "C:/Users/sanja/Documents/presales-automation/server/data/presales.db",
 *           "APIFY_API_TOKEN": "apify_api_..."
 *         }
 *       }
 *     }
 *   }
 */

const { McpServer } = require('@modelcontextprotocol/sdk/server/mcp.js');
const { StdioServerTransport } = require('@modelcontextprotocol/sdk/server/stdio.js');
const { z } = require('zod');
const { initDb } = require('./db/database');

const db = initDb();
const server = new McpServer({
  name: 'presales-automation',
  version: '1.0.0',
});

// ─── Tool: get_opportunities ──────────────────────────────────────────────────
server.tool(
  'get_opportunities',
  'List opportunities from the pre-sales pipeline with optional filters.',
  {
    stage:    z.enum(['Hot','Warm','Cold','Won','Lost']).optional().describe('Filter by stage'),
    type:     z.string().optional().describe('Filter by engagement type (IFI, Retainer, BAS, CA, PFI, ATM)'),
    am:       z.string().optional().describe('Filter by account manager name'),
    q:        z.string().optional().describe('Search client name (partial match)'),
    limit:    z.number().int().min(1).max(100).default(20).describe('Max results'),
  },
  ({ stage, type, am, q, limit }) => {
    let sql = 'SELECT * FROM opportunities WHERE 1=1';
    const params = [];
    if (stage) { sql += ' AND stage = ?'; params.push(stage); }
    if (type)  { sql += ' AND engagement_type = ?'; params.push(type); }
    if (am)    { sql += ' AND account_manager LIKE ?'; params.push(`%${am}%`); }
    if (q)     { sql += ' AND client_name LIKE ?'; params.push(`%${q}%`); }
    sql += ' ORDER BY date_modified DESC LIMIT ?';
    params.push(limit);

    const rows = db.prepare(sql).all(...params);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(rows, null, 2),
      }],
    };
  }
);

// ─── Tool: get_pipeline_summary ───────────────────────────────────────────────
server.tool(
  'get_pipeline_summary',
  'Get pipeline KPIs: deal counts by stage, total ACV, proposal conversion rate.',
  {},
  () => {
    const byStage = db.prepare(`
      SELECT stage,
             COUNT(*) as count,
             ROUND(SUM(acv_cr), 2) as total_acv,
             SUM(proposal_shared) as proposals_shared
      FROM opportunities
      GROUP BY stage
      ORDER BY CASE stage WHEN 'Hot' THEN 1 WHEN 'Warm' THEN 2 WHEN 'Cold' THEN 3 WHEN 'Won' THEN 4 ELSE 5 END
    `).all();

    const totals = db.prepare(`
      SELECT COUNT(*) as total_deals,
             ROUND(SUM(acv_cr), 2) as total_pipeline_cr,
             ROUND(SUM(CASE WHEN stage='Won' THEN acv_cr ELSE 0 END), 2) as won_acv,
             COUNT(DISTINCT account_manager) as active_ams,
             SUM(proposal_shared) as total_proposals_shared
      FROM opportunities
    `).get();

    const byType = db.prepare(`
      SELECT engagement_type, COUNT(*) as count, ROUND(SUM(acv_cr),2) as acv
      FROM opportunities WHERE stage NOT IN ('Lost')
      GROUP BY engagement_type ORDER BY count DESC
    `).all();

    return {
      content: [{
        type: 'text',
        text: JSON.stringify({ by_stage: byStage, totals, by_type: byType }, null, 2),
      }],
    };
  }
);

// ─── Tool: create_opportunity ─────────────────────────────────────────────────
server.tool(
  'create_opportunity',
  'Add a new opportunity to the pipeline.',
  {
    client_name:      z.string().min(1).max(200).describe('Client/prospect name'),
    engagement_type:  z.enum(['IFI','Retainer','CA','BAS','PFI','ATM','Deep and Dark Web','Other']).describe('Service type'),
    stage:            z.enum(['Hot','Warm','Cold','Won','Lost']).default('Cold'),
    account_manager:  z.string().optional().describe('AM name'),
    acv_cr:           z.number().min(0).optional().describe('Deal value in crore (INR)'),
    presales_update:  z.string().max(1000).optional().describe('Initial pre-sales notes'),
  },
  ({ client_name, engagement_type, stage, account_manager, acv_cr, presales_update }) => {
    const result = db.prepare(`
      INSERT INTO opportunities (client_name, engagement_type, stage, account_manager,
        acv_cr, presales_update, date_updated, date_modified)
      VALUES (?, ?, ?, ?, ?, ?, date('now'), date('now'))
    `).run(client_name, engagement_type, stage, account_manager ?? '',
           acv_cr ?? 0, presales_update ?? '');

    const created = db.prepare('SELECT * FROM opportunities WHERE id = ?').get(result.lastInsertRowid);
    return {
      content: [{
        type: 'text',
        text: JSON.stringify(created, null, 2),
      }],
    };
  }
);

// ─── Tool: get_gam_contacts ───────────────────────────────────────────────────
server.tool(
  'get_gam_contacts',
  'List all Global Account Manager contacts.',
  {
    region: z.string().optional().describe('Filter by region (India, MEE, SEA)'),
  },
  ({ region }) => {
    let sql = 'SELECT * FROM gam WHERE 1=1';
    const params = [];
    if (region) { sql += ' AND region = ?'; params.push(region); }
    sql += ' ORDER BY name';

    return {
      content: [{
        type: 'text',
        text: JSON.stringify(db.prepare(sql).all(...params), null, 2),
      }],
    };
  }
);

// ─── Tool: get_stale_deals ────────────────────────────────────────────────────
server.tool(
  'get_stale_deals',
  'Find Hot/Warm deals not updated in N days — useful for chase-up prioritisation.',
  {
    days: z.number().int().min(1).default(7).describe('Days since last update'),
  },
  ({ days }) => {
    const rows = db.prepare(`
      SELECT *, CAST(julianday('now') - julianday(date_updated) AS INTEGER) as days_stale
      FROM opportunities
      WHERE stage IN ('Hot','Warm')
        AND julianday('now') - julianday(date_updated) >= ?
      ORDER BY days_stale DESC
    `).all(days);

    return {
      content: [{
        type: 'text',
        text: rows.length
          ? JSON.stringify(rows, null, 2)
          : `No Hot/Warm deals stale for ${days}+ days.`,
      }],
    };
  }
);

// ─── Tool: prospect_research (Apify) ─────────────────────────────────────────
// Uses Apify Website Content Crawler to pull public intelligence on a prospect.
// Free tier: $5/month credit (~100 actor runs). Get token: https://console.apify.com
server.tool(
  'prospect_research',
  'Scrape public intelligence on a prospect company using Apify Website Content Crawler. Returns homepage content, recent news, and company overview for pre-sales scoping.',
  {
    url:         z.string().url().describe('Company website URL (e.g. https://acme.com)'),
    max_pages:   z.number().int().min(1).max(10).default(3).describe('Pages to crawl (keep low to save credits)'),
  },
  async ({ url, max_pages }) => {
    const token = process.env.APIFY_API_TOKEN;
    if (!token) {
      return {
        content: [{ type: 'text', text: 'APIFY_API_TOKEN not set. Get a free token at https://console.apify.com and add it to your MCP env config.' }],
      };
    }

    try {
      // Start the actor run
      const startRes = await fetch(
        `https://api.apify.com/v2/acts/apify~website-content-crawler/runs?token=${token}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            startUrls: [{ url }],
            maxCrawlPages: max_pages,
            maxCrawlDepth: 1,
            outputFormats: ['markdown'],
          }),
        }
      );

      if (!startRes.ok) {
        const err = await startRes.text();
        return { content: [{ type: 'text', text: `Apify error: ${err}` }] };
      }

      const { data: run } = await startRes.json();
      const runId = run.id;

      // Poll until finished (max 60s)
      let status = run.status;
      let attempts = 0;
      while (!['SUCCEEDED', 'FAILED', 'ABORTED'].includes(status) && attempts < 12) {
        await new Promise(r => setTimeout(r, 5000));
        const pollRes = await fetch(`https://api.apify.com/v2/actor-runs/${runId}?token=${token}`);
        const { data } = await pollRes.json();
        status = data.status;
        attempts++;
      }

      if (status !== 'SUCCEEDED') {
        return { content: [{ type: 'text', text: `Actor run ${status} after ${attempts * 5}s.` }] };
      }

      // Fetch dataset items
      const dataRes = await fetch(
        `https://api.apify.com/v2/actor-runs/${runId}/dataset/items?token=${token}&format=json&limit=${max_pages}`
      );
      const items = await dataRes.json();

      const summary = items.map((item, i) => [
        `## Page ${i + 1}: ${item.url}`,
        item.markdown?.slice(0, 1500) ?? item.text?.slice(0, 1500) ?? '(no content)',
      ].join('\n')).join('\n\n---\n\n');

      return {
        content: [{
          type: 'text',
          text: `# Prospect Research: ${url}\nCrawled ${items.length} page(s)\n\n${summary}`,
        }],
      };
    } catch (err) {
      return { content: [{ type: 'text', text: `Research failed: ${err.message}` }] };
    }
  }
);

// ─── Start server ─────────────────────────────────────────────────────────────
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  process.stderr.write('presales-automation MCP server running\n');
}

main().catch((err) => {
  process.stderr.write(`MCP server error: ${err.message}\n`);
  process.exit(1);
});
