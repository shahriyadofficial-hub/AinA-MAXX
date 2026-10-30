"use client";

// components/maxx/RoutineBag.tsx
import React from "react";
import { ShoppingBag, X, Trash2, ExternalLink } from "lucide-react";
import { formatBdt, routineBagTotal, type RoutineBagItem } from "@/lib/gamification/maxx";

interface RoutineBagProps {
  open: boolean;
  items: RoutineBagItem[];
  locale?: "en" | "bn";
  onClose: () => void;
  onRemove: (slug: string) => void;
}

/** Routine Bag slide-out drawer for the curated BDT shop. */
export function RoutineBag({ open, items, locale = "en", onClose, onRemove }: RoutineBagProps) {
  const bn = locale === "bn";
  const total = routineBagTotal(items);

  return (
    <>
      {open && (
        <button
          type="button"
          aria-label={bn ? "ব্যাগ বন্ধ করুন" : "Close bag"}
          onClick={onClose}
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
        />
      )}

      <aside
        aria-hidden={!open}
        className={`fixed inset-y-0 right-0 z-50 flex w-full max-w-sm flex-col border-l border-white/10 bg-aina-black shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between gap-2 border-b border-white/10 px-4 py-3">
          <h2 className="flex items-center gap-2 font-display text-sm font-bold text-white">
            <ShoppingBag className="h-4 w-4 text-aina-rose" />
            {bn ? "রুটিন ব্যাগ" : "Routine Bag"}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label={bn ? "বন্ধ করুন" : "Close"}
            className="rounded-full border border-white/10 bg-white/5 p-1.5 text-white active:scale-95"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 space-y-2 overflow-y-auto px-4 py-4">
          {items.length === 0 && (
            <p className="rounded-xl bg-white/5 px-3 py-3 text-xs leading-relaxed text-neutral-400">
              {bn
                ? "আপনার ব্যাগ খালি। শপ থেকে রুটিনের পণ্য যোগ করুন।"
                : "Your bag is empty. Add routine products from the shop."}
            </p>
          )}
          {items.map(({ product, qty }) => (
            <div
              key={product.slug}
              className="flex items-start justify-between gap-3 rounded-xl border border-white/5 bg-aina-graphite px-3 py-2.5"
            >
              <div>
                <p className="text-xs font-bold text-white">{product.name}</p>
                <p className="mt-0.5 text-xs text-neutral-400">
                  {product.sellerName} · ×{qty}
                </p>
                <p className="mt-1 text-xs font-bold text-aina-light-cerulean">
                  {formatBdt(product.priceBdt * qty)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => onRemove(product.slug)}
                aria-label={bn ? "সরান" : "Remove"}
                className="rounded-full border border-white/10 bg-white/5 p-1.5 text-neutral-300 active:scale-95"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>

        <div className="space-y-2 border-t border-white/10 px-4 py-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-neutral-400">{bn ? "মোট" : "Total"}</span>
            <span className="font-display text-base font-extrabold text-white">{formatBdt(total)}</span>
          </div>
          <button
            type="button"
            disabled={items.length === 0}
            className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-aina-rose px-4 py-2.5 text-xs font-bold text-white shadow-glow-rose transition disabled:cursor-not-allowed disabled:opacity-40 active:scale-95"
          >
            <ExternalLink className="h-4 w-4" />
            {bn ? "যাচাইকৃত বিক্রেতার কাছে কিনুন" : "Buy from verified sellers"}
          </button>
          <p className="text-xs leading-relaxed text-neutral-500">
            {bn
              ? "AinA সরাসরি বিক্রি করে না — যাচাইকৃত বিক্রেতার লিংকে পাঠানো হয়। অ্যাফিলিয়েট পণ্যে চিহ্ন দেওয়া আছে।"
              : "AinA does not sell directly — you are sent to verified sellers. Affiliate products are labelled."}
          </p>
        </div>
      </aside>
    </>
  );
}
