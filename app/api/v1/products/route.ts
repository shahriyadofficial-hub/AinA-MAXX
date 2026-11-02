export const dynamic = 'force-dynamic';

// app/api/v1/products/route.ts
import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { SHOP_PRODUCTS } from "@/lib/gamification/maxx";

/**
 * Curated BDT shop catalog. DB first (seeded products), curated
 * client-safe mirror as fallback so the shop always renders.
 */
export async function GET() {
  try {
    const products = await prisma.product
      .findMany({
        where: { isPublished: true },
        orderBy: [{ category: "asc" }, { name: "asc" }],
        take: 24,
      })
      .catch(() => null);

    if (products && products.length > 0) {
      return NextResponse.json({
        data: {
          products: products.map((p) => ({
            slug: p.slug,
            name: p.name,
            brand: p.brand ?? "",
            category: p.category,
            description: p.description,
            priceBdt: p.currentPrice ? Number(p.currentPrice) : 0,
            sellerName: p.sellerName ?? "AinA Verified",
            isAffiliate: p.isAffiliate,
          })),
        },
        meta: { source: "database", currency: "BDT", timestamp: new Date().toISOString() },
      });
    }

    return NextResponse.json({
      data: { products: SHOP_PRODUCTS },
      meta: { source: "curated-seed", currency: "BDT", timestamp: new Date().toISOString() },
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal error";
    return NextResponse.json(
      { error: { code: "SERVER_ERROR", message } },
      { status: 500 }
    );
  }
}
