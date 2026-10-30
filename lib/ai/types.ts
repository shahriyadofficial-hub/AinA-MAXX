// lib/ai/types.ts
import { z } from "zod";

export const RoutineCategoryEnum = z.enum([
  "skin",
  "hair",
  "fitness",
  "food",
  "fashion",
  "grooming",
  "habit",
]);
export type RoutineCategory = z.infer<typeof RoutineCategoryEnum>;

export const RoadmapTaskDraftSchema = z.object({
  day: z.number().int().min(1).max(30),
  category: RoutineCategoryEnum,
  title: z.string().min(3).max(120),
  instructions: z.string().min(5).max(1200),
  estimatedMinutes: z.number().int().min(1).max(90),
  isRestDay: z.boolean().default(false),
  needsProfessional: z.boolean().default(false),
  safetyNote: z.string().max(400).optional(),
});
export type RoadmapTaskDraft = z.infer<typeof RoadmapTaskDraftSchema>;

export const RoadmapDraftSchema = z.object({
  title: z.string().min(3).max(100),
  summary: z.string().min(10).max(500),
  durationDays: z.literal(30),
  tasks: z.array(RoadmapTaskDraftSchema).min(7).max(60),
});
export type RoadmapDraft = z.infer<typeof RoadmapDraftSchema>;

export const SkinGuidanceSchema = z.object({
  skinType: z.enum(["oily", "dry", "combination", "sensitive", "normal"]),
  faceShape: z.enum(["oval", "round", "square", "heart", "oblong", "diamond"]).optional(),
  hairTexture: z.enum(["straight", "wavy", "curly", "coily", "thinning"]).optional(),
  hydrationLevel: z.enum(["low", "balanced", "high"]),
  primaryConcerns: z.array(z.string().max(60)).max(5),
  recommendedFocus: z.string().min(10).max(400),
  confidence: z.number().min(0).max(1),
  safetyNote: z.string().max(400).default("Educational guidance only. Not medical diagnosis."),
});
export type SkinGuidance = z.infer<typeof SkinGuidanceSchema>;

export const BarberCardSchema = z.object({
  styleNameEn: z.string().min(3).max(80),
  styleNameBn: z.string().min(3).max(80),
  faceShape: z.enum(["oval", "round", "square", "heart", "oblong", "diamond"]).optional(),
  hairTexture: z.enum(["straight", "wavy", "curly", "coily", "thinning"]).optional(),
  topLength: z.string().min(2).max(80),
  sidesLength: z.string().min(2).max(80),
  fadeType: z.string().min(2).max(80),
  instructionsEn: z.array(z.string().min(3).max(200)).min(3).max(8),
  instructionsBn: z.array(z.string().min(3).max(200)).min(3).max(8),
  maintenanceEn: z.string().min(5).max(400),
  maintenanceBn: z.string().min(5).max(400),
  visualDescription: z.string().min(10).max(600),
  confidence: z.number().min(0).max(1),
});
export type BarberCard = z.infer<typeof BarberCardSchema>;

export const IngredientConflictSchema = z.object({
  isConflict: z.boolean(),
  severity: z.enum(["none", "low", "medium", "high"]),
  conflictingIngredients: z.array(z.string()),
  explanationEn: z.string().min(5).max(600),
  explanationBn: z.string().min(5).max(600),
  climateAdvice: z.string().min(5).max(400),
});
export type IngredientConflict = z.infer<typeof IngredientConflictSchema>;

export interface AiModelResponse<T = unknown> {
  data: T;
  model: string;
  provider: "meta" | "gemini" | "cache" | "fallback";
  latencyMs: number;
  inputTokens?: number;
  outputTokens?: number;
  cached: boolean;
}
