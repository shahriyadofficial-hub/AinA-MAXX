"use client";

// app/vibe/page.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Flame, Heart, MessageCircle, Send, ShieldCheck, Sparkles, Loader2, Users } from "lucide-react";
import Image from "next/image";
import { MODEL_PHOTOS, squareUrl, type StockPhoto } from "@/lib/media/photos";
import {
  VIBE_SEED_POSTS,
  type VibePost,
} from "@/lib/gamification/maxx";

type Locale = "en" | "bn";

interface VibeFeedResponse {
  data: { posts: VibePost[] };
}

const VIBE_AVATARS: StockPhoto[] = [MODEL_PHOTOS.vibeOne, MODEL_PHOTOS.vibeTwo, MODEL_PHOTOS.vibeThree];

export default function VibePage() {
  const [locale, setLocale] = useState<Locale>("en");
  const bn = locale === "bn";

  const [posts, setPosts] = useState<VibePost[]>(VIBE_SEED_POSTS);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const loadFeed = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/vibe");
      const json = (await res.json()) as VibeFeedResponse;
      if (res.ok && json.data?.posts?.length) setPosts(json.data.posts);
    } catch {
      // Keep demo feed so community is always interactive.
    }
  }, []);

  useEffect(() => {
    void loadFeed();
  }, [loadFeed]);

  async function submitPost() {
    const text = draft.trim();
    if (text.length < 3) return;
    setPosting(true);
    setNotice(null);
    try {
      const res = await fetch("/api/v1/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body: text }),
      });
      const json = await res.json();
      if (res.ok && json.data?.post) {
        setPosts((prev) => [json.data.post, ...prev]);
        setDraft("");
        setNotice(
          bn
            ? "পোস্ট প্রকাশিত হয়েছে! মডারেশন ফিল্টার সফল।"
            : "Post published! Safety moderation cleared."
        );
      } else {
        setNotice(
          json.error?.message ??
            (bn ? "পোস্টে সমস্যা হয়েছে।" : "Could not post right now.")
        );
      }
    } catch {
      setNotice(bn ? "অফলাইন — ড্রাফট রাখুন।" : "Offline — please try again.");
    } finally {
      setPosting(false);
    }
  }

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      const isLiked = next.has(id);
      if (isLiked) next.delete(id);
      else next.add(id);

      setPosts((current) =>
        current.map((p) =>
          p.id === id ? { ...p, likes: p.likes + (isLiked ? -1 : 1) } : p
        )
      );
      return next;
    });
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-4">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {bn ? "কমিউনিটি · শুধু প্রচেষ্টা" : "Community · Effort only"}
          </p>
          <h1 className="mt-1 font-display text-2xl sm:text-3xl font-extrabold text-white">AinA Vibe</h1>
          <p className="mt-1 text-xs sm:text-sm text-neutral-400">
            {bn
              ? "ধারাবাহিকতার গল্প — কোনো মুখের স্কোর বা র্যাংকিং নয়"
              : "Consistency stories — never face scores, ratings, or comparison"}
          </p>
        </div>
        <button
          type="button"
          onClick={() => setLocale(bn ? "en" : "bn")}
          className="shrink-0 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-colors active:scale-95"
          aria-label="Switch language"
        >
          {bn ? "English" : "বাংলা"}
        </button>
      </div>

      {/* Responsive Desktop Layout: Composer & Rules (Left) + Community Feed (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Composer & Moderation Guardrails */}
        <div className="lg:col-span-5 space-y-4">
          <section className="space-y-3 rounded-2xl border border-white/10 bg-aina-graphite p-5 sm:p-6 shadow-xl">
            <label className="block">
              <span className="text-sm font-bold text-white font-display">
                {bn ? "আজকের প্রচেষ্টা শেয়ার করুন" : "Share Today's Effort"}
              </span>
              <textarea
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                maxLength={1000}
                rows={4}
                placeholder={
                  bn
                    ? "যেমন: Day 5 AM রুটিন শেষ! সানস্ক্রিন + ময়েশ্চারাইজার…"
                    : "e.g. Day 5 AM routine done! Sunscreen + gentle foam cleanse. Feeling refreshed…"
                }
                className="mt-2 w-full rounded-2xl border border-white/10 bg-black/40 px-3.5 py-2.5 text-xs sm:text-sm leading-relaxed text-white outline-none focus:border-amber-400/60 transition-colors"
              />
            </label>
            <div className="flex items-center justify-between gap-2 pt-1">
              <p className="flex items-center gap-1.5 text-xs text-neutral-400">
                <ShieldCheck className="h-4 w-4 text-emerald-400 shrink-0" />
                <span className="text-[11px]">{bn ? "প্রতিটি পোস্ট মডারেশন দিয়ে যায়" : "Passes AI safety screen"}</span>
              </p>
              <button
                type="button"
                disabled={posting || draft.trim().length < 3}
                onClick={() => void submitPost()}
                className="inline-flex items-center gap-2 rounded-full bg-amber-500 hover:bg-amber-400 px-5 py-2.5 text-xs font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-40 active:scale-95 shadow-lg shadow-amber-500/20"
              >
                {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                <span>{bn ? "পোস্ট করুন" : "Post"}</span>
              </button>
            </div>
            {notice && (
              <p role="status" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-200">
                {notice}
              </p>
            )}
          </section>

          {/* Vibe Community Code Card */}
          <div className="rounded-2xl border border-white/10 bg-aina-graphite/40 p-5 space-y-2 backdrop-blur-md">
            <div className="flex items-center space-x-2 text-amber-400 text-xs font-bold">
              <Users className="w-4 h-4" />
              <span>Vibe Community Code</span>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed">
              We celebrate effort, daily consistency, and barrier repair. Posts promoting body-shaming, unsafe fasting, or unsolicited ratings are rejected deterministically before publication.
            </p>
          </div>
        </div>

        {/* Right Column: Feed Posts */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h2 className="text-xs font-bold uppercase tracking-wider text-neutral-400 font-display">
              Latest Consistency Feed
            </h2>
            <span className="text-xs text-neutral-500">{posts.length} Stories</span>
          </div>

          <div className="space-y-3">
            {posts.map((post, postIndex) => (
              <article key={post.id} className="space-y-3 rounded-2xl border border-white/10 bg-aina-graphite p-5 shadow-xl hover:border-white/20 transition-all">
                <div className="flex items-center gap-3">
                  {(() => {
                    const avatar = VIBE_AVATARS[postIndex % VIBE_AVATARS.length];
                    return (
                      <Image
                        src={squareUrl(avatar, 80)}
                        alt={avatar.alt}
                        width={40}
                        height={40}
                        className="h-10 w-10 shrink-0 rounded-2xl object-cover border border-white/10 shadow-md"
                      />
                    );
                  })()}
                  <div>
                    <p className="text-sm font-bold text-white">{post.authorName}</p>
                    <p className="flex items-center gap-1.5 text-xs text-neutral-400 mt-0.5">
                      <span>{post.area}</span>
                      <span>•</span>
                      <Flame className="h-3.5 w-3.5 text-aina-rose fill-aina-rose" />
                      <span className="text-aina-rose font-medium">{post.streakLabel}</span>
                    </p>
                  </div>
                </div>

                <p className="text-xs sm:text-sm leading-relaxed text-neutral-200">{post.body}</p>

                <div className="flex items-center gap-4 border-t border-white/5 pt-3 text-xs text-neutral-400">
                  <button
                    type="button"
                    onClick={() => toggleLike(post.id)}
                    aria-pressed={liked.has(post.id)}
                    className={`flex items-center gap-1.5 transition active:scale-95 ${
                      liked.has(post.id) ? "text-aina-rose" : "hover:text-aina-rose"
                    }`}
                  >
                    <Heart className={`h-4 w-4 ${liked.has(post.id) ? "fill-aina-rose" : ""}`} />
                    <span className="font-semibold">{post.likes}</span>
                  </button>
                  <span className="flex items-center gap-1.5">
                    <MessageCircle className="h-4 w-4" />
                    <span>{post.comments}</span>
                  </span>
                  <span className="ml-auto rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[10px] font-semibold text-emerald-300">
                    {bn ? "মডারেটেড" : "Moderated"}
                  </span>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
