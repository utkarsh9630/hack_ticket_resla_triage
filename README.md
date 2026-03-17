# TicketGuard — Ticket Resale Scam Triage (Hackathon MVP)

TicketGuard helps fans buying resale tickets under time pressure quickly assess **scam risk indicators** and follow **safer steps** — reducing losses, anxiety, and decision paralysis.

This is **not** a chatbot. It’s an **action-first dashboard**: paste a listing/seller chat → get a **risk level + confidence**, **top reasons with evidence**, a **safer-step checklist**, and **copyable templates** (verification message + platform report + containment steps).

---

## What makes it “agentic” (not just text generation)
TicketGuard uses a **multi-agent Chain-of-Debate (CoD)** workflow:
- Draft multiple candidate plans (Planner / Evidence / User Advocate)
- Critique plans (Red-Team + Risk/Compliance)
- Supervisor selects final response with **confidence** and a short rationale log
- **Boundary Manager** behavior: for high risk, it escalates to “Stop & Verify” steps

---

## Tech stack
- **Frontend:** Next.js (App Router) + TypeScript + Tailwind + shadcn/ui
- **Backend:** Next.js API Route `POST /api/triage` (Vercel Serverless)
- **LLM:** NVIDIA NIM endpoint using a Nemotron-capable instruction model (recommended: `mistralai/mistral-nemotron`)
- **RAG grounding (minimal):** local guidance corpus + retrieval (keyword top-k) injected into LLM prompt
- **Optional safety pass:** `nvidia/nemotron-content-safety-reasoning-4b`

---

## Architecture (high level)

```text
User -> Next.js UI (Vercel) -> POST /api/triage (Serverless)
    -> Retriever (local guidance docs) -> CoD Orchestrator
    -> LLM via NVIDIA NIM (Nemotron) -> Guardrails
    -> JSON -> UI (Risk + Reasons + Actions + Templates + CoD log)
```

---

## Setup (local)

### 1) Install
```bash
# Node 18+ (recommended 20+)
pnpm install
```

### 2) Environment variables
Create `.env.local`:
```bash
# LLM (NVIDIA NIM / Nemotron)
NIM_BASE_URL=...
NIM_API_KEY=...
NIM_MODEL=...
NIM_TIMEOUT_MS=20000

# RAG
RAG_TOP_K=4
RAG_CHUNK_DIR=./data/guidance
RETRIEVAL_MODE=keyword  # keyword | vector (optional)

NEXT_PUBLIC_APP_NAME=TicketGuard
```

### 3) Run
```bash
pnpm dev
```
Open http://localhost:3000

---

## RAG corpus (public guidance docs)
Store 4–8 docs as Markdown in:
```text
data/guidance/
  ftc_bots_act.md
  ftc_enforcement_bypass_limits.md
  ticketmaster_scam_tips.md
  bbb_reseller_tips.md
```

Each file should include a header with:
- `Title:`
- `Source URL:`

**No live web scraping is required** for demo reliability.

---

## API contract
**POST** `/api/triage`

Request:
```json
{
  "text": "string",
  "platform": "string",
  "payment_method": "string",
  "off_platform": true,
  "urgency": true
}
```

Response:
```json
{
  "risk_level": "LOW|MEDIUM|HIGH",
  "confidence": 0.82,
  "banner": { "type": "STOP_VERIFY|VERIFY_FIRST|PROCEED_SAFER", "message": "string" },
  "reasons": [
    { "title": "string", "evidence_snippet": "string", "guidance_links": ["string"], "notes": "string" }
  ],
  "action_steps": ["string"],
  "templates": {
    "verify_message": "string",
    "platform_report": "string",
    "containment_steps": "string"
  },
  "cod_log": { "roundA": "string", "roundB": "string", "roundC": "string", "supervisor": "string" }
}
```

---

## Safety & guardrails (must-follow)
- **Non-accusatory language:** “risk indicators suggest…” not “this is a scam”
- **No enabling wrongdoing:** no instructions for bypassing ticket limits/bots/fraud
- **Victim path:** if the user already paid, provide containment steps + reporting guidance
- **Disclaimer:** “Educational guidance only; cannot guarantee authenticity.”

---

## Demo mode
Include 2 preset buttons in the UI:
- **Obvious scam** (off-platform + irreversible payment + urgency)
- **Borderline legit** (in-platform transfer + safer payment)

This prevents demo failure during judging.

---

## Deployment (Vercel)
- Deploy the Next.js app to Vercel
- Set env vars in Vercel Project Settings (same keys as `.env.local`)
- Commit `data/guidance/*` so the serverless function can load the corpus

Helpful docs (links):
```text
Vercel docs: https://vercel.com/docs
Next.js on Vercel: https://vercel.com/docs/frameworks/nextjs
```
