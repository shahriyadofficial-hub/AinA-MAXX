"use client";

// components/fashion/ComboProductCard.tsx
// AinA Drip — one shoppable product row inside the Combo Sidebar.
// Owns its size selection; reports toggles up to ShoppableLookbookSection.

import React, { useState } from "react";
import Image from "next/image";
import { Check, ShoppingBag } from "lucide-react";
import { formatLookBdt, type LookProduct } from "@/lib/fashion/lookbook";

interface ComboProductCardProps {
  product: LookProduct;
  highlighted: boolean;
  selected: boolean;
  onToggle: (product: LookProduct) => void;
  onHighlight: (productId: string | null) => void;
}

const CATEGORY_LABEL: Record<LookProduct["category"], string> = {
  top: "Top",
  bottom: "Bottom",
  shoes: "Shoes",
  accessory: "Accessory",
};

export function ComboProductCard({ product, highlighted, selected, onToggle, onHighlight }: ComboProductCardProps) {
  const [size, setSize] = useState<string>(product.availableSizes[0] ?? "One Size");

  return (
    <article
      data-testid={`combo-card-${product.id}`}
      onMouseEnter={() => onHighlight(product.id)}
      onMouseLeave={() => onHighlight(null)}
      className={`rounded-2xl border p-3 transition-all duration-200 ${
        highlighted
          ? "border-aina-rose/70 bg-white/[0.07] shadow-[0_0_24px_-8px_rgba(255,45,149,0.55)]"
          : "border-white/10 bg-white/[0.03]"
      } ${!product.inStock ? "opacity-75" : ""}`}
    >
      <div className="flex items-start gap-3">
        <Image
          src={product.image}
          alt={product.name}
          width={56}
          height={56}
          unoptimized
          className="h-14 w-14 shrink-0 rounded-xl border border-white/10 object-cover"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-[10px] font-bold uppercase tracking-wider text-aina-light-cerulean">
                {CATEGORY_LABEL[product.category]} · {product.brand}
              </p>
              <h4 className="truncate text-sm font-bold text-white">{product.name}</h4>
            </div>
            <p className="shrink-0 font-display text-sm font-extrabold text-white">{formatLookBdt(product.priceBDT)}</p>
          </div>

          {/* Size selector — real buttons, 44px-friendly, labelled for AT */}
          <div className="mt-2 flex flex-wrap items-center gap-1.5" role="group" aria-label={`Size for ${product.name}`}>
            {product.availableSizes.map((s) => (
              <button
                key={s}
                type="button"
                aria-pressed={size === s}
                onClick={() => setSize(s)}
                className={`min-h-[32px] min-w-[36px] rounded-lg px-2 text-[11px] font-bold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                  size === s ? "bg-white text-black" : "border border-white/15 bg-white/5 text-neutral-300 hover:text-white"
                }`}
              >
                {s}
              </button>
            ))}
          </div>

          <div className="mt-2.5 flex items-center justify-between gap-2">
            <span className={`text-[11px] font-semibold ${product.inStock ? "text-emerald-400" : "text-amber-400"}`}>
              {product.inStock ? "In stock · Dhaka delivery" : "Out of stock · Notify me"}
            </span>
            <button
              type="button"
              disabled={!product.inStock}
              aria-pressed={selected}
              onClick={() => onToggle(product)}
              className={`inline-flex min-h-[36px] items-center gap-1.5 rounded-full px-3 text-[11px] font-bold transition active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-white disabled:cursor-not-allowed disabled:opacity-40 ${
                selected ? "bg-emerald-500/20 text-emerald-300" : "bg-aina-rose text-white shadow-glow-rose hover:bg-aina-rose/90"
              }`}
            >
              {selected ? <Check className="h-3.5 w-3.5" /> : <ShoppingBag className="h-3.5 w-3.5" />}
              {selected ? `Added · ${size}` : `Add · ${size}`}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}

export default ComboProductCard;
