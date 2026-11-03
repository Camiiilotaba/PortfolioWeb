// WCAG 1.4.4 approximation (root font-size at 200 %); real browser zoom still needs a manual check.
// Measures against clientWidth: innerWidth grows with overflowing content under mobile emulation.
// Usage: node scripts/check-text-zoom.mjs   (needs serve-prod running)
import puppeteer from 'puppeteer-core';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4500';
const PAGES = ['/es/', '/', '/es/proyectos/truekapp/', '/projects/truekapp/', '/es/aviso-legal/', '/es/privacidad/'];
const WIDTHS = [320, 360, 390, 768, 1280];
const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
const page = await browser.newPage();
let fails = 0;

const measure = () => {
  const vw = document.documentElement.clientWidth;
  const textBoxes = [...document.querySelectorAll('body *')].filter((e) => {
    if (e.closest('.sr-only') || e.closest('.stage') || e.closest('.frame')) return false;
    const cs = getComputedStyle(e);
    if (cs.display === 'none' || cs.visibility === 'hidden' || cs.position === 'fixed') return false;
    return [...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim());
  });
  const offenders = textBoxes
    .filter((e) =>
      [...e.childNodes].some((n) => {
        if (n.nodeType !== 3 || !n.textContent.trim()) return false;
        const r = document.createRange();
        r.selectNodeContents(n);
        const b = r.getBoundingClientRect();
        return b.width > 0 && b.right > vw + 1;
      }),
    )
    .slice(0, 4)
    .map((e) => `${e.tagName.toLowerCase()}«${e.textContent.trim().slice(0, 18)}»`);
  const h1 = document.querySelector('h1');
  const body = document.querySelector('main p:not(.label)');
  return {
    scroll: document.documentElement.scrollWidth - vw,
    offenders,
    h1: h1 ? parseFloat(getComputedStyle(h1).fontSize) : 0,
    body: body ? parseFloat(getComputedStyle(body).fontSize) : 0,
  };
};

for (const path of PAGES) {
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900, isMobile: w < 768, hasTouch: w < 768 });
    await page.goto(BASE + path, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const base = await page.evaluate(measure);
    await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
    await new Promise((r) => setTimeout(r, 250));
    const big = await page.evaluate(measure);
    const ok = big.scroll <= 0 && big.offenders.length === 0;
    if (!ok) fails++;
    const ratio = (a, b) => (a ? (b / a).toFixed(2) : '–');
    console.log(`${ok ? 'OK  ' : 'FAIL'} ${path.padEnd(24)} ${String(w).padStart(4)}px  scroll ${big.scroll}  H1 ${base.h1}→${big.h1}px (×${ratio(base.h1, big.h1)})  body ×${ratio(base.body, big.body)}  ${big.offenders.join(' ')}`);
  }
}
await browser.close();
process.exit(fails ? 1 : 0);
