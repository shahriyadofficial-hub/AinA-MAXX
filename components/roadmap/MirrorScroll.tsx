// components/roadmap/MirrorScroll.tsx
import React from "react";
import { Sunrise, MoonStar } from "lucide-react";

interface MirrorScrollProps {
  percent: number;
  currentDay: number;
  durationDays: number;
  locale?: "en" | "bn";
}

/**
 * Mirror Scroll — the elevation progress bar from "Current You" to
 * "Prime You". Progress reflects completed habits, never appearance.
 */
export function MirrorScroll({ percent, currentDay, durationDays, locale = "en" }: MirrorScrollProps) {
  const bn = locale === "bn";
  const clamped = Math.max(0, Math.min(100, percent));

  return (
    <section
      aria-label={bn ? "মিরর স্ক্রল অগ্রগতি" : "Mirror Scroll progress"}
      className="rounded-aina border border-white/10 bg-aina-graphite p-4"
    >
      <div className="flex items-center justify-between gap-2">
        <p className="flex items-center gap-1.5 text-xs font-bold text-neutral-300">
          <Sunrise className="h-4 w-4 text-aina-rose" />
          {bn ? "বর্তমান আপনি" : "Current You"}
        </p>
        <p className="text-xs font-semibold text-neutral-400">
          {bn ? `দিন ${currentDay}/${durationDays}` : `Day ${currentDay} / ${durationDays}`} · {clamped}%
        </p>
        <p className="flex items-center gap-1.5 text-xs font-bold text-aina-light-cerulean">
          {bn ? "প্রাইম আপনি" : "Prime You"}
          <MoonStar className="h-4 w-4 text-aina-light-cerulean" />
        </p>
      </div>

      <div
        role="progressbar"
        aria-valuenow={clamped}
        aria-valuemin={0}
        aria-valuemax={100}
        className="relative mt-3 h-3 overflow-hidden rounded-full bg-black/50"
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-aina-rose via-aina-cerulean to-aina-light-cerulean transition-all duration-500"
          style={{ width: `${clamped}%` }}
        />
        <div
          aria-hidden
          className="absolute top-1/2 h-5 w-5 -translate-y-1/2 rounded-full border-2 border-white bg-aina-rose shadow-glow-rose transition-all duration-500"
          style={{ left: `calc(${clamped}% - 10px)` }}
        />
      </div>

      <p className="mt-2 text-xs leading-relaxed text-neutral-400">
        {bn
          ? "অগ্রগতি মানে ধারাবাহিক অভ্যাস — চেহারার কোনো স্কোর নয়।"
          : "Progress means consistent habits — never an appearance score."}
      </p>
    </section>
  );
}
