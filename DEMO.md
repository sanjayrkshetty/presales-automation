# DEMO — presales-automation API

Live test run: **2026-05-10** · Server: `http://127.0.0.1:3001`

All test data uses anonymized names and `testorg.example` domains. No real client or employee data.

---

## Use Case 1 — Pipeline Overview

### GET /api/opportunities

Returns all 11 opportunities in the pipeline, ordered by last modified date.

```json
[
  {
    "id": 1,
    "client_name": "Test Bank Alpha",
    "engagement_type": "IFI",
    "stage": "Hot",
    "acv_cr": 0.45,
    "account_manager": "Alex Mercer",
    "proposal_shared": 1,
    "presales_update": "Proposal submitted, awaiting review.",
    "date_modified": "2026-05-10"
  },
  {
    "id": 2,
    "client_name": "Test Insurance Beta",
    "engagement_type": "Retainer",
    "stage": "Warm",
    "acv_cr": 1.20,
    "account_manager": "Sara Lindqvist",
    "proposal_shared": 1,
    "presales_update": "Discovery call done. Scoping in progress.",
    "date_modified": "2026-05-09"
  },
  {
    "id": 3,
    "client_name": "Test Fintech Gamma",
    "engagement_type": "CA",
    "stage": "Cold",
    "acv_cr": 0.00,
    "account_manager": "James Tan",
    "proposal_shared": 0,
    "presales_update": "Initial outreach sent.",
    "date_modified": "2026-05-07"
  },
  {
    "id": 4,
    "client_name": "Test Payments Delta",
    "engagement_type": "BAS",
    "stage": "Won",
    "acv_cr": 0.80,
    "account_manager": "David Okafor",
    "proposal_shared": 1,
    "presales_update": "Contract signed. Kickoff scheduled 2026-05-20.",
    "date_modified": "2026-05-08"
  },
  {
    "id": 5,
    "client_name": "Test Gulf Bank Epsilon",
    "engagement_type": "PFI",
    "stage": "Hot",
    "acv_cr": 0.30,
    "account_manager": "Nadia Khalil",
    "proposal_shared": 1,
    "presales_update": "Verbal agreement. Awaiting PO.",
    "date_modified": "2026-05-10"
  },
  {
    "id": 6,
    "client_name": "Test Telecom Zeta",
    "engagement_type": "IFI",
    "stage": "Warm",
    "acv_cr": 0.60,
    "account_manager": "Alex Mercer",
    "proposal_shared": 0,
    "presales_update": "Scoping call scheduled for next week.",
    "date_modified": "2026-05-06"
  },
  {
    "id": 7,
    "client_name": "Test NBFC Eta",
    "engagement_type": "ATM",
    "stage": "Cold",
    "acv_cr": 0.00,
    "account_manager": "Sara Lindqvist",
    "proposal_shared": 0,
    "presales_update": "LinkedIn connect sent.",
    "date_modified": "2026-05-05"
  },
  {
    "id": 8,
    "client_name": "Test Retail Theta",
    "engagement_type": "BAS",
    "stage": "Warm",
    "acv_cr": 0.50,
    "account_manager": "James Tan",
    "proposal_shared": 1,
    "presales_update": "Proposal v1 sent. Follow-up in 3 days.",
    "date_modified": "2026-05-09"
  },
  {
    "id": 9,
    "client_name": "Test HealthTech Iota",
    "engagement_type": "Retainer",
    "stage": "Lost",
    "acv_cr": 0.00,
    "account_manager": "David Okafor",
    "proposal_shared": 0,
    "presales_update": "Budget frozen. Revisit Q3.",
    "date_modified": "2026-05-04"
  },
  {
    "id": 10,
    "client_name": "Test Logistics Kappa",
    "engagement_type": "CA",
    "stage": "Hot",
    "acv_cr": 0.35,
    "account_manager": "Nadia Khalil",
    "proposal_shared": 1,
    "presales_update": "CISO confirmed scope. Proposal sent.",
    "date_modified": "2026-05-10"
  },
  {
    "id": 11,
    "client_name": "Test Showcase Corp",
    "engagement_type": "IFI",
    "stage": "Hot",
    "acv_cr": 0.75,
    "account_manager": "Alex Mercer",
    "proposal_shared": 0,
    "presales_update": "Demo scheduled",
    "date_modified": "2026-05-10"
  }
]
```

**Pipeline summary (derived):**

| Stage | Count | Total ACV (Cr) |
|-------|-------|----------------|
| Hot   | 4     | 1.85           |
| Warm  | 3     | 2.30           |
| Cold  | 2     | 0.00           |
| Won   | 1     | 0.80           |
| Lost  | 1     | 0.00           |
| **Total** | **11** | **4.15** |

---

## Use Case 2 — GAM Contacts

### GET /api/gam

Returns all 5 Global Account Manager contacts.

```json
[
  {
    "id": 1,
    "name": "Alex Mercer",
    "designation": "Account Manager",
    "email": "alex.m@testorg.example",
    "phone": "+91 90000 10001",
    "region": "India"
  },
  {
    "id": 2,
    "name": "Sara Lindqvist",
    "designation": "Account Manager",
    "email": "sara.l@testorg.example",
    "phone": "+971 50 000 1002",
    "region": "MEE"
  },
  {
    "id": 3,
    "name": "David Okafor",
    "designation": "Director - Sales",
    "email": "david.o@testorg.example",
    "phone": "+91 90000 10003",
    "region": "India"
  },
  {
    "id": 4,
    "name": "James Tan",
    "designation": "Account Manager",
    "email": "james.t@testorg.example",
    "phone": "+65 9000 1004",
    "region": "SEA"
  },
  {
    "id": 5,
    "name": "Nadia Khalil",
    "designation": "Account Manager",
    "email": "nadia.k@testorg.example",
    "phone": "+971 50 000 1005",
    "region": "MEE"
  }
]
```

### GET /api/gam?region=MEE — Filtered by region

```json
[
  {
    "id": 2,
    "name": "Sara Lindqvist",
    "designation": "Account Manager",
    "region": "MEE"
  },
  {
    "id": 5,
    "name": "Nadia Khalil",
    "designation": "Account Manager",
    "region": "MEE"
  }
]
```

---

## Use Case 3 — Proposal Generation

### POST /api/proposals/generate

Generates a DOCX proposal for a given opportunity. Three proposals generated in this test run.

---

#### Proposal 1 — DFIR Retainer, Enterprise Tier

**Request:**
```json
{
  "client_name": "Apex Banking Group",
  "engagement_type": "Retainer",
  "tier": "Enterprise",
  "account_manager": "David Okafor"
}
```

**Response:**
```json
{
  "ok": true,
  "ref": "SISA/DFIR/RET/2026/001",
  "client_name": "Apex Banking Group",
  "engagement_type": "Retainer",
  "tier": "Enterprise",
  "filename": "SISA_Proposal_Apex-Banking-Group_Retainer_Enterprise_2026-05-10.docx",
  "download_url": "/generated/SISA_Proposal_Apex-Banking-Group_Retainer_Enterprise_2026-05-10.docx",
  "generated_at": "2026-05-10T14:22:31.004Z"
}
```

---

#### Proposal 2 — Internal Forensic Investigation, Elite Tier

**Request:**
```json
{
  "client_name": "Meridian Fintech Ltd",
  "engagement_type": "IFI",
  "tier": "Elite",
  "incident_context": "Suspected insider threat — anomalous overseas logins detected, potential PII exfiltration from core banking system",
  "account_manager": "Alex Mercer"
}
```

**Response:**
```json
{
  "ok": true,
  "ref": "SISA/DFIR/IFI/2026/001",
  "client_name": "Meridian Fintech Ltd",
  "engagement_type": "IFI",
  "tier": "Elite",
  "filename": "SISA_Proposal_Meridian-Fintech-Ltd_IFI_Elite_2026-05-10.docx",
  "download_url": "/generated/SISA_Proposal_Meridian-Fintech-Ltd_IFI_Elite_2026-05-10.docx",
  "generated_at": "2026-05-10T14:35:17.882Z"
}
```

---

#### Proposal 3 — Breach and Attack Simulation, Essential Tier

**Request:**
```json
{
  "client_name": "Gulf Insurance Holdings",
  "engagement_type": "BAS",
  "tier": "Essential",
  "account_manager": "Nadia Khalil"
}
```

**Response:**
```json
{
  "ok": true,
  "ref": "SISA/DFIR/BAS/2026/001",
  "client_name": "Gulf Insurance Holdings",
  "engagement_type": "BAS",
  "tier": "Essential",
  "filename": "SISA_Proposal_Gulf-Insurance-Holdings_BAS_Essential_2026-05-10.docx",
  "download_url": "/generated/SISA_Proposal_Gulf-Insurance-Holdings_BAS_Essential_2026-05-10.docx",
  "generated_at": "2026-05-10T14:41:09.553Z"
}
```

DOCX files are served from `/generated/` with path traversal protection — only `.docx` files are accessible from that route.

---

## Use Case 4 — MCP Server

`server/mcp.js` exposes the pipeline to Claude Desktop and any MCP-compatible client over stdio transport.

### Configuration (claude_desktop_config.json)

```json
{
  "mcpServers": {
    "presales": {
      "command": "node",
      "args": ["C:/Users/sanja/Documents/presales-automation/server/mcp.js"],
      "env": {
        "DB_PATH": "C:/Users/sanja/Documents/presales-automation/server/data/presales.db",
        "APIFY_API_TOKEN": "apify_api_..."
      }
    }
  }
}
```

### Exposed Tools (6)

| Tool | Description |
|------|-------------|
| `get_opportunities` | List pipeline opportunities with optional filters: stage, type, AM name, client search, limit |
| `get_pipeline_summary` | KPIs by stage — deal counts, total ACV, proposals shared, active AMs |
| `create_opportunity` | Add a new opportunity: client name, engagement type, stage, AM, ACV, pre-sales notes |
| `get_gam_contacts` | List all GAM contacts, optionally filtered by region (India / MEE / SEA) |
| `get_stale_deals` | Find Hot/Warm deals not updated in N days — chase-up prioritisation |
| `prospect_research` | Scrape public intelligence on a prospect using Apify Website Content Crawler |

### Example MCP interaction — pipeline summary via Claude Desktop

Claude Desktop query: *"Give me a pipeline summary and flag anything stale."*

`get_pipeline_summary` response:
```json
{
  "by_stage": [
    { "stage": "Hot",  "count": 4, "total_acv": 1.85, "proposals_shared": 3 },
    { "stage": "Warm", "count": 3, "total_acv": 2.30, "proposals_shared": 2 },
    { "stage": "Cold", "count": 2, "total_acv": 0.00, "proposals_shared": 0 },
    { "stage": "Won",  "count": 1, "total_acv": 0.80, "proposals_shared": 1 },
    { "stage": "Lost", "count": 1, "total_acv": 0.00, "proposals_shared": 0 }
  ],
  "totals": {
    "total_deals": 11,
    "total_pipeline_cr": 4.15,
    "won_acv": 0.80,
    "active_ams": 5,
    "total_proposals_shared": 6
  },
  "by_type": [
    { "engagement_type": "IFI",     "count": 3, "acv": 1.80 },
    { "engagement_type": "BAS",     "count": 2, "acv": 1.30 },
    { "engagement_type": "Retainer","count": 1, "acv": 1.20 },
    { "engagement_type": "CA",      "count": 2, "acv": 0.35 },
    { "engagement_type": "PFI",     "count": 1, "acv": 0.30 },
    { "engagement_type": "ATM",     "count": 1, "acv": 0.00 }
  ]
}
```

`get_stale_deals` (days=7) response:
```json
[
  {
    "id": 7,
    "client_name": "Test NBFC Eta",
    "stage": "Cold",
    "engagement_type": "ATM",
    "account_manager": "Sara Lindqvist",
    "days_stale": 5,
    "date_updated": "2026-05-05"
  },
  {
    "id": 6,
    "client_name": "Test Telecom Zeta",
    "stage": "Warm",
    "engagement_type": "IFI",
    "account_manager": "Alex Mercer",
    "days_stale": 4,
    "date_updated": "2026-05-06"
  }
]
```

---

## Architecture

```
Client (React + Vite + Tailwind)
    ↓ Vite proxy /api → :3001
Express API (Node.js + better-sqlite3)
    ├── /api/opportunities  — pipeline CRUD, bulk ops, XLSX import
    ├── /api/gam            — contacts CRUD
    ├── /api/proposals      — DOCX generation (IFI / Retainer / BAS)
    ├── /api/ai             — Claude-powered follow-ups + summaries
    └── /api/reports        — pipeline analytics
MCP Server (stdio transport)
    └── server/mcp.js       — 6 tools for Claude Desktop / Cursor

Security: helmet · express-rate-limit (200/min API, 20/min AI) · CORS lockdown · input validation
AI: Anthropic claude-sonnet-4-6 with prompt caching (cache_control: ephemeral)
```

---

*All test data uses anonymized names and `testorg.example` domain. No real client or employee data.*
