export const dynamic = 'force-dynamic';

// app/api/v1/telemetry/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import {
  summarizeTelemetry,
  META_CREDIT_BUDGET_USD,
  type AiInteractionLike,
} from "@/lib/telemetry/telemetry";
import { META_MODELS } from "@/lib/ai/providers/meta";

/**
 * Judge Telemetry HUD data source.
 * Aggregates ai_interactions (metadata only — never prompts or photos)
 * into call counts, token usage, latency, and estimated spend against
 * the $150 Meta API credit budget. Returns a clearly-labelled demo
 * baseline when the database has no rows yet.
 */
export async function GET() {
  try {
    const session = await getCurrentSession();

    const rows = await prisma.aiInteraction
      .findMany({
        where: { userId: session.userId },
        orderBy: { createdAt: "desc" },
        take: 200,
      })
      .catch(() => null);

    if (rows && rows.length > 0) {
      const interactions: AiInteractionLike[] = rows.map((r) => ({
        feature: r.feature,
        modelId: r.modelId,
        provider: r.provider,
        status: r.status,
        latencyMs: r.latencyMs,
        inputTokens: r.inputTokens,
        outputTokens: r.outputTokens,
        estimatedCostUsd: r.estimatedCost ? Number(r.estimatedCost) : null,
        createdAt: r.createdAt.toISOString(),
      }));

      return NextResponse.json({
        data: summarizeTelemetry(interactions),
        meta: {
          source: "database",
          models: META_MODELS,
          budgetUsd: META_CREDIT_BUDGET_USD,
          timestamp: new Date().toISOString(),
        },
      });
    }

    // Demo baseline so judges see a populated HUD before any live calls.
    const now = Date.now();
    const demo: AiInteractionLike[] = [
      {
        feature: "roadmap_generation",
        modelId: META_MODELS.TEXT,
        provider: "meta_model_api",
        status: "succeeded",
        latencyMs: 1840,
        inputTokens: 420,
        outputTokens: 1150,
        createdAt: new Date(now - 1000 * 60 * 12).toISOString(),
      },
      {
        feature: "ingredient_conflict_check",
        modelId: META_MODELS.REASONING,
        provider: "meta_model_api",
        status: "succeeded",
        latencyMs: 1320,
        inputTokens: 260,
        outputTokens: 480,
        createdAt: new Date(now - 1000 * 60 * 9).toISOString(),
      },
      {
        feature: "coach_chat",
        modelId: META_MODELS.TEXT,
        provider: "meta_model_api",
        status: "succeeded",
        latencyMs: 940,
        inputTokens: 310,
        outputTokens: 180,
        createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
      },
      {
        feature: "skin_guidance",
        modelId: META_MODELS.TEXT,
        provider: "meta_model_api",
        status: "fallback_used",
        latencyMs: 210,
        inputTokens: 0,
        outputTokens: 0,
        createdAt: new Date(now - 1000 * 60 * 2).toISOString(),
      },
    ];

    return NextResponse.json({
      data: summarizeTelemetry(demo),
      meta: {
        source: "demo-baseline",
        models: META_MODELS,
        budgetUsd: META_CREDIT_BUDGET_USD,
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
