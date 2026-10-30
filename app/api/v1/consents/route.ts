// app/api/v1/consents/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";

const ConsentUpdateSchema = z.object({
  purpose: z.enum([
    "essential_account",
    "photo_processing",
    "health_related_personalization",
    "marketing",
    "community_publication",
    "model_training",
  ]),
  state: z.enum(["granted", "withdrawn", "denied"]),
  policyVersion: z.string().default("v1.0.0-pdpa2026"),
  evidence: z.record(z.unknown()).default({}),
});

export async function GET() {
  try {
    const session = await getCurrentSession();
    const records = await prisma.consentRecord.findMany({
      where: { userId: session.userId },
      orderBy: { createdAt: "desc" },
    });

    // Map each purpose to its latest recorded state
    const currentConsents: Record<string, string> = {
      essential_account: "granted",
      photo_processing: "denied",
      health_related_personalization: "denied",
    };

    for (const record of records) {
      if (!currentConsents[record.purpose]) {
        currentConsents[record.purpose] = record.state;
      }
    }

    return NextResponse.json({
      data: {
        userId: session.userId,
        consents: currentConsents,
        records,
      },
      meta: {
        policyVersion: "v1.0.0-pdpa2026",
        timestamp: new Date().toISOString(),
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

export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();
    const body = await req.json();
    const parsed = ConsentUpdateSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid consent payload",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { purpose, state, policyVersion, evidence } = parsed.data;

    const record = await prisma.consentRecord.create({
      data: {
        userId: session.userId,
        purpose,
        state,
        policyVersion,
        method: "in_app_toggle",
        evidence: evidence as object,
        grantedAt: state === "granted" ? new Date() : null,
        withdrawnAt: state === "withdrawn" ? new Date() : null,
      },
    });

    // Create Audit Event
    await prisma.auditEvent.create({
      data: {
        actorUserId: session.userId,
        action: `consent.${state}`,
        entityType: "consent_record",
        entityId: record.id,
        safeMetadata: { purpose, state, policyVersion },
      },
    });

    return NextResponse.json(
      {
        data: {
          id: record.id,
          purpose: record.purpose,
          state: record.state,
          updatedAt: record.createdAt,
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
