// lib/types/onboarding.ts
import { z } from "zod";

export const OnboardingPayloadSchema = z.object({
  displayName: z.string().min(1).max(60).default("AinA Member"),
  birthDate: z.string().refine((val) => !isNaN(Date.parse(val)), {
    message: "Valid birthDate (YYYY-MM-DD) is required.",
  }),
  locale: z.enum(["en", "bn"]).default("en"),
  goals: z.array(z.string()).min(1, "Select at least 1 goal.").max(5),
  skinType: z.enum(["oily", "dry", "combination", "sensitive", "normal"]).default("combination"),
  hairType: z.enum(["straight", "wavy", "curly", "coily", "thinning"]).default("straight"),
  budgetTier: z.enum(["budget", "mid", "premium"]).default("budget"),
  availableMinutes: z.number().int().min(5).max(180).default(15),
  consents: z.object({
    photoProcessing: z.boolean().default(false),
    healthPersonalization: z.boolean().default(false),
  }).default({ photoProcessing: false, healthPersonalization: false }),
});

export type OnboardingPayload = z.infer<typeof OnboardingPayloadSchema>;
