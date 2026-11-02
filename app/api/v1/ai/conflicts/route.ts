export const dynamic = 'force-dynamic';

// app/api/v1/ai/conflicts/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import { analyzeIngredientConflicts } from "@/lib/ai/router";
import { IngredientConflictSchema } from "@/lib/ai/types";
import { META_MODELS } from "@/lib/ai/providers/meta";

const ConflictRequestSchema = z.object({
  productA: z.string().min(2).max(200),
  productB: z.string().min(2).max(200),
});

/**
 * Ingredient & Routine Conflict Checker (muse-wonder).
 * Explains whether two products can share a routine in Bangladesh's
 * humidity, in Bangla + English. Educational guidance only.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await getCurrentSession();

    const body = await req.json().catch(() => ({}));
    const parsed = ConflictRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Provide two product names to check.",
            messageBn: "যাচাই করতে দুটি পণ্যের নাম দিন।",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { productA, productB } = parsed.data;
    const result = await analyzeIngredientConflicts(productA, productB);

    const check = IngredientConflictSchema.safeParse(result.data);
    if (!check.success) {
      return NextResponse.json(
        {
          error: {
            code: "SCHEMA_REJECTED",
            message: "Conflict analysis failed schema validation and was withheld.",
          },
        },
        { status: 422 }
      );
    }

    await prisma.aiInteraction
      .create({
        data: {
          userId: session.userId,
          feature: "ingredient_conflict_check",
          provider: result.provider === "gemini" ? "gemini" : "meta_model_api",
          modelId: result.model || META_MODELS.REASONING,
          promptVersion: "conflict.v1",
          schemaVersion: "ingredient-conflict.v1",
          status: result.provider === "fallback" ? "fallback_used" : "succeeded",
          latencyMs: result.latencyMs,
          inputTokens: result.inputTokens ?? null,
          outputTokens: result.outputTokens ?? null,
          safetyFlags: [],
        },
      })
      .catch(() => undefined);

    return NextResponse.json({
      data: {
        conflict: check.data,
        productA,
        productB,
      },
      meta: {
        model: result.model,
        provider: result.provider,
        cached: result.cached,
        latencyMs: Date.now() - startTime,
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
