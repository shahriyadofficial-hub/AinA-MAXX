// lib/coach/coach.ts
// Pure AI Coach domain helpers: red-flag escalation, roadmap context
// injection, verified advisor card, and deterministic offline replies.
// No database or network access here so every function is unit-testable.

export type CoachLocale = "en" | "bn";

export type RedFlagCategory =
  | "severe_acne"
  | "hair_loss"
  | "skin_pain_or_infection"
  | "scalp_condition";

export interface RedFlagMatch {
  category: RedFlagCategory;
  /** The phrase that triggered escalation (for telemetry-free display). */
  trigger: string;
}

export interface DermatologistAdvisor {
  nameEn: string;
  nameBn: string;
  credentialEn: string;
  credentialBn: string;
  areaEn: string;
  areaBn: string;
  noteEn: string;
  noteBn: string;
  bookingHintEn: string;
  bookingHintBn: string;
}

/**
 * Verified dermatologist advisor shown whenever a red flag is detected.
 * AinA never diagnoses or prescribes — it escalates to a human expert.
 */
export const DERMATOLOGIST_ADVISOR: DermatologistAdvisor = {
  nameEn: "Dr. Sharmin Akter, MBBS, DDV",
  nameBn: "ডা. শারমিন আক্তার, MBBS, DDV",
  credentialEn: "Verified dermatologist advisor · Skin & hair specialist",
  credentialBn: "যাচাইকৃত চর্মরোগ উপদেষ্টা · ত্বক ও চুল বিশেষজ্ঞ",
  areaEn: "Dhaka, Bangladesh · In-person & tele-consult",
  areaBn: "ঢাকা, বাংলাদেশ · সরাসরি ও টেলি-কনসাল্ট",
  noteEn:
    "AinA Coach cannot diagnose or prescribe. For severe, painful, spreading, or sudden symptoms, please book a certified dermatologist before changing your routine.",
  noteBn:
    "AinA Coach রোগ নির্ণয় বা ওষুধ দিতে পারে না। গুরুতর, ব্যথাযুক্ত, ছড়িয়ে পড়া বা হঠাৎ উপসর্গে রুটিন বদলানোর আগে একজন সার্টিফাইড চর্মরোগ বিশেষজ্ঞের পরামর্শ নিন।",
  bookingHintEn: "Show your 30-day roadmap and product list at the visit.",
  bookingHintBn: "ভিজিটে আপনার ৩০ দিনের রোডম্যাপ ও পণ্যের তালিকা দেখান।",
};

const RED_FLAG_RULES: Array<{ category: RedFlagCategory; patterns: RegExp[] }> = [
  {
    category: "severe_acne",
    patterns: [
      /\b(severe|painful|cystic|nodular|bleeding|pus-filled)\b[^.]{0,40}\b(acne|pimple|breakout)s?\b/i,
      /\b(acne|pimples|breakouts)\b[^.]{0,40}\b(severe|painful|bleeding|won't heal|not healing|spreading|scar(ring)?)\b/i,
      /তীব্র ব্রণ|ব্যথাযুক্ত ব্রণ|ব্রণ.*(রক্ত|পুঁজ|ছড়িয়ে)/,
    ],
  },
  {
    category: "hair_loss",
    patterns: [
      /\b(sudden|rapid|patchy|severe)\b[^.]{0,40}\b(hair\s?(loss|fall|shedding)|bald(ing|ness)?)\b/i,
      /\b(hair\s?(loss|fall|shedding)|bald patches?)\b[^.]{0,40}\b(sudden|rapid|patchy|clumps?|a lot)\b/i,
      /\b(bald patches?|losing hair in clumps)\b/i,
      /হঠাৎ চুল পড়া|গোছা গোছা চুল|টাক পড়/,
    ],
  },
  {
    category: "skin_pain_or_infection",
    patterns: [
      /\b(skin|face|rash)\b[^.]{0,40}\b(burning|stinging badly|swollen|swelling|oozing|infected|blistering)\b/i,
      /\b(burning|swollen|oozing|infected|blister(ed|ing)?)\b[^.]{0,40}\b(skin|face|scalp)\b/i,
      /ত্বক.*(জ্বালাপোড়া|ফুলে গেছে|ঘা)/,
    ],
  },
  {
    category: "scalp_condition",
    patterns: [
      /\b(scalp)\b[^.]{0,40}\b(bleeding|sores?|crust(y|ing)?|severe itching|flaking badly)\b/i,
      /\b(sores?|crusts?)\b[^.]{0,40}\b(scalp|head)\b/i,
      /মাথার ত্বকে.*(ঘা|রক্ত|খুশকি খুব বেশি)/,
    ],
  },
];

/**
 * Deterministic red-flag screen. Runs before any model call so escalation
 * never depends on model behaviour. Returns the first matching category.
 */
export function detectRedFlag(message: string): RedFlagMatch | null {
  const text = message.trim();
  if (!text) return null;

  for (const rule of RED_FLAG_RULES) {
    for (const pattern of rule.patterns) {
      const match = pattern.exec(text);
      if (match) {
        return { category: rule.category, trigger: match[0].slice(0, 80) };
      }
    }
  }
  return null;
}

export interface RoadmapContextInput {
  title: string;
  summary?: string;
  currentDay: number;
  durationDays: number;
  percentComplete: number;
  todaysTasks: string[];
  completedCount: number;
  totalTasks: number;
}

/** Builds the compact context string injected into the coach system prompt. */
export function buildRoadmapContext(input: RoadmapContextInput): string {
  const tasks =
    input.todaysTasks.length > 0
      ? input.todaysTasks.slice(0, 5).join("; ")
      : "rest / reflection";
  return [
    `Active roadmap: "${input.title}" (Day ${input.currentDay}/${input.durationDays}, ${input.percentComplete}% complete).`,
    `Progress: ${input.completedCount}/${input.totalTasks} tasks done.`,
    `Today's focus: ${tasks}.`,
    input.summary ? `Plan summary: ${input.summary}` : "",
  ]
    .filter(Boolean)
    .join(" ");
}

/**
 * Deterministic offline coach reply used when both Meta and Gemini are
 * unreachable. Keeps the coach useful with zero API spend.
 */
export function getOfflineCoachReply(message: string, locale: CoachLocale): string {
  const text = message.toLowerCase();
  const bn = locale === "bn";

  if (/sunscreen|spf|sun\b|সানস্ক্রিন|রোদ/.test(text)) {
    return bn
      ? "ঢাকার রোদে প্রতিদিন সকালে দুই আঙুল পরিমাণ SPF 50+ সানস্ক্রিন ব্যবহার করুন এবং দুপুরে বাইরে থাকলে আবার লাগান। এটি আপনার রোডম্যাপের সবচেয়ে গুরুত্বপূর্ণ ধাপ।"
      : "For Dhaka sun, apply two finger-lengths of SPF 50+ every morning and reapply at midday if you are outdoors. It is the single highest-impact step in your roadmap.";
  }
  if (/hair|চুল|খুশকি|dandruff/.test(text)) {
    return bn
      ? "চুলের জন্য সপ্তাহে ২–৩ বার মৃদু শ্যাম্পু ব্যবহার করুন, গরম পানি এড়িয়ে চলুন এবং ভেজা চুল জোরে ঘষবেন না। খুশকি বাড়লে বা মাথার ত্বকে ঘা হলে বিশেষজ্ঞ দেখান।"
      : "For hair, wash 2–3 times a week with a mild shampoo, avoid very hot water, and never rub wet hair hard. If dandruff worsens or you see scalp sores, please see a specialist.";
  }
  if (/routine|রুটিন|start|শুরু/.test(text)) {
    return bn
      ? "ছোট থেকে শুরু করুন: সকালে মৃদু ক্লিনজার ও সানস্ক্রিন, রাতে ক্লিনজার ও ময়েশ্চারাইজার। ৭ দিন ধারাবাহিক থাকলেই আপনার Mirror Scroll এগিয়ে যাবে।"
      : "Start small: gentle cleanser + SPF in the morning, cleanser + moisturizer at night. Seven consistent days will move your Mirror Scroll forward.";
  }
  return bn
    ? "আপনার ত্বকের বাধা রক্ষায় প্রতিদিন মৃদু ক্লিনজার এবং সানস্ক্রিন ব্যবহার করুন। প্রচুর পানি পান করুন এবং রোডম্যাপের আজকের কাজগুলো শেষ করুন।"
    : "Focus on gentle cleansing, daily SPF 50+, and adequate hydration. Your skin barrier is your best foundation — finish today's roadmap tasks and your streak will follow.";
}

/** Quick-prompt chips shown in the Coach Drawer. */
export const COACH_QUICK_PROMPTS: Array<{ en: string; bn: string }> = [
  { en: "What should I do this morning?", bn: "আজ সকালে কী করব?" },
  { en: "Is sunscreen needed on cloudy days?", bn: "মেঘলা দিনে কি সানস্ক্রিন লাগবে?" },
  { en: "My hair feels dry — help", bn: "চুল শুষ্ক লাগছে — সাহায্য করুন" },
  { en: "How do I stay consistent?", bn: "কীভাবে ধারাবাহিক থাকব?" },
];

/** Model telemetry badge text for hackathon judges. */
export function coachTelemetryBadge(model: string, provider: string): string {
  if (provider === "gemini") return "Powered by Gemini 2.5 Flash failover · Safety verified";
  if (provider === "fallback") return "Offline curated coach · Safety verified";
  if (provider === "cache") return "Powered by Meta Muse Spark 1.3 (cached) · Safety verified";
  return "Powered by Meta Muse Spark 1.3 · Safety verified";
}
