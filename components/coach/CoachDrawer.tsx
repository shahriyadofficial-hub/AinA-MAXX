"use client";

// components/coach/CoachDrawer.tsx
import React, { useEffect, useRef, useState } from "react";
import {
  MessageCircle,
  X,
  Send,
  Loader2,
  ShieldCheck,
  Stethoscope,
  Sparkles,
} from "lucide-react";
import {
  COACH_QUICK_PROMPTS,
  type DermatologistAdvisor,
  type RedFlagCategory,
} from "@/lib/coach/coach";

type Locale = "en" | "bn";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

interface Escalation {
  category: RedFlagCategory;
  advisor: DermatologistAdvisor;
}

interface CoachResponse {
  data: { reply: string; escalation: Escalation | null };
  meta: { model: string; provider: string; cached: boolean; latencyMs: number; badge: string };
}

const CATEGORY_LABELS: Record<RedFlagCategory, { en: string; bn: string }> = {
  severe_acne: { en: "Severe acne concern", bn: "গুরুতর ব্রণের উদ্বেগ" },
  hair_loss: { en: "Hair loss concern", bn: "চুল পড়ার উদ্বেগ" },
  skin_pain_or_infection: { en: "Skin pain / infection concern", bn: "ত্বকের ব্যথা / সংক্রমণের উদ্বেগ" },
  scalp_condition: { en: "Scalp condition concern", bn: "মাথার ত্বকের সমস্যা" },
};

export function CoachDrawer() {
  const [open, setOpen] = useState(false);
  const [locale, setLocale] = useState<Locale>("en");
  const bn = locale === "bn";

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [escalation, setEscalation] = useState<Escalation | null>(null);
  const [badge, setBadge] = useState("Powered by Meta Muse Spark 1.3 · Safety verified");
  const [error, setError] = useState("");

  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      inputRef.current?.focus();
      if (messages.length === 0) {
        setMessages([
          {
            role: "assistant",
            content:
              "Hi! I'm your AinA Coach. Ask me about today's roadmap tasks, skin barrier care, or hair routines — in English or বাংলা.",
          },
        ]);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open ]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, busy, escalation]);

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const nextHistory: ChatMessage[] = [...messages, { role: "user", content: trimmed }];
    setMessages(nextHistory);
    setInput("");
    setError("");
    setBusy(true);

    try {
      const res = await fetch("/api/v1/ai/coach", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: trimmed,
          locale,
          history: nextHistory.slice(-8, -1),
        }),
      });
      const json = (await res.json()) as CoachResponse & {
        error?: { message?: string; messageBn?: string };
      };

      if (!res.ok || !json.data) {
        // Safety rejections come back as friendly assistant messages.
        const friendly = bn ? json.error?.messageBn : json.error?.message;
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content:
              friendly ||
              (bn
                ? "দুঃখিত, আমি এটি করতে পারি না। ত্বক বা চুলের যত্ন নিয়ে জিজ্ঞাসা করুন।"
                : "Sorry, I can't help with that. Ask me about skin or hair care instead."),
          },
        ]);
        return;
      }

      setBadge(json.meta.badge);
      setEscalation(json.data.escalation);
      setMessages((prev) => [...prev, { role: "assistant", content: json.data.reply }]);
    } catch {
      setError(bn ? "কোচের সাথে যোগাযোগ ব্যর্থ হয়েছে।" : "Could not reach the coach.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {/* Floating coach button */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label={bn ? "AI কোচ খুলুন" : "Open AI Coach"}
        className="fixed bottom-24 right-4 z-50 inline-flex items-center gap-2 rounded-full bg-aina-rose px-4 py-2.5 text-xs font-bold text-white shadow-glow-rose transition hover:bg-aina-rose/90 active:scale-95 md:bottom-28"
      >
        <MessageCircle className="h-4 w-4" />
        {bn ? "AI কোচ" : "AI Coach"}
      </button>

      {/* Backdrop */}
      {open && (
        <button
          type="button"
          aria-label={bn ? "কোচ বন্ধ করুন" : "Close coach"}
          onClick={() => setOpen(false)}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        />
      )}

      {/* Slide-out drawer */}
      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-aina-black shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <div>
            <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white">
              <Sparkles className="h-4 w-4 text-aina-rose" />
              {bn ? "AinA AI কোচ" : "AinA AI Coach"}
            </h2>
            <p className="mt-0.5 flex items-center gap-1 text-xs text-emerald-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              {badge}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setLocale(bn ? "en" : "bn")}
              className="rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-white active:scale-95"
              aria-label="Switch language"
            >
              {bn ? "English" : "বাংলা"}
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              aria-label={bn ? "বন্ধ করুন" : "Close"}
              className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white active:scale-95"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto px-4 py-4">
          {messages.map((msg, i) => (
            <div key={i} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
              <p
                className={`max-w-[85%] rounded-2xl px-3 py-2 text-xs leading-relaxed ${
                  msg.role === "user"
                    ? "bg-aina-rose text-white"
                    : "border border-white/10 bg-aina-graphite text-neutral-100"
                }`}
              >
                {msg.content}
              </p>
            </div>
          ))}

          {busy && (
            <p className="flex items-center gap-2 text-xs text-neutral-400">
              <Loader2 className="h-4 w-4 animate-spin text-aina-light-cerulean" />
              {bn ? "কোচ ভাবছে…" : "Coach is thinking…"}
            </p>
          )}

          {/* Red-flag dermatologist advisor card */}
          {escalation && (
            <section className="space-y-2 rounded-aina-sm border border-amber-500/40 bg-amber-500/10 p-3">
              <h3 className="flex items-center gap-2 text-xs font-bold text-amber-300">
                <Stethoscope className="h-4 w-4" />
                {bn
                  ? CATEGORY_LABELS[escalation.category].bn
                  : CATEGORY_LABELS[escalation.category].en}
              </h3>
              <p className="font-display text-sm font-bold text-white">
                {bn ? escalation.advisor.nameBn : escalation.advisor.nameEn}
              </p>
              <p className="text-xs text-neutral-300">
                {bn ? escalation.advisor.credentialBn : escalation.advisor.credentialEn}
              </p>
              <p className="text-xs text-neutral-400">
                {bn ? escalation.advisor.areaBn : escalation.advisor.areaEn}
              </p>
              <p className="text-xs leading-relaxed text-neutral-200">
                {bn ? escalation.advisor.noteBn : escalation.advisor.noteEn}
              </p>
              <p className="text-xs text-aina-light-cerulean">
                {bn ? escalation.advisor.bookingHintBn : escalation.advisor.bookingHintEn}
              </p>
              <p className="flex items-center gap-1.5 text-xs font-semibold text-emerald-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {bn ? "নিরাপত্তা যাচাইকৃত · কোনো রোগ নির্ণয় নয়" : "Safety verified · Not a diagnosis"}
              </p>
            </section>
          )}

          {error && (
            <p role="alert" className="rounded-xl border border-red-500/40 bg-red-950/50 px-3 py-2 text-xs text-red-200">
              {error}
            </p>
          )}
        </div>

        {/* Quick prompts */}
        <div className="flex flex-wrap gap-1.5 px-4 pb-2">
          {COACH_QUICK_PROMPTS.map((prompt) => (
            <button
              key={prompt.en}
              type="button"
              disabled={busy}
              onClick={() => void send(bn ? prompt.bn : prompt.en)}
              className="rounded-full border border-white/10 bg-white/5 px-2.5 py-1 text-xs text-neutral-200 transition hover:border-aina-cerulean/60 disabled:opacity-40 active:scale-95"
            >
              {bn ? prompt.bn : prompt.en}
            </button>
          ))}
        </div>

        {/* Input */}
        <form
          className="flex items-center gap-2 border-t border-white/10 px-4 py-3"
          onSubmit={(e) => {
            e.preventDefault();
            void send(input);
          }}
        >
          <input
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={bn ? "কোচকে জিজ্ঞাসা করুন…" : "Ask your coach…"}
            maxLength={1000}
            className="flex-1 rounded-full border border-white/10 bg-aina-graphite px-3 py-2 text-xs text-white outline-none focus:border-aina-rose"
          />
          <button
            type="submit"
            disabled={busy || input.trim().length === 0}
            aria-label={bn ? "পাঠান" : "Send"}
            className="rounded-full bg-aina-rose p-2.5 text-white shadow-glow-rose transition disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </aside>
    </>
  );
}
