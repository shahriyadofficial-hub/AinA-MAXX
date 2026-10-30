// app/api/v1/onboarding/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import { evaluateAgeGate } from "@/lib/auth/age-gate";

import { OnboardingPayloadSchema } from "@/lib/types/onboarding";

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const parsed = OnboardingPayloadSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid onboarding data",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const ageAssessment = evaluateAgeGate(data.birthDate);

    // 1. Strictly enforce Under-13 block (PDPA 2026)
    if (!ageAssessment.allowed) {
      return NextResponse.json(
        {
          error: {
            code: "UNDERAGE_BLOCKED",
            message: ageAssessment.messageEn,
            messageBn: ageAssessment.messageBn,
          },
        },
        { status: 403 }
      );
    }

    const isAdult = ageAssessment.status === "adult_full_access";

    // 2. Persist Profile, Preferences, Goals, and Consents
    const profile = await prisma.profile.upsert({
      where: { id: session.userId },
      update: {
        displayName: data.displayName,
        birthDate: new Date(data.birthDate),
        locale: data.locale,
        adultAccessEnabled: isAdult,
      },
      create: {
        id: session.userId,
        displayName: data.displayName,
        birthDate: new Date(data.birthDate),
        locale: data.locale,
        timezone: "Asia/Dhaka",
        adultAccessEnabled: isAdult,
      },
    });

    // Upsert Preferences
    await prisma.userPreferences.upsert({
      where: { userId: profile.id },
      update: {
        budgetTier: data.budgetTier,
        availableMinutes: data.availableMinutes,
        goals: data.goals,
        stylePreferences: { skinType: data.skinType, hairType: data.hairType },
      },
      create: {
        userId: profile.id,
        currencyCode: "BDT",
        budgetTier: data.budgetTier,
        availableMinutes: data.availableMinutes,
        goals: data.goals,
        stylePreferences: { skinType: data.skinType, hairType: data.hairType },
      },
    });

    // Reset and insert Goals
    await prisma.userGoal.deleteMany({ where: { userId: profile.id } });
    for (const g of data.goals) {
      await prisma.userGoal.create({
        data: {
          userId: profile.id,
          category: g.includes("hair") ? "hair" : g.includes("drip") ? "fashion" : "skin",
          goalKey: g,
          title: g.replace(/_/g, " ").toUpperCase(),
          status: "active",
        },
      });
    }

    // Record Essential Account Consent
    await prisma.consentRecord.create({
      data: {
        userId: profile.id,
        purpose: "essential_account",
        state: "granted",
        policyVersion: "v1.0.0-pdpa2026",
        method: "onboarding_quiz",
        evidence: { ipAddress: "client_verified", age: ageAssessment.age },
        grantedAt: new Date(),
      },
    });

    // Record Optional Photo Processing Consent (Only allowed for adults)
    if (isAdult && data.consents.photoProcessing) {
      await prisma.consentRecord.create({
        data: {
          userId: profile.id,
          purpose: "photo_processing",
          state: "granted",
          policyVersion: "v1.0.0-pdpa2026",
          method: "onboarding_toggle",
          evidence: { purpose: "skin_hair_guidance_only" },
          grantedAt: new Date(),
        },
      });
    }

    // Record Health Personalization Consent
    if (isAdult && data.consents.healthPersonalization) {
      await prisma.consentRecord.create({
        data: {
          userId: profile.id,
          purpose: "health_related_personalization",
          state: "granted",
          policyVersion: "v1.0.0-pdpa2026",
          method: "onboarding_toggle",
          evidence: { purpose: "barrier_allergies_hydration" },
          grantedAt: new Date(),
        },
      });
    }

    return NextResponse.json(
      {
        data: {
          userId: profile.id,
          displayName: profile.displayName,
          ageAssessment,
          adultAccessEnabled: profile.adultAccessEnabled,
          onboardingCompleted: true,
        },
        meta: {
          timestamp: new Date().toISOString(),
        },
      },
      { status: 201 }
    );
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
