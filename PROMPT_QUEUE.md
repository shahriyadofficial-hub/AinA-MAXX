# AinA (Ai∩A MAXX) — Autonomous Execution Queue

The autonomous build engine iterates through this queue sequentially. Each prompt is executed end-to-end, tested (`npm run typecheck && npm run test && npm run build`), committed to git, and marked `[x]`.

---

- [x] **PROMPT 01 — Foundation, PWA Shell & Brand System (`Ai∩A MAXX`):**
  Scaffold Next.js 15 App Router (TypeScript strict), Tailwind CSS with AinA design tokens (`#0A0A0A` Jet Black, `#1A1A1D` Graphite, `#FF2D95` Neon Rose, `#007BA7` Cerulean, `#3FB6E0` Light Cerulean), fonts (`Space Grotesk`, `Inter`, `Noto Sans Bengali`), the `Ai∩A MAXX` SVG header component (white `Ai∩A` with `#FF2D95` dot on `i`, `∩` mirror arch, and spaced `M A X X` subtitle), bottom navigation (`Home`, `Roadmap`, `Wardrobe`, `Vibe`, `Shop`), and PWA manifest. Verify with `npm run build`.

- [x] **PROMPT 02 — Database Schema, Prisma, Supabase RLS & Seed Data:**
  Create `prisma/schema.prisma` and `supabase/migrations/0001_core.sql` from the blueprint (`profiles`, `consent_records`, `user_preferences`, `user_goals`, `roadmaps`, `roadmap_tasks`, `task_completions`, `weekly_check_ins`, `photo_assets`, `ai_interactions`, `xp_events`, `user_streaks`, `products`, `routine_templates`, `community_posts`, `content_reports`, `audit_events`). Enable RLS policies. Create `prisma/seed.ts` with 12 real Bangladeshi & global skincare/hair products (with BDT prices), 4 curated routines, and 4 Lookbook outfits.

- [x] **PROMPT 03 — 4-Model Meta API Adapter (`muse-spark-1.3`, `muse-wonder`, `muse-image`, `sam-3.1`) + Gemini Flash Fallback + Quota Backoff:**
  Build `lib/ai/providers/meta.ts`, `lib/ai/providers/gemini.ts`, and `lib/ai/router.ts`. Include:
  1. Disk cache in `.cache/ai/` for dev/test credit protection.
  2. Automatic exponential backoff & quota sleep handler (`onQuotaExhausted`: parses `Retry-After` / `x-ratelimit-reset`, logs countdown, waits and retries automatically).
  3. Zod schema validation (`RoadmapDraftSchema`, `SkinGuidanceSchema`, `IngredientConflictSchema`) and deterministic safety filter (`lib/ai/safety.ts`).

- [x] **PROMPT 04 — Adult 18+ Auth, PDPA 2026 Consent Registry & Bilingual Onboarding Quiz:**
  Implement `/api/v1/consents` and `/api/v1/onboarding`. Build the DOB age-gate (under-13 blocked; 13-17 routed to public read-only safe mode; 18+ full access), revocable purpose-specific consent toggles (`photo_processing`, `health_related_personalization`), and the 5-step Bangla/English onboarding quiz (Goals, Skin/Hair type, BDT Budget Tier, Daily Minutes, Language).

- [x] **PROMPT 05 — Interactive CSS 3D Lookbook Hero & AinA Drip (`sam-3.1` Wardrobe Cutout):**
  Build `components/lookbook/Lookbook3D.tsx` using pure HTML/CSS `preserve-3d` and vanilla JS pointer/gyro tilt (`<15KB`, 60fps on budget Android) with floating pill tags (`• Relaxed Fit`, `• Everyday`), giant ghost typography (`PRIME YOU` / `WEAR IT LOUD`), floor reflection, and `01 / 04` counter. Add an interactive "Upload Item (`SAM 3.1` Auto-Cutout)" demo button that segments a clothing item and places it into a 3D parallax card.

- [x] **PROMPT 06 — AinA Coded: Optional Skin/Hair Vision (`muse-spark-1.3`) & Barber Card Generator (`muse-image`):**
  Build the Cerulean (`#007BA7`) scanning overlay UI, private photo upload intent, `muse-spark-1.3` vision analysis (returning skin type, face shape, hair texture, and confidence level with zero attractiveness scores), and a "Generate Barber Reference Card (`muse-image`)" button that creates a visual haircut guide + Bangla/English instructions for the user's local barber.

- [x] **PROMPT 07 — 30-Day Roadmap Engine (`muse-spark-1.3`) & Ingredient Conflict Checker (`muse-wonder`):**
  Build `/api/v1/roadmaps` and `/roadmap` UI with the "Mirror Scroll" elevation progress bar (Current You -> Prime You), AM/PM routine tabs, daily task checkboxes, and an interactive `muse-wonder` Ingredient & Routine Conflict Checker badge that explains why selected products work safely together in Bangladesh's climate.

- [x] **PROMPT 08 — Bilingual AI Coach (`muse-spark-1.3` + `gemini-2.5-flash`) & Red-Flag Escalation:**
  Build `/api/v1/ai/coach` and the slide-out Coach Drawer. Support one-tap Bangla/English switching, context injection from the active 30-day roadmap, automatic red-flag escalation (severe acne/hair loss -> verified dermatologist advisor card), and visible model telemetry badges (`Powered by Meta Muse Spark 1.3 · Safety verified`) for hackathon judges.

- [x] **PROMPT 09 — Gamification (`AinA Maxx`), Leaderboard, Community (`Vibe`) & Curated BDT Shop:**
  Build `/api/v1/tasks/[id]/completion` with server-side idempotent XP (`xp_events`), `Mirror Streak` counter with Rest Day / Freeze tokens, Effort-Only Weekly Leaderboard, privacy-safe Shareable Weekly Mirror Report card (no face photo by default), moderated `AinA Vibe` feed, and `AinA Shop` with BDT prices and Routine Bag slide-out drawer.

- [ ] **PROMPT 10 — Hackathon Judge Demo Mode, Telemetry HUD & E2E Verification:**
  Add a floating "Judge Demo Bar" (toggleable in top nav) that lets hackathon judges 1-click test: (a) Instant Demo Login, (b) Live `muse-spark-1.3` Roadmap Generation, (c) `muse-wonder` Conflict Analysis, (d) `muse-image` Barber Card, (e) `sam-3.1` Wardrobe Cutout, and (f) Live API Latency/Token Telemetry Drawer showing our $150 Meta API usage in real time. Run full Vitest + Playwright suite and production build.
