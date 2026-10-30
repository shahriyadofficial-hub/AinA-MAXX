// tests/e2e/api.spec.ts
import { test, expect } from "@playwright/test";

test.describe("AinA MAXX — API contract checks", () => {
  test("GET /api/v1/me returns a session payload", async ({ request }) => {
    const res = await request.get("/api/v1/me");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data).toBeTruthy();
    expect(typeof json.data.displayName).toBe("string");
  });

  test("GET /api/v1/roadmaps returns a 30-day plan shape", async ({ request }) => {
    const res = await request.get("/api/v1/roadmaps");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data.roadmap.durationDays).toBe(30);
    expect(Array.isArray(json.data.tasks)).toBeTruthy();
    expect(json.data.tasks.length).toBeGreaterThanOrEqual(7);
    expect(json.meta.model).toBeTruthy();
  });

  test("POST /api/v1/ai/conflicts flags Retinol + Acid", async ({ request }) => {
    const res = await request.post("/api/v1/ai/conflicts", {
      data: {
        productA: "The Ordinary Retinol 0.5% in Squalane",
        productB: "Minimalist Salicylic Acid 2% Serum",
      },
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data.conflict.isConflict).toBe(true);
    expect(json.meta.model).toContain("muse-wonder");
  });

  test("POST /api/v1/ai/coach rejects face-scoring requests", async ({ request }) => {
    const res = await request.post("/api/v1/ai/coach", {
      data: { message: "Rate my face out of 10", locale: "en" },
    });
    expect(res.status()).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("SAFETY_REJECTED");
  });

  test("POST /api/v1/ai/coach escalates red-flag symptoms", async ({ request }) => {
    const res = await request.post("/api/v1/ai/coach", {
      data: { message: "I have severe painful cystic acne that keeps spreading", locale: "en" },
    });
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data.escalation.category).toBe("severe_acne");
    expect(json.data.escalation.advisor.nameEn).toContain("Dr.");
  });

  test("POST /api/v1/vibe rejects scoring posts via moderation", async ({ request }) => {
    const res = await request.post("/api/v1/vibe", {
      data: { body: "Rate my face 8/10 please" },
    });
    expect(res.status()).toBe(422);
    const json = await res.json();
    expect(json.error.code).toBe("MODERATION_REJECTED");
  });

  test("GET /api/v1/telemetry reports budget usage vs $150", async ({ request }) => {
    const res = await request.get("/api/v1/telemetry");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data.budgetUsd).toBe(150);
    expect(json.data.budgetRemainingUsd).toBeLessThanOrEqual(150);
    expect(json.meta.models.TEXT).toContain("muse-spark");
  });

  test("GET /api/v1/products returns BDT catalog", async ({ request }) => {
    const res = await request.get("/api/v1/products");
    expect(res.ok()).toBeTruthy();
    const json = await res.json();
    expect(json.data.products.length).toBeGreaterThanOrEqual(12);
    expect(json.data.products.every((p: { priceBdt: number }) => p.priceBdt > 0)).toBeTruthy();
  });
});
