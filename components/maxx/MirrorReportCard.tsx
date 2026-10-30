// components/maxx/MirrorReportCard.tsx
import React from "react";
import { ShieldCheck, Flame, Snowflake, Share2 } from "lucide-react";
import type { MirrorReport } from "@/lib/gamification/maxx";

interface MirrorReportCardProps {
  report: MirrorReport;
  locale?: "en" | "bn";
}

/**
 * Privacy-safe Shareable Weekly Mirror Report.
 * Shows effort (habits, streak, XP) only — never a face photo by default.
 */
export function MirrorReportCard({ report, locale = "en" }: MirrorReportCardProps) {
  const bn = locale === "bn";

  return (
    <section className="space-y-3 rounded-aina border border-aina-rose/30 bg-gradient-to-br from-aina-graphite to-black p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="font-display text-sm font-bold text-white">
          {bn ? "সাপ্তাহিক Mirror Report" : "Weekly Mirror Report"}
        </h2>
        <span className="rounded-full bg-aina-rose/15 px-2.5 py-1 text-xs font-semibold text-aina-rose">
          {report.weekLabel}
        </span>
      </div>

      <p className="font-display text-base font-bold leading-snug text-white">
        {bn ? report.headlineBn : report.headlineEn}
      </p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-black/40 px-2 py-2.5">
          <p className="font-display text-base font-extrabold text-white">
            {report.tasksCompleted}/{report.totalTasks}
          </p>
          <p className="text-xs text-neutral-400">{bn ? "অভ্যাস সম্পন্ন" : "Habits done"}</p>
        </div>
        <div className="rounded-xl bg-black/40 px-2 py-2.5">
          <p className="flex items-center justify-center gap-1 font-display text-base font-extrabold text-white">
            <Flame className="h-4 w-4 text-aina-rose" />
            {report.currentStreak}
          </p>
          <p className="text-xs text-neutral-400">{bn ? "দিনের স্ট্রিক" : "Day streak"}</p>
        </div>
        <div className="rounded-xl bg-black/40 px-2 py-2.5">
          <p className="flex items-center justify-center gap-1 font-display text-base font-extrabold text-white">
            <Snowflake className="h-4 w-4 text-aina-light-cerulean" />
            {report.freezeTokens}
          </p>
          <p className="text-xs text-neutral-400">{bn ? "ফ্রিজ টোকেন" : "Freeze tokens"}</p>
        </div>
      </div>

      {report.topCategories.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {report.topCategories.map((category) => (
            <span
              key={category}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs capitalize text-neutral-200"
            >
              {category}
            </span>
          ))}
        </div>
      )}

      <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-3">
        <p className="flex items-center gap-1.5 text-xs text-emerald-300">
          <ShieldCheck className="h-3.5 w-3.5 shrink-0" />
          {bn ? "মুখের ছবি ছাড়াই শেয়ারযোগ্য" : "Shareable · No face photo"}
        </p>
        <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-aina-light-cerulean">
          <Share2 className="h-3.5 w-3.5" />
          {report.percentComplete}% {bn ? "সম্পন্ন" : "complete"}
        </span>
      </div>
    </section>
  );
}
