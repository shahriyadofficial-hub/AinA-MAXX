export const dynamic = 'force-dynamic';

// app/api/v1/size/charts/route.ts
// AinA Universal Fit — Bangladesh local brand size charts.
// Public reference data (no personal measurements), safe to cache by CDN
// but marked force-dynamic per sizing API convention.

import { NextResponse } from "next/server";
import prisma from "@/lib/db/client";
import { LOCAL_BRAND_CHARTS } from "@/lib/engine/bangladeshSizing";

export async function GET() {
  try {
    const charts = await prisma.localBrandChart.findMany({
      orderBy: [{ brandName: "asc" }, { garmentType: "asc" }, { chestMinIn: "asc" }],
    });

    // DB not seeded yet → serve the deterministic in-code baseline so the
    // engine and API never disagree.
    const data =
      charts.length > 0
        ? charts.map((c) => ({
            brandName: c.brandName,
            garmentType: c.garmentType,
            sizeLabel: c.sizeLabel,
            chestMinIn: c.chestMinIn,
            chestMaxIn: c.chestMaxIn,
            lengthInches: c.lengthInches,
            shoulderInches: c.shoulderInches,
            fabricType: c.fabricType,
            easeAllowanceIn: c.easeAllowanceIn,
            shrinkageOffset: c.shrinkageOffset,
          }))
        : LOCAL_BRAND_CHARTS;

    return NextResponse.json({
      data,
      meta: {
        source: charts.length > 0 ? "database" : "baseline",
        unit: "inches",
        timestamp: new Date().toISOString(),
      },
    });
  } catch {
    // Database unreachable — the baseline charts keep the feature alive.
    return NextResponse.json({
      data: LOCAL_BRAND_CHARTS,
      meta: { source: "baseline", unit: "inches", timestamp: new Date().toISOString() },
    });
  }
}
