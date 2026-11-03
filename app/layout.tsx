import type { Metadata, Viewport } from "next";
import { Space_Grotesk, Inter, Noto_Sans_Bengali } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/navigation/Navbar";
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
      <body className="bg-aina-black text-foreground antialiased selection:bg-aina-rose selection:text-white pb-24 md:pb-12 min-h-screen">
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
      </body>
    </html>
  );
}
