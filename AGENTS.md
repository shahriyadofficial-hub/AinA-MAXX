# AinA (Ai∩A MAXX) — Autonomous Workspace Rules & Engineering Invariants

## 1. Autonomous Queue Execution
- **Queue Source of Truth:** `/PROMPT_QUEUE.md` contains the 10 sequential execution prompts.
- **Workflow Loop:**
  1. Inspect `/PROMPT_QUEUE.md` at session start.
  2. Find the first prompt marked `[ ]` (or incomplete `[~]`).
  3. Change status to `[~]` (In Progress).
  4. Implement the feature slice completely end-to-end.
  5. Validate via strict quality gates: `npm run typecheck && npm run test && npm run build`.
  6. Commit changes: `git add -A && git commit -m "feat(phase-X): <description>"`.
  7. Mark prompt as `[x]` in `/PROMPT_QUEUE.md`.
  8. Immediately advance to the next `[ ]` prompt without waiting unless paused by rate limits/quotas.

## 2. Model Routing Strategy
- **Code Generation & Architecture:** Handled autonomously in workspace by the primary coding agent.
- **App Runtime AI Layer (`lib/ai/providers/meta.ts` & `lib/ai/router.ts`):**
  - **`muse-spark-1.3` (Responses API):**
    - 30-Day structured JSON roadmap generation
    - Bilingual (Bangla & English) AI Coach chat
    - Cautious adult skin/hair vision guidance
  - **`muse-wonder`:**
    - Skincare ingredient conflict reasoning (e.g., Retinol + AHA/BHA in Bangladesh humidity)
    - Weekly check-in roadmap adaptation & progress triage
  - **`muse-image`:**
    - Visual haircut guide generation for local barbers (with Bangla/English reference cards)
    - Capsule wardrobe outfit visualization
  - **`sam-3.1` (Segment Anything Model 3.1):**
    - Clothing background removal & garment segmentation for 3D Lookbook and AinA Drip wardrobe
  - **`gemini-2.5-flash`:**
    - Deterministic safety screening & prompt pre-flight check
    - Zero-downtime failover whenever Meta Model API returns 429 Rate Limit or 5xx Server Error

## 3. $150 Meta API Credit Protection & Disk Cache
- During automated unit tests, integration tests, E2E tests, and local builds (`NODE_ENV=test` or `AI_CACHE_MODE=true`):
  - Cache first successful Meta Model API response to `.cache/ai-responses/` keyed by SHA-256 hash of `[model, systemPrompt, userPrompt]`.
  - Never make redundant duplicate paid API calls for test suites or static verification.
  - Automatically parse `Retry-After` or `x-ratelimit-reset` headers on HTTP 429. If quota is temporarily exhausted, sleep with countdown backoff until quota window refreshes.

## 4. Product, Safety & Legal Guardrails (PDPA 2026 & Hackathon Standards)
- **18+ Age Gate:** Strictly enforce 18+ gate for MVP accounts. Under-13 accounts are blocked; 13-17 users are routed to public read-only safe mode without biometric/photo analysis until guardian consent mechanisms are verified.
- **Zero Attractiveness Scoring:** Absolutely NO attractiveness scores, facial rating numbers, "glow-up percentages", or body shaming. Guidance must focus on skin barrier health, grooming consistency, personal style, and habit tracking.
- **Design System & Visual Tokens:**
  - Background: `#0A0A0A` (Jet Black)
  - Surface/Cards: `#1A1A1D` (Graphite)
  - Primary Accent: `#FF2D95` (Neon Rose)
  - Secondary Accent: `#007BA7` (Cerulean)
  - Highlight Accent: `#3FB6E0` (Light Cerulean)
  - Logo Lockup: White `Ai∩A` with `#FF2D95` dot on `i`, `∩` mirror arch, and spaced `#FF2D95` `M A X X` subtitle.
- **Security & RLS:**
  - Never expose `MODEL_API_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, or `GEMINI_API_KEY` to client components or public bundles.
  - User photos are strictly stored in private Supabase buckets with short-lived signed URLs.
