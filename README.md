<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=180&section=header&text=Pre-Sales%20Automation&fontSize=38&fontColor=fff&animation=twinkling&fontAlignY=38&desc=Full-Stack%20DFIR%20Pre-Sales%20Tool%20%7C%20AI%20Proposals%20%7C%20Pipeline%20Tracker&descAlignY=58&descSize=15" />
</p>

<p align="center">
  <a href="https://github.com/sanjayrkshetty"><img src="https://img.shields.io/badge/by-@sanjayrkshetty-7C3AED?style=flat-square&logo=github&logoColor=white" /></a>
  &nbsp;
  <img src="https://img.shields.io/badge/React-61DAFB?style=flat-square&logo=react&logoColor=black" />
  <img src="https://img.shields.io/badge/Express-000000?style=flat-square&logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/SQLite-003B57?style=flat-square&logo=sqlite&logoColor=white" />
  <img src="https://img.shields.io/badge/Anthropic%20Claude-D4A843?style=flat-square" />
</p>

---

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

## Dashboard
- 4 key performance indicator (KPI) cards: total opportunities, total Annual Contract Value (ACV), high-priority pipeline ACV, and won opportunities for the current month
- ACV distribution by engagement type, visualized through a horizontal bar chart
- Opportunity stage distribution, represented as a donut chart
- Table listing stale opportunities, enabling proactive management and mitigation of potential revenue losses
### Reports
- Export to Excel or CSV
- Filters: date range, stage, engagement type
- Column selector
- Excel export includes Summary sheet (by stage, type, AM)

## Excel Import Format

Sheet headers (exact match required):

| Client Name | Pre-Sales Update | Account Manager | Engagement Type | Proposal Shared | ACV (Cr) | Stage | Client Side Updates |
|---|---|---|---|---|---|---|---|

---

<p align="center">
  Part of <a href="https://github.com/sanjayrkshetty"><strong>@sanjayrkshetty</strong></a>'s AI security portfolio
</p>

<p align="center">
  <a href="https://sanjayrkshetty.vercel.app"><img src="https://img.shields.io/badge/Portfolio-Live-00d97e?style=flat-square&logo=vercel&logoColor=white" /></a>
  &nbsp;
  <a href="https://linkedin.com/in/sanjay-r-k-shetty-1048ba245"><img src="https://img.shields.io/badge/LinkedIn-Connect-0077B5?style=flat-square&logo=linkedin&logoColor=white" /></a>
  &nbsp;
  <a href="https://github.com/sanjayrkshetty"><img src="https://img.shields.io/badge/GitHub-@sanjayrkshetty-181717?style=flat-square&logo=github&logoColor=white" /></a>
  &nbsp;
  <a href="mailto:sanjayrkshetty@gmail.com"><img src="https://img.shields.io/badge/Email-Contact-EA4335?style=flat-square&logo=gmail&logoColor=white" /></a>
</p>

<p align="center">
  <img src="https://capsule-render.vercel.app/api?type=waving&color=gradient&customColorList=6,11,20&height=80&section=footer" />
</p>
