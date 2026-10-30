// tests/unit/gamification.test.ts
import { describe, it, expect } from "vitest";
import {
  computeXpAward,
  advanceStreak,
  rankLeaderboard,
  buildMirrorReport,
  moderateVibePost,
  formatBdt,
  routineBagTotal,
  SHOP_PRODUCTS,
  INITIAL_STREAK,
  type StreakState,
} from "@/lib/gamification/maxx";
import { runSafetyScreen } from "@/lib/ai/safety";
import type { RoadmapTaskLike } from "@/lib/roadmap/plan";

function task(partial: Partial<RoadmapTaskLike>): RoadmapTaskLike {
  return {
    day: 1,
    category: "skin",
    title: "AM Gentle Cleanse",
    instructions: "Cleanse gently.",
    estimatedMinutes: 5,
    isRestDay: false,
    needsProfessional: false,
    completed: false,
    ...partial,
  };
}

describe("Idempotent XP awards", () => {
  it("builds deterministic idempotency keys per user/task/day/action", () => {
    const a = computeXpAward({
      userId: "u1",
      taskId: "t1",
      localDay: "2026-10-30",
      action: "completed",
      estimatedMinutes: 15,
      isRestDay: false,
    });
    const b = computeXpAward({
      userId: "u1",
      taskId: "t1",
      localDay: "2026-10-30",
      action: "completed",
      estimatedMinutes: 15,
      isRestDay: false,
    });
    expect(a.idempotencyKey).toBe(b.idempotencyKey);
    expect(a.idempotencyKey).toBe("xp:u1:t1:2026-10-30:completed");
    expect(a.xpDelta).toBe(30);
  });

  it("awards rest-day XP and zero XP for skips", () => {
    const rest = computeXpAward({
      userId: "u1",
      taskId: "t2",
      localDay: "2026-10-30",
      action: "rest_day",
      estimatedMinutes: 5,
      isRestDay: true,
    });
    expect(rest.xpDelta).toBe(10);

    const skip = computeXpAward({
      userId: "u1",
      taskId: "t2",
      localDay: "2026-10-30",
      action: "skipped",
      estimatedMinutes: 5,
      isRestDay: false,
    });
    expect(skip.xpDelta).toBe(0);
  });
});

describe("Mirror Streak with freeze tokens", () => {
  it("starts at day 1 and is idempotent within a day", () => {
    const s1 = advanceStreak(INITIAL_STREAK, "2026-10-28");
    expect(s1.currentStreak).toBe(1);
    expect(advanceStreak(s1, "2026-10-28")).toEqual(s1);
  });

  it("increments on consecutive days and tracks longest", () => {
    let s = advanceStreak(INITIAL_STREAK, "2026-10-28");
    s = advanceStreak(s, "2026-10-29");
    s = advanceStreak(s, "2026-10-30");
    expect(s.currentStreak).toBe(3);
    expect(s.longestStreak).toBe(3);
  });

  it("consumes a freeze token for a single missed day", () => {
    const state: StreakState = {
      currentStreak: 5,
      longestStreak: 5,
      lastQualifiedDay: "2026-10-28",
      freezeTokens: 1,
    };
    const next = advanceStreak(state, "2026-10-30"); // missed 29th
    expect(next.currentStreak).toBe(6);
    expect(next.freezeTokens).toBe(0);
  });

  it("resets after a longer gap without tokens", () => {
    const state: StreakState = {
      currentStreak: 9,
      longestStreak: 9,
      lastQualifiedDay: "2026-10-20",
      freezeTokens: 0,
    };
    const next = advanceStreak(state, "2026-10-30");
    expect(next.currentStreak).toBe(1);
    expect(next.longestStreak).toBe(9);
  });

  it("earns a freeze token at 7-day milestones (bank max 3)", () => {
    let s: StreakState = { ...INITIAL_STREAK, freezeTokens: 0 };
    for (let d = 1; d <= 7; d++) {
      s = advanceStreak(s, `2026-10-${String(20 + d).padStart(2, "0")}`);
    }
    expect(s.currentStreak).toBe(7);
    expect(s.freezeTokens).toBe(1);
  });
});

describe("Effort-only leaderboard & mirror report", () => {
  it("ranks by tasks completed, then XP — never appearance", () => {
    const ranked = rankLeaderboard([
      { displayName: "A", area: "Dhaka", weeklyXp: 500, tasksCompleted: 5, streakDays: 2 },
      { displayName: "B", area: "Dhaka", weeklyXp: 100, tasksCompleted: 9, streakDays: 3 },
      { displayName: "C", area: "Dhaka", weeklyXp: 300, tasksCompleted: 9, streakDays: 1 },
    ]);
    expect(ranked.map((r) => r.displayName)).toEqual(["C", "B", "A"]);
    expect(ranked[0].rank).toBe(1);
  });

  it("builds a privacy-safe report with no face photo", () => {
    const report = buildMirrorReport({
      weekLabel: "Week 1",
      tasks: [
        task({ completed: true, category: "skin" }),
        task({ completed: true, category: "skin", title: "AM SPF" }),
        task({ completed: false, category: "hair", title: "Scalp wash" }),
      ],
      xpEarned: 40,
      streak: { currentStreak: 3, longestStreak: 5, lastQualifiedDay: "2026-10-30", freezeTokens: 1 },
    });
    expect(report.tasksCompleted).toBe(2);
    expect(report.percentComplete).toBe(67);
    expect(report.includesFacePhoto).toBe(false);
    expect(report.topCategories).toEqual(["skin"]);
    expect(runSafetyScreen(report.headlineEn).passed).toBe(true);
  });
});

describe("BDT shop catalog", () => {
  it("has 12 products with positive BDT prices", () => {
    expect(SHOP_PRODUCTS).toHaveLength(12);
    expect(SHOP_PRODUCTS.every((p) => p.priceBdt > 0)).toBe(true);
  });

  it("formats BDT and totals the routine bag", () => {
    expect(formatBdt(1350)).toBe("৳1,350 BDT");
    const total = routineBagTotal([
      { product: SHOP_PRODUCTS[0], qty: 2 },
      { product: SHOP_PRODUCTS[7], qty: 1 },
    ]);
    expect(total).toBe(850 * 2 + 320);
  });
});

describe("Vibe moderation", () => {
  it("publishes kind effort posts", () => {
    expect(moderateVibePost("Day 5 done! SPF and moisturizer, feeling consistent.").status).toBe(
      "published"
    );
  });

  it("rejects face-scoring language outright", () => {
    const result = moderateVibePost("Rate my face 8/10 please, am I ugly?");
    expect(result.status).toBe("rejected");
    expect(result.reason).toContain("effort-only");
  });

  it("holds external links for human review", () => {
    expect(moderateVibePost("Check my routine at https://example.com/x").status).toBe("pending");
  });
});
