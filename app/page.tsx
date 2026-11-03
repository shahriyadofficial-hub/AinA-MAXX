import React from "react";
import Link from "next/link";
import {
  Compass,
  Flame,
  Shirt,
  ShoppingBag,
  ShieldCheck,
  ArrowRight,
  Zap,
  Target,
  ScanFace,
  MessageCircle,
  Sparkles,
  Layers,
  Award,
} from "lucide-react";
import { AinaLogo } from "@/components/brand/AinaLogo";
import Image from "next/image";
import { MODEL_PHOTOS, PRODUCT_PHOTOS, PHOTO_LICENSE_NOTE, photoUrl, portraitUrl } from "@/lib/media/photos";
import { MirrorReportCard } from "@/components/maxx/MirrorReportCard";
import { Leaderboard } from "@/components/maxx/Leaderboard";
import {
  INITIAL_STREAK,
  DEMO_LEADERBOARD,
  rankLeaderboard,
  buildMirrorReport,
} from "@/lib/gamification/maxx";
import { getCuratedFallbackRoadmap } from "@/lib/roadmap/fallback";

const TRENDING_LOOKS = [
  {
    src: portraitUrl(MODEL_PHOTOS.streetEditorial, 520),
    alt: MODEL_PHOTOS.streetEditorial.alt,
    tag: "Street",
    title: "Dhaka Street Editorial",
    note: "Relaxed layers built for humid evenings",
  },
  {
    src: portraitUrl(MODEL_PHOTOS.monoNight, 520),
    alt: MODEL_PHOTOS.monoNight.alt,
    tag: "Monochrome",
    title: "Mono Night Fit",
    note: "One-tone dressing, zero effort look",
  },
  {
    src: portraitUrl(MODEL_PHOTOS.smartCasual, 520),
    alt: MODEL_PHOTOS.smartCasual.alt,
    tag: "Smart casual",
    title: "Office-to-Adda",
    note: "Sharp enough for work, easy for after",
  },
  {
    src: portraitUrl(MODEL_PHOTOS.linenMood, 520),
    alt: MODEL_PHOTOS.linenMood.alt,
    tag: "Breathable",
    title: "Linen Monsoon Mood",
    note: "Airy fabrics that survive the rain season",
  },
  {
    src: photoUrl(PRODUCT_PHOTOS.leatherJacket, 520),
    alt: PRODUCT_PHOTOS.leatherJacket.alt,
    tag: "Statement",
    title: "Leather Jacket Edit",
    note: "The one piece that upgrades everything",
  },
] as const;

export default function HomePage() {
  const fallbackTasks = getCuratedFallbackRoadmap().tasks.map((t) => ({
    ...t,
    completed: false,
  }));
  const mirrorReport = buildMirrorReport({
    weekLabel: "Week 1",
    tasks: fallbackTasks,
    xpEarned: 0,
    streak: INITIAL_STREAK,
  });
  const leaderboard = rankLeaderboard(DEMO_LEADERBOARD);

  return (
    <div className="space-y-8">
      {/* Brand Hero Showcase — real editorial photography */}
      <section className="relative overflow-hidden rounded-2xl md:rounded-3xl border border-white/10 shadow-2xl">
        <Image
          src={portraitUrl(MODEL_PHOTOS.heroPortrait, 1600)}
          alt={MODEL_PHOTOS.heroPortrait.alt}
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-r from-aina-black/95 via-aina-black/70 to-aina-black/15" />
        <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-aina-black/85 via-transparent to-aina-black/30" />
        <div className="absolute -top-16 -right-16 w-64 h-64 md:w-96 md:h-96 bg-aina-rose/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-64 h-64 md:w-96 md:h-96 bg-aina-cerulean/25 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-8 p-6 sm:p-8 lg:p-12">
          {/* Hero Left / Center Content */}
          <div className="flex flex-col items-center md:items-start text-center md:text-left space-y-4 max-w-2xl">
            <AinaLogo size="lg" showSubtitle={true} variant="primary" />

            <div className="space-y-1.5 pt-2">
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold font-display tracking-tight text-white">
                Reflect the Prime You
              </h1>
              <p className="text-sm sm:text-base font-bengali text-neutral-300">
                আয়নায় দেখো তোমার সেরা তুমি
              </p>
            </div>

            <p className="text-xs sm:text-sm text-neutral-400 max-w-xl leading-relaxed">
              AI-guided personal transformation platform for skin, hair, fitness,
              food, and fashion tailored for Bangladesh’s humid monsoon climate and
              everyday lifestyle. Powered by Meta Muse & SAM 3.1.
            </p>

            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 pt-2">
              <Link
                href="/roadmap"
                className="inline-flex items-center space-x-2 px-6 py-3 rounded-full bg-aina-rose text-white text-xs sm:text-sm font-semibold tracking-wide shadow-glow-rose hover:bg-aina-rose/90 transition-all hover:scale-105 active:scale-95"
              >
                <span>Start 30-Day Roadmap</span>
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/wardrobe"
                className="inline-flex items-center space-x-2 px-5 py-3 rounded-full bg-aina-graphite/90 text-neutral-200 text-xs sm:text-sm font-semibold border border-white/10 hover:border-aina-cerulean/50 transition-all hover:scale-105"
              >
                <Shirt className="w-4 h-4 text-aina-light-cerulean" />
                <span>AinA Drip · 3D Lookbook</span>
              </Link>
            </div>
          </div>

          {/* Hero Right Decorative Highlights (Desktop) */}
          <div className="hidden lg:flex flex-col space-y-3 w-72 shrink-0">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center space-x-2.5 text-aina-light-cerulean text-xs font-bold mb-1">
                <Sparkles className="w-4 h-4" />
                <span>Meta Model Routing</span>
              </div>
              <p className="text-[11px] text-neutral-300">
                muse-spark-1.3 for 30-day plans & bilingual coach; muse-wonder for climate ingredient triage.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="flex items-center space-x-2.5 text-aina-rose text-xs font-bold mb-1">
                <Layers className="w-4 h-4" />
                <span>3D Interactive Fashion</span>
              </div>
              <p className="text-[11px] text-neutral-300">
                Studio-lit 3D mannequin, garment orbit, floating fabric tags, and routine combos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid: Responsive 3-Column Desktop Grid */}
      <section className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
        <div className="glass-panel rounded-2xl p-5 flex items-center space-x-4 border border-white/10 hover:border-aina-rose/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-aina-rose/15 flex items-center justify-center text-aina-rose shrink-0 shadow-glow-rose">
            <Flame className="w-6 h-6 fill-aina-rose" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-display text-white">Day 1</span>
              <span className="text-xs text-aina-rose font-semibold uppercase tracking-wider">Active</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Mirror Consistency Streak</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center space-x-4 border border-white/10 hover:border-aina-cerulean/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-aina-cerulean/15 flex items-center justify-center text-aina-light-cerulean shrink-0">
            <Zap className="w-6 h-6 fill-aina-light-cerulean" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-display text-white">0 XP</span>
              <span className="text-xs text-aina-light-cerulean font-semibold uppercase tracking-wider">Level 1</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Daily Prime Points · Cap 100 XP</p>
          </div>
        </div>

        <div className="glass-panel rounded-2xl p-5 flex items-center space-x-4 border border-white/10 hover:border-emerald-500/40 transition-all">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 flex items-center justify-center text-emerald-400 shrink-0">
            <Target className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-baseline space-x-2">
              <span className="text-2xl font-extrabold font-display text-white">30 Days</span>
              <span className="text-xs text-emerald-400 font-semibold uppercase tracking-wider">Curated</span>
            </div>
            <p className="text-xs text-neutral-400 mt-0.5">Plan Adherence Target</p>
          </div>
        </div>
      </section>

      {/* Transformation Modules: Responsive 4-Column Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 font-display">
            Transformation Modules
          </h2>
          <span className="text-xs text-neutral-500">6 Specialized AI Engines</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {/* Roadmap */}
          <Link
            href="/roadmap"
            className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between min-h-[140px] group border border-white/5 hover:border-aina-rose/40"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-aina-rose/15 text-aina-rose flex items-center justify-center group-hover:scale-110 transition-transform">
                <Compass className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-aina-rose bg-aina-rose/10 px-2 py-0.5 rounded-full">
                muse-spark
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-aina-rose transition-colors">
                Roadmap
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                30-day adaptive schedule with ingredient conflict checks
              </p>
            </div>
          </Link>

          {/* AinA Drip (Fashion Lookbook) */}
          <Link
            href="/wardrobe"
            className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between min-h-[140px] group border border-white/5 hover:border-aina-cerulean/40"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-aina-cerulean/15 text-aina-light-cerulean flex items-center justify-center group-hover:scale-110 transition-transform">
                <Shirt className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-aina-light-cerulean bg-aina-cerulean/20 px-2 py-0.5 rounded-full">
                Interactive 3D
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-aina-light-cerulean transition-colors">
                AinA Drip
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                3D Lookbook, fabric zoom & outfit combos
              </p>
            </div>
          </Link>

          {/* AinA Coded / Vision */}
          <Link
            href="/coded"
            className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between min-h-[140px] group border border-white/5 hover:border-purple-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ScanFace className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-purple-300 bg-purple-500/20 px-2 py-0.5 rounded-full">
                muse-image
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-purple-300 transition-colors">
                AinA Maxx · Coded
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Private skin vision & Bangla barber guides
              </p>
            </div>
          </Link>

          {/* AI Coach */}
          <div className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between min-h-[140px] border border-white/5 hover:border-aina-rose/40">
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-aina-rose/15 text-aina-rose flex items-center justify-center">
                <MessageCircle className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/15 px-2 py-0.5 rounded-full">
                Live EN/বাংলা
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display">
                AI Coach
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tap Coach button in lower corner anytime
              </p>
            </div>
          </div>

          {/* AinA Vibe */}
          <Link
            href="/vibe"
            className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between min-h-[140px] group border border-white/5 hover:border-amber-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Flame className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-amber-300 bg-amber-500/20 px-2 py-0.5 rounded-full">
                Community
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-amber-300 transition-colors">
                AinA Vibe
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Effort-based peer accountability feed
              </p>
            </div>
          </Link>

          {/* Curated Shop */}
          <Link
            href="/shop"
            className="glass-panel glass-panel-hover rounded-2xl p-5 flex flex-col justify-between min-h-[140px] group border border-white/5 hover:border-emerald-500/40"
          >
            <div className="flex items-start justify-between">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-bold text-emerald-300 bg-emerald-500/20 px-2 py-0.5 rounded-full">
                BDT Verified
              </span>
            </div>
            <div>
              <h3 className="text-base font-bold text-white font-display group-hover:text-emerald-300 transition-colors">
                Curated Shop
              </h3>
              <p className="text-xs text-neutral-400 mt-0.5">
                Tested non-comedogenic local products
              </p>
            </div>
          </Link>
        </div>
      </section>

      {/* AinA Maxx: Responsive 2-Column Desktop Grid for Mirror Report & Leaderboard */}
      <section className="space-y-4">
        <h2 className="text-sm font-bold uppercase tracking-wider text-neutral-400 px-1 font-display">
          AinA Maxx · Gamification & Reflection
        </h2>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          <MirrorReportCard report={mirrorReport} />
          <Leaderboard entries={leaderboard} />
        </div>
      </section>

      {/* Trending Looks — real photography strip */}
      <section className="space-y-4">
        <div className="flex items-end justify-between px-1">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.2em] text-aina-rose">Trending this week</p>
            <h2 className="text-lg sm:text-xl font-extrabold font-display text-white">Looks men in Dhaka are saving</h2>
          </div>
          <Link href="/drip" className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-aina-light-cerulean hover:text-white transition-colors">
            <span>Open 3D Lookbook</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
        <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {TRENDING_LOOKS.map((look) => (
            <Link
              key={look.title}
              href="/drip"
              className="group relative w-[68vw] max-w-[260px] shrink-0 snap-start overflow-hidden rounded-2xl border border-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose"
            >
              <Image
                src={look.src}
                alt={look.alt}
                width={520}
                height={650}
                sizes="(max-width: 640px) 68vw, 260px"
                className="aspect-[4/5] w-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div aria-hidden="true" className="absolute inset-0 bg-gradient-to-t from-aina-black/90 via-aina-black/10 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-4">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-aina-light-cerulean">{look.tag}</p>
                <p className="mt-1 text-sm font-bold text-white font-display">{look.title}</p>
                <p className="text-[11px] text-neutral-300">{look.note}</p>
              </div>
            </Link>
          ))}
        </div>
        <p className="px-1 text-[11px] text-neutral-500">{PHOTO_LICENSE_NOTE}</p>
      </section>

      {/* Safety & Legal Guardrail Banner */}
      <section className="rounded-2xl p-4 sm:p-5 bg-aina-graphite/40 border border-white/10 flex items-start space-x-3.5 backdrop-blur-md">
        <ShieldCheck className="w-5 h-5 text-aina-cerulean shrink-0 mt-0.5" />
        <div className="space-y-1 text-xs">
          <p className="font-bold text-neutral-200">
            Zero Attractiveness Scoring · Bangladesh PDPA 2026 Compliant
          </p>
          <p className="text-neutral-400 text-xs leading-relaxed">
            AinA strictly prohibits facial ratings, attractiveness numbers, or glow-up percentages. All guidance is rooted in dermatological science, climate adaptation, personal styling, and consistent daily habit building.
          </p>
        </div>
      </section>
    </div>
  );
}
