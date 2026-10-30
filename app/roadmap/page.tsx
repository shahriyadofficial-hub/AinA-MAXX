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

export default function RoadmapPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const bn = locale === "bn";

  const [payload, setPayload] = useState<RoadmapResponse>(() => fallbackResponse());
  const [completedIds, setCompletedIds] = useState<Set<string>>(new Set());
  const [selectedDay, setSelectedDay] = useState(1);
  const [tab, setTab] = useState<PeriodTab>("am");
  const [generating, setGenerating] = useState(false);
  const [notice, setNotice] = useState("");

  const tasks = useMemo<RoadmapTaskLike[]>(
    () =>
      payload.data.tasks.map((task) => ({
        ...task,
        completed: completedIds.has(task.id ?? "") || task.completed === true,
      })),
    [payload, completedIds]
  );

  const days = useMemo(() => groupTasksByDay(tasks), [tasks]);
  const progress = useMemo(() => computeMirrorScrollProgress(tasks), [tasks]);
  const activeDay = days.find((d) => d.day === selectedDay) ?? days[0];

  const loadRoadmap = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/roadmaps");
      const json = (await res.json()) as RoadmapResponse;
      if (res.ok && json.data) {
        setPayload(json);
        setCompletedIds(
          new Set(json.data.tasks.filter((t) => t.completed).map((t) => t.id ?? ""))
        );
        setSelectedDay(1);
      }
    } catch {
      // Keep the local curated fallback so the page always renders.
    }
  }, []);

  useEffect(() => {
    void loadRoadmap();
  }, [loadRoadmap]);

  async function generateRoadmap() {
    setGenerating(true);
    setNotice("");
    try {
      const res = await fetch("/api/v1/roadmaps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goals: ["skin barrier health", "hair hydration", "grooming consistency"],
          skinType: "combination",
          hairType: "wavy",
          budgetTier: "budget",
          availableMinutes: 15,
          locale,
        }),
      });
      const json = (await res.json()) as RoadmapResponse & { error?: { message?: string } };
      if (!res.ok || !json.data) {
        throw new Error(json.error?.message || "Roadmap generation failed");
      }
      setPayload(json);
      setCompletedIds(new Set());
      setSelectedDay(1);
      setNotice(
        bn
          ? `${json.meta.model} দিয়ে নতুন ৩০ দিনের রোডম্যাপ তৈরি হয়েছে।`
          : `New 30-day roadmap generated with ${json.meta.model} (${json.meta.latencyMs}ms).`
      );
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Roadmap generation failed");
    } finally {
      setGenerating(false);
    }
  }

  function toggleTask(task: RoadmapTaskLike) {
    const id = task.id ?? "";
    setCompletedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  const visibleTasks =
    tab === "am" ? activeDay?.am ?? [] : tab === "pm" ? activeDay?.pm ?? [] : activeDay?.anytime ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-aina-rose">
            {bn ? "৩০ দিনের রোডম্যাপ · muse-spark-1.3" : "30-Day Roadmap · muse-spark-1.3"}
          </p>
          <h1 className="mt-1 font-display text-xl font-bold text-white">
            {payload.data.roadmap.title}
          </h1>
          <p className="mt-0.5 text-xs leading-relaxed text-neutral-400">
            {payload.data.roadmap.summary}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLocale(bn ? "en" : "bn")}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white active:scale-95"
          aria-label="Switch language"
        >
          {bn ? "English" : "বাংলা"}
        </button>
      </div>

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
        className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-aina-rose px-4 py-2.5 text-xs font-bold text-white shadow-glow-rose transition disabled:opacity-50 active:scale-95"
      >
        {generating ? <Loader2 className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
        {generating
          ? bn
            ? "রোডম্যাপ তৈরি হচ্ছে…"
            : "Generating roadmap…"
          : bn
            ? "আমার ৩০ দিনের রোডম্যাপ তৈরি করুন (muse-spark-1.3)"
            : "Generate my 30-day roadmap (muse-spark-1.3)"}
      </button>

      {notice && (
        <p role="status" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-200">
          {notice}
        </p>
      )}

      <p className="text-xs text-neutral-500">
        {payload.meta.model} · {payload.meta.provider}
        {payload.meta.cached ? " · cached" : ""} · {progress.completed}/{progress.total}{" "}
        {bn ? "টি কাজ সম্পন্ন" : "tasks completed"}
      </p>

      {/* Day selector */}
      <section className="space-y-3 rounded-aina border border-white/10 bg-aina-graphite p-4">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white">
          <CalendarDays className="h-4 w-4 text-aina-rose" />
          {bn ? "দিন বেছে নিন" : "Pick a day"}
        </h2>
        <div className="flex flex-wrap gap-1.5">
          {days.map((d) => (
            <button
              key={d.day}
              type="button"
              onClick={() => setSelectedDay(d.day)}
              aria-pressed={d.day === selectedDay}
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                d.day === selectedDay
                  ? "bg-aina-rose text-white shadow-glow-rose"
                  : d.completedCount === d.tasks.length && d.tasks.length > 0
                    ? "border border-emerald-500/40 bg-emerald-500/10 text-emerald-300"
                    : "border border-white/10 bg-white/5 text-neutral-300"
              }`}
            >
              {bn ? `দিন ${d.day}` : `Day ${d.day}`}
              {d.isRestDay ? " · ☾" : ""}
            </button>
          ))}
        </div>

        {/* AM / PM tabs */}
        <div role="tablist" aria-label={bn ? "রুটিনের সময়" : "Routine period"} className="grid grid-cols-3 gap-1 rounded-full bg-black/40 p-1">
          {(
            [
              { key: "am", label: bn ? "সকাল AM" : "AM", icon: Sunrise },
              { key: "pm", label: bn ? "রাত PM" : "PM", icon: MoonStar },
              { key: "anytime", label: bn ? "যেকোনো সময়" : "Anytime", icon: Compass },
            ] as const
          ).map((item) => (
            <button
              key={item.key}
              role="tab"
              aria-selected={tab === item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`inline-flex items-center justify-center gap-1.5 rounded-full px-2 py-1.5 text-xs font-semibold transition active:scale-95 ${
                tab === item.key ? "bg-aina-cerulean text-white" : "text-neutral-400"
              }`}
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </button>
          ))}
        </div>

        {/* Tasks */}
        {activeDay && (
          <p className="text-xs text-neutral-400">
            {bn ? `দিন ${activeDay.day}` : `Day ${activeDay.day}`} · {activeDay.totalMinutes}{" "}
            {bn ? "মিনিট" : "mins"} · {activeDay.completedCount}/{activeDay.tasks.length}{" "}
            {bn ? "সম্পন্ন" : "done"}
            {activeDay.isRestDay ? (bn ? " · বিশ্রামের দিন" : " · Rest day") : ""}
          </p>
        )}

        <div className="space-y-2">
          {visibleTasks.length === 0 && (
            <p className="rounded-xl bg-black/30 px-3 py-3 text-xs text-neutral-400">
              {bn
                ? "এই সময়ে কোনো কাজ নেই — অন্য ট্যাব দেখুন।"
                : "No tasks in this period — check another tab."}
            </p>
          )}
          {visibleTasks.map((task) => {
            const done = task.completed === true;
            return (
              <div
                key={task.id ?? `${task.day}-${task.title}`}
                className={`flex items-start justify-between gap-3 rounded-xl border px-3 py-2.5 ${
                  task.isRestDay
                    ? "border-aina-cerulean/30 bg-aina-cerulean/10"
                    : "border-white/5 bg-black/30"
                }`}
              >
                <label className="flex flex-1 cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={done}
                    onChange={() => toggleTask(task)}
                    className="peer sr-only"
                    aria-label={task.title}
                  />
                  <span aria-hidden className="mt-0.5 shrink-0 text-aina-light-cerulean">
                    {done ? (
                      <CheckCircle2 className="h-5 w-5 text-emerald-400" />
                    ) : (
                      <Circle className="h-5 w-5 text-neutral-500" />
                    )}
                  </span>
                  <span>
                    <span
                      className={`block text-xs font-semibold ${
                        done ? "text-neutral-500 line-through" : "text-neutral-100"
                      }`}
                    >
                      {task.title}
                    </span>
                    <span className="mt-0.5 block text-xs leading-relaxed text-neutral-400">
                      {task.instructions}
                    </span>
                    <span className="mt-1 block text-xs text-neutral-500">
                      {task.estimatedMinutes} {bn ? "মিনিট" : "mins"} · {task.category}
                      {task.needsProfessional
                        ? bn
                          ? " · পেশাদার পরামর্শ নিন"
                          : " · See a professional"
                        : ""}
                    </span>
                    {task.safetyNote && (
                      <span className="mt-1 block text-xs text-amber-300">{task.safetyNote}</span>
                    )}
                  </span>
                </label>
                <span className="shrink-0 text-xs font-semibold text-aina-light-cerulean">
                  +{xpForTask(task)} XP
                </span>
              </div>
            );
          })}
        </div>

        <p className="text-xs leading-relaxed text-neutral-500">
          {bn
            ? "চেকবক্স এখন এই ডিভাইসে অগ্রগতি দেখায়; সার্ভার XP ও স্ট্রিক আসছে পরের ধাপে (AinA Maxx)।"
            : "Checkboxes preview progress on this device; server XP & streaks arrive in the next phase (AinA Maxx)."}
        </p>
      </section>

      <ConflictChecker locale={locale} />
    </div>
  );
}
