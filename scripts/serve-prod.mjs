// Serves dist/ with compression plus the headers and redirects from vercel.json, so the deploy config is tested locally.
// Usage: node scripts/serve-prod.mjs [port=4500]
import { createServer } from 'node:http';
import { existsSync, readFileSync, statSync } from 'node:fs';
import { extname, join, normalize, resolve } from 'node:path';
import { brotliCompressSync, constants, gzipSync } from 'node:zlib';

const PORT = Number(process.argv[2] ?? 4500);
const ROOT = resolve('dist');
const CONFIG = existsSync('vercel.json') ? JSON.parse(readFileSync('vercel.json', 'utf8')) : {};

const TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.xml': 'application/xml; charset=utf-8',
  '.txt': 'text/plain; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.pdf': 'application/pdf',
};
const COMPRESSIBLE = new Set(['.html', '.css', '.js', '.json', '.xml', '.txt', '.svg']);

// Vercel-style source patterns: literal paths, `:param`, `(.*)`.
const toRegex = (source) =>
  new RegExp(`^${source.replace(/\(\.\*\)/g, '§').replace(/:[a-z]+\*?/gi, '[^/]+').replace(/[.+?^${}|[\]\\]/g, '\\$&').replace(/§/g, '.*')}$`);

function headersFor(path) {
  const out = {};
  for (const rule of CONFIG.headers ?? []) {
    if (toRegex(rule.source).test(path)) for (const h of rule.headers) out[h.key] = h.value;
  }
  return out;
}

function resolveFile(urlPath) {
  const clean = normalize(decodeURIComponent(urlPath)).replace(/^([/\\])+/, '');
  let file = join(ROOT, clean);
  if (!file.startsWith(ROOT)) return null;
  if (existsSync(file) && statSync(file).isDirectory()) file = join(file, 'index.html');
  return existsSync(file) ? file : null;
}

createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const path = url.pathname;

  for (const r of CONFIG.redirects ?? []) {
    if (toRegex(r.source).test(path)) {
      res.writeHead(r.permanent === false ? 307 : 308, { Location: r.destination });
      return res.end();
    }
  }
  // trailingSlash: always (astro.config) → redirect /foo to /foo/ when that page exists.
  if (!extname(path) && !path.endsWith('/') && resolveFile(`${path}/`)) {
    res.writeHead(308, { Location: `${path}/${url.search}` });
    return res.end();
  }

  let file = resolveFile(path);
  let status = 200;
  if (!file) {
    file = join(ROOT, '404.html');
    status = 404;
  }
  const ext = extname(file);
  let body = readFileSync(file);
  const headers = { 'Content-Type': TYPES[ext] ?? 'application/octet-stream', Vary: 'Accept-Encoding', ...headersFor(path) };

  const accept = req.headers['accept-encoding'] ?? '';
  if (COMPRESSIBLE.has(ext) && body.length > 1024) {
    if (accept.includes('br')) {
      body = brotliCompressSync(body, { params: { [constants.BROTLI_PARAM_QUALITY]: 11 } });
      headers['Content-Encoding'] = 'br';
    } else if (accept.includes('gzip')) {
      body = gzipSync(body, { level: 9 });
      headers['Content-Encoding'] = 'gzip';
    }
  }
  headers['Content-Length'] = body.length;
  res.writeHead(status, headers);
  res.end(req.method === 'HEAD' ? undefined : body);
}).listen(PORT, '127.0.0.1', () => {
  console.log(`serve-prod: http://127.0.0.1:${PORT}/ (dist/, ${CONFIG.headers ? 'vercel.json headers' : 'no deploy headers'})`);
});
