// tests/unit/coach.test.ts
import { describe, it, expect } from "vitest";
import {
  detectRedFlag,
  buildRoadmapContext,
  getOfflineCoachReply,
  coachTelemetryBadge,
  DERMATOLOGIST_ADVISOR,
} from "@/lib/coach/coach";
import { chatWithCoach } from "@/lib/ai/router";
import { runSafetyScreen } from "@/lib/ai/safety";

describe("Red-flag escalation (deterministic, pre-model)", () => {
  it("escalates severe acne descriptions", () => {
    const match = detectRedFlag("I have severe painful cystic acne that keeps spreading");
    expect(match?.category).toBe("severe_acne");
  });

  it("escalates sudden patchy hair loss", () => {
    const match = detectRedFlag("I noticed sudden patchy hair loss in clumps this week");
    expect(match?.category).toBe("hair_loss");
  });

  it("escalates burning / swollen skin", () => {
    const match = detectRedFlag("My face is burning and swollen after a new cream");
    expect(match?.category).toBe("skin_pain_or_infection");
  });

  it("escalates scalp sores", () => {
    const match = detectRedFlag("There are bleeding sores on my scalp");
    expect(match?.category).toBe("scalp_condition");
  });

  it("escalates Bangla red-flag phrases", () => {
    expect(detectRedFlag("আমার হঠাৎ চুল পড়া শুরু হয়েছে")?.category).toBe("hair_loss");
    expect(detectRedFlag("আমার তীব্র ব্রণ হয়েছে")?.category).toBe("severe_acne");
  });

  it("does not escalate everyday routine questions", () => {
    expect(detectRedFlag("What should I do this morning?")).toBeNull();
    expect(detectRedFlag("My hair feels a bit dry after shampoo")).toBeNull();
    expect(detectRedFlag("Is sunscreen needed on cloudy days?")).toBeNull();
    expect(detectRedFlag("")).toBeNull();
  });

  it("advisor card is bilingual and never diagnoses", () => {
    expect(DERMATOLOGIST_ADVISOR.nameEn).toContain("Dr.");
    expect(DERMATOLOGIST_ADVISOR.nameBn.length).toBeGreaterThan(3);
    expect(DERMATOLOGIST_ADVISOR.noteEn).toContain("cannot diagnose");
    expect(runSafetyScreen(JSON.stringify(DERMATOLOGIST_ADVISOR)).passed).toBe(true);
  });
});

describe("Roadmap context injection", () => {
  it("summarizes day, progress, and today's tasks", () => {
    const context = buildRoadmapContext({
      title: "30-Day Essential Barrier Reset & Grooming",
      summary: "Barrier repair focus",
      currentDay: 3,
      durationDays: 30,
      percentComplete: 14,
      todaysTasks: ["AM Sun Protection Ritual", "Scalp Hydration"],
      completedCount: 2,
      totalTasks: 14,
    });

    expect(context).toContain("Day 3/30");
    expect(context).toContain("14%");
    expect(context).toContain("AM Sun Protection Ritual");
    expect(context).toContain("2/14");
  });

  it("handles rest days without tasks", () => {
    const context = buildRoadmapContext({
      title: "Plan",
      currentDay: 7,
      durationDays: 30,
      percentComplete: 20,
      todaysTasks: [],
      completedCount: 2,
      totalTasks: 10,
    });
    expect(context).toContain("rest / reflection");
  });
});

describe("Offline coach replies & telemetry badge", () => {
  it("answers sunscreen questions in both locales without API calls", () => {
    expect(getOfflineCoachReply("Do I need sunscreen today?", "en")).toContain("SPF 50+");
    expect(getOfflineCoachReply("সানস্ক্রিন লাগবে?", "bn")).toContain("সানস্ক্রিন");
  });

  it("keeps offline replies free of forbidden scoring language", () => {
    const reply = getOfflineCoachReply("How do I start a routine?", "en");
    expect(runSafetyScreen(reply).passed).toBe(true);
    expect(reply).not.toContain("/10");
  });

  it("chatWithCoach resolves via safe fallback in test env", async () => {
    const res = await chatWithCoach({ message: "Is sunscreen needed on cloudy days?", locale: "en" });
    expect(res.data.length).toBeGreaterThan(10);
    expect(runSafetyScreen(res.data).passed).toBe(true);
  });

  it("renders judge-facing telemetry badges per provider", () => {
    expect(coachTelemetryBadge("muse-spark-1.3", "meta")).toContain("Muse Spark 1.3");
    expect(coachTelemetryBadge("gemini-2.5-flash", "gemini")).toContain("failover");
    expect(coachTelemetryBadge("coach-offline-fallback", "fallback")).toContain("Safety verified");
  });
});
