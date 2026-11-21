import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
await page.goto("http://127.0.0.1:53262/riffle_web_app.html?v=calc-fix", {
  waitUntil: "networkidle",
});
await page.evaluate(() => {
  document.getElementById("skill-check-modal")?.remove();
  document.getElementById("auth-gate")?.classList.add("hidden");
  if (typeof switchView === "function") switchView("dashboard");
});
const guest = page.locator('button:has-text("Continue as guest")');
if (await guest.isVisible().catch(() => false)) {
  await guest.click();
  await page.waitForTimeout(400);
  await page.evaluate(() => {
    document.getElementById("skill-check-modal")?.remove();
    if (typeof switchView === "function") switchView("dashboard");
  });
}
await page.evaluate(() => document.fonts.ready);
const info = await page.evaluate(() => {
  const brand = document.querySelector(".r-brand");
  const head = document.querySelector(".r-hero-headline");
  const cs = getComputedStyle(brand);
  const hs = getComputedStyle(head);
  return {
    brandFont: cs.fontFamily,
    brandSize: cs.fontSize,
    headSize: hs.fontSize,
    brandRect: {
      w: brand.getBoundingClientRect().width,
      h: brand.getBoundingClientRect().height,
    },
    gemunu: document.fonts.check('700 55px "Gemunu Libre"'),
    status: document.fonts.status,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
