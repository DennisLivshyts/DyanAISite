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

test("resume content is gone and the new sections are in nav order", async ({ page }) => {
  await page.goto("/");
  const body = await page.locator("body").innerText();
  for (const word of ["UCSF", "Dope Thoughts", "Azure Access", "CSULB", "ResumeHero", "NFT Minting", "2–3 weeks", "2–3 Weeks"]) {
    expect(body, word).not.toContain(word);
  }
  const ids = await page.locator("main > section[id]").evaluateAll((els) => els.map((e) => e.id));
  expect(ids.filter((id) => ["work", "capabilities", "process", "contact"].includes(id)))
    .toEqual(["work", "capabilities", "process", "contact"]);
});

test("nav links land on their sections", async ({ page, isMobile }) => {
  await page.goto("/");
  for (const [label, id] of [["Work", "work"], ["Capabilities", "capabilities"], ["Process", "process"], ["Contact", "contact"]]) {
    if (isMobile) await page.getByRole("button", { name: "Toggle menu" }).click();
    // phones use the dropdown under the header, desktop the inline nav: click whichever is visible
    await page.locator("header").getByRole("link", { name: label, exact: true }).filter({ visible: true }).click();
    await expect(page.locator(`#${id}`)).toBeInViewport();
  }
});

test("every case card renders, and outbound links are safe", async ({ page }) => {
  await page.goto("/");
  const cards = page.locator("[data-case]");
  expect(await cards.count()).toBeGreaterThan(0);
  for (const a of await page.locator('#work a[target="_blank"]').all()) {
    expect(await a.getAttribute("rel")).toContain("noopener");
  }
  // screenshots actually load (not broken images)
  for (const img of await page.locator("#work img").filter({ visible: true }).all()) {
    await img.scrollIntoViewIfNeeded();
    await expect.poll(() => img.evaluate((el: HTMLImageElement) => el.complete && el.naturalWidth > 0)).toBe(true);
  }
});
