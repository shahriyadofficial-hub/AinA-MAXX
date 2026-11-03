"use client";

// app/shop/page.tsx
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ShoppingBag, Plus, Check } from "lucide-react";
import { RoutineBag } from "@/components/maxx/RoutineBag";
import {
  SHOP_PRODUCTS,
  formatBdt,
  type ShopProduct,
  type RoutineBagItem,
} from "@/lib/gamification/maxx";

type Locale = "en" | "bn";

interface ProductsResponse {
  data: { products: ShopProduct[] };
}

const CATEGORIES = ["all", "skincare", "haircare"] as const;

export default function ShopPage() {
  const [locale, setLocale] = useState<Locale>("en");
  const bn = locale === "bn";

  const [products, setProducts] = useState<ShopProduct[]>(SHOP_PRODUCTS);
  const [category, setCategory] = useState<(typeof CATEGORIES)[number]>("all");
  const [bag, setBag] = useState<Map<string, RoutineBagItem>>(new Map());
  const [bagOpen, setBagOpen] = useState(false);

  const loadProducts = useCallback(async () => {
    try {
      const res = await fetch("/api/v1/products");
      const json = (await res.json()) as ProductsResponse;
      if (res.ok && json.data?.products?.length) setProducts(json.data.products);
    } catch {
      // Keep the curated catalog so the shop always renders.
    }
  }, []);

  useEffect(() => {
    void loadProducts();
  }, [loadProducts]);

  const visible = useMemo(
    () => (category === "all" ? products : products.filter((p) => p.category === category)),
    [products, category]
  );

  const bagItems = useMemo(() => [...bag.values()], [bag]);
  const bagCount = bagItems.reduce((sum, item) => sum + item.qty, 0);

  function addToBag(product: ShopProduct) {
    setBag((prev) => {
      const next = new Map(prev);
      const existing = next.get(product.slug);
      next.set(product.slug, { product, qty: (existing?.qty ?? 0) + 1 });
      return next;
    });
  }

  function removeFromBag(slug: string) {
    setBag((prev) => {
      const next = new Map(prev);
      next.delete(slug);
      return next;
    });
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-purple-400">
            {bn ? "কিউরেটেড শপ · BDT যাচাইকৃত" : "Curated Shop · BDT verified"}
          </p>
          <h1 className="mt-1 font-display text-xl font-bold text-white">AinA Shop</h1>
          <p className="mt-0.5 text-xs text-neutral-400">
            {bn
              ? "বাংলাদেশি ও গ্লোবাল পণ্য, আসল BDT দামে"
              : "Bangladeshi & global products with real BDT pricing"}
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
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
            onClick={() => setBagOpen(true)}
            className="relative rounded-full bg-aina-rose p-2.5 text-white shadow-glow-rose active:scale-95"
            aria-label={bn ? "রুটিন ব্যাগ খুলুন" : "Open routine bag"}
          >
            <ShoppingBag className="h-4 w-4" />
            {bagCount > 0 && (
              <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-white font-display text-xs font-extrabold text-aina-rose">
                {bagCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Category filter */}
      <div className="flex gap-1.5">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            type="button"
            onClick={() => setCategory(cat)}
            aria-pressed={category === cat}
            className={`rounded-full px-3 py-1.5 text-xs font-semibold capitalize transition active:scale-95 ${
              category === cat
                ? "bg-purple-500 text-white"
                : "border border-white/10 bg-white/5 text-neutral-300"
            }`}
          >
            {cat === "all" ? (bn ? "সব" : "All") : cat}
          </button>
        ))}
      </div>

      {/* Product grid: Responsive 3-Column Desktop Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {visible.map((product) => {
          const inBag = bag.has(product.slug);
          return (
            <article
              key={product.slug}
              className="space-y-2 rounded-aina border border-white/10 bg-aina-graphite p-4"
            >
              <div className="flex items-center justify-between gap-2">
                <span className="rounded-full bg-aina-cerulean/20 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-aina-light-cerulean">
                  {product.brand}
                </span>
                <span className="font-display text-sm font-extrabold text-white">
                  {formatBdt(product.priceBdt)}
                </span>
              </div>

              <h2 className="text-xs font-bold leading-relaxed text-white">{product.name}</h2>
              <p className="text-xs leading-relaxed text-neutral-400">{product.description}</p>

              <div className="flex items-center justify-between gap-2 border-t border-white/5 pt-2">
                <span className="text-xs text-neutral-500">
                  {product.sellerName}
                  {product.isAffiliate ? (bn ? " · অ্যাফিলিয়েট" : " · Affiliate") : ""}
                </span>
                <button
                  type="button"
                  onClick={() => addToBag(product)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold transition active:scale-95 ${
                    inBag
                      ? "bg-emerald-500/15 text-emerald-300"
                      : "bg-white/10 text-white hover:bg-white/20"
                  }`}
                >
                  {inBag ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                  {inBag ? (bn ? "ব্যাগে আছে" : "In bag") : bn ? "ব্যাগে যোগ করুন" : "Add to Bag"}
                </button>
              </div>
            </article>
          );
        })}
      </div>

      <RoutineBag
        open={bagOpen}
        items={bagItems}
        locale={locale}
        onClose={() => setBagOpen(false)}
        onRemove={removeFromBag}
      />
    </div>
  );
}
