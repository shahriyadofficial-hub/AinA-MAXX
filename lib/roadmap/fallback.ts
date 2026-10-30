// lib/roadmap/fallback.ts
// Curated fallback 30-day roadmap (zero-downtime guarantee).
// Pure data + types only — safe to import from client components.
import type { RoadmapDraft } from "@/lib/ai/types";

export function getCuratedFallbackRoadmap(): RoadmapDraft {
  return {
    title: "30-Day Essential Barrier Reset & Grooming",
    summary: "Curated beginner protocol for Bangladesh climate focusing on skin barrier repair, scalp balance, and daily grooming consistency.",
    durationDays: 30,
    tasks: [
      {
        day: 1,
        category: "skin",
        title: "AM Gentle Cleansing & Barrier Assessment",
        instructions: "Wash face with room-temperature water or gentle soap-free cleanser. Note any tightness or redness.",
        estimatedMinutes: 2,
        isRestDay: false,
        needsProfessional: false,
        safetyNote: "Do not scrub aggressively. Pat dry with clean towel.",
      },
      {
        day: 2,
        category: "skin",
        title: "AM Sun Protection Ritual",
        instructions: "Apply two finger lengths of broad-spectrum SPF 50+ sunscreen. Essential for Dhaka UV index.",
        estimatedMinutes: 3,
        isRestDay: false,
        needsProfessional: false,
      },
      {
        day: 3,
        category: "hair",
        title: "Scalp Hydration & Gentle Brush",
        instructions: "Apply lightweight aloe-enriched coconut oil to scalp 30 mins before shower, then cleanse with mild shampoo.",
        estimatedMinutes: 5,
        isRestDay: false,
        needsProfessional: false,
      },
      {
        day: 4,
        category: "fashion",
        title: "Capsule Wardrobe Audit",
        instructions: "Identify 3 versatile top-bottom pairings suitable for current weather.",
        estimatedMinutes: 10,
        isRestDay: false,
        needsProfessional: false,
      },
      {
        day: 5,
        category: "habit",
        title: "Hydration & Sleep Check",
        instructions: "Drink 2.5L water throughout the day and target 7.5 hours of uninterrupted sleep.",
        estimatedMinutes: 1,
        isRestDay: false,
        needsProfessional: false,
      },
      {
        day: 6,
        category: "grooming",
        title: "Nail & Beard Clean Trim",
        instructions: "Tidy up neckline and groom nails. Apply a drop of oil to soften hair.",
        estimatedMinutes: 10,
        isRestDay: false,
        needsProfessional: false,
      },
      {
        day: 7,
        category: "habit",
        title: "Weekly Reflection & Rest",
        instructions: "Review consistency and submit Week 1 Mirror Check-In.",
        estimatedMinutes: 5,
        isRestDay: true,
        needsProfessional: false,
      },
    ],
  };
}
