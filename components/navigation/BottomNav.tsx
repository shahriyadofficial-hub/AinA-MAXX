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
  { label: "Drip", banglaLabel: "ড্রিপ", href: "/drip", icon: Shirt },
  { label: "Vibe", banglaLabel: "ভাইব", href: "/vibe", icon: Flame },
  { label: "Shop", banglaLabel: "শপ", href: "/shop", icon: ShoppingBag },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="fixed bottom-0 left-0 right-0 z-50 bg-aina-black/95 backdrop-blur-2xl border-t border-white/10 px-3 py-1.5 transition-all duration-300 md:hidden pb-safe"
    >
      <div className="flex items-center justify-around max-w-lg mx-auto">
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
              className={`relative flex flex-col items-center justify-center min-h-[44px] min-w-[44px] py-1 px-3 rounded-2xl transition-all duration-200 active:scale-95 group ${
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
