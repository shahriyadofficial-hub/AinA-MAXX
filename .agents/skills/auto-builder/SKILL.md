---
name: auto-builder
description: Autonomous queue execution skill for AinA (Ai∩A MAXX). Reads PROMPT_QUEUE.md, implements each feature phase end-to-end, runs quality verification (typecheck, tests, build), commits git milestones, and advances continuously until all 10 phases are completed.
---

# AinA Autonomous Queue Builder (`auto-builder`)

## Purpose
Executes the 10-prompt build sequence outlined in `/PROMPT_QUEUE.md` for **AinA (Ai∩A MAXX)** without human interruption, enforcing:
- Full TypeScript strictness
- Zero-leakage Meta Model API key isolation
- $150 credit preservation via `.cache/ai-responses/`
- Automatic backoff on HTTP 429
- End-to-end verification before marking each prompt `[x]`

## Workflow Protocol
1. **Queue Inspection:** Read `/PROMPT_QUEUE.md`. Identify the topmost task marked `[ ]` or `[~]`.
2. **State Transition:** Update the task checkbox to `[~]` (In Progress) in `/PROMPT_QUEUE.md`.
3. **Architecture Adherence:**
   - Review `/AGENTS.md` and the master blueprint (`aina_all_in_one_prd_trd_database_schema_antigravity_blueprint (1).md`).
   - Implement the complete scope described in the prompt.
   - Respect AinA branding: Jet Black (`#0A0A0A`), Graphite (`#1A1A1D`), Neon Rose (`#FF2D95`), Cerulean (`#007BA7`), Light Cerulean (`#3FB6E0`).
   - Guard against attractiveness ranking, body shaming, or unauthorized teen accounts.
4. **Validation Gate:**
   - Execute:
     ```bash
     npm run typecheck
     npm run test
     npm run build
     ```
   - Resolve any type discrepancies or broken tests before proceeding.
5. **Git Milestone:**
   - Stage and commit with structured semantic commit:
     ```bash
     git add -A
     git commit -m "feat(phase-X): <concise summary of phase>"
     ```
6. **Queue Completion:**
   - Update the task status to `[x]` in `/PROMPT_QUEUE.md`.
7. **Immediate Continuation:**
   - Immediately proceed to the next `[ ]` task until 10/10 prompts are marked `[x]`.
