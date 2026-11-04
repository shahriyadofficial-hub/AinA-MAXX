// app/not-found.tsx
// AinA (Ai∩A MAXX) — custom 404 page.
//
// Deliberately plain and self-contained: no API calls, no database, no
// Supabase, no heavy components. Next.js prerenders this page during
// `/_not-found` collection, so anything that can throw here (env reads,
// `new URL(...)`, data fetching) fails the whole build. Keep it static.

import Link from "next/link";

export const dynamic = "force-static";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#0A0A0A] text-[#E8E8E5] flex flex-col items-center justify-center p-6 text-center">
      <h2 className="text-4xl font-bold font-mono text-[#FF2D95] mb-2">404</h2>
      <p className="text-sm text-[#8A8A8F] mb-6">Page Not Found</p>
      <Link
        className="px-6 py-2.5 rounded-full bg-[#FF2D95] text-black font-semibold text-xs uppercase"
        href="/"
      >
        Return Home
      </Link>
    </div>
  );
}
