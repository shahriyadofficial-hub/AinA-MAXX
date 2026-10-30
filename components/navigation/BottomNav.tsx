"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Home, Compass, Shirt, Flame, ShoppingBag } from "lucide-react";

interface NavItem {
  label: string;
  banglaLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const NAV_ITEMS: NavItem[] = [
  { label: "Home", banglaLabel: "হোম", href: "/", icon: Home },
  { label: "Roadmap", banglaLabel: "রোডম্যাপ", href: "/roadmap", icon: Compass },
  { label: "Wardrobe", banglaLabel: "ড্রিপ", href: "/wardrobe", icon: Shirt },
  { label: "Vibe", banglaLabel: "ভাইব", href: "/vibe", icon: Flame },
  { label: "Shop", banglaLabel: "শপ", href: "/shop", icon: ShoppingBag },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-aina-black/95 backdrop-blur-xl border-t border-aina-border/80 px-2 py-1.5 transition-all duration-300 md:max-w-md md:mx-auto md:bottom-3 md:rounded-full md:border md:shadow-2xl md:shadow-black"
    >
      <div className="flex items-center justify-around">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon;
          const isActive =
            item.href === "/"
              ? pathname === "/"
              : pathname.startsWith(item.href);

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex flex-col items-center justify-center py-1.5 px-3 rounded-2xl transition-all duration-200 group ${
                isActive
                  ? "text-aina-rose"
                  : "text-neutral-400 hover:text-white"
              }`}
            >
              {/* Active Indicator Glow */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-aina-rose shadow-glow-rose" />
              )}

              <Icon
                className={`w-5 h-5 transition-transform duration-200 ${
                  isActive ? "scale-110 stroke-[2.25]" : "group-hover:scale-105"
                }`}
              />
              <span className="text-[10px] font-medium tracking-tight mt-1 font-display">
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

export default BottomNav;
