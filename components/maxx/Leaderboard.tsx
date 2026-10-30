// components/maxx/Leaderboard.tsx
import React from "react";
import { Trophy, Flame } from "lucide-react";
import type { LeaderboardEntry } from "@/lib/gamification/maxx";

interface LeaderboardProps {
  entries: Array<LeaderboardEntry & { rank: number }>;
  locale?: "en" | "bn";
}

/**
 * Effort-Only Weekly Leaderboard. Ranking is by habits completed and XP —
 * never by appearance. That is the whole point of AinA Maxx.
 */
export function Leaderboard({ entries, locale = "en" }: LeaderboardProps) {
  const bn = locale === "bn";

  return (
    <section className="space-y-3 rounded-aina border border-white/10 bg-aina-graphite p-4">
      <div className="flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white">
          <Trophy className="h-4 w-4 text-amber-400" />
          {bn ? "সাপ্তাহিক লিডারবোর্ড" : "Weekly Leaderboard"}
        </h2>
        <span className="rounded-full border border-amber-500/40 bg-amber-500/10 px-2.5 py-1 text-xs font-semibold text-amber-300">
          {bn ? "শুধু প্রচেষ্টা" : "Effort only"}
        </span>
      </div>

      <ol className="space-y-2">
        {entries.map((entry) => (
          <li
            key={`${entry.rank}-${entry.displayName}`}
            className={`flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 ${
              entry.isCurrentUser
                ? "border border-aina-rose/40 bg-aina-rose/10"
                : "border border-white/5 bg-black/30"
            }`}
          >
            <div className="flex items-center gap-3">
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-display text-xs font-extrabold ${
                  entry.rank === 1
                    ? "bg-amber-400 text-black"
                    : entry.isCurrentUser
                      ? "bg-aina-rose text-white"
                      : "bg-white/10 text-neutral-300"
                }`}
              >
                {entry.rank}
              </span>
              <div>
                <p className="text-xs font-bold text-white">
                  {entry.displayName}
                  {entry.isCurrentUser ? (bn ? " (আপনি)" : " (You)") : ""}
                </p>
                <p className="text-xs text-neutral-400">{entry.area}</p>
              </div>
            </div>
            <div className="text-right">
              <p className="text-xs font-bold text-white">
                {entry.tasksCompleted} {bn ? "টি কাজ" : "tasks"} · {entry.weeklyXp} XP
              </p>
              <p className="flex items-center justify-end gap-1 text-xs text-neutral-400">
                <Flame className="h-3 w-3 text-aina-rose" />
                {entry.streakDays} {bn ? "দিন" : "days"}
              </p>
            </div>
          </li>
        ))}
      </ol>

      <p className="text-xs leading-relaxed text-neutral-500">
        {bn
          ? "র্যাংকিং শুধু সম্পন্ন অভ্যাস ও XP দিয়ে — চেহারা দিয়ে কখনো নয়।"
          : "Ranked by completed habits and XP only — never by appearance."}
      </p>
    </section>
  );
}
