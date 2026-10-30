// lib/ai/router.ts
import { callMetaModel, META_MODELS } from "@/lib/ai/providers/meta";
import { callGeminiFlash } from "@/lib/ai/providers/gemini";
import {
  RoadmapDraftSchema,
  RoadmapDraft,
  IngredientConflictSchema,
  IngredientConflict,
  SkinGuidanceSchema,
  SkinGuidance,
  BarberCardSchema,
  BarberCard,
  AiModelResponse,
} from "@/lib/ai/types";
import { runSafetyScreen } from "@/lib/ai/safety";
import {
  getFallbackSkinGuidance,
  getFallbackBarberCard,
  containsForbiddenScoring,
} from "@/lib/ai/vision";

/**
 * Curated Fallback 30-Day Roadmap (Zero-Downtime Guarantee)
 */
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

/**
 * 1. Generate 30-Day Structured Roadmap
 * Routes to Meta muse-spark-1.3 with automatic Gemini Flash failover.
 */
export async function generateRoadmapPlan(input: {
  goals: string[];
  skinType?: string;
  hairType?: string;
  budgetTier?: string;
  availableMinutes?: number;
  locale?: string;
}): Promise<AiModelResponse<RoadmapDraft>> {
  const startTime = Date.now();

  const systemPrompt = `You are AinA's Principal Personal Routine Architect.
You design 30-day transformation roadmaps for adult users in Bangladesh.
CRITICAL SAFETY RULES:
- Never provide attractiveness scores, ratings, or face rankings.
- Never prescribe prescription drugs or diagnose diseases.
- Calibrate advice for Bangladesh humidity, dust, and tap water conditions.
- You MUST return a strictly valid JSON object matching this schema:
{
  "title": "string",
  "summary": "string",
  "durationDays": 30,
  "tasks": [
    {
      "day": number (1-30),
      "category": "skin" | "hair" | "fitness" | "food" | "fashion" | "grooming" | "habit",
      "title": "string",
      "instructions": "string",
      "estimatedMinutes": number,
      "isRestDay": boolean,
      "needsProfessional": boolean,
      "safetyNote": "optional string"
    }
  ]
}`;

  const userPrompt = `Create a 30-day roadmap for:
Goals: ${input.goals.join(", ")}
Skin Type: ${input.skinType || "combination"}
Hair Type: ${input.hairType || "normal"}
Budget: ${input.budgetTier || "budget"} (in BDT)
Time Available: ${input.availableMinutes || 15} mins/day
Language: ${input.locale === "bn" ? "Bangla" : "English"}`;

  // Try Meta Model API (muse-spark-1.3)
  try {
    const metaRes = await callMetaModel({
      model: META_MODELS.TEXT,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const parsed = RoadmapDraftSchema.safeParse(JSON.parse(metaRes.text));
    if (parsed.success) {
      return {
        data: parsed.data,
        model: metaRes.model,
        provider: metaRes.cached ? "cache" : "meta",
        latencyMs: Date.now() - startTime,
        inputTokens: metaRes.inputTokens,
        outputTokens: metaRes.outputTokens,
        cached: metaRes.cached,
      };
    }
    console.warn("[Router] Meta JSON validation failed:", parsed.error);
  } catch (metaErr) {
    console.warn("[Router] Meta Model API failed, initiating Gemini Flash failover:", metaErr);
  }

  // Failover to Gemini Flash
  try {
    const geminiRes = await callGeminiFlash({
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const parsed = RoadmapDraftSchema.safeParse(JSON.parse(geminiRes.text));
    if (parsed.success) {
      return {
        data: parsed.data,
        model: geminiRes.model,
        provider: geminiRes.cached ? "cache" : "gemini",
        latencyMs: Date.now() - startTime,
        cached: geminiRes.cached,
      };
    }
  } catch (geminiErr) {
    console.warn("[Router] Gemini Flash fallback also failed:", geminiErr);
  }

  // Graceful Curated Fallback
  return {
    data: getCuratedFallbackRoadmap(),
    model: "curated-fallback-v1",
    provider: "fallback",
    latencyMs: Date.now() - startTime,
    cached: true,
  };
}

/**
 * 2. Analyze Ingredient Conflicts (muse-wonder)
 * Reasoning engine checking skincare combinations in humid Bangladesh climates.
 */
export async function analyzeIngredientConflicts(
  productA: string,
  productB: string
): Promise<AiModelResponse<IngredientConflict>> {
  const startTime = Date.now();

  const systemPrompt = `You are AinA's Skincare Chemistry & Ingredient Specialist powered by muse-wonder.
Analyze potential ingredient conflicts between two cosmetic products for a user in Bangladesh's climate.
Return strictly valid JSON:
{
  "isConflict": boolean,
  "severity": "none" | "low" | "medium" | "high",
  "conflictingIngredients": ["ingredientA", "ingredientB"],
  "explanationEn": "English explanation",
  "explanationBn": "Bangla explanation",
  "climateAdvice": "Advice for Bangladesh humidity"
}`;

  const userPrompt = `Analyze conflict between:\nProduct A: ${productA}\nProduct B: ${productB}`;

  try {
    const res = await callMetaModel({
      model: META_MODELS.REASONING,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const parsed = IngredientConflictSchema.safeParse(JSON.parse(res.text));
    if (parsed.success) {
      return {
        data: parsed.data,
        model: res.model,
        provider: res.cached ? "cache" : "meta",
        latencyMs: Date.now() - startTime,
        inputTokens: res.inputTokens,
        outputTokens: res.outputTokens,
        cached: res.cached,
      };
    }
  } catch (err) {
    console.warn("[Router] muse-wonder conflict call failed, using deterministic fallback:", err);
  }

  // Deterministic safe fallback for known conflicts
  const isRetinolAcid =
    (productA.toLowerCase().includes("retinol") && productB.toLowerCase().includes("acid")) ||
    (productB.toLowerCase().includes("retinol") && productA.toLowerCase().includes("acid"));

  const fallbackData: IngredientConflict = {
    isConflict: isRetinolAcid,
    severity: isRetinolAcid ? "medium" : "none",
    conflictingIngredients: isRetinolAcid ? ["Retinol", "Direct Acids (AHA/BHA)"] : [],
    explanationEn: isRetinolAcid
      ? "Using Retinol and strong Exfoliating Acids together in the same routine can compromise the moisture barrier, especially under hot/humid weather."
      : "No direct ingredient conflicts detected. Space out application and maintain sunscreen protection.",
    explanationBn: isRetinolAcid
      ? "রেটিনল এবং এক্সফোলিয়েটিং অ্যাসিড একসাথে ব্যবহার করলে ত্বকের আর্দ্রতা ব্যাহত হতে পারে।"
      : "কোনো বিপজ্জনক রাসায়নিক দ্বন্দ্ব পাওয়া যায়নি। সানস্ক্রিন ব্যবহার বজায় রাখুন।",
    climateAdvice: "In Bangladesh's monsoon humidity, alternate active serums on separate nights.",
  };

  return {
    data: fallbackData,
    model: "muse-wonder-deterministic",
    provider: "fallback",
    latencyMs: Date.now() - startTime,
    cached: true,
  };
}

/**
 * 3. Optional Skin/Hair Vision Guidance (muse-spark-1.3)
 * Cautious adult-only guidance. Never emits attractiveness scores or diagnoses.
 * The photo itself stays in private storage; only a short-lived analysis
 * intent (purpose + self-reported hints) reaches the text adapter here.
 */
export async function analyzeSkinHairVision(input: {
  purpose: "skin_guidance" | "hair_guidance";
  skinTypeHint?: string;
  hairTextureHint?: string;
  locale?: string;
}): Promise<AiModelResponse<SkinGuidance>> {
  const startTime = Date.now();

  const systemPrompt = `You are AinA Coded, a cautious skin & hair guidance assistant for adults (18+) in Bangladesh.
CRITICAL SAFETY RULES:
- Never provide attractiveness scores, beauty ratings, face rankings, or glow-up percentages.
- Never diagnose diseases or prescribe medication. Educational guidance only.
- Focus on skin barrier health, hydration, grooming consistency, and personal style.
- Calibrate for Bangladesh humidity, dust, sun, and tap water.
Return strictly valid JSON:
{
  "skinType": "oily" | "dry" | "combination" | "sensitive" | "normal",
  "faceShape": "oval" | "round" | "square" | "heart" | "oblong" | "diamond",
  "hairTexture": "straight" | "wavy" | "curly" | "coily" | "thinning",
  "hydrationLevel": "low" | "balanced" | "high",
  "primaryConcerns": ["short concern"],
  "recommendedFocus": "actionable focus text",
  "confidence": 0.0,
  "safetyNote": "Educational guidance only. Not medical diagnosis."
}`;

  const userPrompt = `Provide cautious ${input.purpose === "hair_guidance" ? "hair & scalp" : "skin & hair"} guidance.
Self-reported skin type hint: ${input.skinTypeHint || "unknown"}
Self-reported hair texture hint: ${input.hairTextureHint || "unknown"}
Language: ${input.locale === "bn" ? "Bangla" : "English"}
Photo context: private adult self-photo supplied for guidance only (not public, not scored).`;

  try {
    const metaRes = await callMetaModel({
      model: META_MODELS.TEXT,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const raw: unknown = JSON.parse(metaRes.text);
    if (containsForbiddenScoring(raw)) {
      throw new Error("Vision output contained forbidden scoring fields.");
    }
    const parsed = SkinGuidanceSchema.safeParse(raw);
    if (parsed.success) {
      return {
        data: parsed.data,
        model: metaRes.model,
        provider: metaRes.cached ? "cache" : "meta",
        latencyMs: Date.now() - startTime,
        inputTokens: metaRes.inputTokens,
        outputTokens: metaRes.outputTokens,
        cached: metaRes.cached,
      };
    }
    console.warn("[Router] Vision JSON validation failed:", parsed.error);
  } catch (err) {
    console.warn("[Router] muse-spark-1.3 vision failed, using safe fallback:", err);
  }

  return {
    data: getFallbackSkinGuidance({
      skinType: input.skinTypeHint,
      hairTexture: input.hairTextureHint,
    }),
    model: "muse-spark-1.3-vision-fallback",
    provider: "fallback",
    latencyMs: Date.now() - startTime,
    cached: true,
  };
}

/**
 * 4. Barber Reference Card (muse-image)
 * Produces bilingual barber instructions plus a visual reference description.
 * The generated visual is a haircut reference only — never a face score.
 */
export async function generateBarberCard(input: {
  guidance?: Partial<SkinGuidance>;
  desiredStyle?: string;
  locale?: string;
}): Promise<AiModelResponse<BarberCard & { imageModel: string; imagePrompt: string }>> {
  const startTime = Date.now();
  const fallback = getFallbackBarberCard(input.guidance);

  const systemPrompt = `You are AinA's Barber Card stylist powered by muse-image.
Create a practical haircut reference card a user can show a local barber in Bangladesh.
CRITICAL SAFETY RULES:
- Never provide attractiveness scores, face ratings, or rankings.
- Keep the hairline natural; practical, humidity-friendly styles only.
Return strictly valid JSON matching the BarberCard schema (styleNameEn, styleNameBn, faceShape, hairTexture, topLength, sidesLength, fadeType, instructionsEn, instructionsBn, maintenanceEn, maintenanceBn, visualDescription, confidence).`;

  const userPrompt = `Create a barber reference card.
Face shape: ${input.guidance?.faceShape || fallback.faceShape || "oval"}
Hair texture: ${input.guidance?.hairTexture || fallback.hairTexture || "wavy"}
Desired style: ${input.desiredStyle || fallback.styleNameEn}
Language: ${input.locale === "bn" ? "Bangla first" : "English first"}`;

  const imagePrompt = `Barber reference card visual, front side and back views: ${fallback.visualDescription}`;

  try {
    const res = await callMetaModel({
      model: META_MODELS.IMAGE,
      systemPrompt,
      userPrompt,
      jsonMode: true,
    });

    const raw: unknown = JSON.parse(res.text);
    if (!containsForbiddenScoring(raw)) {
      const parsed = BarberCardSchema.safeParse(raw);
      if (parsed.success) {
        return {
          data: { ...parsed.data, imageModel: META_MODELS.IMAGE, imagePrompt },
          model: res.model,
          provider: res.cached ? "cache" : "meta",
          latencyMs: Date.now() - startTime,
          inputTokens: res.inputTokens,
          outputTokens: res.outputTokens,
          cached: res.cached,
        };
      }
    }
    console.warn("[Router] Barber card JSON validation failed, using fallback card.");
  } catch (err) {
    console.warn("[Router] muse-image barber card failed, using fallback card:", err);
  }

  return {
    data: { ...fallback, imageModel: META_MODELS.IMAGE, imagePrompt },
    model: "muse-image-fallback",
    provider: "fallback",
    latencyMs: Date.now() - startTime,
    cached: true,
  };
}

/**
 * 5. Bilingual AI Coach Chat (muse-spark-1.3)
 */
export async function chatWithCoach(input: {
  message: string;
  history?: Array<{ role: "user" | "assistant"; content: string }>;
  locale?: string;
  activeContext?: string;
}): Promise<AiModelResponse<string>> {
  const startTime = Date.now();
  const isBangla = input.locale === "bn";

  const systemPrompt = `You are AinA (আয়না) AI Coach.
You are a warm, supportive, and knowledgeable personal transformation mentor for adults in Bangladesh.
- Zero attractiveness scoring or body judgment.
- Answer in ${isBangla ? "Bangla (বাংলা)" : "English"}, blending natural local context.
- Keep responses concise (under 120 words), actionable, and grounded in skin/hair health.
${input.activeContext ? `Current User Context: ${input.activeContext}` : ""}`;

  try {
    const metaRes = await callMetaModel({
      model: META_MODELS.TEXT,
      systemPrompt,
      userPrompt: input.message,
    });

    return {
      data: metaRes.text,
      model: metaRes.model,
      provider: metaRes.cached ? "cache" : "meta",
      latencyMs: Date.now() - startTime,
      inputTokens: metaRes.inputTokens,
      outputTokens: metaRes.outputTokens,
      cached: metaRes.cached,
    };
  } catch {
    // Failover to Gemini Flash
    try {
      const geminiRes = await callGeminiFlash({
        systemPrompt,
        userPrompt: input.message,
      });

      return {
        data: geminiRes.text,
        model: geminiRes.model,
        provider: geminiRes.cached ? "cache" : "gemini",
        latencyMs: Date.now() - startTime,
        cached: geminiRes.cached,
      };
    } catch {
      return {
        data: isBangla
          ? "আপনার ত্বকের বাধা রক্ষায় প্রতিদিন মৃদু ক্লিনজার এবং সানস্ক্রিন ব্যবহার করুন। প্রচুর পানি পান করুন।"
          : "Focus on gentle cleansing, daily SPF 50+, and adequate hydration. Your skin barrier is your best foundation.",
        model: "coach-offline-fallback",
        provider: "fallback",
        latencyMs: Date.now() - startTime,
        cached: true,
      };
    }
  }
}
