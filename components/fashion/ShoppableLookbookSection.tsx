"use client";

// components/fashion/ShoppableLookbookSection.tsx
// AinA Drip · Experience 2 (Core) — "Try the Look" shoppable lookbook.
// Left: full-height look image with pulsing hotspot markers.
// Right: Combo Sidebar — product cards, live bundle maths, sticky buy bar.
// Bidirectional sync: hotspot ⇄ card highlight; selection drives the total.

import React, { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { BadgePercent, CheckCircle2, ChevronLeft, ChevronRight, MousePointerClick, ShoppingBag } from "lucide-react";
import {
  LOOKBOOK_ITEMS,
  computeBundleSummary,
  findProduct,
  formatLookBdt,
  hotspotForProduct,
  type Hotspot,
  type LookProduct,
} from "@/lib/fashion/lookbook";
import { HotspotMarker } from "./HotspotMarker";
import { ComboProductCard } from "./ComboProductCard";
import { MaisonblockFittingModal } from "./sizing/MaisonblockFittingModal";
import { UniversalFitModal } from "./sizing/UniversalFitModal";

export function ShoppableLookbookSection() {
  const reduceMotion = useReducedMotion();
  const [lookIndex, setLookIndex] = useState(0);
  const [activeProductId, setActiveProductId] = useState<string | null>(null);
  const [selectedByLook, setSelectedByLook] = useState<Record<string, string[]>>({});
  const [sizeByProduct, setSizeByProduct] = useState<Record<string, string>>({});
  const [fitProduct, setFitProduct] = useState<LookProduct | null>(null);
  const [universalProduct, setUniversalProduct] = useState<LookProduct | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const look = LOOKBOOK_ITEMS[lookIndex];
  const selectedIds = useMemo(
    () => new Set(selectedByLook[look.id] ?? look.products.filter((p) => p.inStock).map((p) => p.id)),
    [look, selectedByLook]
  );
  const summary = useMemo(() => computeBundleSummary(look, selectedIds), [look, selectedIds]);

  const showToast = useCallback((msg: string) => {
    setToast(msg);
    if (toastTimer.current) clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 3200);
  }, []);

  const switchLook = useCallback((next: number) => {
    setLookIndex(((next % LOOKBOOK_ITEMS.length) + LOOKBOOK_ITEMS.length) % LOOKBOOK_ITEMS.length);
    setActiveProductId(null);
  }, []);

  const handleHotspot = useCallback(
    (hotspot: Hotspot) => {
      setActiveProductId(hotspot.productId);
      document
        .querySelector(`[data-testid="combo-card-${hotspot.productId}"]`)
        ?.scrollIntoView({ behavior: reduceMotion ? "auto" : "smooth", block: "nearest" });
    },
    [reduceMotion]
  );

  const handleCardHighlight = useCallback((productId: string | null) => {
    setActiveProductId(productId);
  }, []);

  const handleSizeChange = useCallback((productId: string, size: string) => {
    setSizeByProduct((prev) => ({ ...prev, [productId]: size }));
  }, []);

  /** Maisonblock "Select Size [X]" — binds into the card variant selector. */
  const handleFitSelect = useCallback(
    (productId: string, size: string) => {
      setSizeByProduct((prev) => ({ ...prev, [productId]: size }));
      setActiveProductId(productId);
      const product = look.products.find((p) => p.id === productId);
      showToast(`Maisonblock fit applied: ${product?.name ?? "Garment"} · Size ${size}. Nothing about your body left this device.`);
    },
    [look, showToast]
  );

  /** Universal Fit "Select Size" — binds into the card variant selector. */
  const handleUniversalSelect = useCallback(
    (productId: string, size: string) => {
      setSizeByProduct((prev) => ({ ...prev, [productId]: size }));
      setActiveProductId(productId);
      const product = look.products.find((p) => p.id === productId);
      showToast(`Universal Fit applied: ${product?.name ?? "Garment"} · Size ${size} (Bangladesh brand cross-check). Profile stays on your device.`);
    },
    [look, showToast]
  );

  const handleToggle = useCallback(
    (product: LookProduct) => {
      setSelectedByLook((prev) => {
        const current = new Set(prev[look.id] ?? look.products.filter((p) => p.inStock).map((p) => p.id));
        if (current.has(product.id)) current.delete(product.id);
        else current.add(product.id);
        return { ...prev, [look.id]: [...current] };
      });
      setActiveProductId(product.id);
    },
    [look]
  );

  const handleBuyLook = useCallback(() => {
    if (summary.itemCount === 0) {
      showToast("Select at least one piece to build your look.");
      return;
    }
    showToast(
      summary.isFullLook
        ? `${look.title} bundle added — you saved ${formatLookBdt(summary.discountBDT)} (${summary.discountPercent}% off).`
        : `${summary.itemCount} piece${summary.itemCount > 1 ? "s" : ""} from ${look.title} added to your Routine Bag.`
    );
  }, [look, showToast, summary]);

  const activeHotspot = activeProductId ? hotspotForProduct(look, activeProductId) : undefined;
  const activeProduct = activeProductId ? findProduct(look, activeProductId) : undefined;

  return (
    <section aria-labelledby="shoppable-lookbook-heading" className="space-y-4">
      {/* Section header + look switcher */}
      <div className="flex flex-wrap items-end justify-between gap-3 px-1">
        <div>
          <p className="text-[11px] font-bold uppercase tracking-[0.18em] text-aina-rose">Experience 02 · Try the Look</p>
          <h2 id="shoppable-lookbook-heading" className="mt-1 font-display text-xl font-extrabold text-white sm:text-2xl">
            Shoppable Lookbook — tap a hotspot, shop the combo
          </h2>
          <p className="mt-1 max-w-2xl text-xs leading-relaxed text-neutral-400 sm:text-sm">
            Every marker on the model opens the exact piece in the combo sidebar. Pick sizes, build the full look, and
            the bundle discount applies automatically. <span className="font-bengali text-neutral-300">পছন্দের লুকটি সরাসরি কিনুন।</span>
          </p>
        </div>
        <div className="flex items-center gap-1.5" role="tablist" aria-label="Choose a look">
          {LOOKBOOK_ITEMS.map((item, idx) => (
            <button
              key={item.id}
              type="button"
              role="tab"
              aria-selected={idx === lookIndex}
              onClick={() => switchLook(idx)}
              className={`min-h-[40px] rounded-full px-3.5 text-xs font-bold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                idx === lookIndex ? "bg-aina-rose text-white shadow-glow-rose" : "border border-white/10 bg-white/5 text-neutral-300 hover:text-white"
              }`}
            >
              {item.title}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-12 lg:items-start">
        {/* ── Left: model image + hotspots ─────────────────────────────── */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-aina-graphite shadow-2xl lg:col-span-7">
          <AnimatePresence mode="wait">
            <motion.div
              key={look.id}
              initial={reduceMotion ? false : { opacity: 0, scale: 1.02 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={reduceMotion ? undefined : { opacity: 0 }}
              transition={{ duration: reduceMotion ? 0 : 0.35, ease: "easeOut" }}
              className="relative aspect-[4/5] w-full sm:aspect-[5/5]"
              style={{ background: `linear-gradient(180deg, ${look.modelGradient[0]} 0%, ${look.modelGradient[1]} 100%)` }}
            >
              {/* Ghost typography */}
              <span aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-10 text-center font-display text-[52px] font-black uppercase tracking-tighter text-white/[0.05] sm:text-[76px]">
                {look.ghostText}
              </span>

              <Image
                src={look.modelImage}
                alt={`${look.title} — full look worn by model`}
                fill
                priority={lookIndex === 0}
                sizes="(max-width: 1024px) 100vw, 58vw"
                className="object-cover object-center"
              />
              {/* Editorial legibility gradients (photo stays the hero) */}
              <div aria-hidden="true" className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/35" />

              {/* Hotspots */}
              {look.hotspots.map((hotspot) => (
                <HotspotMarker
                  key={hotspot.id}
                  hotspot={hotspot}
                  active={activeProductId === hotspot.productId}
                  dimmed={activeProductId !== null && activeProductId !== hotspot.productId}
                  onActivate={handleHotspot}
                />
              ))}

              {/* Top badges */}
              <div className="absolute left-4 top-4 z-20 flex flex-wrap items-center gap-2">
                <span className="rounded-full border border-white/15 bg-black/60 px-3 py-1 text-[11px] font-bold text-white backdrop-blur-md">
                  {look.title} · <span className="font-bengali font-medium">{look.titleBn}</span>
                </span>
                <span className="rounded-full bg-aina-rose/90 px-3 py-1 text-[11px] font-bold text-white">
                  −{look.bundleDiscountPercent}% full-look bundle
                </span>
              </div>

              {/* Prev / next */}
              <div className="absolute right-4 top-4 z-20 flex items-center gap-1.5">
                <button type="button" onClick={() => switchLook(lookIndex - 1)} aria-label="Previous look" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button type="button" onClick={() => switchLook(lookIndex + 1)} aria-label="Next look" className="flex min-h-[44px] min-w-[44px] items-center justify-center rounded-full border border-white/15 bg-black/60 text-white backdrop-blur-md transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white">
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Photo credit (Unsplash License provenance) */}
              <p className="absolute bottom-4 right-4 z-20 hidden text-[10px] font-medium text-white/60 sm:block">
                Photo · {look.modelCredit} / Unsplash
              </p>

              {/* Active hotspot readout */}
              <div aria-live="polite" className="absolute inset-x-4 bottom-4 z-20">
                {activeProduct ? (
                  <p className="inline-flex max-w-full items-center gap-2 rounded-full border border-white/15 bg-black/75 px-3.5 py-2 text-xs font-semibold text-white backdrop-blur-md">
                    <MousePointerClick className="h-3.5 w-3.5 shrink-0 text-aina-rose" />
                    <span className="truncate">
                      {activeProduct.name} · {formatLookBdt(activeProduct.priceBDT)}
                      {activeHotspot ? ` · marker ${Math.round(activeHotspot.xPercent)}%, ${Math.round(activeHotspot.yPercent)}%` : ""}
                    </span>
                  </p>
                ) : (
                  <p className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-3.5 py-2 text-xs text-neutral-300 backdrop-blur-md">
                    <MousePointerClick className="h-3.5 w-3.5 text-aina-light-cerulean" /> Tap a + marker to shop that piece
                  </p>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* ── Right: Combo Sidebar ─────────────────────────────────────── */}
        <div className="lg:col-span-5">
          <div className="rounded-[28px] border border-white/10 bg-aina-graphite/80 shadow-2xl backdrop-blur-xl lg:sticky lg:top-24">
            <div className="border-b border-white/10 px-5 pb-4 pt-5">
              <div className="flex items-center justify-between gap-2">
                <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-aina-light-cerulean">Combo Sidebar · Shop the Look</p>
                <span className="rounded-full bg-white/5 px-2.5 py-1 text-[10px] font-bold text-neutral-300">
                  {summary.itemCount}/{look.products.length} selected
                </span>
              </div>
              <h3 className="mt-1.5 font-display text-lg font-extrabold text-white">
                {look.title} <span className="font-bengali text-sm font-medium text-neutral-400">· {look.occasionBn}</span>
              </h3>
              <p className="mt-0.5 text-xs text-neutral-400">{look.occasion} — hover or tap a card to light up its marker on the model.</p>
            </div>

            <div className="max-h-[520px] space-y-2.5 overflow-y-auto px-4 py-4">
              {look.products.map((product) => (
                <ComboProductCard
                  key={product.id}
                  product={product}
                  highlighted={activeProductId === product.id}
                  selected={selectedIds.has(product.id)}
                  size={sizeByProduct[product.id] ?? product.availableSizes[0] ?? "One Size"}
                  onSizeChange={handleSizeChange}
                  onToggle={handleToggle}
                  onHighlight={handleCardHighlight}
                  onFindMyFit={setFitProduct}
                  onCheckMyFit={setUniversalProduct}
                />
              ))}
            </div>

            {/* Bundle maths + sticky buy bar */}
            <div className="border-t border-white/10 px-5 py-4">
              <dl className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <dt className="text-neutral-400">Subtotal ({summary.itemCount} piece{summary.itemCount === 1 ? "" : "s"})</dt>
                  <dd className="font-semibold text-white">{formatLookBdt(summary.subtotalBDT)}</dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="inline-flex items-center gap-1.5 text-neutral-400">
                    <BadgePercent className="h-3.5 w-3.5 text-aina-rose" /> Bundle discount
                  </dt>
                  <dd className={summary.isFullLook ? "font-semibold text-emerald-400" : "text-neutral-500"}>
                    {summary.isFullLook ? `−${formatLookBdt(summary.discountBDT)} (${summary.discountPercent}%)` : summary.savingsLabel}
                  </dd>
                </div>
                <div className="flex items-center justify-between border-t border-dashed border-white/10 pt-2">
                  <dt className="font-bold text-white">Total</dt>
                  <dd className="font-display text-lg font-extrabold text-white">{formatLookBdt(summary.totalBDT)} <span className="text-[10px] font-semibold text-neutral-400">BDT</span></dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={handleBuyLook}
                className="mt-3 inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-full bg-aina-rose px-5 text-sm font-extrabold text-white shadow-glow-rose transition hover:bg-aina-rose/90 active:scale-[0.98] focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black"
              >
                <ShoppingBag className="h-4 w-4" />
                {summary.isFullLook ? `Buy the Full Look · ${formatLookBdt(summary.totalBDT)}` : `Add ${summary.itemCount || ""} Selected to Bag`}
              </button>
              <p className="mt-2 text-center text-[11px] leading-relaxed text-neutral-500">
                AinA does not sell directly — checkout continues with verified Bangladeshi sellers. Affiliate pieces are labelled at checkout.
              </p>

              <div aria-live="polite">
                {toast && (
                  <p className="mt-3 flex items-start gap-2 rounded-2xl border border-emerald-500/30 bg-emerald-500/10 px-3.5 py-2.5 text-xs font-semibold leading-relaxed text-emerald-300">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" /> {toast}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Maisonblock Fitting Engine (Verified Precision Merchants only) */}
      <MaisonblockFittingModal
        open={fitProduct !== null}
        product={fitProduct}
        onClose={() => setFitProduct(null)}
        onSelectSize={handleFitSelect}
      />

      {/* AinA Universal Fit — Bangladesh brand cross-check (all products) */}
      <UniversalFitModal
        open={universalProduct !== null}
        product={universalProduct}
        onClose={() => setUniversalProduct(null)}
        onSelectSize={handleUniversalSelect}
      />
    </section>
  );
}

export default ShoppableLookbookSection;
