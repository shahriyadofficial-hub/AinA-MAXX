"use client";

// app/roadmap/page.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  CheckCircle2,
  Circle,
  Compass,
  Loader2,
  MoonStar,
  Sparkles,
  Sunrise,
} from "lucide-react";
import { MirrorScroll } from "@/components/roadmap/MirrorScroll";
import { ConflictChecker } from "@/components/roadmap/ConflictChecker";
import {
  groupTasksByDay,
  computeMirrorScrollProgress,
  xpForTask,
  type RoadmapTaskLike,
} from "@/lib/roadmap/plan";
import { getCuratedFallbackRoadmap } from "@/lib/roadmap/fallback";

type Locale = "en" | "bn";
type PeriodTab = "am" | "pm" | "anytime";

interface RoadmapResponse {
  data: {
    roadmap: { id: string | null; title: string; summary: string; durationDays: number; status: string };
    tasks: RoadmapTaskLike[];
  };
  meta: { model: string; provider: string; cached: boolean; latencyMs: number };
}

function fallbackResponse(): RoadmapResponse {
  const draft = getCuratedFallbackRoadmap();
  return {
    data: {
      roadmap: {
        id: null,
        title: draft.title,
        summary: draft.summary,
        durationDays: draft.durationDays,
        status: "active",
      },
      tasks: draft.tasks.map((task, index) => ({
        id: `local-task-${index + 1}`,
        day: task.day,
        category: task.category,
        title: task.title,
        instructions: task.instructions,
        estimatedMinutes: task.estimatedMinutes,
        isRestDay: task.isRestDay,
        needsProfessional: task.needsProfessional,
        safetyNote: task.safetyNote,
        completed: false,
      })),
    },
    meta: { model: "curated-fallback-v1", provider: "fallback", cached: true, latencyMs: 0 },
  };
}

interface CompletionResponse {
  data?: {
    xpAwarded: number;
    totalXp: number;
    idempotentReplay: boolean;
    streak?: { currentStreak: number };
  };
}

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default function RoadmapPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const [selectedDay, setSelectedDay] = useState<number>(1);
  const [tab, setTab] = useState<PeriodTab>("am");
  const [generating, setGenerating] = useState<boolean>(false);
  const [payload, setPayload] = useState<RoadmapResponse>(() => fallbackResponse());
  const [notice, setNotice] = useState<string | null>(null);
  const [xpNotice, setXpNotice] = useState<string | null>(null);

  const bn = locale === "bn";

  const loadRoadmap = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/roadmaps", {
        headers: { Accept: "application/json" },
      });
      if (!res.ok) return;
      const json = (await res.json()) as RoadmapResponse;
      if (json.data?.roadmap && Array.isArray(json.data.tasks)) {
        setPayload(json);
      }
    } catch {
      // Offline or network error: fallback remains visible.
    }
  }, []);

  useEffect(() => {
    void loadRoadmap();
  }, [loadRoadmap]);

  const generateRoadmap = async () => {
    setGenerating(true);
    setNotice(null);
    try {
      const res = await fetch("/api/v1/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          locale,
          durationDays: 30,
          budgetTier: "budget",
          availableMinutesPerDay: 15,
        }),
      });
      const json = (await res.json()) as RoadmapResponse;
      if (res.ok && json.data) {
        setPayload(json);
        setSelectedDay(1);
        setNotice(
          bn
            ? `muse-spark-1.3 সফলভাবে তৈরি করেছে (${json.meta.latencyMs}ms)`
            : `Roadmap freshly crafted by ${json.meta.model} (${json.meta.latencyMs}ms)`
        );
      } else {
        setNotice(
          bn
            ? "সার্ভার ব্যস্ত — কিউরেটেড ফলব্যাক রোডম্যাপ সক্রিয় রাখা হয়েছে।"
            : "Server busy — using verified curated fallback roadmap."
        );
      }
    } catch {
      setNotice(
        bn
          ? "অফলাইন মোড — কিউরেটেড রুটিন দেখাচ্ছে।"
          : "Offline mode — showing curated roadmap."
      );
    } finally {
      setGenerating(false);
    }
  };

  const days = useMemo(() => {
    return groupTasksByDay(payload.data.tasks);
  }, [payload.data.tasks]);

  const activeDay = useMemo(() => {
    return days.find((d) => d.day === selectedDay) ?? days[0];
  }, [days, selectedDay]);

  const progress = useMemo(() => {
    return computeMirrorScrollProgress(payload.data.tasks);
  }, [payload.data.tasks]);

  async function toggleTask(task: RoadmapTaskLike) {
    const wasDone = task.completed === true;
    setPayload((prev) => ({
      ...prev,
      data: {
        ...prev.data,
        tasks: prev.data.tasks.map((t) => {
          const match =
            t.id && task.id
              ? t.id === task.id
              : t.day === task.day && t.title === task.title;
          return match ? { ...t, completed: !wasDone } : t;
        }),
      },
    }));

    const id = task.id;
    if (!id) return;
    if (!UUID_RE.test(id)) return;
    try {
      const res = await fetch(`/api/v1/tasks/${id}/completion`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: wasDone ? "skipped" : task.isRestDay ? "rest_day" : "completed",
        }),
      });
      const json = (await res.json()) as CompletionResponse;
      if (res.ok && json.data && !wasDone) {
        setXpNotice(
          json.data.idempotentReplay
            ? bn
              ? "ইতিমধ্যে গণনা করা হয়েছে — XP দ্বিগুণ হয়নি।"
              : "Already counted — XP is never double-awarded."
            : bn
              ? `+${json.data.xpAwarded} XP! মোট ${json.data.totalXp} XP · স্ট্রিক ${json.data.streak?.currentStreak ?? 1} দিন`
              : `+${json.data.xpAwarded} XP! Total ${json.data.totalXp} XP · Streak ${json.data.streak?.currentStreak ?? 1} day(s)`
        );
      }
    } catch {
      // Local progress is kept even if the server is unreachable.
    }
  }

  const visibleTasks =
    tab === "am" ? activeDay?.am ?? [] : tab === "pm" ? activeDay?.pm ?? [] : activeDay?.anytime ?? [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-aina-rose">
            {bn ? "৩০ দিনের রোডম্যাপ · muse-spark-1.3" : "30-Day Roadmap · muse-spark-1.3"}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-white">
            {payload.data.roadmap.title}
          </h1>
          <p className="mt-1 text-xs sm:text-sm leading-relaxed text-neutral-400 max-w-2xl">
            {payload.data.roadmap.summary}
          </p>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <button
            type="button"
            onClick={() => setLocale(bn ? "en" : "bn")}
            className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors active:scale-95"
            aria-label="Switch language"
          >
            {bn ? "English" : "বাংলা"}
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className="rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-neutral-200">
          {notice}
        </p>
      )}

      {/* Responsive Desktop Grid: Tasks & Day Selector (Left) + Mirror Progress & Ingredient Conflict Checker (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Tasks & Day Selector (lg:col-span-7) */}
        <div className="lg:col-span-7 space-y-4">
          <section className="space-y-4 rounded-2xl border border-white/10 bg-aina-graphite p-5 sm:p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <h2 className="flex items-center gap-2 font-display text-base font-bold text-white">
                <CalendarDays className="h-5 w-5 text-aina-rose" />
                {bn ? "দিন বেছে নিন" : "Select Day"}
              </h2>
              {activeDay && (
                <span className="text-xs font-mono text-neutral-400">
                  {bn ? `দিন ${activeDay.day}` : `Day ${activeDay.day}`} · {activeDay.totalMinutes}{" "}
                  {bn ? "মিনিট" : "mins"} · {activeDay.completedCount}/{activeDay.tasks.length}{" "}
                  {bn ? "সম্পন্ন" : "done"}
                  {activeDay.isRestDay ? (bn ? " · ☾ রেস্ট ডে" : " · ☾ Rest day") : ""}
                </span>
              )}
            </div>

            {/* 30-Day Grid Selector */}
            <div className="flex flex-wrap gap-1.5 max-h-48 overflow-y-auto pr-1">
              {days.map((d) => (
                <button
                  key={d.day}
                  type="button"
                  onClick={() => setSelectedDay(d.day)}
                  aria-pressed={d.day === selectedDay}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    d.day === selectedDay
                      ? "bg-aina-rose text-white shadow-glow-rose font-bold"
                      : d.completedCount === d.tasks.length && d.tasks.length > 0
                        ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                        : "border border-white/10 bg-white/5 text-neutral-300 hover:bg-white/10"
                  }`}
                >
                  {bn ? `দিন ${d.day}` : `Day ${d.day}`}
                  {d.isRestDay ? " · ☾" : ""}
                </button>
              ))}
            </div>

            {/* AM / PM / Anytime Tabs */}
            <div role="tablist" aria-label={bn ? "রুটিনের সময়" : "Routine period"} className="grid grid-cols-3 gap-1 rounded-full bg-black/40 p-1 border border-white/5">
              {(
                [
                  { key: "am", label: bn ? "সকাল AM" : "AM Routine", icon: Sunrise },
                  { key: "pm", label: bn ? "রাত PM" : "PM Routine", icon: MoonStar },
                  { key: "anytime", label: bn ? "যেকোনো সময়" : "Anytime / Habit", icon: Compass },
                ] as const
              ).map((item) => (
                <button
                  key={item.key}
                  role="tab"
                  aria-selected={tab === item.key}
                  type="button"
                  onClick={() => setTab(item.key)}
                  className={`inline-flex items-center justify-center gap-1.5 rounded-full px-3 py-2 text-xs font-semibold transition active:scale-95 ${
                    tab === item.key
                      ? "bg-aina-cerulean text-white shadow-[0_0_12px_rgba(0,123,167,0.4)]"
                      : "text-neutral-400 hover:text-white"
                  }`}
                >
                  <item.icon className="h-3.5 w-3.5" />
                  <span>{item.label}</span>
                </button>
              ))}
            </div>

            {/* Task Item Cards */}
            <div className="space-y-2.5 pt-1">
              {visibleTasks.length === 0 && (
                <p className="rounded-xl bg-black/30 px-4 py-4 text-xs text-neutral-400">
                  {bn
                    ? "এই সময়ে কোনো কাজ নেই — অন্য ট্যাব দেখুন।"
                    : "No tasks scheduled in this period — select another tab."}
                </p>
              )}
              {visibleTasks.map((task) => {
                const done = task.completed === true;
                return (
                  <div
                    key={task.id ?? `${task.day}-${task.title}`}
                    className={`flex items-start justify-between gap-3 rounded-2xl border p-4 transition-all ${
                      task.isRestDay
                        ? "border-aina-cerulean/30 bg-aina-cerulean/10"
                        : done
                          ? "border-white/5 bg-black/40 opacity-70"
                          : "border-white/10 bg-black/30 hover:border-white/20"
                    }`}
                  >
                    <label className="flex flex-1 cursor-pointer items-start gap-3.5">
                      <input
                        type="checkbox"
                        checked={done}
                        onChange={() => void toggleTask(task)}
                        className="peer sr-only"
                        aria-label={task.title}
                      />
                      <span aria-hidden className="mt-0.5 shrink-0 text-aina-light-cerulean">
                        {done ? (
                          <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                        ) : (
                          <Circle className="h-5 w-5 text-neutral-500 hover:text-white" />
                        )}
                      </span>
                      <span className="space-y-1">
                        <span
                          className={`block text-sm font-semibold ${
                            done ? "text-neutral-500 line-through" : "text-white"
                          }`}
                        >
                          {task.title}
                        </span>
                        <span className="block text-xs leading-relaxed text-neutral-400">
                          {task.instructions}
                        </span>
                        <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px] text-neutral-400">
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                            {task.estimatedMinutes} {bn ? "মিনিট" : "mins"}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-aina-cerulean/15 text-aina-light-cerulean border border-aina-cerulean/25 uppercase font-mono">
                            {task.category}
                          </span>
                          {task.needsProfessional && (
                            <span className="px-2 py-0.5 rounded-full bg-amber-500/15 text-amber-300 border border-amber-500/30">
                              {bn ? "পেশাদার পরামর্শ" : "Professional Guidance"}
                            </span>
                          )}
                        </div>
                        {task.safetyNote && (
                          <span className="mt-1 block text-xs text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                            ⚠️ {task.safetyNote}
                          </span>
                        )}
                      </span>
                    </label>
                    <span className="shrink-0 text-xs font-bold font-mono text-aina-light-cerulean">
                      +{xpForTask(task)} XP
                    </span>
                  </div>
                );
              })}
            </div>

            {xpNotice && (
              <p role="status" className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-4 py-2.5 text-xs font-semibold text-emerald-300">
                {xpNotice}
              </p>
            )}

            <p className="text-[11px] leading-relaxed text-neutral-500">
              {bn
                ? "সম্পন্ন কাজে সার্ভার-যাচাইকৃত XP ও Mirror Streak যোগ হয় (AinA Maxx)। একই কাজে দ্বিগুণ XP কখনো নয়।"
                : "Completed tasks earn server-verified XP and Mirror Streak progress (AinA Maxx). The same task never awards XP twice."}
            </p>
          </section>
        </div>

        {/* Right Side: Mirror Progress & Ingredient Conflict Checker (lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-5">
          <div className="rounded-2xl border border-white/10 bg-aina-graphite p-5 sm:p-6 shadow-xl space-y-4">
            <MirrorScroll
              percent={progress.percent}
              currentDay={progress.currentDay}
              durationDays={progress.durationDays}
              locale={locale}
            />

            <button
              type="button"
              disabled={generating}
              onClick={generateRoadmap}
              className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-aina-rose hover:bg-aina-rose/90 px-5 py-3 text-xs sm:text-sm font-bold text-white shadow-glow-rose transition active:scale-95 disabled:opacity-50"
            >
              {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
              {generating
                ? bn
                  ? "রোডম্যাপ তৈরি হচ্ছে…"
                  : "Generating roadmap…"
                : bn
                  ? "আমার ৩০ দিনের রোডম্যাপ তৈরি করুন (muse-spark-1.3)"
                  : "Generate 30-Day Roadmap (muse-spark-1.3)"}
            </button>

            <div className="pt-1 flex items-center justify-between text-[11px] text-neutral-500">
              <span>{payload.meta.model} · {payload.meta.provider}</span>
              <span>{progress.completed}/{progress.total} {bn ? "সম্পন্ন" : "done"}</span>
            </div>
          </div>

          {/* Conflict Checker Component */}
          <ConflictChecker locale={locale} />
        </div>
      </div>
    </div>
  );
}
