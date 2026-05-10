# API Test Outputs — presales-automation

Live test run: **2026-05-10** · Server: `http://127.0.0.1:3001`

---

## Opportunities Pipeline

### GET /api/opportunities — Full pipeline

```json
[
  { "id": 1, "client_name": "Test Bank Alpha",      "engagement_type": "IFI",     "stage": "Hot",  "acv_cr": 0.45, "account_manager": "Alex Mercer",    "proposal_shared": 1 },
  { "id": 2, "client_name": "Test Insurance Beta",  "engagement_type": "Retainer","stage": "Warm", "acv_cr": 1.20, "account_manager": "Sara Lindqvist",  "proposal_shared": 1 },
  { "id": 3, "client_name": "Test Fintech Gamma",   "engagement_type": "CA",      "stage": "Cold", "acv_cr": 0.00, "account_manager": "James Tan",       "proposal_shared": 0 },
  { "id": 4, "client_name": "Test Payments Delta",  "engagement_type": "BAS",     "stage": "Won",  "acv_cr": 0.80, "account_manager": "David Okafor",    "proposal_shared": 1 },
  { "id": 5, "client_name": "Test Gulf Bank Epsilon","engagement_type": "PFI",    "stage": "Hot",  "acv_cr": 0.30, "account_manager": "Nadia Khalil",    "proposal_shared": 1 },
  { "id": 6, "client_name": "Test Telecom Zeta",    "engagement_type": "IFI",     "stage": "Warm", "acv_cr": 0.60, "account_manager": "Alex Mercer",     "proposal_shared": 0 },
  { "id": 7, "client_name": "Test NBFC Eta",        "engagement_type": "ATM",     "stage": "Cold", "acv_cr": 0.00, "account_manager": "Sara Lindqvist",  "proposal_shared": 0 },
  { "id": 8, "client_name": "Test Retail Theta",    "engagement_type": "BAS",     "stage": "Warm", "acv_cr": 0.50, "account_manager": "James Tan",       "proposal_shared": 1 },
  { "id": 9, "client_name": "Test HealthTech Iota", "engagement_type": "Retainer","stage": "Lost", "acv_cr": 0.00, "account_manager": "David Okafor",    "proposal_shared": 0 },
  { "id":10, "client_name": "Test Logistics Kappa", "engagement_type": "CA",      "stage": "Hot",  "acv_cr": 0.35, "account_manager": "Nadia Khalil",    "proposal_shared": 1 }
]
```

### GET /api/opportunities?stage=Hot&type=IFI — Filtered query

```json
[
  {
    "id": 1,
    "client_name": "Test Bank Alpha",
    "engagement_type": "IFI",
    "stage": "Hot",
    "acv_cr": 0.45,
    "account_manager": "Alex Mercer",
    "presales_update": "Proposal submitted, awaiting review.",
    "proposal_shared": 1,
    "client_side_updates": "Client reviewing internally."
  }
]
```

### POST /api/opportunities — Create new opportunity

**Request:**
```json
{
  "client_name": "Test Showcase Corp",
  "stage": "Warm",
  "engagement_type": "IFI",
  "acv_cr": 0.75,
  "account_manager": "Alex Mercer",
  "presales_update": "Demo scheduled"
}
```

**Response:**
```json
{
  "id": 11,
  "client_name": "Test Showcase Corp",
  "stage": "Warm",
  "engagement_type": "IFI",
  "acv_cr": 0.75,
  "account_manager": "Alex Mercer",
  "presales_update": "Demo scheduled",
  "proposal_shared": 0,
  "date_modified": "2026-05-10",
  "date_updated": "2026-05-10"
}
```

### PUT /api/opportunities/11 — Update opportunity

**Response:**
```json
{
  "id": 11,
  "presales_update": "Proposal revised and sent. Client reviewing v2.",
  "stage": "Hot",
  "date_modified": "2026-05-10"
}
```

### POST /api/opportunities/bulk-stage — Bulk stage update

**Request:** `{ "ids": [1, 5, 10], "stage": "Hot" }`

**Response:** `{ "ok": true, "updated": 3 }`

### PUT /api/opportunities/11/updates — Append to update log

**Request:** `{ "update_text": "Called CISO, confirmed budget approved. Moving to contract stage." }`

**Response:** `{ "ok": true }`

### GET /api/opportunities/11/updates — Retrieve update log

```json
[
  {
    "id": 1,
    "opportunity_id": 11,
    "update_text": "Called CISO, confirmed budget approved. Moving to contract stage.",
    "logged_at": "2026-05-10 16:53:52"
  }
]
```

---

## GAM Contacts

### GET /api/gam

```json
[
  { "id": 1, "name": "Alex Mercer",    "designation": "Account Manager",  "email": "alex.m@testorg.example",  "phone": "+91 90000 10001", "region": "India" },
  { "id": 2, "name": "Sara Lindqvist", "designation": "Account Manager",  "email": "sara.l@testorg.example",  "phone": "+971 50 000 1002","region": "MEE"   },
  { "id": 3, "name": "David Okafor",   "designation": "Director - Sales", "email": "david.o@testorg.example", "phone": "+91 90000 10003", "region": "India" },
  { "id": 4, "name": "James Tan",      "designation": "Account Manager",  "email": "james.t@testorg.example", "phone": "+65 9000 1004",   "region": "SEA"   },
  { "id": 5, "name": "Nadia Khalil",   "designation": "Account Manager",  "email": "nadia.k@testorg.example", "phone": "+971 50 000 1005","region": "MEE"   }
]
```

---

## Security Tests

### Input validation — invalid stage enum

**Request:** `POST /api/opportunities` with `{ "client_name": "BadCorp", "stage": "Invalid" }`

**Response (400):**
```json
{ "error": "stage must be one of: Hot, Warm, Cold, Won, Lost" }
```

### File type enforcement — non-xlsx upload rejected

**Request:** `POST /api/opportunities/import` with `filename: evil.exe`

**Response (400):**
```json
{ "error": "Only .xlsx/.xls files allowed" }
```

### Rate limiting headers

All API responses include:
```
RateLimit-Limit: 200
RateLimit-Remaining: 199
RateLimit-Reset: 60
```
AI endpoints (`/api/ai/*`) cap at 20 req/min.

### Path traversal blocked

`GET /generated/../server/db/database.js` → `403 Forbidden`

Only `.docx` files served from `/generated/`.

---

## Architecture

```
Client (React + Vite + Tailwind)
    ↓ Vite proxy /api → :3001
Express API (Node.js + better-sqlite3)
    ├── /api/opportunities  — pipeline CRUD + bulk ops + import
    ├── /api/gam            — contacts CRUD
    ├── /api/proposals      — DOCX generation (IFI / Retainer / BAS)
    ├── /api/ai             — Claude-powered follow-ups + summaries
    └── /api/reports        — pipeline analytics
Security layer: helmet · express-rate-limit · CORS lockdown · input validation
AI: Anthropic claude-sonnet-4-20250514 with prompt caching (cache_control ephemeral)
```

---

*All test data uses anonymized names (`testorg.example` domain). No real client or employee data.*
