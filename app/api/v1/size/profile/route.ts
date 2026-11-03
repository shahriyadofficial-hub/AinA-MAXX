export const dynamic = 'force-dynamic';

// app/api/v1/size/profile/route.ts
// AinA Universal Fit — body profile persistence (Bangladesh PDPA 2026).
//
// PRIVACY CONTRACT:
// - GET/POST/DELETE all require an authenticated session.
// - POST persists ONLY when the client sends explicit `consentGranted: true`
//   (the in-app consent toggle). Without it → 403 CONSENT_REQUIRED.
// - DELETE is one-tap erasure: the row is hard-deleted, and an audit event
//   (without any measurement values) records the erasure.
// - Guests never reach this route: they calculate on-device only.

import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";

const ProfileSchema = z.object({
  heightInches: z.number().min(48).max(84),
  weightKg: z.number().min(35).max(180),
  chestInches: z.number().min(28).max(60),
  waistInches: z.number().min(24).max(60),
  shoulderInches: z.number().min(12).max(26).optional(),
  panjabiLengthIn: z.number().min(34).max(52).optional(),
  fitPreference: z.enum(["SLIM_FIT", "SEMI_FIT", "REGULAR", "RELAXED_OVERSIZED"]).default("SEMI_FIT"),
  bodyComposition: z.enum(["SLIM", "REGULAR", "ATHLETIC", "HEAVY_CHEST", "ROUND_BELLY"]).optional(),
  consentGranted: z.boolean(),
});

function toPublicProfile(p: {
  id: string;
  heightInches: number;
  weightKg: number;
  chestInches: number;
  waistInches: number;
  shoulderInches: number | null;
  panjabiLengthIn: number | null;
  fitPreference: string;
  bodyComposition: string | null;
  consentGranted: boolean;
  updatedAt: Date;
}) {
  return {
    id: p.id,
    heightInches: p.heightInches,
    weightKg: p.weightKg,
    chestInches: p.chestInches,
    waistInches: p.waistInches,
    shoulderInches: p.shoulderInches,
    panjabiLengthIn: p.panjabiLengthIn,
    fitPreference: p.fitPreference,
    bodyComposition: p.bodyComposition,
    consentGranted: p.consentGranted,
    updatedAt: p.updatedAt,
  };
}

export async function GET() {
  try {
    const session = await getCurrentSession();
    const profile = await prisma.userBodyProfile.findUnique({ where: { userId: session.userId } });
    return NextResponse.json({
      data: profile ? toPublicProfile(profile) : null,
      meta: { policy: "PDPA-2026", timestamp: new Date().toISOString() },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: { code: "SERVER_ERROR", message } }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const parsed = ProfileSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: { code: "VALIDATION_ERROR", message: "Invalid body profile payload", details: parsed.error.issues } },
        { status: 400 }
      );
    }

    // PDPA 2026: zero backend storage without explicit consent.
    if (!parsed.data.consentGranted) {
      return NextResponse.json(
        {
          error: {
            code: "CONSENT_REQUIRED",
            message:
              "আপনার শারীরিক মাপ নিরাপদভাবে সংরক্ষিত হবে কেবল সাইজ সুপারিশের জন্য। Explicit consent is required before any body profile is stored.",
          },
        },
        { status: 403 }
      );
    }

    const { consentGranted, ...measurements } = parsed.data;
    const profile = await prisma.userBodyProfile.upsert({
      where: { userId: session.userId },
      update: { ...measurements, consentGranted },
      create: { userId: session.userId, ...measurements, consentGranted },
    });

    await prisma.auditEvent.create({
      data: {
        actorUserId: session.userId,
        action: "body_profile.saved_with_consent",
        entityType: "user_body_profile",
        entityId: profile.id,
        safeMetadata: { policy: "PDPA-2026", consentGranted: true },
      },
    });

    return NextResponse.json({ data: toPublicProfile(profile) }, { status: 201 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: { code: "SERVER_ERROR", message } }, { status: 500 });
  }
}

export async function DELETE() {
  try {
    const session = await getCurrentSession();
    const existing = await prisma.userBodyProfile.findUnique({ where: { userId: session.userId } });
    if (existing) {
      await prisma.userBodyProfile.delete({ where: { userId: session.userId } });
      await prisma.auditEvent.create({
        data: {
          actorUserId: session.userId,
          action: "body_profile.erased",
          entityType: "user_body_profile",
          entityId: existing.id,
          safeMetadata: { policy: "PDPA-2026", erasedBy: "user_one_tap" },
        },
      });
    }
    return NextResponse.json({
      data: { erased: Boolean(existing) },
      meta: { policy: "PDPA-2026", timestamp: new Date().toISOString() },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json({ error: { code: "SERVER_ERROR", message } }, { status: 500 });
  }
}
