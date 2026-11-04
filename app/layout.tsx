import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";
import BottomNav from "@/components/navigation/BottomNav";
import { CoachDrawer } from "@/components/coach/CoachDrawer";
import { ErrorBoundary } from "@/components/system/ErrorBoundary";
import { MODEL_PHOTOS, portraitUrl } from "@/lib/media/photos";

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

const notoSansBengali = Noto_Sans_Bengali({
  subsets: ["bengali"],
  variable: "--font-noto-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  // Guarded: a malformed NEXT_PUBLIC_APP_URL must never throw at module
  // evaluation (that crashes every route, including the error pages).
  // Normalizes stray whitespace/brackets and a missing scheme, then falls
  // back to the production origin — never localhost in a deployed build.
  metadataBase: (() => {
    const fallback = "https://aina-maxx.vercel.app";
    const raw = (process.env.NEXT_PUBLIC_APP_URL || "").trim().replace(/^\[|\]$/g, "");
    const candidate = raw ? (raw.startsWith("http") ? raw : `https://${raw}`) : fallback;
    try {
      return new URL(candidate);
    } catch {
      return new URL(fallback);
    }
  })(),
  title: "AinA (Ai∩A MAXX) — Reflect the Prime You",
  description: "AI-guided personal transformation platform for skin, hair, fitness, food, fashion and grooming. Meta Global AI Developer Hackathon.",
  manifest: "/manifest.webmanifest",
  icons: {
    icon: "/icon.svg",
    apple: "/apple-icon.svg",
  },
  openGraph: {
    title: "AinA (Ai∩A MAXX) — Reflect the Prime You",
    description: "AI-guided skin, hair, fitness and fashion transformation for Bangladesh's climate. Powered by Meta Muse & SAM 3.1.",
    type: "website",
    images: [{ url: portraitUrl(MODEL_PHOTOS.heroPortrait, 1200), alt: MODEL_PHOTOS.heroPortrait.alt }],
  },
  twitter: {
    card: "summary_large_image",
    title: "AinA (Ai∩A MAXX) — Reflect the Prime You",
    description: "AI-guided skin, hair, fitness and fashion transformation for Bangladesh's climate.",
    images: [portraitUrl(MODEL_PHOTOS.heroPortrait, 1200)],
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0A0A0A",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${notoSansBengali.variable} dark`}
    >
      <body className="bg-aina-black text-foreground antialiased selection:bg-aina-rose selection:text-white pb-24 md:pb-12 min-h-screen">
        {/* Root Error Boundary: a client throw in any shell widget or page
            degrades to a recoverable panel instead of a blank screen.
            (app/error.tsx + app/global-error.tsx cover the route/layout
            levels above this boundary.) */}
        <ErrorBoundary label="App shell">
          {/* Full Desktop & Mobile Responsive Header */}
          <Navbar />

          {/* Modern Wide Dashboard Container */}
          <main className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 min-h-[calc(100vh-140px)]">
            {children}
          </main>

          {/* Mobile-Only Bottom Navigation Dock */}
          <BottomNav />

          {/* Slide-out Bilingual AI Coach (muse-spark-1.3) */}
          <CoachDrawer />
        </ErrorBoundary>
      </body>
    </html>
  );
}
