export const dynamic = 'force-dynamic';

// app/api/v1/me/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";

export async function GET() {
  try {
    const session = await getCurrentSession();
    const profile = await prisma.profile.findUnique({
      where: { id: session.userId },
      include: {
        preferences: true,
        goals: { where: { status: "active" } },
        streak: true,
      },
    });

    if (!profile) {
      return NextResponse.json(
        {
          data: {
            id: session.userId,
            displayName: "New Guest",
            adultAccessEnabled: false,
            needsOnboarding: true,
          },
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      data: {
        id: profile.id,
        displayName: profile.displayName,
        locale: profile.locale,
        timezone: profile.timezone,
        adultAccessEnabled: profile.adultAccessEnabled,
        birthDate: profile.birthDate,
        preferences: profile.preferences,
        goals: profile.goals,
        streak: profile.streak,
        needsOnboarding: false,
      },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
