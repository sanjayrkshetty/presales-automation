# Pre-Sales Automation System v3

Full-stack pre-sales pipeline tracker and DOCX proposal generator for SISA DFIR.

## Stack

- **Frontend**: React + Vite + TailwindCSS + Recharts
- **Backend**: Node.js + Express
- **Database**: SQLite (better-sqlite3) — seeded with 5 GAM contacts and 10 sample opportunities
- **AI**: Anthropic Claude API (`claude-sonnet-4-20250514`)
- **DOCX generation**: `docx` npm package
- **Excel I/O**: `xlsx` npm package

## Setup

### 1. Clone and install

```bash
git clone <repo-url>
cd presales-automation
npm install
cd server && npm install
cd ../client && npm install
```

### 2. Configure environment

```bash
cp .env.example server/.env
# Edit server/.env — add your ANTHROPIC_API_KEY
```

`.env` lives inside `server/`. Variables:

```
ANTHROPIC_API_KEY=sk-ant-...
PORT=3001
DB_PATH=./data/presales.db
GENERATED_DIR=./generated
```

### 3. Run dev servers

From project root:

```bash
npm run dev
```

- Frontend: http://localhost:5173
- Backend API: http://localhost:3001

## Features

### Opportunities
- 10-column table with column toggle (state persisted in localStorage)
- Inline editable cells (stage, type, ACV, pre-sales update, client side updates)
- Filters: stage (multi), engagement type (multi), AM, proposal shared, search
- Bulk actions: stage update, mark proposal shared
- Import from Excel (headers: `Client Name`, `Pre-Sales Update`, `Account Manager`, `Engagement Type`, `Proposal Shared`, `ACV (Cr)`, `Stage`, `Client Side Updates`)

### AI Follow-up
- Per-opportunity: "Suggest Follow-up" button generates a Teams message
- "Chase All Stale" generates batch messages for all stale deals (Hot 7d+, Warm 14d+, Cold 21d+)

### Proposal Generation Wizard
- 4-step wizard: Type → Tier (Retainer only) → Details → Preview/Download
- Proposal number auto-generated: `SISA/DFIR/[TYPE]/[YEAR]/[SEQ]`
- AI generates executive summary and incident scope
- Downloads fully populated DOCX

### DOCX Templates
- **IFI**: 12 sections, AI-generated objectives/scope/challenges, SPOC table, commercials
- **Retainer**: 18 sections, tier comparison table (selected tier highlighted), SLA table
- **BAS**: 9 sections, AI-generated BAS scope

### GAM Contacts
- CRUD table for account managers / billing contacts
- Bulk import via CSV/tab-separated text (upsert by name)

### Dashboard
- 4 metric cards: total opps, total ACV, hot pipeline ACV, won this month
- ACV by engagement type (horizontal bar chart)
- Stage distribution (donut chart)
- Stale opportunities table

### Reports
- Export to Excel or CSV
- Filters: date range, stage, engagement type
- Column selector
- Excel export includes Summary sheet (by stage, type, AM)

## Excel Import Format

Sheet headers (exact match required):

| Client Name | Pre-Sales Update | Account Manager | Engagement Type | Proposal Shared | ACV (Cr) | Stage | Client Side Updates |
|---|---|---|---|---|---|---|---|
