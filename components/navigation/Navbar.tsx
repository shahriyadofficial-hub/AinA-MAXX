"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AinaLogo } from "@/components/brand/AinaLogo";
import { JudgeDemoBar } from "@/components/judge/JudgeDemoBar";
import {
  Compass,
  Shirt,
  Sparkles,
  Flame,
  ShoppingBag,
  Home,
  Zap,
  ShieldCheck,
} from "lucide-react";

interface NavLinkItem {
  label: string;
  banglaLabel: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

const NAV_LINKS: NavLinkItem[] = [
  { label: "Home", banglaLabel: "হোম", href: "/", icon: Home },
  { label: "Roadmap", banglaLabel: "রোডম্যাপ", href: "/roadmap", icon: Compass },
  {
    label: "AinA Drip (Fashion)",
    banglaLabel: "ড্রিপ",
    href: "/drip",
    icon: Shirt,
    badge: "3D",
  },
  {
    label: "AinA Maxx",
    banglaLabel: "ম্যাক্স",
    href: "/coded",
    icon: Sparkles,
  },
  { label: "Vibe", banglaLabel: "ভাইব", href: "/vibe", icon: Flame },
  { label: "Shop", banglaLabel: "শপ", href: "/shop", icon: ShoppingBag },
];

export function Navbar() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-40 w-full bg-aina-black/90 backdrop-blur-xl border-b border-white/5 transition-all">
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2.5">
        <div className="flex items-center justify-between">
          {/* Logo & Desktop Nav Links */}
          <div className="flex items-center space-x-6 lg:space-x-8">
            <Link
              href="/"
              className="group focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose rounded-lg transition-transform active:scale-95"
              aria-label="AinA Home"
            >
              <AinaLogo size="sm" showSubtitle={true} variant="primary" />
            </Link>

            {/* Desktop Navigation Links (>= md) */}
            <nav
              aria-label="Desktop Navigation"
              className="hidden md:flex items-center space-x-1 lg:space-x-1.5"
            >
              {NAV_LINKS.map((item) => {
                const Icon = item.icon;
                const isActive =
                  item.href === "/"
                    ? pathname === "/"
                    : pathname.startsWith(item.href);

                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`relative inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-full text-xs font-semibold tracking-wide transition-all duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-aina-rose ${
                      isActive
                        ? "bg-white/10 text-white shadow-[0_0_15px_rgba(255,45,149,0.25)] border border-white/15"
                        : "text-neutral-400 hover:text-white hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Icon
                      className={`w-3.5 h-3.5 transition-colors ${
                        isActive
                          ? "text-aina-rose stroke-[2.2]"
                          : "text-neutral-400 group-hover:text-white"
                      }`}
                    />
                    <span>{item.label}</span>

                    {item.badge && (
                      <span className="text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.2 rounded-full bg-aina-rose/20 text-aina-rose border border-aina-rose/30">
                        {item.badge}
                      </span>
                    )}

                    {isActive && (
                      <span className="absolute -bottom-2.5 left-1/2 -translate-x-1/2 w-4 h-0.5 rounded-full bg-aina-rose shadow-glow-rose" />
                    )}
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Right Header Status Bar (Streak, XP, Judge Demo, Adult Badge) */}
          <div className="flex items-center space-x-2 sm:space-x-3">
            {/* Desktop Streak Counter */}
            <div
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-aina-rose/10 border border-aina-rose/25 text-aina-rose text-xs font-bold"
              title="Current Mirror Streak"
            >
              <Flame className="w-3.5 h-3.5 fill-aina-rose text-aina-rose animate-pulse" />
              <span>Day 1</span>
            </div>

            {/* Desktop XP Pill Badge */}
            <div
              className="hidden sm:inline-flex items-center space-x-1.5 px-2.5 py-1 rounded-full bg-aina-cerulean/15 border border-aina-cerulean/30 text-aina-light-cerulean text-xs font-bold"
              title="Daily Experience Points"
            >
              <Zap className="w-3.5 h-3.5 text-aina-light-cerulean fill-aina-light-cerulean" />
              <span>0 XP</span>
            </div>

            {/* Judge Demo Inspector Bar */}
            <JudgeDemoBar />

            {/* 18+ Adult Gate Badge */}
            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-[10px] font-semibold tracking-wider bg-aina-graphite/80 text-neutral-300 border border-white/10">
              <ShieldCheck className="w-3 h-3 text-emerald-400" />
              <span className="hidden xs:inline">18+</span>
              <span className="hidden lg:inline">ADULT</span>
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Navbar;
