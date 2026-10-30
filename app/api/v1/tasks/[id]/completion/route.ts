// app/api/v1/tasks/[id]/completion/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import { computeXpAward, advanceStreak, type StreakState } from "@/lib/gamification/maxx";

const CompletionRequestSchema = z.object({
  action: z.enum(["completed", "skipped", "rest_day"]).default("completed"),
  note: z.string().max(500).optional(),
});

/** Asia/Dhaka local day as YYYY-MM-DD (en-CA gives ISO ordering). */
function dhakaLocalDay(): string {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

/**
 * Server-side idempotent task completion.
 * - TaskCompletion is upserted on (taskId, userId, localDay).
 * - XpEvent carries a deterministic idempotency key; a duplicate POST
 *   returns the original award with `idempotentReplay: true` and never
 *   double-counts XP or streak.
 */
export async function POST(
  req: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getCurrentSession();
    const { id: taskId } = await context.params;

    const body = await req.json().catch(() => ({}));
    const parsed = CompletionRequestSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid completion payload",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }
    const { action, note } = parsed.data;
    const localDay = dhakaLocalDay();

    const task = await prisma.roadmapTask
      .findFirst({ where: { id: taskId, userId: session.userId } })
      .catch(() => null);

    if (!task) {
      return NextResponse.json(
        {
          error: {
            code: "TASK_NOT_FOUND",
            message: "Roadmap task not found for this account.",
            messageBn: "এই অ্যাকাউন্টে কাজটি পাওয়া যায়নি।",
          },
        },
        { status: 404 }
      );
    }

    const award = computeXpAward({
      userId: session.userId,
      taskId: task.id,
      localDay,
      action,
      estimatedMinutes: task.estimatedMinutes,
      isRestDay: task.isRestDay,
    });

    // 1) Completion record (idempotent upsert).
    await prisma.taskCompletion.upsert({
      where: {
        taskId_userId_localDay: {
          taskId: task.id,
          userId: session.userId,
          localDay: new Date(`${localDay}T00:00:00.000Z`),
        },
      },
      update: {
        status: action === "completed" ? "completed" : action === "rest_day" ? "rest_day" : "skipped",
        completedAt: action === "skipped" ? null : new Date(),
        note: note ?? null,
      },
      create: {
        taskId: task.id,
        userId: session.userId,
        status: action === "completed" ? "completed" : action === "rest_day" ? "rest_day" : "skipped",
        completedAt: action === "skipped" ? null : new Date(),
        localDay: new Date(`${localDay}T00:00:00.000Z`),
        note: note ?? null,
      },
    });

    // 2) XP event — unique idempotency key makes replays safe.
    let xpAwarded = award.xpDelta;
    let idempotentReplay = false;

    const existing = await prisma.xpEvent
      .findUnique({ where: { idempotencyKey: award.idempotencyKey } })
      .catch(() => null);

    if (existing) {
      xpAwarded = existing.xpDelta;
      idempotentReplay = true;
    } else if (award.xpDelta > 0) {
      await prisma.xpEvent
        .create({
          data: {
            userId: session.userId,
            eventKey: award.eventKey,
            sourceType: "roadmap_task",
            sourceId: task.id,
            xpDelta: award.xpDelta,
            localDay: new Date(`${localDay}T00:00:00.000Z`),
            idempotencyKey: award.idempotencyKey,
          },
        })
        .catch(() => {
          // Unique-constraint race: another request already awarded it.
          idempotentReplay = true;
        });
    }

    // 3) Streak advance on qualified days (completed or rest day).
    let streak: StreakState | null = null;
    if (!idempotentReplay && (action === "completed" || action === "rest_day")) {
      const current = await prisma.userStreak
        .findUnique({ where: { userId: session.userId } })
        .catch(() => null);

      const next = advanceStreak(
        {
          currentStreak: current?.currentStreak ?? 0,
          longestStreak: current?.longestStreak ?? 0,
          lastQualifiedDay: current?.lastQualifiedLocalDay
            ? current.lastQualifiedLocalDay.toISOString().slice(0, 10)
            : null,
          freezeTokens: current?.freezeTokens ?? 1,
        },
        localDay
      );
      streak = next;

      await prisma.userStreak
        .upsert({
          where: { userId: session.userId },
          update: {
            currentStreak: next.currentStreak,
            longestStreak: next.longestStreak,
            lastQualifiedLocalDay: new Date(`${localDay}T00:00:00.000Z`),
            freezeTokens: next.freezeTokens,
          },
          create: {
            userId: session.userId,
            currentStreak: next.currentStreak,
            longestStreak: next.longestStreak,
            lastQualifiedLocalDay: new Date(`${localDay}T00:00:00.000Z`),
            freezeTokens: next.freezeTokens,
          },
        })
        .catch(() => undefined);
    }

    const totalXp = await prisma.xpEvent
      .aggregate({ where: { userId: session.userId }, _sum: { xpDelta: true } })
      .then((r) => r._sum.xpDelta ?? 0)
      .catch(() => xpAwarded);

    return NextResponse.json({
      data: {
        taskId: task.id,
        action,
        localDay,
        xpAwarded,
        totalXp,
        idempotentReplay,
        streak,
      },
      meta: {
        idempotencyKey: award.idempotencyKey,
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
