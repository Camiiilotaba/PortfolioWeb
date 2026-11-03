# camilotaba.dev

Source of my personal portfolio: a static, bilingual (EN/ES) site built with **Astro** and **Tailwind CSS 4**.

- `/` English · `/es/` Spanish
- Truekapp case study: `/projects/truekapp/` · `/es/proyectos/truekapp/`

## Stack

Astro 7 (static output) · Tailwind CSS 4 · TypeScript · self-hosted variable fonts · set up for Vercel.
No client framework: the only JavaScript is a small progressive-enhancement script for copying the email address.

## Highlights

- **i18n without a library**: typed dictionaries per language, per-page `hreflang`, localized metadata and sitemap.
- **Performance**: responsive AVIF/WebP images, fingerprinted assets cached for a year, inline critical CSS, metric-matched font fallback (CLS 0).
- **Accessibility**: WCAG 2.2 AA target, visible focus, reduced-motion support, layout that holds up with text enlarged to 200 %.
- **Security**: hashed Content-Security-Policy (Astro), strict headers in `vercel.json`.
- **SEO**: canonical URLs, `hreflang`, sitemap, Open Graph images per language, `Person`/`WebSite` JSON-LD.

## Getting started

Requires Node.js ≥ 22.12.

```sh
npm install
npm run dev      # http://localhost:4321
npm run check    # type check
npm run build    # static site in dist/
```

Pages ship with `noindex` by default. Set `PUBLIC_INDEXABLE=true` in the production environment to allow indexing.

## Quality checks

Lab tooling lives in `scripts/` and writes its output to `reports/` (not committed). Build first, then serve `dist/`
with production-like compression and headers:

```sh
node scripts/serve-prod.mjs 4500
node scripts/lighthouse-runs.mjs final 3   # Lighthouse x3 per page and device, medians
node scripts/qa-audit.mjs final            # axe-core, overflow, keyboard focus, SEO consistency, links
node scripts/cross-browser.mjs             # Chrome, Firefox and WebKit (Playwright)
node scripts/check-text-zoom.mjs           # text enlarged to 200 % without overflow
```

`node scripts/generate-og.mjs` regenerates the Open Graph images and icons.

## Structure

```
src/
  pages/        routes (EN at the root, ES under /es/)
  components/   header, footer and page sections (components/site/)
  i18n/         copy for both languages
  data/         profile, projects and tech stack
  layouts/      document head: SEO, structured data, preloads
  styles/       design tokens and shared patterns
public/         CV (PDF), icons, robots.txt, Open Graph images
scripts/        build helpers and lab QA tooling
```

## License

Code is available for reference. Text, photos, screenshots and the CV are © Camilo Taba; please don't reuse them.
