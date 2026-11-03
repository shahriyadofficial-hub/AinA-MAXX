// lib/gamification/maxx.ts
// Pure AinA Maxx gamification domain: idempotent XP, Mirror Streak with
// Rest Day / Freeze tokens, Effort-Only leaderboard, privacy-safe Weekly
// Mirror Report, curated BDT shop catalog, and moderated Vibe feed.
// No database or network access here so every function is unit-testable.

import { xpForTask, type RoadmapTaskLike } from "@/lib/roadmap/plan";
import { runSafetyScreen } from "@/lib/ai/safety";
import { PRODUCT_PHOTOS, squareUrl } from "@/lib/media/photos";

// ---------------------------------------------------------------------------
// XP events (server-side idempotent)
// ---------------------------------------------------------------------------

export type CompletionAction = "completed" | "skipped" | "rest_day";

export interface XpAward {
  xpDelta: number;
  eventKey: string;
  idempotencyKey: string;
}

/**
 * Computes the XP award for a task completion. The idempotency key is
 * deterministic per (user, task, local day) so a retried POST can never
 * double-award: the database unique constraint on xp_events rejects it.
 */
export function computeXpAward(input: {
  userId: string;
  taskId: string;
  localDay: string; // YYYY-MM-DD (Asia/Dhaka)
  action: CompletionAction;
  estimatedMinutes: number;
  isRestDay: boolean;
}): XpAward {
  const base =
    input.action === "completed"
      ? xpForTask({ estimatedMinutes: input.estimatedMinutes, isRestDay: input.isRestDay })
      : input.action === "rest_day"
        ? 10
        : 0;

  return {
    xpDelta: base,
    eventKey: `task_${input.action}`,
    idempotencyKey: `xp:${input.userId}:${input.taskId}:${input.localDay}:${input.action}`,
  };
}

// ---------------------------------------------------------------------------
// Mirror Streak (Rest Day / Freeze tokens)
// ---------------------------------------------------------------------------

export interface StreakState {
  currentStreak: number;
  longestStreak: number;
  /** Last qualified day, YYYY-MM-DD (Asia/Dhaka) or null. */
  lastQualifiedDay: string | null;
  freezeTokens: number;
}

export const INITIAL_STREAK: StreakState = {
  currentStreak: 0,
  longestStreak: 0,
  lastQualifiedDay: null,
  freezeTokens: 1,
};

function dayDiff(a: string, b: string): number {
  const ms = Date.parse(`${b}T00:00:00Z`) - Date.parse(`${a}T00:00:00Z`);
  return Math.round(ms / 86_400_000);
}

/**
 * Advances the Mirror Streak for a newly qualified day.
 * - Same day: no change (idempotent).
 * - Next day: streak +1.
 * - One missed day with a freeze token: token consumed, streak preserved.
 * - Longer gap: streak resets to 1 (today counts).
 * Every 7-day milestone earns a new freeze token (max 3 banked).
 */
export function advanceStreak(state: StreakState, qualifiedDay: string): StreakState {
  if (state.lastQualifiedDay === qualifiedDay) return state;

  if (!state.lastQualifiedDay) {
    return {
      currentStreak: 1,
      longestStreak: Math.max(state.longestStreak, 1),
      lastQualifiedDay: qualifiedDay,
      freezeTokens: state.freezeTokens,
    };
  }

  const gap = dayDiff(state.lastQualifiedDay, qualifiedDay);
  let freezeTokens = state.freezeTokens;
  let currentStreak: number;

  if (gap === 1) {
    currentStreak = state.currentStreak + 1;
  } else if (gap === 2 && freezeTokens > 0) {
    freezeTokens -= 1;
    currentStreak = state.currentStreak + 1;
  } else if (gap <= 0) {
    return state; // out-of-order event; ignore
  } else {
    currentStreak = 1;
  }

  // Milestone reward: +1 freeze token every 7 streak days (bank max 3).
  if (currentStreak > 0 && currentStreak % 7 === 0) {
    freezeTokens = Math.min(3, freezeTokens + 1);
  }

  return {
    currentStreak,
    longestStreak: Math.max(state.longestStreak, currentStreak),
    lastQualifiedDay: qualifiedDay,
    freezeTokens,
  };
}

// ---------------------------------------------------------------------------
// Effort-Only Weekly Leaderboard
// ---------------------------------------------------------------------------

export interface LeaderboardEntry {
  displayName: string;
  area: string;
  weeklyXp: number;
  tasksCompleted: number;
  streakDays: number;
  isCurrentUser?: boolean;
}

/**
 * Effort-Only ranking: sorted by tasks completed, then XP. There is no
 * appearance metric anywhere in this system by design.
 */
export function rankLeaderboard(entries: LeaderboardEntry[]): Array<LeaderboardEntry & { rank: number }> {
  return [...entries]
    .sort((a, b) => b.tasksCompleted - a.tasksCompleted || b.weeklyXp - a.weeklyXp)
    .map((entry, i) => ({ ...entry, rank: i + 1 }));
}

export const DEMO_LEADERBOARD: LeaderboardEntry[] = [
  { displayName: "Tahmid F.", area: "Mirpur, Dhaka", weeklyXp: 320, tasksCompleted: 18, streakDays: 7 },
  { displayName: "Nusrat J.", area: "Uttara, Dhaka", weeklyXp: 295, tasksCompleted: 16, streakDays: 6 },
  { displayName: "You", area: "Dhaka", weeklyXp: 240, tasksCompleted: 14, streakDays: 4, isCurrentUser: true },
  { displayName: "Arif H.", area: "Chattogram", weeklyXp: 210, tasksCompleted: 12, streakDays: 5 },
  { displayName: "Priya S.", area: "Sylhet", weeklyXp: 180, tasksCompleted: 11, streakDays: 3 },
  { displayName: "Rahim U.", area: "Khulna", weeklyXp: 150, tasksCompleted: 9, streakDays: 2 },
];

// ---------------------------------------------------------------------------
// Privacy-safe Shareable Weekly Mirror Report
// ---------------------------------------------------------------------------

export interface MirrorReport {
  weekLabel: string;
  tasksCompleted: number;
  totalTasks: number;
  percentComplete: number;
  xpEarned: number;
  currentStreak: number;
  longestStreak: number;
  freezeTokens: number;
  topCategories: string[];
  /** Always false: the report never includes a face photo by default. */
  includesFacePhoto: false;
  headlineEn: string;
  headlineBn: string;
}

export function buildMirrorReport(input: {
  weekLabel: string;
  tasks: RoadmapTaskLike[];
  xpEarned: number;
  streak: StreakState;
}): MirrorReport {
  const totalTasks = input.tasks.length;
  const tasksCompleted = input.tasks.filter((t) => t.completed).length;
  const percentComplete = totalTasks === 0 ? 0 : Math.round((tasksCompleted / totalTasks) * 100);

  const categoryCounts = new Map<string, number>();
  for (const task of input.tasks) {
    if (task.completed) categoryCounts.set(task.category, (categoryCounts.get(task.category) ?? 0) + 1);
  }
  const topCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([category]) => category);

  return {
    weekLabel: input.weekLabel,
    tasksCompleted,
    totalTasks,
    percentComplete,
    xpEarned: input.xpEarned,
    currentStreak: input.streak.currentStreak,
    longestStreak: input.streak.longestStreak,
    freezeTokens: input.streak.freezeTokens,
    topCategories,
    includesFacePhoto: false,
    headlineEn: `${tasksCompleted} habits completed · ${input.streak.currentStreak}-day Mirror Streak · ${input.xpEarned} XP earned`,
    headlineBn: `${tasksCompleted}টি অভ্যাস সম্পন্ন · ${input.streak.currentStreak} দিনের Mirror Streak · ${input.xpEarned} XP অর্জিত`,
  };
}

// ---------------------------------------------------------------------------
// Curated BDT Shop
// ---------------------------------------------------------------------------

export interface ShopProduct {
  slug: string;
  name: string;
  brand: string;
  category: string;
  description: string;
  priceBdt: number;
  sellerName: string;
  isAffiliate: boolean;
  /** Real product photograph (Unsplash CDN) for the shop card. */
  image: string;
}

/** Client-safe mirror of the seeded catalog (prisma/seed.ts PRODUCTS_SEED). */
export const SHOP_PRODUCTS: ShopProduct[] = [
  { slug: "simple-refreshing-facial-wash", name: "Simple Kind to Skin Refreshing Facial Wash (150ml)", brand: "Simple", category: "skincare", description: "100% soap-free foaming gel cleanser with Pro-Vitamin B5 and Vitamin E. Ideal for Dhaka tap water.", priceBdt: 850, sellerName: "AinA Verified Beauty", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.skincareShelf) },
  { slug: "the-ordinary-niacinamide-10-zinc-1", name: "The Ordinary Niacinamide 10% + Zinc 1% (30ml)", brand: "The Ordinary", category: "skincare", description: "High-strength vitamin and mineral formula that visibly regulates sebum in high humidity.", priceBdt: 1350, sellerName: "Deciem Authorized Importer", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.skincareDropper) },
  { slug: "cosrx-advanced-snail-96-mucin-essence", name: "COSRX Advanced Snail 96 Mucin Power Essence (100ml)", brand: "COSRX", category: "skincare", description: "Lightweight hydration essence with 96% snail secretion filtrate to repair damaged barriers.", priceBdt: 1650, sellerName: "Korean Skincare BD", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.skincareCream) },
  { slug: "beauty-of-joseon-relief-sun-spf50", name: "Beauty of Joseon Relief Sun SPF50+ PA++++ (50ml)", brand: "Beauty of Joseon", category: "skincare", description: "Organic sunscreen with 30% Rice Extract. Zero white cast on South Asian skin tones.", priceBdt: 1450, sellerName: "Beauty Carousel BD", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.groomingKit) },
  { slug: "cerave-foaming-facial-cleanser", name: "CeraVe Foaming Facial Cleanser (236ml)", brand: "CeraVe", category: "skincare", description: "3 essential ceramides, niacinamide, and hyaluronic acid. Cleanses without disrupting the barrier.", priceBdt: 1850, sellerName: "SkinCafe Flagship", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.skincareShelf) },
  { slug: "minimalist-salicylic-acid-2-serum", name: "Minimalist Salicylic Acid 2% Serum (30ml)", brand: "Minimalist", category: "skincare", description: "Gentle daily BHA serum that penetrates pores to clear blackheads and excess sebum.", priceBdt: 1250, sellerName: "Minimalist Official Partner BD", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.skincareDropper) },
  { slug: "lafz-apple-cider-vinegar-shampoo", name: "Lafz Apple Cider Vinegar Clarifying Shampoo (200ml)", brand: "Lafz", category: "haircare", description: "Halal certified clarifying shampoo with organic Himalayan ACV and tea tree oil.", priceBdt: 550, sellerName: "Lafz Bangladesh", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.skincareCream) },
  { slug: "parachute-advansed-aloe-vera-coconut-oil", name: "Parachute Advansed Aloe Vera Coconut Hair Oil (250ml)", brand: "Parachute", category: "haircare", description: "Lightweight, non-sticky coconut oil with aloe vera to soften strands and nourish the scalp.", priceBdt: 320, sellerName: "Marico Bangladesh Official", isAffiliate: false, image: squareUrl(PRODUCT_PHOTOS.groomingKit) },
  { slug: "tresemme-keratin-smooth-mask", name: "TRESemmé Keratin Smooth Deep Smoothing Mask (300ml)", brand: "TRESemmé", category: "haircare", description: "Salon-grade anti-frizz mask with Marula oil and Keratin. Fights humidity frizz up to 72 hours.", priceBdt: 780, sellerName: "Unilever Personal Care", isAffiliate: false, image: squareUrl(PRODUCT_PHOTOS.skincareShelf) },
  { slug: "the-ordinary-glycolic-acid-7-toning-solution", name: "The Ordinary Glycolic Acid 7% Exfoliating Toner (240ml)", brand: "The Ordinary", category: "skincare", description: "Targeted AHA surface exfoliation to improve radiance and texture.", priceBdt: 1850, sellerName: "Deciem Authorized Importer", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.skincareDropper) },
  { slug: "neutrogena-hydro-boost-water-gel", name: "Neutrogena Hydro Boost Water Gel (50g)", brand: "Neutrogena", category: "skincare", description: "Ultra-lightweight oil-free water gel with hyaluronic acid. No pore-clogging heaviness.", priceBdt: 1600, sellerName: "Johnson & Johnson BD", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.skincareCream) },
  { slug: "panoxyl-acne-foaming-wash-10", name: "PanOxyl 10% Benzoyl Peroxide Foaming Wash (156g)", brand: "PanOxyl", category: "skincare", description: "Maximum strength antimicrobial cleanser for persistent inflammatory acne on face and back.", priceBdt: 1750, sellerName: "AinA Verified Pharmacy Partner", isAffiliate: true, image: squareUrl(PRODUCT_PHOTOS.groomingKit) },
];

export function formatBdt(amount: number): string {
  return `৳${amount.toLocaleString("en-IN")} BDT`;
}

export interface RoutineBagItem {
  product: ShopProduct;
  qty: number;
}

export function routineBagTotal(items: RoutineBagItem[]): number {
  return items.reduce((sum, item) => sum + item.product.priceBdt * item.qty, 0);
}

// ---------------------------------------------------------------------------
// AinA Vibe — moderated community feed
// ---------------------------------------------------------------------------

export interface VibePost {
  id: string;
  authorName: string;
  area: string;
  streakLabel: string;
  body: string;
  likes: number;
  comments: number;
  status: "published" | "pending" | "rejected";
}

export const VIBE_SEED_POSTS: VibePost[] = [
  {
    id: "vibe-1",
    authorName: "Tahmid F.",
    area: "Mirpur, Dhaka",
    streakLabel: "7-Day Mirror Streak",
    body: "Completed Day 7 PM hydration. Local aloe gel + ceramide moisturizer stopped all dryness from fan air at night!",
    likes: 24,
    comments: 5,
    status: "published",
  },
  {
    id: "vibe-2",
    authorName: "Nusrat J.",
    area: "Uttara, Dhaka",
    streakLabel: "6-Day Mirror Streak",
    body: "Rest day done right: no actives, just moisturizer and 8 hours of sleep. My barrier feels calm for the first time in weeks.",
    likes: 18,
    comments: 3,
    status: "published",
  },
  {
    id: "vibe-3",
    authorName: "Arif H.",
    area: "Chattogram",
    streakLabel: "5-Day Mirror Streak",
    body: "ACV clarifying wash once a week fixed my hard-water buildup. Hair feels lighter even in this humidity.",
    likes: 11,
    comments: 2,
    status: "published",
  },
];

export interface ModerationResult {
  status: "published" | "pending" | "rejected";
  reason: string | null;
}

const PROFANITY_OR_ABUSE = [/\b(idiot|stupid|loser|hate you)\b/i, /বোকা|মূর্খ/];
const EXTERNAL_LINK = /(https?:\/\/|www\.)/i;

/**
 * Deterministic Vibe moderation. Posts with scoring language are rejected
 * by the shared safety filter; links and abuse go to human review (pending);
 * everything else publishes immediately.
 */
export function moderateVibePost(body: string): ModerationResult {
  const screen = runSafetyScreen(body);
  if (!screen.passed) {
    return {
      status: "rejected",
      reason: "AinA Vibe is an effort-only space: no face scoring, ranking, or body judgment.",
    };
  }
  if (EXTERNAL_LINK.test(body)) {
    return { status: "pending", reason: "Links are reviewed by a moderator before publishing." };
  }
  if (PROFANITY_OR_ABUSE.some((p) => p.test(body))) {
    return { status: "pending", reason: "Flagged for moderator review (community kindness rules)." };
  }
  return { status: "published", reason: null };
}
