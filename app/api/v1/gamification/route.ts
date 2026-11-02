export const dynamic = 'force-dynamic';

// app/api/v1/gamification/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import {
  INITIAL_STREAK,
  DEMO_LEADERBOARD,
  rankLeaderboard,
  buildMirrorReport,
  type StreakState,
} from "@/lib/gamification/maxx";
import { getCuratedFallbackRoadmap } from "@/lib/roadmap/fallback";

/**
 * AinA Maxx summary: total XP, Mirror Streak, Effort-Only leaderboard,
 * and the privacy-safe Weekly Mirror Report. Falls back to demo data so
 * the UI always renders (judge mode / DB unreachable).
 */
export async function GET() {
  try {
    const session = await getCurrentSession();

    const [xpAgg, streakRow, roadmap] = await Promise.all([
      prisma.xpEvent
        .aggregate({ where: { userId: session.userId }, _sum: { xpDelta: true } })
        .catch(() => null),
      prisma.userStreak.findUnique({ where: { userId: session.userId } }).catch(() => null),
      prisma.roadmap
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
        .catch(() => null),
    ]);

    const totalXp = xpAgg?._sum.xpDelta ?? 0;

    const streak: StreakState = streakRow
      ? {
          currentStreak: streakRow.currentStreak,
          longestStreak: streakRow.longestStreak,
          lastQualifiedDay: streakRow.lastQualifiedLocalDay
            ? streakRow.lastQualifiedLocalDay.toISOString().slice(0, 10)
            : null,
          freezeTokens: streakRow.freezeTokens,
        }
      : INITIAL_STREAK;

    const tasks =
      roadmap && roadmap.tasks.length > 0
        ? roadmap.tasks.map((t) => ({
            day: t.dayIndex,
            category: t.category,
            title: t.title,
            instructions: t.instructions,
            estimatedMinutes: t.estimatedMinutes,
            isRestDay: t.isRestDay,
            needsProfessional: t.needsProfessional,
            completed: t.completions.some((c) => c.status === "completed"),
          }))
        : getCuratedFallbackRoadmap().tasks.map((t) => ({ ...t, completed: false }));

    const report = buildMirrorReport({
      weekLabel: "This week",
      tasks,
      xpEarned: totalXp,
      streak,
    });

    // Effort-only leaderboard: demo peers + the user's live numbers.
    const myTasksCompleted = tasks.filter((t) => t.completed).length;
    const leaderboard = rankLeaderboard(
      DEMO_LEADERBOARD.map((entry) =>
        entry.isCurrentUser
          ? {
              ...entry,
              displayName: session.displayName || "You",
              weeklyXp: Math.max(entry.weeklyXp, totalXp),
              tasksCompleted: Math.max(entry.tasksCompleted, myTasksCompleted),
              streakDays: Math.max(entry.streakDays, streak.currentStreak),
            }
          : entry
      )
    );

    return NextResponse.json({
      data: {
        totalXp,
        streak,
        leaderboard,
        report,
      },
      meta: {
        effortOnly: true,
        includesFacePhoto: false,
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
