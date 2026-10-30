// app/api/v1/ai/coach/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import { chatWithCoach } from "@/lib/ai/router";
import { assertSafePrompt, runSafetyScreen } from "@/lib/ai/safety";
import { META_MODELS } from "@/lib/ai/providers/meta";
import {
  detectRedFlag,
  buildRoadmapContext,
  coachTelemetryBadge,
  DERMATOLOGIST_ADVISOR,
} from "@/lib/coach/coach";
import { getCuratedFallbackRoadmap } from "@/lib/roadmap/fallback";
import { groupTasksByDay, computeMirrorScrollProgress } from "@/lib/roadmap/plan";

const CoachRequestSchema = z.object({
  message: z.string().min(1).max(1000),
  locale: z.enum(["en", "bn"]).default("en"),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      })
    )
    .max(10)
    .default([]),
});

/**
 * Builds context from the user's active 30-day roadmap. Falls back to the
 * curated plan so the coach is always grounded, even before generation.
 */
async function loadRoadmapContext(userId: string): Promise<string> {
  const roadmap = await prisma.roadmap
    .findFirst({
      where: { userId, status: { in: ["active", "draft"] } },
      orderBy: { createdAt: "desc" },
      include: {
        tasks: {
          orderBy: [{ dayIndex: "asc" }, { sortOrder: "asc" }],
          include: { completions: { where: { userId } } },
        },
      },
    })
    .catch(() => null);

  if (roadmap && roadmap.tasks.length > 0) {
    const tasks = roadmap.tasks.map((t) => ({
      day: t.dayIndex,
      category: t.category,
      title: t.title,
      instructions: t.instructions,
      estimatedMinutes: t.estimatedMinutes,
      isRestDay: t.isRestDay,
      needsProfessional: t.needsProfessional,
      completed: t.completions.some((c) => c.status === "completed"),
    }));
    const progress = computeMirrorScrollProgress(tasks);
    const days = groupTasksByDay(tasks);
    const today = days.find((d) => d.day === progress.currentDay);

    return buildRoadmapContext({
      title: roadmap.title,
      summary: roadmap.summary,
      currentDay: progress.currentDay,
      durationDays: roadmap.durationDays,
      percentComplete: progress.percent,
      todaysTasks: today ? today.tasks.map((t) => t.title) : [],
      completedCount: progress.completed,
      totalTasks: progress.total,
    });
  }

  const fallback = getCuratedFallbackRoadmap();
  return buildRoadmapContext({
    title: fallback.title,
    summary: fallback.summary,
    currentDay: 1,
    durationDays: fallback.durationDays,
    percentComplete: 0,
    todaysTasks: fallback.tasks.filter((t) => t.day === 1).map((t) => t.title),
    completedCount: 0,
    totalTasks: fallback.tasks.length,
  });
}

/**
 * Bilingual AI Coach (muse-spark-1.3 + gemini-2.5-flash failover).
 * - Pre-flight: deterministic safety screen + red-flag escalation.
 * - Context: active 30-day roadmap injected into the system prompt.
 * - Post-flight: reply is safety-screened; unsafe output is withheld.
 */
export async function POST(req: NextRequest) {
  const startTime = Date.now();
  try {
    const session = await getCurrentSession();

    const body = await req.json().catch(() => ({}));
    const parsed = CoachRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Send a message between 1 and 1000 characters.",
            messageBn: "১ থেকে ১০০০ অক্ষরের মধ্যে একটি বার্তা পাঠান।",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { message, locale, history } = parsed.data;

    // Pre-flight safety: reject face-scoring requests deterministically.
    try {
      assertSafePrompt(message);
    } catch {
      return NextResponse.json(
        {
          error: {
            code: "SAFETY_REJECTED",
            message:
              "AinA never scores or ranks faces. Ask me about skin barrier health, hair care, or your roadmap instead.",
            messageBn:
              "AinA কখনো মুখের স্কোর বা র্যাংক করে না। ত্বকের যত্ন, চুলের যত্ন বা আপনার রোডম্যাপ সম্পর্কে জিজ্ঞাসা করুন।",
          },
        },
        { status: 422 }
      );
    }

    // Red-flag escalation happens before any model call.
    const redFlag = detectRedFlag(message);
    if (redFlag) {
      await prisma.aiInteraction
        .create({
          data: {
            userId: session.userId,
            feature: "coach_red_flag_escalation",
            provider: "deterministic_safety",
            modelId: "red-flag-rules.v1",
            promptVersion: "coach.v1",
            schemaVersion: "coach.v1",
            status: "succeeded",
            latencyMs: Date.now() - startTime,
            safetyFlags: [`RED_FLAG:${redFlag.category}`],
          },
        })
        .catch(() => undefined);

      return NextResponse.json({
        data: {
          reply:
            locale === "bn"
              ? "আপনার উপসর্গগুলো গুরুত্বপূর্ণ মনে হচ্ছে। আমি রোগ নির্ণয় করতে পারি না — অনুগ্রহ করে যাচাইকৃত চর্মরোগ বিশেষজ্ঞের পরামর্শ নিন। নিচে উপদেষ্টার কার্ড দেওয়া হলো।"
              : "Your symptoms sound important. I can't diagnose — please consult a verified dermatologist. I've added the advisor card below.",
          escalation: {
            category: redFlag.category,
            advisor: DERMATOLOGIST_ADVISOR,
          },
        },
        meta: {
          model: "red-flag-rules.v1",
          provider: "safety-escalation",
          cached: false,
          latencyMs: Date.now() - startTime,
          badge: "Red-flag escalation · Safety verified",
          timestamp: new Date().toISOString(),
        },
      });
    }

    const activeContext = await loadRoadmapContext(session.userId);

    const result = await chatWithCoach({
      message,
      history,
      locale,
      activeContext,
    });

    // Post-flight safety screen on the model reply.
    const screen = runSafetyScreen(result.data);
    const reply = screen.sanitizedText;

    await prisma.aiInteraction
      .create({
        data: {
          userId: session.userId,
          feature: "coach_chat",
          provider: result.provider === "gemini" ? "gemini" : "meta_model_api",
          modelId: result.model || META_MODELS.TEXT,
          promptVersion: "coach.v1",
          schemaVersion: "coach.v1",
          status: result.provider === "fallback" ? "fallback_used" : "succeeded",
          latencyMs: result.latencyMs,
          inputTokens: result.inputTokens ?? null,
          outputTokens: result.outputTokens ?? null,
          safetyFlags: screen.flags,
        },
      })
      .catch(() => undefined);

    return NextResponse.json({
      data: {
        reply,
        escalation: null,
      },
      meta: {
        model: result.model,
        provider: result.provider,
        cached: result.cached,
        latencyMs: Date.now() - startTime,
        inputTokens: result.inputTokens ?? null,
        outputTokens: result.outputTokens ?? null,
        badge: coachTelemetryBadge(result.model, result.provider),
        safetyFlags: screen.flags,
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
