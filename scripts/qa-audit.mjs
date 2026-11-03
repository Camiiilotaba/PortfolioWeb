// Usage: node scripts/qa-audit.mjs <label>   (needs serve-prod running; writes reports/qa-<label>.json)
import { mkdirSync, readFileSync, readdirSync, statSync, writeFileSync } from 'node:fs';
import { join, resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const label = process.argv[2] ?? 'run';
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4500';
const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PAGES = ['/es/', '/', '/es/proyectos/truekapp/', '/projects/truekapp/', '/es/aviso-legal/', '/es/privacidad/', '/404.html'];
const WIDTHS = [320, 360, 390, 768, 1024, 1280, 1440, 1920];
const AXE = readFileSync(resolve('node_modules/axe-core/axe.min.js'), 'utf8');
const report = { label, base: BASE, date: new Date().toISOString(), resources: {}, axe: {}, overflow: [], focus: {}, interactions: {}, seo: {}, links: {} };

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setCacheEnabled(false);

for (const p of PAGES.slice(0, 4)) {
  const byType = {};
  const cdp = await page.createCDPSession();
  await cdp.send('Network.enable');
  const reqs = new Map();
  cdp.on('Network.responseReceived', (e) => reqs.set(e.requestId, { url: e.response.url, type: e.type, status: e.response.status }));
  cdp.on('Network.loadingFinished', (e) => { const r = reqs.get(e.requestId); if (r) r.bytes = e.encodedDataLength; });
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true });
  await page.goto(BASE + p, { waitUntil: 'networkidle0' });
  await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 600) { scrollTo(0, y); await new Promise((r) => setTimeout(r, 30)); } });
  await new Promise((r) => setTimeout(r, 800));
  const list = [...reqs.values()];
  for (const r of list) { byType[r.type] = (byType[r.type] ?? 0) + (r.bytes ?? 0); }
  report.resources[p] = {
    requests: list.length,
    totalKB: Math.round(list.reduce((s, r) => s + (r.bytes ?? 0), 0) / 1024),
    byTypeKB: Object.fromEntries(Object.entries(byType).map(([k, v]) => [k, Math.round(v / 1024)])),
    errors: list.filter((r) => r.status >= 400).map((r) => `${r.status} ${r.url}`),
    thirdParty: list.filter((r) => !r.url.startsWith(BASE) && !r.url.startsWith('data:')).map((r) => r.url),
  };
  await cdp.detach();
}

for (const p of PAGES) {
  for (const w of [390, 1440]) {
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: w < 768 });
    await page.goto(BASE + p, { waitUntil: 'networkidle0' });
    await page.evaluate(AXE);
    const res = await page.evaluate(async () =>
      axe.run(document, { runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa', 'best-practice'] } }),
    );
    report.axe[`${p}@${w}`] = {
      violations: res.violations.map((v) => ({ id: v.id, impact: v.impact, nodes: v.nodes.length, sample: v.nodes[0]?.target?.join(' ') })),
      incomplete: res.incomplete.map((v) => ({ id: v.id, nodes: v.nodes.length })),
      passes: res.passes.length,
    };
  }
}

for (const p of PAGES) {
  for (const w of WIDTHS) {
    await page.setViewport({ width: w, height: 900, deviceScaleFactor: 1, isMobile: w < 768 });
    await page.goto(BASE + p, { waitUntil: 'networkidle0' });
    await page.evaluate(() => document.fonts.ready);
    const r = await page.evaluate(() => {
      const vw = document.documentElement.clientWidth;
      const offenders = [...document.querySelectorAll('body *')]
        .filter((el) => {
          const cs = getComputedStyle(el);
          if (el.closest('.sr-only') || cs.position === 'fixed' || cs.visibility === 'hidden' || cs.display === 'none') return false;
          const b = el.getBoundingClientRect();
          return b.width > 0 && b.right > vw + 0.5;
        })
        .slice(0, 5)
        .map((el) => `${el.tagName.toLowerCase()}.${[...el.classList].slice(0, 2).join('.')}`);
      return { docOverflow: document.documentElement.scrollWidth - innerWidth, offenders };
    });
    report.overflow.push({ page: p, width: w, ...r });
  }
}

for (const p of PAGES.slice(0, 4)) {
  await page.setViewport({ width: 1280, height: 900, deviceScaleFactor: 1 });
  await page.goto(BASE + p, { waitUntil: 'networkidle0' });
  const stops = [];
  for (let i = 0; i < 80; i++) {
    await page.keyboard.press('Tab');
    const s = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return null;
      const cs = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return { text: (el.textContent || el.getAttribute('aria-label') || '').trim().replace(/\s+/g, ' ').slice(0, 30), outline: cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2, w: Math.round(r.width), h: Math.round(r.height) };
    });
    if (!s) break;
    if (stops.length && stops[0].text === s.text && stops.length > 3) break;
    stops.push(s);
  }
  report.focus[p] = { stops: stops.length, noVisibleFocus: stops.filter((s) => !s.outline).map((s) => s.text), smallTargets: stops.filter((s) => s.h < 24 || s.w < 24).map((s) => `${s.text} ${s.w}×${s.h}`) };
}

// Event Timing in the lab is only a proxy for INP.
for (const p of ['/es/', '/']) {
  await page.setViewport({ width: 390, height: 844, deviceScaleFactor: 2, isMobile: true, hasTouch: true });
  const cdp = await page.createCDPSession();
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 4 });
  await page.goto(BASE + p, { waitUntil: 'networkidle0' });
  await page.evaluate(() => {
    window.__events = [];
    new PerformanceObserver((list) => { for (const e of list.getEntries()) window.__events.push({ name: e.name, d: e.duration }); })
      .observe({ type: 'event', buffered: true, durationThreshold: 16 });
  });
  await page.tap('header nav a[href$="#projects"]');
  await new Promise((r) => setTimeout(r, 400));
  await page.tap('header nav a[href$="#contact"]');
  await new Promise((r) => setTimeout(r, 400));
  const copy = await page.$('[data-copy]:not([hidden])');
  if (copy) { await copy.tap(); await new Promise((r) => setTimeout(r, 400)); }
  await page.keyboard.press('Tab');
  await new Promise((r) => setTimeout(r, 300));
  const ev = await page.evaluate(() => window.__events);
  report.interactions[p] = { maxEventMs: Math.round(Math.max(0, ...ev.map((e) => e.d))), events: ev.length, note: 'Event Timing entries ≥16 ms, 4× CPU. Lab proxy, not field INP.' };
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: 1 });
  await cdp.detach();
}

const dist = resolve('dist');
const htmlFiles = [];
const walk = (d) => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) walk(p); else if (f.endsWith('.html')) htmlFiles.push(p); } };
walk(dist);
const pages = {};
for (const f of htmlFiles) {
  const html = readFileSync(f, 'utf8');
  const route = '/' + f.slice(dist.length + 1).replace(/\\/g, '/').replace(/index\.html$/, '');
  const pick = (re) => (html.match(re) ?? [])[1] ?? null;
  pages[route] = {
    title: pick(/<title>([^<]*)<\/title>/),
    description: pick(/<meta name="description" content="([^"]*)"/),
    robots: pick(/<meta name="robots" content="([^"]*)"/),
    canonical: pick(/<link rel="canonical" href="([^"]*)"/),
    lang: pick(/<html lang="([^"]*)"/),
    h1: (html.match(/<h1[\s>]/g) ?? []).length,
    hreflang: [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)].map((m) => [m[1], m[2]]),
    jsonld: [...html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)].flatMap((m) => {
      // JSON-LD may be an object, an array or an @graph.
      try {
        const j = JSON.parse(m[1]);
        const items = Array.isArray(j) ? j : j['@graph'] ?? [j];
        return items.map((x) => x['@type'] ?? 'NO_TYPE');
      } catch { return ['INVALID']; }
    }),
    ogImage: pick(/<meta property="og:image" content="([^"]*)"/),
    links: [...html.matchAll(/<a [^>]*href="([^"]+)"/g)].map((m) => m[1]),
  };
}
const titles = Object.entries(pages).filter(([r]) => r !== '/404.html');
const dupTitles = titles.filter(([, a], i) => titles.findIndex(([, b]) => b.title === a.title) !== i).map(([r]) => r);
const hreflangIssues = [];
for (const [route, pg] of titles) {
  for (const [lang, href] of pg.hreflang) {
    if (lang === 'x-default') continue;
    const target = new URL(href).pathname;
    const back = pages[target]?.hreflang?.some(([, h]) => new URL(h).pathname === route);
    if (!pages[target]) hreflangIssues.push(`${route}: hreflang ${lang} → ${target} (no page)`);
    else if (!back) hreflangIssues.push(`${route}: hreflang ${lang} → ${target} not reciprocal`);
  }
}
const sitemap = readFileSync(join(dist, 'sitemap-0.xml'), 'utf8');
const inSitemap = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1]).pathname);
report.seo = {
  pages: Object.fromEntries(titles.map(([r, p]) => [r, { title: p.title, titleLen: p.title?.length, descLen: p.description?.length, robots: p.robots, canonical: p.canonical, lang: p.lang, h1: p.h1, jsonld: p.jsonld, hreflang: p.hreflang.length }])),
  duplicateTitles: dupTitles,
  hreflangIssues,
  sitemap: inSitemap,
  indexablePagesNotInSitemap: titles.map(([r]) => r).filter((r) => !inSitemap.includes(r)),
};

const internal = new Set();
const external = new Set();
for (const [route, pg] of Object.entries(pages)) {
  for (const href of pg.links) {
    if (href.startsWith('mailto:')) continue;
    if (/^https?:\/\//.test(href)) { external.add(href); continue; }
    internal.add(new URL(href, `http://x${route}`).pathname + (href.includes('#') ? '#' + href.split('#')[1] : ''));
  }
}
const broken = [];
// Plain HTTP: headless Chrome treats PDFs as downloads.
for (const link of internal) {
  const [path, hash] = link.split('#');
  const res = await fetch(BASE + path, { method: 'GET', redirect: 'manual' });
  if (res.status >= 400) { broken.push(`${res.status} ${link}`); continue; }
  if (hash) {
    const html = await res.text();
    if (!html.includes(`id="${hash}"`)) broken.push(`missing anchor ${link}`);
  }
}
report.links = { internalChecked: internal.size, broken, external: [...external] };

await browser.close();
mkdirSync(resolve('reports'), { recursive: true });
writeFileSync(resolve(`reports/qa-${label}.json`), JSON.stringify(report, null, 2));

const axeViol = Object.entries(report.axe).filter(([, v]) => v.violations.length).map(([k, v]) => `${k}: ${v.violations.map((x) => `${x.id}(${x.impact},${x.nodes})`).join(' ')}`);
console.log('Resources:', Object.entries(report.resources).map(([p, r]) => `${p} ${r.totalKB}KB/${r.requests}req ${JSON.stringify(r.byTypeKB)} err:${r.errors.length} 3p:${r.thirdParty.length}`).join('\n  '));
console.log('axe violations:', axeViol.length ? '\n  ' + axeViol.join('\n  ') : 'none');
console.log('axe incomplete (needs manual):', [...new Set(Object.values(report.axe).flatMap((v) => v.incomplete.map((i) => i.id)))].join(', ') || 'none');
console.log('Overflow:', report.overflow.filter((o) => o.docOverflow > 0 || o.offenders.length).map((o) => `${o.page}@${o.width} doc:${o.docOverflow} ${o.offenders.join(',')}`).join(' | ') || 'none');
console.log('Focus:', Object.entries(report.focus).map(([p, f]) => `${p} stops:${f.stops} noFocus:${f.noVisibleFocus.length} small:${f.smallTargets.join(';') || 0}`).join(' | '));
console.log('Interactions:', JSON.stringify(report.interactions));
console.log('SEO dupTitles:', dupTitles.length, 'hreflang issues:', hreflangIssues.length ? hreflangIssues.join('; ') : 0, 'not in sitemap:', report.seo.indexablePagesNotInSitemap.join(',') || 0);
console.log('Links: internal', internal.size, 'broken:', broken.length ? broken.join('; ') : 0, '| external:', external.size);
