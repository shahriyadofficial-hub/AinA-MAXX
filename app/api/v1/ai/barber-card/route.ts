// app/api/v1/ai/barber-card/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import { generateBarberCard } from "@/lib/ai/router";
import { SkinGuidanceSchema } from "@/lib/ai/types";
import { META_MODELS } from "@/lib/ai/providers/meta";

const BarberCardRequestSchema = z.object({
  desiredStyle: z.string().max(80).optional(),
  locale: z.enum(["en", "bn"]).default("en"),
  guidance: SkinGuidanceSchema.partial().optional(),
});

/**
 * Barber Reference Card generator (muse-image).
 * Returns a visual haircut guide description plus step-by-step Bangla/English
 * instructions a user can show their local barber. No face scoring, ever.
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
            message: "Barber cards are available to verified 18+ accounts only.",
            messageBn: "বারবার কার্ড শুধুমাত্র যাচাইকৃত ১৮+ অ্যাকাউন্টের জন্য।",
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = BarberCardRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid barber card request payload",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { desiredStyle, locale, guidance } = parsed.data;

    const result = await generateBarberCard({ guidance, desiredStyle, locale });

    await prisma.aiInteraction
      .create({
        data: {
          userId: session.userId,
          feature: "hair_guidance",
          provider: result.provider === "gemini" ? "gemini" : "meta_model_api",
          modelId: result.model || META_MODELS.IMAGE,
          promptVersion: "barber-card.v1",
          schemaVersion: "barber-card.v1",
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
        card: result.data,
        // Deterministic SVG reference visual (front/side/back guide) — no external image cost.
        referenceVisual: "/coded/barber-reference.svg",
        showToBarber:
          "Show the visual + numbered steps to your barber. Keep the hairline natural.",
      },
      meta: {
        model: result.model,
        imageModel: META_MODELS.IMAGE,
        provider: result.provider,
        cached: result.cached,
        latencyMs: Date.now() - startTime,
        safety: "Zero attractiveness scoring · Haircut reference only",
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
