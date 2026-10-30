"use client";

// app/vibe/page.tsx
import React, { useCallback, useEffect, useState } from "react";
import { Flame, Heart, MessageCircle, Send, ShieldCheck, Loader2 } from "lucide-react";
import { VIBE_SEED_POSTS, type VibePost } from "@/lib/gamification/maxx";

type Locale = "en" | "bn";

interface VibeResponse {
  data: { posts: VibePost[] };
}

interface PostResponse {
  data: { post: VibePost; moderation: { status: string; reason: string | null } };
}

export default function VibePage() {
  const [locale, setLocale] = useState<Locale>("en");
  const bn = locale === "bn";

  const [posts, setPosts] = useState<VibePost[]>(VIBE_SEED_POSTS);
  const [draft, setDraft] = useState("");
  const [posting, setPosting] = useState(false);
  const [notice, setNotice] = useState("");
  const [liked, setLiked] = useState<Set<string>>(new Set());

  const loadPosts = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/vibe");
      const json = (await res.json()) as VibeResponse;
      if (res.ok && json.data?.posts?.length) setPosts(json.data.posts);
    } catch {
      // Keep curated seed posts so the feed always renders.
    }
  }, []);

  useEffect(() => {
    void loadPosts();
  }, [loadPosts]);

  async function submitPost() {
    const body = draft.trim();
    if (body.length < 3 || posting) return;
    setPosting(true);
    setNotice("");
    try {
      const res = await fetch("/api/v1/vibe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ body }),
      });
      const json = (await res.json()) as PostResponse & {
        error?: { message?: string; messageBn?: string };
      };

      if (res.status === 422) {
        setNotice(bn ? json.error?.messageBn ?? "" : json.error?.message ?? "Post rejected by moderation.");
        return;
      }
      if (!res.ok || !json.data) {
        throw new Error(json.error?.message || "Could not post");
      }

      if (json.data.post.status === "published") {
        setPosts((prev) => [json.data.post, ...prev]);
        setNotice(bn ? "পোস্ট প্রকাশিত হয়েছে!" : "Posted to AinA Vibe!");
      } else {
        setNotice(
          bn
            ? "পোস্টটি মডারেটর পর্যালোচনার জন্য পাঠানো হয়েছে।"
            : "Sent for moderator review — it will appear once approved."
        );
      }
      setDraft("");
    } catch (err) {
      setNotice(err instanceof Error ? err.message : "Could not post");
    } finally {
      setPosting(false);
    }
  }

  function toggleLike(id: string) {
    setLiked((prev) => {
      const next = new Set(prev);
      const has = next.has(id);
      if (has) next.delete(id);
      else next.add(id);
      setPosts((current) =>
        current.map((p) => (p.id === id ? { ...p, likes: p.likes + (has ? -1 : 1) } : p))
      );
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-amber-400">
            {bn ? "কমিউনিটি · শুধু প্রচেষ্টা" : "Community · Effort only"}
          </p>
          <h1 className="mt-1 font-display text-xl font-bold text-white">AinA Vibe</h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            {bn
              ? "ধারাবাহিকতার গল্প — কোনো মুখের স্কোর বা র্যাংকিং নয়"
              : "Consistency stories — never face scores or rankings"}
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

      {/* Composer */}
      <section className="space-y-2 rounded-aina border border-white/10 bg-aina-graphite p-4">
        <label className="block">
          <span className="text-xs font-semibold text-neutral-300">
            {bn ? "আজকের অগ্রগতি শেয়ার করুন" : "Share today's effort"}
          </span>
          <textarea
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            maxLength={1000}
            rows={3}
            placeholder={
              bn
                ? "যেমন: Day 5 AM রুটিন শেষ! সানস্ক্রিন + ময়েশ্চারাইজার…"
                : "e.g. Day 5 AM routine done! SPF + moisturizer…"
            }
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-black/40 px-3 py-2 text-xs leading-relaxed text-white outline-none focus:border-amber-400/60"
          />
        </label>
        <div className="flex items-center justify-between gap-2">
          <p className="flex items-center gap-1.5 text-xs text-neutral-500">
            <ShieldCheck className="h-3.5 w-3.5 text-emerald-400" />
            {bn ? "প্রতিটি পোস্ট মডারেশন দিয়ে যায়" : "Every post passes moderation"}
          </p>
          <button
            type="button"
            disabled={posting || draft.trim().length < 3}
            onClick={() => void submitPost()}
            className="inline-flex items-center gap-2 rounded-full bg-amber-500 px-4 py-2 text-xs font-bold text-black transition disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          >
            {posting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
            {bn ? "পোস্ট করুন" : "Post"}
          </button>
        </div>
        {notice && (
          <p role="status" className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-xs text-neutral-200">
            {notice}
          </p>
        )}
      </section>

      {/* Feed */}
      <div className="space-y-3">
        {posts.map((post) => (
          <article key={post.id} className="space-y-3 rounded-aina border border-white/10 bg-aina-graphite p-4">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-aina-rose to-aina-cerulean font-display text-xs font-bold text-white">
                {post.authorName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{post.authorName}</p>
                <p className="flex items-center gap-1 text-xs text-neutral-400">
                  {post.area} · <Flame className="h-3 w-3 text-aina-rose" /> {post.streakLabel}
                </p>
              </div>
            </div>

            <p className="text-xs leading-relaxed text-neutral-200">{post.body}</p>

            <div className="flex items-center gap-4 border-t border-white/5 pt-2 text-xs text-neutral-400">
              <button
                type="button"
                onClick={() => toggleLike(post.id)}
                aria-pressed={liked.has(post.id)}
                className={`flex items-center gap-1.5 transition active:scale-95 ${
                  liked.has(post.id) ? "text-aina-rose" : "hover:text-aina-rose"
                }`}
              >
                <Heart className={`h-3.5 w-3.5 ${liked.has(post.id) ? "fill-aina-rose" : ""}`} />
                {post.likes}
              </button>
              <span className="flex items-center gap-1.5">
                <MessageCircle className="h-3.5 w-3.5" />
                {post.comments}
              </span>
              <span className="ml-auto rounded-full bg-emerald-500/10 px-2 py-0.5 text-xs font-semibold text-emerald-300">
                {bn ? "মডারেটেড" : "Moderated"}
              </span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
