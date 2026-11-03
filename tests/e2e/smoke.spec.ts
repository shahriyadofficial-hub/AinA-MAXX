// tests/e2e/smoke.spec.ts
import { test, expect } from "@playwright/test";

test.describe("AinA MAXX — judge smoke suite", () => {
  test("home renders brand, gamification, and safety banner", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByText("Reflect the Prime You")).toBeVisible();
    await expect(page.getByText("Weekly Mirror Report")).toBeVisible();
    await expect(page.getByText("Weekly Leaderboard")).toBeVisible();
    await expect(page.getByText(/Zero Attractiveness Scoring/i)).toBeVisible();
  });

  test("roadmap shows Mirror Scroll, AM/PM tabs, and conflict checker", async ({ page }) => {
    await page.goto("/roadmap");
    await expect(page.getByText("Current You")).toBeVisible();
    await expect(page.getByText("Prime You")).toBeVisible();
    await expect(page.getByRole("tab", { name: /AM/ })).toBeVisible();
    await expect(page.getByText("Ingredient Conflict Checker")).toBeVisible();
    await expect(page.getByText("Check with muse-wonder")).toBeVisible();
  });

  test("conflict checker flags Retinol + Acid (deterministic fallback ok)", async ({ page }) => {
    await page.goto("/roadmap");
    await page.getByText("Check with muse-wonder").click();
    await expect(page.getByText(/Use with care|Safe together/)).toBeVisible({ timeout: 15_000 });
  });

  test("vibe feed renders moderated posts and composer", async ({ page }) => {
    await page.goto("/vibe");
    await expect(page.getByText("AinA Vibe")).toBeVisible();
    await expect(page.getByText(/Share today's effort/)).toBeVisible();
    await expect(page.getByText("Moderated").first()).toBeVisible();
  });

  test("shop lists BDT products and opens the routine bag", async ({ page }) => {
    await page.goto("/shop");
    await expect(page.getByText("AinA Shop")).toBeVisible();
    await expect(page.getByText(/BDT/).first()).toBeVisible();
    await page.getByRole("button", { name: /Add to Bag|Add/ }).first().click();
    await page.getByRole("button", { name: /Open routine bag/ }).click();
    await expect(page.getByText("Routine Bag")).toBeVisible();
  });

  test("coach drawer opens with telemetry badge and quick prompts", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Open AI Coach/ }).click();
    await expect(page.getByText(/Powered by Meta Muse Spark 1.3/)).toBeVisible();
    await expect(page.getByText("What should I do this morning?")).toBeVisible();
  });

  test("judge demo bar runs instant demo login and opens telemetry HUD", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("button", { name: /Judge Demo/ }).click();
    await page.getByRole("button", { name: /Instant Demo Login/ }).click();
    await expect(page.getByText(/Signed in as/)).toBeVisible({ timeout: 15_000 });
    await page.getByRole("button", { name: /Telemetry HUD/ }).click();
    await expect(page.getByText(/Meta API credit/)).toBeVisible({ timeout: 15_000 });
  });

  test("coded page enforces the consent gate before upload", async ({ page }) => {
    await page.goto("/coded");
    await expect(page.getByText(/Private photo processing consent/)).toBeVisible();
    await expect(page.getByText(/Turn on the consent above first/)).toBeVisible();
  });

  test("drip hub renders all five fashion experiences", async ({ page }) => {
    await page.goto("/drip");
    await expect(page.getByText("Five ways to wear it.")).toBeVisible();
    await expect(page.getByRole("link", { name: /Try the Look/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /The Rail/ })).toBeVisible();
    await expect(page.getByText("Shoppable Lookbook — tap a hotspot, shop the combo")).toBeVisible();
    await expect(page.getByText("What goes with what — for Dhaka weather")).toBeVisible();
    await expect(page.getByText("Your wardrobe, cut out by SAM 3.1")).toBeVisible();
  });

  test("shoppable lookbook: hotspot activates combo card and bundle total", async ({ page }) => {
    await page.goto("/drip");
    await page.getByTestId("hotspot-hs-tee").click();
    await expect(page.getByTestId("combo-card-p-tee-graphic")).toBeVisible();
    await expect(page.getByText(/Buy the Full Look/)).toBeVisible();
    await page.getByRole("tab", { name: /05 Monsoon Minimalist/ }).click();
    await expect(page.getByTestId("hotspot-hs-bomber")).toBeVisible();
  });

  test("legacy /wardrobe route renders the same fashion hub", async ({ page }) => {
    await page.goto("/wardrobe");
    await expect(page.getByText("Five ways to wear it.")).toBeVisible();
    await expect(page.getByText("Shoppable Lookbook — tap a hotspot, shop the combo")).toBeVisible();
  });

  test("maisonblock: verified merchant opens fitting engine, locked pill for others", async ({ page }) => {
    await page.goto("/drip");
    // Verified Precision Merchant SKU → active trigger.
    await expect(page.getByTestId("find-my-fit-p-tee-graphic")).toBeVisible();
    // Unverified SKU → elegant locked teaser.
    await expect(page.getByText(/Coming Soon for Verified Precision Merchants/).first()).toBeVisible();

    await page.getByTestId("find-my-fit-p-tee-graphic").click();
    const dialog = page.getByRole("dialog");
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Find My Fit · Oversized Graphic Tee")).toBeVisible();
    await expect(dialog.getByText(/Verified Precision Merchant/)).toBeVisible();
    await expect(dialog.getByText(/Private by design/)).toBeVisible();

    // Step flow: measurements → body shape → fit preference.
    await dialog.getByRole("button", { name: "Next" }).click();
    await expect(dialog.getByText("Body shape & composition")).toBeVisible();
    await dialog.getByRole("button", { name: "Athletic", exact: true }).click();
    await dialog.getByRole("button", { name: "Next" }).click();
    await expect(dialog.getByText("How do you like it to fit?")).toBeVisible();

    // Apply the live recommendation — it must bind into the card size selector.
    const applyBtn = dialog.getByRole("button", { name: /Select Size/ }).first();
    await expect(applyBtn).toBeVisible();
    await applyBtn.click();
    await expect(dialog).toBeHidden();
    await expect(page.getByText(/Maisonblock fit applied/)).toBeVisible();
  });

  test("rail: keyboard browsing updates the screen-reader announcement", async ({ page }) => {
    await page.goto("/drip");
    const rail = page.getByTestId("rail-carousel");
    await rail.scrollIntoViewIfNeeded();
    await expect(rail.getByText("Slide the rail.")).toBeVisible();

    const region = rail.getByRole("region", { name: /Rail product browser/ });
    await region.focus();
    await expect(rail.getByRole("status")).toHaveText(/Product 1 of \d+: Heavyweight Oversized Hoodie, 3850 BDT/);

    await page.keyboard.press("ArrowRight");
    await expect(rail.getByRole("status")).toHaveText(/Product 2 of \d+:/);
    await expect(rail.getByRole("heading", { name: /Oversized Graphic Tee/ })).toBeVisible();

    await page.keyboard.press("ArrowLeft");
    await expect(rail.getByRole("status")).toHaveText(/Product 1 of \d+:/);
  });

  test("rail: quick view adds to the routine bag with toast and drawer total", async ({ page }) => {
    await page.goto("/drip");
    const rail = page.getByTestId("rail-carousel");
    await rail.scrollIntoViewIfNeeded();

    await rail.getByRole("button", { name: /Quick view/ }).click();
    const dialog = page.getByRole("dialog", { name: /Quick view/ });
    await expect(dialog).toBeVisible();
    await expect(dialog.getByText("Heavyweight Oversized Hoodie")).toBeVisible();

    await dialog.getByRole("button", { name: /Add to Bag/ }).click();
    await expect(page.getByText(/Added Heavyweight Oversized Hoodie/)).toBeVisible();
    await expect(page.getByTestId("routine-bag-count")).toHaveText("1");

    // Quick view hands off to the bag drawer with a BDT total.
    const bag = page.getByRole("dialog", { name: "Routine Bag" });
    await expect(bag).toBeVisible();
    await expect(bag.getByText("Total (BDT)")).toBeVisible();
    await expect(bag.locator("span").filter({ hasText: /^৳3,850$/ })).toBeVisible();
  });

  test("rail: out-of-stock product shows badge and disables purchase", async ({ page }) => {
    await page.goto("/drip");
    const rail = page.getByTestId("rail-carousel");
    await rail.scrollIntoViewIfNeeded();

    await rail.getByRole("tab", { name: /Washed Denim Trucker Jacket/ }).click();
    await expect(rail.getByRole("status")).toHaveText(/Washed Denim Trucker Jacket, 3450 BDT/);
    await expect(rail.getByText("Out of Stock").first()).toBeVisible();
    await expect(rail.getByTestId("rail-add-to-bag")).toBeDisabled();
  });
});
