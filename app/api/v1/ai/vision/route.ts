export const dynamic = 'force-dynamic';

// app/api/v1/ai/vision/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import { analyzeSkinHairVision } from "@/lib/ai/router";
import { runSafetyScreen } from "@/lib/ai/safety";
import { META_MODELS } from "@/lib/ai/providers/meta";

const VisionRequestSchema = z.object({
  photoAssetId: z.string().uuid().optional(),
  purpose: z.enum(["skin_guidance", "hair_guidance"]).default("skin_guidance"),
  skinTypeHint: z.string().max(30).optional(),
  hairTextureHint: z.string().max(30).optional(),
  locale: z.enum(["en", "bn"]).default("en"),
});

/**
 * AinA Coded — cautious adult skin/hair vision guidance (muse-spark-1.3).
 * Returns skin type, face shape, hair texture, hydration, concerns and a
 * confidence level. Zero attractiveness scores by design and by filter.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await getCurrentSession();

    if (!session.adultAccessEnabled) {
      return NextResponse.json(
        {
          error: {
            code: "ADULT_ACCESS_REQUIRED",
            message:
              "Vision guidance is available to verified 18+ accounts only. Ages 13–17 stay in read-only safe mode without photo analysis.",
            messageBn:
              "ভিশন নির্দেশনা শুধুমাত্র যাচাইকৃত ১৮+ অ্যাকাউন্টের জন্য। ১৩–১৭ বছর বয়সীদের ছবি বিশ্লেষণ করা হয় না।",
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = VisionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid vision request payload",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { photoAssetId, purpose, skinTypeHint, hairTextureHint, locale } = parsed.data;

    // If a photo asset is referenced, it must belong to this user.
    if (photoAssetId) {
      const asset = await prisma.photoAsset.findFirst({
        where: { id: photoAssetId, userId: session.userId },
      });
      if (!asset) {
        return NextResponse.json(
          {
            error: {
              code: "PHOTO_NOT_FOUND",
              message: "Private photo not found for this account.",
            },
          },
          { status: 404 }
        );
      }
    }

    const result = await analyzeSkinHairVision({
      purpose,
      skinTypeHint,
      hairTextureHint,
      locale,
    });

    // Defense in depth: screen the serialized guidance before returning it.
    const screen = runSafetyScreen(JSON.stringify(result.data));
    if (!screen.passed) {
      return NextResponse.json(
        {
          error: {
            code: "SAFETY_REJECTED",
            message: "Guidance was withheld by the deterministic safety filter.",
            flags: screen.flags,
          },
        },
        { status: 422 }
      );
    }

    // Telemetry (no photo content, no scores — metadata only).
    await prisma.aiInteraction
      .create({
        data: {
          userId: session.userId,
          feature: purpose === "hair_guidance" ? "hair_guidance" : "skin_guidance",
          provider: result.provider === "gemini" ? "gemini" : "meta_model_api",
          modelId: result.model || META_MODELS.TEXT,
          promptVersion: "vision.v1",
          schemaVersion: "skin-guidance.v1",
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
        guidance: result.data,
        photoAssetId: photoAssetId ?? null,
        purpose,
      },
      meta: {
        model: result.model,
        provider: result.provider,
        cached: result.cached,
        latencyMs: Date.now() - startTime,
        safety: "Zero attractiveness scoring · Educational guidance only",
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
