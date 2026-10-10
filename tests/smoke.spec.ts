import { test, expect, type Page } from "@playwright/test";

// Every request here is either a page load or an API call the server rejects, so
// running this against production books nothing and sends no email.

async function collectErrors(page: Page) {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  page.on("console", (m) => { if (m.type() === "error") errors.push(m.text()); });
  return errors;
}

test("home page loads without errors", async ({ page }) => {
  const errors = await collectErrors(page);
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
  await page.waitForLoadState("networkidle");
  expect(errors).toEqual([]);
});

for (const width of [360, 390, 414, 768, 1280]) {
  test(`no horizontal scroll at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 800 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  });
}

test("booking modal opens from every Book button and closes on Escape", async ({ page, isMobile }) => {
  await page.goto("/");
  const modal = page.getByRole("heading", { name: "Schedule a Mission" });
  const buttons = page.getByRole("button", { name: /book/i });
  const count = await buttons.count();
  expect(count).toBeGreaterThan(0);

  let opened = 0;
  for (let i = 0; i < count; i++) {
    const b = buttons.nth(i);
    if (!(await b.isVisible())) continue; // e.g. desktop-only nav button on phones
    await b.scrollIntoViewIfNeeded();
    await b.click();
    await expect(modal).toBeVisible();
    await page.keyboard.press("Escape");
    await expect(modal).toBeHidden();
    opened++;
  }
  // Hero + Contact on every layout, plus the Nav button on desktop
  expect(opened).toBeGreaterThanOrEqual(isMobile ? 2 : 3);
});

test("booking API rejects bad input", async ({ request }) => {
  for (const body of [
    {},
    { date: "2026-10-13", time: "09:00", name: "x", email: "not-an-email" },
    { date: "2026-10-13", time: "03:15", name: "x", email: "a@b.co" },
  ]) {
    const res = await request.post("/api/book", { data: body });
    expect(res.status(), JSON.stringify(body)).toBe(400);
  }
});

test("contact API rejects bad input", async ({ request }) => {
  const res = await request.post("/api/contact", { data: { name: "x", email: "no", message: "hi" } });
  expect(res.status()).toBe(400);
});

test("robots.txt and sitemap.xml are served", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.status()).toBe(200);
  expect(await robots.text()).toContain("sitemap.xml");
  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.status()).toBe(200);
  expect(await sitemap.text()).toContain("https://www.dyanailabs.com");
});
