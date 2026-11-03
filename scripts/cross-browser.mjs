// Usage: node scripts/cross-browser.mjs   (needs serve-prod running)
// WebKit on Windows approximates Safari; it is not Safari itself.
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { chromium, firefox, webkit } from 'playwright';

const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4500';
const PAGES = ['/es/', '/', '/es/proyectos/truekapp/', '/es/aviso-legal/'];
const WIDTHS = [320, 390, 1440];
const out = resolve('reports/screenshots/cross-browser');
mkdirSync(out, { recursive: true });

const engines = [
  ['chrome', () => chromium.launch({ channel: 'chrome' })],
  ['firefox', () => firefox.launch()],
  ['webkit', () => webkit.launch()],
];
const rows = [];
for (const [name, launch] of engines) {
  const browser = await launch();
  for (const w of WIDTHS) {
    const ctx = await browser.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
    if (name === 'chrome') await ctx.grantPermissions(['clipboard-read', 'clipboard-write'], { origin: BASE });
    const page = await ctx.newPage();
    for (const p of PAGES) {
      const errors = [];
      page.removeAllListeners('console');
      page.on('console', (m) => { if (m.type() === 'error' || /Content.Security.Policy/i.test(m.text())) errors.push(m.text().slice(0, 140)); });
      page.on('pageerror', (e) => errors.push('pageerror ' + e.message));
      await page.goto(BASE + p, { waitUntil: 'networkidle' });
      await page.evaluate(() => document.fonts.ready);
      const r = await page.evaluate(() => {
        const stack = document.querySelector('.mobile-stack');
        let stackOk = null;
        if (stack && getComputedStyle(stack).display !== 'none') {
          const c = stack.closest('.container-x');
          const limit = c.getBoundingClientRect().right - parseFloat(getComputedStyle(c).paddingRight);
          const right = Math.max(...[...stack.querySelectorAll('span:not(.sr-only)')].map((s) => s.getBoundingClientRect().right));
          stackOk = right <= limit + 0.5;
        }
        const copy = document.querySelector('[data-copy]');
        return {
          overflow: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          fonts: [...document.fonts].filter((f) => f.status === 'loaded').map((f) => f.family.replace(/"/g, '')),
          copyEnhanced: copy ? !copy.hidden : null,
          stackOk,
        };
      });
      r.copyResult = null;
      // Firefox and WebKit can't read the clipboard under automation, so there we check the visible outcome.
      const copyBtn = await page.$('[data-copy]:not([hidden])');
      if (copyBtn) {
        await copyBtn.scrollIntoViewIfNeeded();
        await copyBtn.click();
        await page.waitForTimeout(300);
        const outcome = await page.evaluate(() => ({
          label: document.querySelector('[data-copy-label]')?.textContent?.trim(),
          status: document.querySelector('[data-copy-status]')?.textContent?.trim(),
        }));
        let clip = null;
        if (name === 'chrome') clip = await page.evaluate(() => navigator.clipboard.readText().catch((e) => `ERR ${e.name}`));
        r.copyResult = clip !== null ? `clipboard=${clip}` : `label=${outcome.label} status=${outcome.status || '—'}`;
      }
      // Snapshot errors before the screenshot: WebKit's screenshot injects a <style> that the CSP blocks.
      const pageErrors = [...errors];
      const shot = `${name}-${p.replace(/\//g, '_') || 'root'}-${w}.png`;
      await page.screenshot({ path: resolve(out, shot), caret: 'initial', animations: 'allow' });
      rows.push({ browser: name, page: p, width: w, ...r, errors: pageErrors });
    }
    await ctx.close();
  }
  await browser.close();
}
writeFileSync(resolve('reports/cross-browser.json'), JSON.stringify(rows, null, 2));
for (const r of rows) {
  const copyBad = r.copyResult && !(/clipboard=camilotaba.dev@gmail.com|label=Copiado|label=Copied|No se pudo|Could not/.test(r.copyResult));
  const bad = copyBad || r.overflow > 0 || r.errors.length || r.stackOk === false || (r.copyEnhanced === false) || !r.fonts.includes('Instrument Sans');
  console.log(`${bad ? 'CHECK' : 'OK   '} ${r.browser.padEnd(7)} ${r.page.padEnd(24)} ${String(r.width).padStart(4)}  overflow ${r.overflow}  fonts ${[...new Set(r.fonts)].join('+')}  copy ${r.copyEnhanced} [${r.copyResult ?? 'n/a'}]  stack ${r.stackOk}  errors ${r.errors.length ? r.errors.join(' | ') : 0}`);
}
