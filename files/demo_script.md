# TicketGuard Demo Script

---

## Setup Checklist (before judges arrive)

- [ ] App running locally or deployed (verify URL works)
- [ ] Killer demo input pre-loaded in textarea (or "Load Example" button ready)
- [ ] Mock fallback enabled (in case Nemotron call is slow)
- [ ] Tab open with the app — not code, not README
- [ ] Backup demo input ready to paste manually

---

## 60-Second Version

**Goal:** Show the full flow in one smooth run. Judges see: input → analysis → risk → reasoning → actions.

**What to say and do:**

> "Imagine you're buying concert tickets on Facebook and a stranger sends you this message."

→ **Click "Load Example"** (killer demo input loads into the textarea)

> "Off-platform request. Venmo. Urgency. Broken transfer excuse. Classic scam cocktail."

→ **Click "Run Scam Triage"**

> "TicketGuard runs a chain-of-debate analysis — three internal reasoning rounds — and returns a structured risk assessment."

→ **Stepper animates** (Retrieve Guidance → Draft Plans → Red-Team Check → Supervisor Decision)

> "HIGH risk. 82% confidence. Here's why."

→ **Point to the three reason cards**

> "And here are the exact steps to take — and copyable messages you can send right now."

→ **Click one copy button** (verify_message)

> "Built on NVIDIA Nemotron. One route. Zero database. Fully hackathon-deployable."

**End.**

---

## 90-Second Version

**Goal:** Same flow, but show one extra dimension — the CoD log — and briefly explain the AI architecture.

**What to say and do:**

> "We're solving a real problem. Ticket fraud costs consumers hundreds of millions of dollars a year. The FTC, the BBB, and Ticketmaster all publish guidance — but nobody reads it in the moment of a transaction."

> "TicketGuard puts that guidance in the loop automatically."

→ **Click "Load Example"** (killer demo input)

> "This message has four red flags: off-platform redirect, Venmo payment, broken Ticketmaster transfer excuse, and time pressure."

→ **Click "Run Scam Triage"**

> "The model runs a chain-of-debate. Round A drafts the risk plan. Round B red-teams it — challenges false reassurance. Round C revises. A supervisor makes the final call."

→ **Stepper completes**

> "HIGH risk. 82% confidence. Three reasons, each grounded in the seller's own words."

→ **Expand the CoD log**

> "Here's the internal reasoning — the model showing its work."

→ **Scroll to action steps and templates**

> "Three copyable templates: a message to verify the seller, a platform report, and — if you already paid — containment steps."

→ **Click "Load Example" → backup demo (already paid scenario)**

> "If someone's already sent money, TicketGuard shifts into damage control mode automatically."

→ **Click "Run Scam Triage"** (briefly, no need to wait for full animation)

> "Built on NVIDIA Nemotron with a structured JSON contract. One Next.js app. No database. Fully offline-capable via mock fallback."

**End.**

---

## Fallback: If the API is slow or fails

If the Nemotron call hangs or returns an error:
1. The mock fallback returns a pre-set HIGH-risk response instantly.
2. The demo still works perfectly — the output is realistic and complete.
3. Say: *"We have a demo-reliable mock mode — the real Nemotron response is structurally identical."*

Do not apologize for the fallback. It is a feature.

---

## Things NOT to say

- "We ran out of time to finish..."
- "This part is broken but..."
- "It's not deployed yet but..."
- "The AI sometimes..."

If something breaks, switch to the mock example tab immediately and keep talking.

---

## Key phrases to use

- "Chain-of-debate reasoning"
- "Grounded in authoritative sources — FTC, BBB, Ticketmaster"
- "Copyable in one click"
- "Built for the moment of decision"
- "NVIDIA Nemotron structured output"
