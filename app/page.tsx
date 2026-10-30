import React from "react";
import Link from "next/link";
import { Sparkles, Compass, Flame, Shirt, ShoppingBag, ShieldCheck, ArrowRight, Zap, Target } from "lucide-react";
import AinaLogo from "@/components/brand/AinaLogo";

export default function HomePage() {
  return (
    <div className="space-y-6">
      {/* Brand Hero Card */}
      <section className="relative overflow-hidden rounded-aina p-6 bg-gradient-to-br from-aina-graphite via-aina-dark to-aina-black border border-white/10 shadow-2xl">
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-aina-rose/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-aina-cerulean/20 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col items-center text-center space-y-3">
          <AinaLogo size="md" showSubtitle={true} />
          
          <div className="space-y-1 pt-1">
            <h1 className="text-xl font-bold font-display tracking-tight text-white sm:text-2xl">
              Reflect the Prime You
            </h1>
            <p className="text-sm font-bengali text-neutral-300">
              আয়নায় দেখো তোমার সেরা তুমি
            </p>
          </div>

          <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
            AI-guided personal transformation for skin, hair, fitness, food, and drip tailored for Bangladesh’s climate and lifestyle.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-2 pt-2">
            <Link
              href="/roadmap"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-full bg-aina-rose text-white text-xs font-semibold tracking-wide shadow-glow-rose hover:bg-aina-rose/90 transition-transform active:scale-95"
            >
              <span>Start 30-Day Roadmap</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
            <Link
              href="/wardrobe"
              className="inline-flex items-center space-x-2 px-4 py-2.5 rounded-full bg-aina-graphite text-neutral-200 text-xs font-semibold border border-white/10 hover:border-aina-cerulean/50 transition-colors"
            >
              <Shirt className="w-3.5 h-3.5 text-aina-light-cerulean" />
              <span>AinA Drip</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Quick Stats Grid */}
      <section className="grid grid-cols-3 gap-3">
        <div className="glass-panel rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-aina-rose/15 flex items-center justify-center text-aina-rose">
            <Flame className="w-4 h-4 fill-aina-rose" />
          </div>
          <span className="text-base font-extrabold font-display text-white">Day 1</span>
          <span className="text-[10px] text-neutral-400 tracking-tight">Mirror Streak</span>
        </div>

        <div className="glass-panel rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-aina-cerulean/15 flex items-center justify-center text-aina-light-cerulean">
            <Zap className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold font-display text-white">0 XP</span>
          <span className="text-[10px] text-neutral-400 tracking-tight">Daily Prime</span>
        </div>

        <div className="glass-panel rounded-2xl p-3 flex flex-col items-center justify-center text-center space-y-1">
          <div className="w-8 h-8 rounded-full bg-emerald-500/15 flex items-center justify-center text-emerald-400">
            <Target className="w-4 h-4" />
          </div>
          <span className="text-base font-extrabold font-display text-white">30 Days</span>
          <span className="text-[10px] text-neutral-400 tracking-tight">Plan Target</span>
        </div>
      </section>

      {/* Feature Navigation Cards */}
      <section className="space-y-3">
        <h2 className="text-xs font-semibold uppercase tracking-wider text-neutral-400 px-1 font-display">
          Transformation Modules
        </h2>

        <div className="grid grid-cols-2 gap-3">
          <Link
            href="/roadmap"
            className="glass-panel glass-panel-hover rounded-aina-sm p-4 flex flex-col justify-between h-32 group"
          >
            <div className="w-9 h-9 rounded-xl bg-aina-rose/15 text-aina-rose flex items-center justify-center group-hover:scale-110 transition-transform">
              <Compass className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Roadmap</h3>
              <p className="text-[11px] text-neutral-400">30-day adaptive schedule</p>
            </div>
          </Link>

          <Link
            href="/wardrobe"
            className="glass-panel glass-panel-hover rounded-aina-sm p-4 flex flex-col justify-between h-32 group"
          >
            <div className="w-9 h-9 rounded-xl bg-aina-cerulean/15 text-aina-light-cerulean flex items-center justify-center group-hover:scale-110 transition-transform">
              <Shirt className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">AinA Drip</h3>
              <p className="text-[11px] text-neutral-400">3D Lookbook & Cutouts</p>
            </div>
          </Link>

          <Link
            href="/vibe"
            className="glass-panel glass-panel-hover rounded-aina-sm p-4 flex flex-col justify-between h-32 group"
          >
            <div className="w-9 h-9 rounded-xl bg-amber-500/15 text-amber-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <Flame className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">AinA Vibe</h3>
              <p className="text-[11px] text-neutral-400">Consistency community</p>
            </div>
          </Link>

          <Link
            href="/shop"
            className="glass-panel glass-panel-hover rounded-aina-sm p-4 flex flex-col justify-between h-32 group"
          >
            <div className="w-9 h-9 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center group-hover:scale-110 transition-transform">
              <ShoppingBag className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white font-display">Curated Shop</h3>
              <p className="text-[11px] text-neutral-400">Verified BDT products</p>
            </div>
          </Link>
        </div>
      </section>

      {/* Safety & Legal Guardrail Banner */}
      <section className="rounded-2xl p-3.5 bg-aina-graphite/40 border border-white/5 flex items-start space-x-3">
        <ShieldCheck className="w-5 h-5 text-aina-cerulean shrink-0 mt-0.5" />
        <div className="space-y-0.5 text-xs">
          <p className="font-semibold text-neutral-200">
            Zero Attractiveness Scoring · PDPA 2026 Compliant
          </p>
          <p className="text-neutral-400 text-[11px] leading-relaxed">
            AinA never rates or ranks faces. Routine guidance is focused purely on skin barrier health, grooming consistency, and personal confidence.
          </p>
        </div>
      </section>
    </div>
  );
}
