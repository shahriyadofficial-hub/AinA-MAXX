"use client";

// components/judge/JudgeDemoBar.tsx
import React, { useCallback, useEffect, useState } from "react";
import {
  FlaskConical,
  X,
  Loader2,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  UserCheck,
  Map,
  Scissors,
  Shirt,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { DEMO_ACTIONS, formatUsd, type DemoActionId } from "@/lib/telemetry/telemetry";

interface TelemetryData {
  totalCalls: number;
  succeeded: number;
  fallbacksUsed: number;
  safetyRejections: number;
  totalTokens: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  estimatedCostUsd: number;
  budgetUsd: number;
  budgetUsedPercent: number;
  budgetRemainingUsd: number;
  byModel: Array<{ model: string; calls: number; tokens: number; estimatedCostUsd: number; avgLatencyMs: number }>;
  recent: Array<{ feature: string; modelId: string; status: string; latencyMs: number | null; createdAt: string }>;
}

interface TelemetryResponse {
  data: TelemetryData;
  meta: { source: string; timestamp: string };
}

interface ActionResult {
  status: "ok" | "error";
  summary: string;
  latencyMs: number;
}

const ACTION_ICONS: Record<DemoActionId, React.ComponentType<{ className?: string }>> = {
  login: UserCheck,
  roadmap: Map,
  conflict: FlaskConical,
  barber: Scissors,
  cutout: Shirt,
};

function summarizeResult(actionId: DemoActionId, json: unknown): string {
  const root = json as { data?: Record<string, unknown>; error?: { message?: string } };
  if (root.error?.message) return root.error.message;
  const data = root.data ?? {};

  switch (actionId) {
    case "login": {
      const name = typeof data.displayName === "string" ? data.displayName : "Demo user";
      return `Signed in as ${name} · 18+ access ${data.adultAccessEnabled ? "on" : "off"}`;
    }
    case "roadmap": {
      const roadmap = data.roadmap as { title?: string } | undefined;
      const tasks = Array.isArray(data.tasks) ? data.tasks.length : 0;
      return `${roadmap?.title ?? "Roadmap"} · ${tasks} tasks generated`;
    }
    case "conflict": {
      const conflict = data.conflict as { isConflict?: boolean; severity?: string } | undefined;
      return conflict?.isConflict
        ? `Conflict detected · severity ${conflict.severity ?? "medium"}`
        : "Safe together · no conflict";
    }
    case "barber": {
      const card = data.card as { styleNameEn?: string } | undefined;
      return `${card?.styleNameEn ?? "Barber card"} · bilingual steps ready`;
    }
    case "cutout": {
      return `Garment segmented · cutout saved to wardrobe`;
    }
    default:
      return "Done";
  }
}

/**
 * Hackathon Judge Demo Bar + Live Telemetry HUD.
 * Toggle in the top nav. One click runs each flagship AI flow against the
 * real APIs and shows latency/token/cost telemetry vs the $150 budget.
 */
export function JudgeDemoBar() {
  const [barOpen, setBarOpen] = useState(false);
  const [hudOpen, setHudOpen] = useState(false);
  const [running, setRunning] = useState<DemoActionId | null>(null);
  const [results, setResults] = useState<Partial<Record<DemoActionId, ActionResult>>>({});
  const [telemetry, setTelemetry] = useState<TelemetryData | null>(null);
  const [telemetrySource, setTelemetrySource] = useState("");

  const loadTelemetry = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/telemetry");
      const json = (await res.json()) as TelemetryResponse;
      if (res.ok && json.data) {
        setTelemetry(json.data);
        setTelemetrySource(json.meta.source);
      }
    } catch {
      // HUD keeps the last known values.
    }
  }, []);

  useEffect(() => {
    if (barOpen || hudOpen) void loadTelemetry();
  }, [barOpen, hudOpen, loadTelemetry]);

  async function runAction(actionId: DemoActionId) {
    const action = DEMO_ACTIONS.find((a) => a.id === actionId);
    if (!action || running) return;
    setRunning(actionId);
    const started = Date.now();
    try {
      const res = await fetch(action.endpoint, {
        method: action.method,
        headers: { "Content-Type": "application/json" },
        body: action.method === "POST" ? JSON.stringify(action.body ?? {}) : undefined,
      });
      const json: unknown = await res.json().catch(() => ({}));
      setResults((prev) => ({
        ...prev,
        [actionId]: {
          status: res.ok ? "ok" : "error",
          summary: summarizeResult(actionId, json),
          latencyMs: Date.now() - started,
        },
      }));
    } catch {
      setResults((prev) => ({
        ...prev,
        [actionId]: { status: "error", summary: "Request failed", latencyMs: Date.now() - started },
      }));
    } finally {
      setRunning(null);
      void loadTelemetry();
    }
  }

  const budgetPercent = telemetry ? Math.min(100, telemetry.budgetUsedPercent) : 0;

  return (
    <>
      {/* Top-nav toggle */}
      <button
        type="button"
        onClick={() => setBarOpen((v) => !v)}
        aria-expanded={barOpen}
        className="inline-flex items-center gap-1.5 rounded-full border border-aina-rose/40 bg-aina-rose/15 px-3 py-1.5 text-xs font-bold text-aina-rose transition active:scale-95"
      >
        <FlaskConical className="h-3.5 w-3.5" />
        Judge Demo
        {barOpen ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
      </button>

      {/* Demo bar */}
      {barOpen && (
        <div className="fixed inset-x-0 top-[57px] z-40 border-b border-aina-rose/30 bg-aina-black/95 backdrop-blur-md">
          <div className="mx-auto max-w-xl space-y-3 px-4 py-3">
            <div className="flex items-center justify-between gap-2">
              <p className="font-display text-xs font-bold uppercase tracking-wider text-white">
                Judge Demo Mode · 1-click live tests
              </p>
              <button
                type="button"
                onClick={() => setBarOpen(false)}
                aria-label="Close judge demo bar"
                className="rounded-full border border-white/10 bg-white/5 p-1 text-white active:scale-95"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {DEMO_ACTIONS.map((action) => {
                const Icon = ACTION_ICONS[action.id];
                const result = results[action.id];
                const isRunning = running === action.id;
                return (
                  <button
                    key={action.id}
                    type="button"
                    disabled={running !== null}
                    onClick={() => void runAction(action.id)}
                    className="space-y-1 rounded-xl border border-white/10 bg-aina-graphite px-3 py-2.5 text-left transition enabled:hover:border-aina-rose/50 disabled:opacity-60 active:scale-95"
                  >
                    <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                      {isRunning ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin text-aina-rose" />
                      ) : (
                        <Icon className="h-3.5 w-3.5 text-aina-rose" />
                      )}
                      {action.labelEn}
                    </span>
                    <span className="block text-xs text-neutral-400">{action.model}</span>
                    {result && (
                      <span
                        className={`flex items-start gap-1 text-xs leading-snug ${
                          result.status === "ok" ? "text-emerald-300" : "text-red-300"
                        }`}
                      >
                        {result.status === "ok" ? (
                          <CheckCircle2 className="mt-0.5 h-3 w-3 shrink-0" />
                        ) : (
                          <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
                        )}
                        {result.summary} · {result.latencyMs}ms
                      </span>
                    )}
                  </button>
                );
              })}

              {/* Telemetry HUD toggle */}
              <button
                type="button"
                onClick={() => setHudOpen((v) => !v)}
                aria-expanded={hudOpen}
                className="space-y-1 rounded-xl border border-aina-cerulean/40 bg-aina-cerulean/10 px-3 py-2.5 text-left transition active:scale-95"
              >
                <span className="flex items-center gap-1.5 text-xs font-bold text-white">
                  <Gauge className="h-3.5 w-3.5 text-aina-light-cerulean" />
                  Telemetry HUD
                </span>
                <span className="block text-xs text-neutral-400">
                  {telemetry
                    ? `${telemetry.totalCalls} calls · ${formatUsd(telemetry.estimatedCostUsd)} est.`
                    : "Latency · tokens · $150 budget"}
                </span>
              </button>
            </div>

            {/* Telemetry HUD panel */}
            {hudOpen && telemetry && (
              <section className="space-y-3 rounded-xl border border-aina-cerulean/30 bg-black/40 p-3">
                <div className="grid grid-cols-4 gap-2 text-center">
                  <div>
                    <p className="font-display text-sm font-extrabold text-white">{telemetry.totalCalls}</p>
                    <p className="text-xs text-neutral-400">Calls</p>
                  </div>
                  <div>
                    <p className="font-display text-sm font-extrabold text-white">
                      {telemetry.totalTokens.toLocaleString()}
                    </p>
                    <p className="text-xs text-neutral-400">Tokens</p>
                  </div>
                  <div>
                    <p className="font-display text-sm font-extrabold text-white">{telemetry.avgLatencyMs}ms</p>
                    <p className="text-xs text-neutral-400">Avg latency</p>
                  </div>
                  <div>
                    <p className="font-display text-sm font-extrabold text-white">{telemetry.p95LatencyMs}ms</p>
                    <p className="text-xs text-neutral-400">p95 latency</p>
                  </div>
                </div>

                <div>
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-neutral-300">
                      Meta API credit · {formatUsd(telemetry.estimatedCostUsd)} est. of {formatUsd(telemetry.budgetUsd)}
                    </span>
                    <span className="text-aina-light-cerulean">
                      {formatUsd(telemetry.budgetRemainingUsd)} left
                    </span>
                  </div>
                  <div className="mt-1.5 h-2 overflow-hidden rounded-full bg-white/10">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-aina-cerulean to-aina-rose"
                      style={{ width: `${Math.max(1, budgetPercent)}%` }}
                    />
                  </div>
                  <p className="mt-1 text-xs text-neutral-500">
                    {telemetry.succeeded} succeeded · {telemetry.fallbacksUsed} fallbacks ·{" "}
                    {telemetry.safetyRejections} safety rejections · source: {telemetrySource} ·
                    cached test calls cost $0.00
                  </p>
                </div>

                {telemetry.byModel.length > 0 && (
                  <ul className="space-y-1">
                    {telemetry.byModel.map((m) => (
                      <li key={m.model} className="flex items-center justify-between text-xs">
                        <span className="font-semibold text-neutral-200">{m.model}</span>
                        <span className="text-neutral-400">
                          {m.calls} calls · {m.tokens.toLocaleString()} tok · {m.avgLatencyMs}ms ·{" "}
                          {formatUsd(m.estimatedCostUsd)}
                        </span>
                      </li>
                    ))}
                  </ul>
                )}

                {telemetry.recent.length > 0 && (
                  <ul className="space-y-1 border-t border-white/5 pt-2">
                    {telemetry.recent.slice(0, 4).map((r, i) => (
                      <li key={i} className="flex items-center justify-between text-xs">
                        <span className="text-neutral-300">{r.feature}</span>
                        <span className="text-neutral-500">
                          {r.modelId} · {r.status} · {r.latencyMs ?? 0}ms
                        </span>
                      </li>
                    ))}
                  </ul>
                )}
              </section>
            )}
          </div>
        </div>
      )}
    </>
  );
}
