import { chromium } from "playwright";
import fs from "fs";

const browser = await chromium.launch();

const DRILLS = `
  <li><span class="line-dot" style="background:#E21D2D"></span>Strumming drill <span class="meta">10 min</span></li>
  <li><span class="line-dot" style="background:#1E5BFF"></span>Chord transitions <span class="meta">10 min</span></li>
  <li><span class="line-dot" style="background:#22B14C"></span>Warmups <span class="meta">5 min</span></li>
  <li><span class="line-dot" style="background:#FFC20E"></span>Song practice <span class="meta">15 min</span></li>`;

async function settleOverview(page) {
  await page.addStyleTag({
    content: "*{animation:none!important;transition:none!important}",
  });
  await page.evaluate((drills) => {
    const hide = (id) => {
      const el = document.getElementById(id);
      if (el) {
        el.classList.add("hidden");
        el.style.display = "none";
      }
    };
    hide("skill-check-modal");
    hide("auth-gate");
    if (typeof switchView === "function") switchView("dashboard");
    const recent = document.getElementById("recent-activity");
    if (recent) recent.innerHTML = drills;
    const clock = document.getElementById("local-clock");
    if (clock) clock.textContent = "23:41";
    const label = document.getElementById("dashboard-next-btn-label");
    if (label) label.textContent = "Resume Practice";
  }, DRILLS);
}

async function shot(w, h, mobile, out) {
  const page = await browser.newPage({
    viewport: { width: w, height: h },
    isMobile: !!mobile,
    deviceScaleFactor: 1,
  });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("http://127.0.0.1:53262/riffle_web_app.html?v=finish-fix2", {
    waitUntil: "networkidle",
  });

  const guest = page.locator('button:has-text("Continue as guest")');
  if (await guest.isVisible().catch(() => false)) {
    await guest.click();
    await page.waitForTimeout(400);
  }

  await settleOverview(page);
  await page.evaluate(() => {
    if (window.lucide?.createIcons) window.lucide.createIcons();
  });
  await page.waitForTimeout(300);
  await settleOverview(page);
  await page.evaluate(() => {
    if (window.lucide?.createIcons) window.lucide.createIcons();
  });

  await page.screenshot({ path: out, fullPage: true });
  const box = await page.evaluate(() => {
    const b = document.querySelector(".r-brand")?.getBoundingClientRect();
    const p = document.querySelector(".r-panel-alerts")?.getBoundingClientRect();
    const drills = document.getElementById("recent-activity")?.innerText || "";
    return {
      brand: b && { x: b.x, y: b.y, w: b.width, h: b.height },
      panel: p && { x: p.x, y: p.y, w: p.width, h: p.height },
      pos: getComputedStyle(document.querySelector(".r-brand")).position,
      drills: drills.slice(0, 80),
      w: innerWidth,
      h: innerHeight,
    };
  });
  console.log(out, fs.statSync(out).size, JSON.stringify(box));
  await page.close();
}

await shot(1440, 810, false, ".impeccable/review/desktop.png");
await shot(390, 844, true, ".impeccable/review/mobile.png");
await browser.close();
