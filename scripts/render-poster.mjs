// Renders the default (clay) desk scene to the hero posters in src/assets/:
// first paint, loading backdrop and no-WebGL fallback. One landscape and one
// portrait render; app/globals.css (.desk-poster) positions each where the
// camera frames the desk, so the sizes below must stay in sync with it.
// Usage: start the site (npm run dev or npm start), then `npm run poster`.
// Needs a local Chrome; set POSTER_URL to point at another host.
import { chromium } from "playwright-core";

const url = process.env.POSTER_URL ?? "http://localhost:3000/";
const targets = [
  // 7:4 is the camera's composed landscape aspect (COMPOSED_ASPECT in camera-rig.tsx).
  { file: "src/assets/desk-poster-landscape.jpg", viewport: { width: 1750, height: 1000 }, deviceScaleFactor: 1 },
  // Phones get the low-power render path (no post-processing), so capture that path.
  {
    file: "src/assets/desk-poster-portrait.jpg",
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  },
];

const browser = await chromium.launch({ channel: "chrome" });
for (const { file, ...context } of targets) {
  // Reduced motion freezes the cursor tilt and idle sway, so the still matches the scene at rest.
  const page = await browser.newPage({ ...context, reducedMotion: "reduce" });
  await page.goto(url, { waitUntil: "networkidle" });
  // The scene loads on first interaction; nudge it, then wait for the first frame.
  await page.mouse.move(10, 10);
  await page.waitForFunction(
    () => document.querySelector("canvas") && !document.querySelector("[role=status]"),
    null,
    { timeout: 60_000 },
  );
  // Hide everything except the scene.
  await page.addStyleTag({
    content: 'nav, [data-hero-copy], nextjs-portal, a[href="/#contact"] { visibility: hidden !important; }',
  });
  await page.waitForTimeout(3000);
  await page.screenshot({ path: file, type: "jpeg", quality: 82 });
  await page.close();
  console.log(`Wrote ${file}`);
}
await browser.close();
