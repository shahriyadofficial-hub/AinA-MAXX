// app/api/v1/vibe/route.ts
import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import prisma from "@/lib/db/client";
import { getCurrentSession } from "@/lib/auth/session";
import { VIBE_SEED_POSTS, moderateVibePost } from "@/lib/gamification/maxx";

const CreatePostSchema = z.object({
  body: z.string().min(3).max(1000),
});

/**
 * AinA Vibe — moderated, effort-only community feed.
 * GET returns published posts (DB first, curated seed fallback).
 * POST runs deterministic moderation before anything is stored:
 * scoring language is rejected, links/abuse wait for a human moderator.
 */
export async function GET() {
  try {
    const posts = await prisma.communityPost
      .findMany({
        where: { status: "published", visibility: "public" },
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          user: { select: { displayName: true } },
          _count: { select: { comments: true, reactions: true } },
        },
      })
      .catch(() => null);

    if (posts && posts.length > 0) {
      return NextResponse.json({
        data: {
          posts: posts.map((p) => ({
            id: p.id,
            authorName: p.user.displayName,
            area: "Bangladesh",
            streakLabel: "Mirror Streak member",
            body: p.body,
            likes: p._count.reactions,
            comments: p._count.comments,
            status: "published" as const,
          })),
        },
        meta: { source: "database", timestamp: new Date().toISOString() },
      });
    }

    return NextResponse.json({
      data: { posts: VIBE_SEED_POSTS },
      meta: { source: "curated-seed", timestamp: new Date().toISOString() },
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

    const body = await req.json().catch(() => ({}));
    const parsed = CreatePostSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        {
          error: {
            code: "VALIDATION_ERROR",
            message: "Post must be between 3 and 1000 characters.",
            messageBn: "পোস্ট ৩ থেকে ১০০০ অক্ষরের মধ্যে হতে হবে।",
            details: parsed.error.issues,
          },
        },
        { status: 400 }
      );
    }

    const moderation = moderateVibePost(parsed.data.body);

    if (moderation.status === "rejected") {
      return NextResponse.json(
        {
          error: {
            code: "MODERATION_REJECTED",
            message: moderation.reason,
            messageBn: "AinA Vibe শুধু প্রচেষ্টার জায়গা: কোনো মুখের স্কোর, র্যাংকিং বা শরীর নিয়ে মন্তব্য নয়।",
          },
        },
        { status: 422 }
      );
    }

    const created = await prisma.communityPost
      .create({
        data: {
          userId: session.userId,
          body: parsed.data.body,
          visibility: "public",
          status: moderation.status,
          moderationReason: moderation.reason,
        },
      })
      .catch(() => null);

    return NextResponse.json(
      {
        data: {
          post: {
            id: created?.id ?? `local-${Date.now()}`,
            authorName: session.displayName,
            area: "Dhaka",
            streakLabel: "Mirror Streak member",
            body: parsed.data.body,
            likes: 0,
            comments: 0,
            status: moderation.status,
          },
          moderation,
        },
        meta: { persisted: Boolean(created), timestamp: new Date().toISOString() },
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
