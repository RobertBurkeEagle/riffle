import { chromium } from "playwright";

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 810 } });
await page.goto("http://127.0.0.1:53262/riffle_web_app.html?v=aspect16x9", {
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
const info = await page.evaluate(() => {
  const el = document.querySelector(".r-brand");
  const matched = [];
  for (const sheet of document.styleSheets) {
    try {
      for (const rule of sheet.cssRules) {
        if (!rule.style || !rule.selectorText) continue;
        if (rule.style.fontSize && el.matches(rule.selectorText)) {
          matched.push({
            sel: rule.selectorText,
            fs: rule.style.fontSize,
            href: sheet.href?.slice(-50) || "inline",
          });
        }
      }
    } catch {
      /* cross-origin */
    }
  }
  return {
    matched,
    className: el.className,
    parent: el.parentElement?.id,
    computed: getComputedStyle(el).fontSize,
  };
});
console.log(JSON.stringify(info, null, 2));
await browser.close();
