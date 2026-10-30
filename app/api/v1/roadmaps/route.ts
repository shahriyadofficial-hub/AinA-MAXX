// app/api/v1/roadmaps/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import { generateRoadmapPlan, getCuratedFallbackRoadmap } from "@/lib/ai/router";
import { RoadmapDraftSchema, type RoadmapDraft } from "@/lib/ai/types";
import { META_MODELS } from "@/lib/ai/providers/meta";

const GenerateRoadmapSchema = z.object({
  goals: z.array(z.string().min(1).max(60)).min(1).max(6).default(["skin barrier health"]),
  skinType: z.string().max(30).optional(),
  hairType: z.string().max(30).optional(),
  budgetTier: z.enum(["budget", "mid", "premium"]).default("budget"),
  availableMinutes: z.number().int().min(5).max(120).default(15),
  locale: z.enum(["en", "bn"]).default("en"),
});

function draftToResponse(draft: RoadmapDraft, roadmapId: string | null) {
  return {
    roadmap: {
      id: roadmapId,
      title: draft.title,
      summary: draft.summary,
      durationDays: draft.durationDays,
      status: "active",
    },
    tasks: draft.tasks.map((task, index) => ({
      id: `${roadmapId ?? "draft"}-task-${index + 1}`,
      day: task.day,
      category: task.category,
      title: task.title,
      instructions: task.instructions,
      estimatedMinutes: task.estimatedMinutes,
      isRestDay: task.isRestDay,
      needsProfessional: task.needsProfessional,
      safetyNote: task.safetyNote ?? null,
      completed: false,
    })),
  };
}

/**
 * GET — the user's latest active roadmap with tasks + completion state.
 * Falls back to the curated 30-day draft so the UI always renders, even
 * before the database is reachable (demo / judge mode).
 */
export async function GET() {
  try {
    const session = await getCurrentSession();

    const roadmap = await prisma.roadmap
      .findFirst({
        where: { userId: session.userId, status: { in: ["active", "draft"] } },
        orderBy: { createdAt: "desc" },
        include: {
          tasks: {
            orderBy: [{ dayIndex: "asc" }, { sortOrder: "asc" }],
            include: { completions: { where: { userId: session.userId } } },
          },
        },
      })
      .catch(() => null);

    if (roadmap && roadmap.tasks.length > 0) {
      return NextResponse.json({
        data: {
          roadmap: {
            id: roadmap.id,
            title: roadmap.title,
            summary: roadmap.summary,
            durationDays: roadmap.durationDays,
            status: roadmap.status,
          },
          tasks: roadmap.tasks.map((task) => ({
            id: task.id,
            day: task.dayIndex,
            category: task.category,
            title: task.title,
            instructions: task.instructions,
            estimatedMinutes: task.estimatedMinutes,
            isRestDay: task.isRestDay,
            needsProfessional: task.needsProfessional,
            safetyNote: task.safetyNote,
            completed: task.completions.some((c) => c.status === "completed"),
          })),
        },
        meta: {
          model: roadmap.modelId ?? META_MODELS.TEXT,
          provider: "database",
          cached: true,
          latencyMs: 0,
          timestamp: new Date().toISOString(),
        },
      });
    }

    const fallback = getCuratedFallbackRoadmap();
    return NextResponse.json({
      data: draftToResponse(fallback, null),
      meta: {
        model: "curated-fallback-v1",
        provider: "fallback",
        cached: true,
        latencyMs: 0,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}

/**
 * POST — generate a fresh 30-day roadmap with muse-spark-1.3
 * (Gemini Flash failover, curated fallback) and persist it when the
 * database is reachable. Telemetry is metadata-only.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await getCurrentSession();

    const body = await req.json().catch(() => ({}));
    const parsed = GenerateRoadmapSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid roadmap generation payload",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const input = parsed.data;
    const result = await generateRoadmapPlan(input);

    const draftCheck = RoadmapDraftSchema.safeParse(result.data);
    if (!draftCheck.success) {
      return NextResponse.json(
        {
          error: {
            code: "SCHEMA_REJECTED",
            message: "Generated roadmap failed schema validation and was withheld.",
          },
        },
        { status: 422 }
      );
    }
    const draft = draftCheck.data;

    // Persist roadmap + tasks when the DB is reachable (best effort).
    let roadmapId: string | null = null;
    try {
      const created = await prisma.roadmap.create({
        data: {
          userId: session.userId,
          title: draft.title,
          summary: draft.summary,
          durationDays: draft.durationDays,
          status: "active",
          generationSource: result.provider === "fallback" ? "curated" : "ai",
          modelId: result.model,
          promptVersion: "roadmap.v1",
          outputSchemaVersion: "roadmap.v1",
          startedAt: new Date(),
          tasks: {
            create: draft.tasks.map((task, index) => ({
              userId: session.userId,
              dayIndex: task.day,
              category: task.category,
              title: task.title,
              instructions: task.instructions,
              estimatedMinutes: task.estimatedMinutes,
              isRestDay: task.isRestDay,
              needsProfessional: task.needsProfessional,
              safetyNote: task.safetyNote ?? null,
              sortOrder: index,
            })),
          },
        },
      });
      roadmapId = created.id;
    } catch (persistErr) {
      console.warn("[Roadmaps] Persist skipped (DB unreachable):", persistErr);
    }

    await prisma.aiInteraction
      .create({
        data: {
          userId: session.userId,
          feature: "roadmap_generation",
          provider: result.provider === "gemini" ? "gemini" : "meta_model_api",
          modelId: result.model || META_MODELS.TEXT,
          promptVersion: "roadmap.v1",
          schemaVersion: "roadmap.v1",
          status: result.provider === "fallback" ? "fallback_used" : "succeeded",
          latencyMs: result.latencyMs,
          inputTokens: result.inputTokens ?? null,
          outputTokens: result.outputTokens ?? null,
          safetyFlags: [],
        },
      })
      .catch(() => undefined);

    return NextResponse.json({
      data: draftToResponse(draft, roadmapId),
      meta: {
        model: result.model,
        provider: result.provider,
        cached: result.cached,
        latencyMs: Date.now() - startTime,
        inputTokens: result.inputTokens ?? null,
        outputTokens: result.outputTokens ?? null,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
