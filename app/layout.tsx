import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import AinaLogo from "@/components/brand/AinaLogo";
import BottomNav from "@/components/navigation/BottomNav";
import { CoachDrawer } from "@/components/coach/CoachDrawer";

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
  title: "AinA (Ai∩A MAXX) — Reflect the Prime You",
  description: "AI-guided personal transformation platform for skin, hair, fitness, food, fashion and grooming. Meta Global AI Developer Hackathon.",
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
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
      <body className="bg-aina-black text-foreground antialiased selection:bg-aina-rose selection:text-white pb-24 md:pb-28">
        {/* Header with Ai∩A MAXX Logo */}
        <header className="sticky top-0 z-40 w-full bg-aina-black/85 backdrop-blur-md border-b border-white/5 px-4 py-2.5 transition-all">
          <div className="max-w-xl mx-auto flex items-center justify-between">
            <AinaLogo size="sm" showSubtitle={true} />
            <div className="flex items-center space-x-2">
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-aina-cerulean/15 text-aina-light-cerulean border border-aina-cerulean/30">
                18+ ADULT
              </span>
              <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium tracking-tight bg-aina-rose/10 text-aina-rose border border-aina-rose/25">
                CEREBRAL VALLEY
              </span>
            </div>
          </div>
        </header>

        {/* Main Application Container */}
        <main className="max-w-xl mx-auto px-4 py-4 min-h-[calc(100vh-140px)]">
          {children}
        </main>

        {/* Persistent Mobile Bottom Navigation */}
        <BottomNav />

        {/* Slide-out Bilingual AI Coach (muse-spark-1.3) */}
        <CoachDrawer />
      </body>
    </html>
  );
}
