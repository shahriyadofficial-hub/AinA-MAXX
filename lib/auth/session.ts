// lib/auth/session.ts
import { cookies } from "next/headers";
import prisma from "@/lib/db/client";

export const DEMO_USER_ID = "00000000-0000-0000-0000-000000000001";

export interface UserSession {
  userId: string;
  displayName: string;
  adultAccessEnabled: boolean;
  locale: string;
}

/**
 * Resolves current session from cookie, header, or falls back to demo profile.
 */
export async function getCurrentSession(): Promise<UserSession> {
  const cookieStore = await cookies();
  const sessionUserId = cookieStore.get("aina_user_id")?.value || DEMO_USER_ID;

  try {
    const profile = await prisma.profile.findUnique({
      where: { id: sessionUserId },
    });

    if (profile) {
      return {
        userId: profile.id,
        displayName: profile.displayName,
        adultAccessEnabled: profile.adultAccessEnabled,
        locale: profile.locale,
      };
    }
  } catch (err) {
    console.warn("[Session] Could not read profile from DB, using fallback:", err);
  }

  return {
    userId: DEMO_USER_ID,
    displayName: "AinA Member",
    adultAccessEnabled: true,
    locale: "en",
  };
}
