// Usage: node scripts/lighthouse-runs.mjs <label> [runs=3]   (needs serve-prod running)
import { mkdirSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import * as chromeLauncher from 'chrome-launcher';
import lighthouse from 'lighthouse';
import desktopConfig from 'lighthouse/core/config/desktop-config.js';

const label = process.argv[2] ?? 'run';
const RUNS = Number(process.argv[3] ?? 3);
const BASE = process.env.BASE_URL ?? 'http://127.0.0.1:4500';
const PAGES = (process.env.PAGES ?? '/es/,/,/es/proyectos/truekapp/,/projects/truekapp/').split(',');
const FORMS = ['mobile', 'desktop'];
const out = resolve('reports');
mkdirSync(out, { recursive: true });

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  return s[Math.floor(s.length / 2)];
};

const chrome = await chromeLauncher.launch({
  chromePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe',
  chromeFlags: ['--headless=new', '--no-first-run', '--disable-extensions'],
});
const results = [];
let incomplete = false;
for (const page of PAGES) {
  for (const form of FORMS) {
    const runs = [];
    const failed = [];
    for (let attempt = 0; runs.length < RUNS && attempt < RUNS * 2; attempt++) {
      const flags = { port: chrome.port, output: 'json', logLevel: 'error' };
      const config = form === 'desktop' ? desktopConfig : undefined;
      const { lhr } = await lighthouse(BASE + page, flags, config);
      // A run without LCP is discarded instead of counted as a zero score.
      if (lhr.runtimeError || lhr.categories.performance.score === null || !lhr.audits['largest-contentful-paint'].numericValue) {
        failed.push({ attempt, runtimeError: lhr.runtimeError ?? null, perf: lhr.categories.performance.score });
        continue;
      }
      const a = lhr.audits;
      runs.push({
        perf: Math.round(lhr.categories.performance.score * 100),
        a11y: Math.round(lhr.categories.accessibility.score * 100),
        bp: Math.round(lhr.categories['best-practices'].score * 100),
        seo: Math.round(lhr.categories.seo.score * 100),
        fcp: a['first-contentful-paint'].numericValue,
        lcp: a['largest-contentful-paint'].numericValue,
        tbt: a['total-blocking-time'].numericValue,
        cls: a['cumulative-layout-shift'].numericValue,
        si: a['speed-index'].numericValue,
        ttfb: a['server-response-time']?.numericValue ?? null,
        bytes: a['total-byte-weight'].numericValue,
        requests: a['network-requests']?.details?.items?.length ?? null,
        lcpElement: a['largest-contentful-paint-element']?.details?.items?.[0]?.items?.[0]?.node?.snippet ?? null,
        failing: Object.values(lhr.categories)
          .flatMap((c) => c.auditRefs)
          .filter((r) => r.weight > 0 && lhr.audits[r.id].score !== null && lhr.audits[r.id].score < 1)
          .map((r) => r.id),
        version: lhr.lighthouseVersion,
        formFactor: lhr.configSettings.formFactor,
        throttlingMethod: lhr.configSettings.throttlingMethod,
        throttling: lhr.configSettings.throttling,
        screenEmulation: lhr.configSettings.screenEmulation,
        userAgent: lhr.environment?.hostUserAgent,
        fetchTime: lhr.fetchTime,
      });
    }
    // Never summarise an incomplete sample: record it and make the whole run fail.
    if (runs.length < RUNS) {
      results.push({ page, form, incomplete: true, validRuns: runs.length, failedRuns: failed, failing: [] });
      console.error(`INCOMPLETE ${form} ${page}: ${runs.length}/${RUNS} valid runs`);
      incomplete = true;
      continue;
    }
    const m = (k) => median(runs.map((r) => r[k]));
    const row = {
      page, form,
      perf: m('perf'), a11y: m('a11y'), bp: m('bp'), seo: m('seo'),
      fcp: Math.round(m('fcp')), lcp: Math.round(m('lcp')), tbt: Math.round(m('tbt')),
      cls: Number(m('cls').toFixed(3)), si: Math.round(m('si')), ttfb: Math.round(m('ttfb') ?? 0),
      kb: Math.round(m('bytes') / 1024), requests: m('requests'),
      lcpRange: [Math.round(Math.min(...runs.map((r) => r.lcp))), Math.round(Math.max(...runs.map((r) => r.lcp)))],
      perfRange: [Math.min(...runs.map((r) => r.perf)), Math.max(...runs.map((r) => r.perf))],
      lcpElement: runs[0].lcpElement,
      validRuns: runs.length,
      failedRuns: failed,
      runs,
      formFactor: runs[0].formFactor,
      failing: [...new Set(runs.flatMap((r) => r.failing))],
    };
    results.push(row);
    console.log(`${form.padEnd(7)} ${page.padEnd(26)} P${row.perf} A${row.a11y} BP${row.bp} SEO${row.seo} LCP ${row.lcp}ms CLS ${row.cls} TBT ${row.tbt}ms ${row.kb}KB ${row.requests}req`);
  }
}
await chrome.kill();

// Build identity: hash of the built home page, so results can be tied to a specific dist/.
const { createHash } = await import('node:crypto');
const { readFileSync: rf } = await import('node:fs');
const buildHash = createHash('sha256').update(rf(resolve('dist/index.html'))).update(rf(resolve('dist/es/index.html'))).digest('hex').slice(0, 12);
const meta = {
  buildHash,
  indexable: rf(resolve('dist/es/index.html'), 'utf8').includes('content="index,'),
  label, runs: RUNS, base: BASE, date: new Date().toISOString(), lighthouse: results.length ? undefined : null,
  note: 'Lighthouse lab data (median of N runs). Mobile = default throttling (simulated Slow 4G, 4× CPU). Not field data.',
};
writeFileSync(resolve(out, `lighthouse-${label}.json`), JSON.stringify({ meta, results }, null, 2));
const md = [
  `| Page | Device | Perf | A11y | BP | SEO | FCP | LCP (range) | TBT | CLS | Weight | Requests |`,
  `|---|---|---|---|---|---|---|---|---|---|---|---|`,
  ...results.filter((r) => !r.incomplete).map((r) => `| \`${r.page}\` | ${r.form} | ${r.perf} | ${r.a11y} | ${r.bp} | ${r.seo} | ${r.fcp} ms | ${r.lcp} ms (${r.lcpRange[0]}–${r.lcpRange[1]}) | ${r.tbt} ms | ${r.cls} | ${r.kb} KB | ${r.requests} |`),
].join('\n');
writeFileSync(resolve(out, `lighthouse-${label}.md`), md + '\n\nFailing audits (union of all runs):\n\n' + results.map((r) => `- ${r.form} \`${r.page}\`: ${r.failing.join(', ') || '—'}`).join('\n') + '\n');
console.log(`\nSaved reports/lighthouse-${label}.{json,md}`);
if (incomplete) process.exit(1);
