// prisma/seed.ts
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const PRODUCTS_SEED = [
  {
    slug: "simple-refreshing-facial-wash",
    name: "Simple Kind to Skin Refreshing Facial Wash (150ml)",
    brand: "Simple",
    category: "skincare",
    description: "100% soap-free foaming gel cleanser enriched with Pro-Vitamin B5 and Vitamin E. Ideal for Dhaka tap water and sensitive barriers.",
    ingredients: { active: ["Pro-Vitamin B5", "Vitamin E"], base: ["Triple Purified Water"] },
    currencyCode: "BDT",
    currentPrice: 850.00,
    stockStatus: "available",
    sellerName: "AinA Verified Beauty",
    imagePath: "/images/products/simple-wash.png",
    isAffiliate: true,
    isPublished: true,
  },
  {
    slug: "the-ordinary-niacinamide-10-zinc-1",
    name: "The Ordinary Niacinamide 10% + Zinc 1% (30ml)",
    brand: "The Ordinary",
    category: "skincare",
    description: "High-strength vitamin and mineral blemish formula that visibly regulates sebum in Bangladesh's high humidity.",
    ingredients: { active: ["Niacinamide 10%", "Zinc PCA 1%"] },
    currencyCode: "BDT",
    currentPrice: 1350.00,
    stockStatus: "available",
    sellerName: "Deciem Authorized Importer",
    imagePath: "/images/products/ordinary-niacinamide.png",
    isAffiliate: true,
    isPublished: true,
  },
  {
    slug: "cosrx-advanced-snail-96-mucin-essence",
    name: "COSRX Advanced Snail 96 Mucin Power Essence (100ml)",
    brand: "COSRX",
    category: "skincare",
    description: "Lightweight yet intense hydration essence with 96% snail secretion filtrate to repair damaged skin barriers and soothe redness.",
    ingredients: { active: ["Snail Secretion Filtrate 96%", "Sodium Hyaluronate", "Allantoin"] },
    currencyCode: "BDT",
    currentPrice: 1650.00,
    stockStatus: "available",
    sellerName: "Korean Skincare BD",
    imagePath: "/images/products/cosrx-snail.png",
    isAffiliate: true,
    isPublished: true,
  },
  {
    slug: "beauty-of-joseon-relief-sun-spf50",
    name: "Beauty of Joseon Relief Sun: Rice + Probiotics SPF50+ PA++++ (50ml)",
    brand: "Beauty of Joseon",
    category: "skincare",
    description: "Organic chemical sunscreen with 30% Rice Extract and Grain Probiotics that leaves zero white cast on South Asian skin tones.",
    ingredients: { active: ["Rice Extract 30%", "Grain Fermented Extracts"], filters: ["Uvinul A Plus", "Tinosorb M"] },
    currencyCode: "BDT",
    currentPrice: 1450.00,
    stockStatus: "available",
    sellerName: "Beauty Carousel BD",
    imagePath: "/images/products/boj-sunscreen.png",
    isAffiliate: true,
    isPublished: true,
  },
  {
    slug: "cerave-foaming-facial-cleanser",
    name: "CeraVe Foaming Facial Cleanser for Normal to Oily Skin (236ml)",
    brand: "CeraVe",
    category: "skincare",
    description: "Formulated with 3 essential ceramides, niacinamide, and hyaluronic acid to cleanse without disrupting the skin barrier.",
    ingredients: { active: ["Ceramides 1, 3, 6-II", "Hyaluronic Acid", "Niacinamide"] },
    currencyCode: "BDT",
    currentPrice: 1850.00,
    stockStatus: "available",
    sellerName: "SkinCafe Flagship",
    imagePath: "/images/products/cerave-cleanser.png",
    isAffiliate: true,
    isPublished: true,
  },
  {
    slug: "minimalist-salicylic-acid-2-serum",
    name: "Minimalist Salicylic Acid 2% Oil Control Serum (30ml)",
    brand: "Minimalist",
    category: "skincare",
    description: "Gentle daily BHA serum with oligopeptide that penetrates deep into pores to clear blackheads and excess sebum.",
    ingredients: { active: ["Salicylic Acid 2%", "Oligopeptide-10", "EWG Green Aloe"] },
    currencyCode: "BDT",
    currentPrice: 1250.00,
    stockStatus: "available",
    sellerName: "Minimalist Official Partner BD",
    imagePath: "/images/products/minimalist-salicylic.png",
    isAffiliate: true,
    isPublished: true,
  },
  {
    slug: "lafz-apple-cider-vinegar-shampoo",
    name: "Lafz Apple Cider Vinegar Clarifying Shampoo (200ml)",
    brand: "Lafz",
    category: "haircare",
    description: "Halal certified, 100% vegetarian clarifying shampoo formulated with organic Himalayan ACV and tea tree oil to balance scalp pH.",
    ingredients: { active: ["Apple Cider Vinegar", "Tea Tree Oil", "Vitamin E"] },
    currencyCode: "BDT",
    currentPrice: 550.00,
    stockStatus: "available",
    sellerName: "Lafz Bangladesh",
    imagePath: "/images/products/lafz-acv-shampoo.png",
    isAffiliate: true,
    isPublished: true,
  },
  {
    slug: "parachute-advansed-aloe-vera-coconut-oil",
    name: "Parachute Advansed Aloe Vera Enriched Coconut Hair Oil (250ml)",
    brand: "Parachute",
    category: "haircare",
    description: "Lightweight, non-sticky hair oil blending pure coconut oil with aloe vera extract to soften hair strands and nourish the scalp.",
    ingredients: { active: ["Coconut Oil", "Aloe Vera Gel Extracts"] },
    currencyCode: "BDT",
    currentPrice: 320.00,
    stockStatus: "available",
    sellerName: "Marico Bangladesh Official",
    imagePath: "/images/products/parachute-aloe.png",
    isAffiliate: false,
    isPublished: true,
  },
  {
    slug: "tresemme-keratin-smooth-mask",
    name: "TRESemmé Keratin Smooth Deep Smoothing Mask (300ml)",
    brand: "TRESemmé",
    category: "haircare",
    description: "Salon-grade anti-frizz mask infused with Marula oil and Keratin to combat humidity frizz for up to 72 hours.",
    ingredients: { active: ["Keratin Protein", "African Marula Oil"] },
    currencyCode: "BDT",
    currentPrice: 780.00,
    stockStatus: "available",
    sellerName: "Unilever Pureit / Personal Care",
    imagePath: "/images/products/tresemme-keratin.png",
    isAffiliate: false,
    isPublished: true,
  },
  {
    slug: "the-ordinary-glycolic-acid-7-toning-solution",
    name: "The Ordinary Glycolic Acid 7% Exfoliating Toner (240ml)",
    brand: "The Ordinary",
    category: "skincare",
    description: "Targeted AHA surface exfoliation toner to improve skin radiance and texture. Also effective as an underarm odor neutralizer.",
    ingredients: { active: ["Glycolic Acid 7%", "Tasmanian Pepperberry", "Aloe Vera"] },
    currencyCode: "BDT",
    currentPrice: 1850.00,
    stockStatus: "available",
    sellerName: "Deciem Authorized Importer",
    imagePath: "/images/products/ordinary-glycolic.png",
    isAffiliate: true,
    isPublished: true,
  },
  {
    slug: "neutrogena-hydro-boost-water-gel",
    name: "Neutrogena Hydro Boost Water Gel Moisturizer (50g)",
    brand: "Neutrogena",
    category: "skincare",
    description: "Ultra-lightweight oil-free water gel with hyaluronic acid that instantly quenches dehydrated skin without pore-clogging heaviness.",
    ingredients: { active: ["Purified Hyaluronic Acid", "Prebiotics", "Trehalose"] },
    currencyCode: "BDT",
    currentPrice: 1600.00,
    stockStatus: "available",
    sellerName: "Johnson & Johnson BD",
    imagePath: "/images/products/neutrogena-hydro.png",
    isAffiliate: true,
    isPublished: true,
  },
  {
    slug: "panoxyl-acne-foaming-wash-10",
    name: "PanOxyl 10% Benzoyl Peroxide Maximum Strength Foaming Wash (156g)",
    brand: "PanOxyl",
    category: "skincare",
    description: "Dermatologist-recommended maximum strength antimicrobial cleanser for persistent inflammatory acne on face and back.",
    ingredients: { active: ["Benzoyl Peroxide 10%"] },
    currencyCode: "BDT",
    currentPrice: 1750.00,
    stockStatus: "available",
    sellerName: "AinA Verified Pharmacy Partner",
    imagePath: "/images/products/panoxyl-10.png",
    isAffiliate: true,
    isPublished: true,
  },
];

export const ROUTINES_SEED = [
  {
    slug: "beginner-barrier-reset",
    title: "Beginner Skin Barrier Reset (AM/PM)",
    category: "skin",
    locale: "en",
    budgetTier: "budget",
    content: "A gentle 2-step morning and 3-step evening routine designed to soothe irritated skin and repair the lipid barrier without heavy actives.",
    safetyNotes: "Always patch test on your inner arm first. Do not introduce active exfoliating acids until moisture barrier feels calm for 14 continuous days.",
    steps: [
      { stepOrder: 1, title: "AM Gentle Cleansing", instructions: "Wash face with lukewarm water or a single pump of Simple Refreshing Gel Cleanser.", timeOfDay: "morning", estimatedMinutes: 2 },
      { stepOrder: 2, title: "AM Sun Protection", instructions: "Apply 2 finger lengths of Beauty of Joseon SPF50+ evenly to face, neck, and ears.", timeOfDay: "morning", estimatedMinutes: 3 },
      { stepOrder: 3, title: "PM Double Cleanse / Gentle Wash", instructions: "Cleanse away daily dust, pollution, and sunscreen thoroughly.", timeOfDay: "evening", estimatedMinutes: 3 },
      { stepOrder: 4, title: "PM Snail Mucin / Hydration", instructions: "Pat COSRX Snail Mucin onto slightly damp skin for deep moisture replenishment.", timeOfDay: "evening", estimatedMinutes: 2 },
      { stepOrder: 5, title: "PM Barrier Lock Moisturizer", instructions: "Apply a pea-sized amount of CeraVe or light water gel to lock in moisture before sleep.", timeOfDay: "evening", estimatedMinutes: 2 },
    ],
  },
  {
    slug: "monsoon-acne-control",
    title: "Monsoon Humidity Acne Control",
    category: "skin",
    locale: "en",
    budgetTier: "mid",
    content: "Formulated specifically for high-humidity climates where excess sweat and sebum combine to clog pores.",
    safetyNotes: "Alternate BHA and Niacinamide if your skin is prone to stinging. Never skip sunscreen while using chemical exfoliants.",
    steps: [
      { stepOrder: 1, title: "AM Sebum Regulating Wash", instructions: "Cleanse with CeraVe Foaming Cleanser.", timeOfDay: "morning", estimatedMinutes: 2 },
      { stepOrder: 2, title: "AM Niacinamide Balancing Drops", instructions: "Apply 3 drops of The Ordinary Niacinamide 10% across the T-zone.", timeOfDay: "morning", estimatedMinutes: 2 },
      { stepOrder: 3, title: "AM Featherlight Sunscreen", instructions: "Protect against UVA/UVB with non-greasy organic filters.", timeOfDay: "morning", estimatedMinutes: 3 },
      { stepOrder: 4, title: "PM Salicylic Acid (BHA) Treatment", instructions: "Apply Minimalist 2% Salicylic Acid on Tuesday & Friday nights only.", timeOfDay: "evening", estimatedMinutes: 3 },
      { stepOrder: 5, title: "PM Oil-Free Hydration", instructions: "Soothe with Neutrogena Hydro Boost Water Gel.", timeOfDay: "evening", estimatedMinutes: 2 },
    ],
  },
  {
    slug: "hair-density-protocol",
    title: "Hair Volume & Scalp Density Protocol",
    category: "hair",
    locale: "en",
    budgetTier: "budget",
    content: "Designed to remove hard water mineral buildup and nourish roots for stronger hair strands.",
    safetyNotes: "Do not leave pure oil on scalp for longer than 60 minutes if you suffer from fungal dandruff.",
    steps: [
      { stepOrder: 1, title: "Pre-Wash Aloe Oil Scalp Massage", instructions: "Gently massage Parachute Aloe Coconut oil into scalp 45 minutes prior to showering.", timeOfDay: "day", estimatedMinutes: 5 },
      { stepOrder: 2, title: "Scalp Clarifying Wash", instructions: "Lather Lafz Apple Cider Vinegar shampoo to remove hard water mineral residue.", timeOfDay: "day", estimatedMinutes: 4 },
      { stepOrder: 3, title: "Mid-Length Frizz Conditioning", instructions: "Apply Tresemme Keratin mask to hair ends, leaving on for 3 minutes before cold rinse.", timeOfDay: "day", estimatedMinutes: 4 },
    ],
  },
  {
    slug: "glass-skin-uv-shield",
    title: "Glass Skin Hydration & UV Shield",
    category: "skin",
    locale: "en",
    budgetTier: "mid",
    content: "The ultimate K-Beauty glow routine optimized for South Asian undertones with zero greasy residue.",
    safetyNotes: "Hydrating layers work best when patted onto slightly damp skin rather than completely dry skin.",
    steps: [
      { stepOrder: 1, title: "AM Hydrating Splash", instructions: "Gentle cleanse with Simple Foaming Gel.", timeOfDay: "morning", estimatedMinutes: 2 },
      { stepOrder: 2, title: "AM Snail Mucin Glaze", instructions: "Smooth 2 pumps of COSRX Snail Essence all over face.", timeOfDay: "morning", estimatedMinutes: 2 },
      { stepOrder: 3, title: "AM Probiotic Glow Sunscreen", instructions: "Generously apply Beauty of Joseon SPF50+ for a dewy, protected finish.", timeOfDay: "morning", estimatedMinutes: 3 },
    ],
  },
];

export const LOOKBOOK_OUTFITS_SEED = [
  {
    title: "Old Dhaka Heritage Streetwear",
    occasion: "everyday",
    season: "all",
    notes: "A fusion of traditional Bangladeshi silhouette and modern streetwear. Breathable, comfortable, and iconic.",
  },
  {
    title: "Monsoon Techwear Rain Shield",
    occasion: "weather",
    season: "monsoon",
    notes: "Engineered for sudden Dhaka downpours with quick-dry materials, water-resistant fabrics, and waterproof chelsea boots.",
  },
  {
    title: "Gulshan Smart Casual Friday",
    occasion: "work_casual",
    season: "summer",
    notes: "Linen camp-collar shirt paired with relaxed pleat trousers and minimal loafers for meetings and evening hangouts.",
  },
  {
    title: "Minimalist Jet Black Monochrome",
    occasion: "evening",
    season: "all",
    notes: "Heavyweight 240 GSM oversized Jet Black tee with structured charcoal trousers reflecting the AinA Prime aesthetic.",
  },
];

async function main() {
  console.log("🌱 Seeding AinA (Ai∩A MAXX) Database...");

  // 1. Seed Products
  console.log("   -> Seeding 12 Verified Bangladeshi & Global Products...");
  const productMap = new Map<string, string>();
  for (const prod of PRODUCTS_SEED) {
    const record = await prisma.product.upsert({
      where: { slug: prod.slug },
      update: prod,
      create: prod,
    });
    productMap.set(prod.slug, record.id);
  }

  // 2. Seed Curated Routine Templates & Steps
  console.log("   -> Seeding 4 Curated Routines...");
  for (const r of ROUTINES_SEED) {
    const routine = await prisma.routineTemplate.upsert({
      where: { slug: r.slug },
      update: {
        title: r.title,
        category: r.category,
        locale: r.locale,
        budgetTier: r.budgetTier,
        content: r.content,
        safetyNotes: r.safetyNotes,
        isPublished: true,
      },
      create: {
        slug: r.slug,
        title: r.title,
        category: r.category,
        locale: r.locale,
        budgetTier: r.budgetTier,
        content: r.content,
        safetyNotes: r.safetyNotes,
        isPublished: true,
      },
    });

    // Delete existing steps to replace idempotently
    await prisma.routineStep.deleteMany({
      where: { routineId: routine.id },
    });

    for (const step of r.steps) {
      await prisma.routineStep.create({
        data: {
          routineId: routine.id,
          stepOrder: step.stepOrder,
          title: step.title,
          instructions: step.instructions,
          timeOfDay: step.timeOfDay,
          estimatedMinutes: step.estimatedMinutes,
        },
      });
    }
  }

  // 3. Seed Demo Profile & Outfits for Lookbook
  console.log("   -> Seeding Demo Profile & 4 Lookbook Outfits...");
  const demoProfile = await prisma.profile.upsert({
    where: { id: "00000000-0000-0000-0000-000000000001" },
    update: {
      displayName: "AinA Demo User",
      locale: "en",
      adultAccessEnabled: true,
    },
    create: {
      id: "00000000-0000-0000-0000-000000000001",
      displayName: "AinA Demo User",
      locale: "en",
      timezone: "Asia/Dhaka",
      adultAccessEnabled: true,
    },
  });

  for (const outfit of LOOKBOOK_OUTFITS_SEED) {
    const existing = await prisma.outfit.findFirst({
      where: { title: outfit.title, userId: demoProfile.id },
    });
    if (!existing) {
      await prisma.outfit.create({
        data: {
          userId: demoProfile.id,
          title: outfit.title,
          occasion: outfit.occasion,
          season: outfit.season,
          notes: outfit.notes,
          isCurated: true,
        },
      });
    }
  }

  console.log("✅ Seed completed successfully!");
}

if (process.argv[1] && process.argv[1].replace(/\\/g, "/").endsWith("prisma/seed.ts")) {
  main()
    .catch((e) => {
      console.error("❌ Seeding failed:", e);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
