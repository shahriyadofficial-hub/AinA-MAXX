// app/api/v1/photos/upload-intent/route.ts
import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";

const UploadIntentSchema = z.object({
  purpose: z.enum(["skin_guidance", "hair_guidance", "private_progress"]),
  mimeType: z.enum(["image/jpeg", "image/png", "image/webp"]).default("image/jpeg"),
  byteSize: z.number().int().positive().max(10 * 1024 * 1024).default(1024),
  fileName: z.string().max(120).optional(),
});

const RETENTION_DAYS = Number(process.env.PHOTO_RETENTION_DAYS ?? 30);

/**
 * Creates a private photo asset record and returns a short-lived signed
 * upload intent. The photo is never public and never scored.
 * Adult (18+) + explicit photo_processing consent are both required.
 */
export async function POST(req: NextRequest) {
  try {
    const session = await getCurrentSession();

    if (!session.adultAccessEnabled) {
      return NextResponse.json(
        {
          error: {
            code: "ADULT_ACCESS_REQUIRED",
            message:
              "Photo guidance is available to verified 18+ accounts only. Ages 13–17 stay in read-only safe mode.",
            messageBn:
              "ছবি নির্দেশনা শুধুমাত্র যাচাইকৃত ১৮+ অ্যাকাউন্টের জন্য। ১৩–১৭ বছর বয়সীরা রিড-অনলি সেফ মোডে থাকবে।",
          },
        },
        { status: 403 }
      );
    }

    const body = await req.json().catch(() => ({}));
    const parsed = UploadIntentSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Invalid upload intent payload",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const { purpose, mimeType, byteSize } = parsed.data;

    // Require the latest photo_processing consent to be granted.
    const consent = await prisma.consentRecord.findFirst({
      where: { userId: session.userId, purpose: "photo_processing" },
      orderBy: { createdAt: "desc" },
    });

    if (!consent || consent.state !== "granted") {
      return NextResponse.json(
        {
          error: {
            code: "PHOTO_CONSENT_REQUIRED",
            message:
              "Grant the optional Private Photo Vision consent first. You can withdraw it anytime in the consent registry.",
            messageBn:
              "আগে ঐচ্ছিক প্রাইভেট ছবি সম্মতি চালু করুন। যেকোনো সময় সম্মতি প্রত্যাহার করা যাবে।",
          },
        },
        { status: 403 }
      );
    }

    const assetId = randomUUID();
    const ext = mimeType === "image/png" ? "png" : mimeType === "image/webp" ? "webp" : "jpg";
    const storagePath = `private/${session.userId}/${purpose}/${assetId}.${ext}`;
    const expiresAt = new Date(Date.now() + RETENTION_DAYS * 24 * 60 * 60 * 1000);

    const asset = await prisma.photoAsset.create({
      data: {
        id: assetId,
        userId: session.userId,
        storagePath,
        purpose,
        consentRecordId: consent.id,
        state: "uploaded",
        mimeType,
        byteSize: BigInt(byteSize),
        expiresAt,
      },
    });

    await prisma.auditEvent.create({
      data: {
        actorUserId: session.userId,
        action: "photo.upload_intent_created",
        entityType: "photo_asset",
        entityId: asset.id,
        safeMetadata: { purpose, mimeType, retentionDays: RETENTION_DAYS },
      },
    });

    return NextResponse.json(
      {
        data: {
          photoAssetId: asset.id,
          storagePath: asset.storagePath,
          purpose: asset.purpose,
          state: asset.state,
          // Short-lived signed URL placeholder — minted by private storage in production.
          signedUploadUrl: `/api/v1/photos/${asset.id}/signed-upload?exp=900`,
          signedUrlExpiresInSeconds: 900,
          retentionDays: RETENTION_DAYS,
          expiresAt: asset.expiresAt,
          privacy: "Private bucket only. Never public. Never used for attractiveness scoring.",
        },
        meta: { timestamp: new Date().toISOString() },
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
