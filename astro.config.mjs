// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// Same URL scheme as the previous site (EN at `/`, ES at `/es/`).
// The case study's translations don't share a path prefix, so the sitemap pair is declared by hand.
const PAIRS = [{ en: 'https://camilotaba.dev/projects/truekapp/', es: 'https://camilotaba.dev/es/proyectos/truekapp/' }];
const REVIEW_ONLY = ['/404'];

export default defineConfig({
  site: 'https://camilotaba.dev',
  trailingSlash: 'always',
  i18n: {
    locales: ['en', 'es'],
    defaultLocale: 'en',
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      filter: (page) => !REVIEW_ONLY.some((p) => new URL(page).pathname.startsWith(p)),
      i18n: { defaultLocale: 'en', locales: { en: 'en', es: 'es' } },
      serialize(item) {
        const pair = PAIRS.find((p) => p.en === item.url || p.es === item.url);
        if (pair) item.links = [{ lang: 'en', url: pair.en }, { lang: 'es', url: pair.es }];
        return item;
      },
    }),
  ],
  build: { inlineStylesheets: 'always' },
  // CSP as a <meta> tag with hashes for inline scripts/styles; frame-ancestors is sent as a header (vercel.json).
  security: {
    csp: {
      algorithm: 'SHA-256',
      directives: [
        "default-src 'self'",
        "img-src 'self' data:",
        "font-src 'self'",
        "connect-src 'self'",
        "base-uri 'self'",
        "form-action 'self'",
        "object-src 'none'",
      ],
    },
  },
  vite: { plugins: [tailwindcss()] },
});
