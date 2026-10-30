// tests/unit/roadmap.test.ts
import { describe, it, expect } from "vitest";
import {
  deriveTaskPeriod,
  groupTasksByDay,
  computeMirrorScrollProgress,
  xpForTask,
  type RoadmapTaskLike,
} from "@/lib/roadmap/plan";
import { RoadmapDraftSchema } from "@/lib/ai/types";
import { getCuratedFallbackRoadmap } from "@/lib/roadmap/fallback";
import { analyzeIngredientConflicts } from "@/lib/ai/router";
import { runSafetyScreen } from "@/lib/ai/safety";

function task(partial: Partial<RoadmapTaskLike>): RoadmapTaskLike {
  return {
    day: 1,
    category: "skin",
    title: "AM Gentle Cleanse",
    instructions: "Cleanse gently with lukewarm water.",
    estimatedMinutes: 5,
    isRestDay: false,
    needsProfessional: false,
    completed: false,
    ...partial,
  };
}

describe("Roadmap period derivation (AM/PM tabs)", () => {
  it("detects AM tasks from title prefixes", () => {
    expect(deriveTaskPeriod(task({ title: "AM Gentle Cleansing" }))).toBe("am");
    expect(deriveTaskPeriod(task({ title: "Morning SPF ritual", instructions: "Apply sunscreen." }))).toBe("am");
  });

  it("detects PM tasks from evening cues", () => {
    expect(deriveTaskPeriod(task({ title: "PM Retinol (alternate nights)", instructions: "Apply pea-sized amount." }))).toBe("pm");
    expect(
      deriveTaskPeriod(task({ title: "Night routine", instructions: "Evening cleanse before bed." }))
    ).toBe("pm");
  });

  it("falls back to anytime for neutral tasks", () => {
    expect(
      deriveTaskPeriod(task({ title: "Hydration & Sleep Check", instructions: "Drink 2.5L water." }))
    ).toBe("anytime");
  });
});

describe("Day grouping & Mirror Scroll progress", () => {
  const tasks: RoadmapTaskLike[] = [
    task({ id: "a", day: 1, title: "AM Cleanse", completed: true }),
    task({ id: "b", day: 1, title: "PM Moisturize", instructions: "Evening moisturizer before bed." }),
    task({ id: "c", day: 2, title: "AM SPF", completed: true }),
    task({ id: "d", day: 7, title: "Weekly Reflection & Rest", isRestDay: true, completed: false }),
  ];

  it("groups tasks by day with AM/PM splits and totals", () => {
    const days = groupTasksByDay(tasks);
    expect(days.map((d) => d.day)).toEqual([1, 2, 7]);
    expect(days[0].am).toHaveLength(1);
    expect(days[0].pm).toHaveLength(1);
    expect(days[0].completedCount).toBe(1);
    expect(days[2].isRestDay).toBe(true);
  });

  it("computes progress percent and current day", () => {
    const progress = computeMirrorScrollProgress(tasks);
    expect(progress.total).toBe(4);
    expect(progress.completed).toBe(2);
    expect(progress.percent).toBe(50);
    expect(progress.currentDay).toBe(1);
    expect(progress.durationDays).toBe(30);
  });

  it("handles empty and fully complete plans", () => {
    expect(computeMirrorScrollProgress([]).percent).toBe(0);
    const done = tasks.map((t) => ({ ...t, completed: true }));
    const progress = computeMirrorScrollProgress(done);
    expect(progress.percent).toBe(100);
    expect(progress.currentDay).toBe(30);
  });

  it("awards bounded XP previews", () => {
    expect(xpForTask(task({ estimatedMinutes: 2 }))).toBe(10);
    expect(xpForTask(task({ estimatedMinutes: 15 }))).toBe(30);
    expect(xpForTask(task({ estimatedMinutes: 90 }))).toBe(40);
    expect(xpForTask(task({ isRestDay: true }))).toBe(10);
  });
});

describe("Fallback roadmap & conflict checker integration", () => {
  it("curated fallback stays schema-valid and groupable", () => {
    const draft = getCuratedFallbackRoadmap();
    expect(RoadmapDraftSchema.safeParse(draft).success).toBe(true);

    const days = groupTasksByDay(
      draft.tasks.map((t) => ({ ...t, safetyNote: t.safetyNote, completed: false }))
    );
    expect(days.length).toBeGreaterThanOrEqual(7);
    expect(days[0].day).toBe(1);
  });

  it("flags Retinol + Acid as a medium conflict via muse-wonder fallback", async () => {
    const res = await analyzeIngredientConflicts(
      "The Ordinary Retinol 0.5% in Squalane",
      "Minimalist Salicylic Acid 2% Serum"
    );
    expect(res.data.isConflict).toBe(true);
    expect(res.data.severity).toBe("medium");
    expect(res.data.climateAdvice.toLowerCase()).toContain("humidity");
  });

  it("treats a gentle pair as safe", async () => {
    const res = await analyzeIngredientConflicts(
      "Simple Refreshing Facial Wash",
      "CeraVe Moisturising Lotion"
    );
    expect(res.data.isConflict).toBe(false);
    expect(res.data.severity).toBe("none");
  });

  it("keeps roadmap copy free of forbidden scoring language", () => {
    const draft = getCuratedFallbackRoadmap();
    const screen = runSafetyScreen(JSON.stringify(draft));
    expect(screen.passed).toBe(true);
    expect(JSON.stringify(draft)).not.toContain("/10");
  });
});
