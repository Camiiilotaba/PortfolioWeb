// Fonts and portrait are inlined as data URIs: a setContent page has no origin to fetch them from.
// Usage: node scripts/generate-og.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const CHROME = process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const font = (file) => `data:font/woff2;base64,${readFileSync(resolve('src/assets/fonts', file)).toString('base64')}`;
const SANS = font('instrument-sans-latin-wght.woff2');
const MONO = font('jetbrains-mono-latin-wght.woff2');
const portrait = `data:image/jpeg;base64,${readFileSync(resolve('src/assets/people/camilo-taba.jpg')).toString('base64')}`;

const variants = [
  { file: 'public/og-image.png', lines: ['Full-Stack', 'Developer'], place: 'Orihuela, Alicante · Spain' },
  { file: 'public/og-image-es.png', lines: ['Desarrollador', 'Full-Stack'], place: 'Orihuela, Alicante · España' },
];

const html = (v) => `<!doctype html><html><head><style>
@font-face { font-family: 'IS'; src: url('${SANS}') format('woff2'); font-weight: 400 700; }
@font-face { font-family: 'JB'; src: url('${MONO}') format('woff2'); font-weight: 400 600; }
* { margin: 0; box-sizing: border-box; }
body { width: 1200px; height: 630px; background: #0b0b0d; color: #f4f4f2; font-family: 'IS'; padding: 72px 80px; display: flex; flex-direction: column; justify-content: space-between; }
h1 { font-size: 104px; font-weight: 600; line-height: .92; letter-spacing: -.05em; }
.row { display: flex; gap: .14em; margin-top: .06em; }
.cap { width: 1.32em; height: 1.76em; margin-top: .06em; border-radius: .12em; overflow: hidden; border: 1px solid #4a4c53; }
.cap img { width: 100%; height: 100%; object-fit: cover; object-position: 50% 30%; filter: grayscale(.15) contrast(1.03); }
.role { color: #b8bac0; } .period { color: #8e9098; }
.foot { display: flex; justify-content: space-between; align-items: center; font-family: 'JB'; font-size: 22px; color: #b8bac0; border-top: 1px solid #303137; padding-top: 22px; }
.dot { display: inline-block; width: 12px; height: 12px; border-radius: 99px; background: #e9b44c; margin-right: 14px; vertical-align: middle; }
</style></head><body>
<h1>Camilo Taba<div class="row"><span class="cap"><img src="${portrait}"></span><span class="role"><div>${v.lines[0]}</div><div>${v.lines[1]}<span class="period">.</span></div></span></div></h1>
<div class="foot"><span>Laravel / PHP / MySQL / JavaScript / Vue / Flutter</span><span><span class="dot"></span>${v.place}</span></div>
</body></html>`;

const browser = await puppeteer.launch({ executablePath: CHROME, headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 1200, height: 630, deviceScaleFactor: 1 });
for (const v of variants) {
  await page.setContent(html(v), { waitUntil: 'load' });
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: resolve(v.file) });
  console.log('✓', v.file);
}
const icon = readFileSync(resolve('public/favicon.svg'), 'utf8');
await page.setViewport({ width: 180, height: 180, deviceScaleFactor: 1 });
await page.setContent(`<html><body style="margin:0">${icon.replace('<svg ', '<svg width="180" height="180" ')}</body></html>`, { waitUntil: 'load' });
await page.screenshot({ path: resolve('public/apple-touch-icon.png'), omitBackground: false });
console.log('✓ public/apple-touch-icon.png');

// Some clients request /favicon.ico directly, whatever the <link> says.
await page.setViewport({ width: 32, height: 32, deviceScaleFactor: 1 });
await page.setContent(`<html><body style="margin:0">${icon.replace('<svg ', '<svg width="32" height="32" ')}</body></html>`, { waitUntil: 'load' });
const png = await page.screenshot({ type: 'png' });
const header = Buffer.alloc(22);
header.writeUInt16LE(0, 0); header.writeUInt16LE(1, 2); header.writeUInt16LE(1, 4); // reserved, type=icon, count=1
header.writeUInt8(32, 6); header.writeUInt8(32, 7); header.writeUInt8(0, 8); header.writeUInt8(0, 9);
header.writeUInt16LE(1, 10); header.writeUInt16LE(32, 12); header.writeUInt32LE(png.length, 14); header.writeUInt32LE(22, 18);
writeFileSync(resolve('public/favicon.ico'), Buffer.concat([header, png]));
console.log('✓ public/favicon.ico');
await browser.close();
