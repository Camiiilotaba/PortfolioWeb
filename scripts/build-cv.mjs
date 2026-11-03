// Builds public/CamiloTaba-CV.pdf (ES) and public/CamiloTaba-CV-en.pdf (EN) from cv/content.json.
// Keep the file names: other sites already link to them.
// Usage: node scripts/build-cv.mjs [--html-only]
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { resolve } from 'node:path';
import puppeteer from 'puppeteer-core';

const data = JSON.parse(readFileSync('cv/content.json', 'utf8'));
const css = readFileSync('cv/styles.css', 'utf8');
const escape = (value) => String(value).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]);
const list = (items) => `<ul>${items.map((item) => `<li>${escape(item)}</li>`).join('')}</ul>`;

function render(lang) {
  const c = data[lang];
  return `<!doctype html>
<html lang="${lang}"><head><meta charset="utf-8"><title>Camilo Taba - CV (${lang.toUpperCase()})</title><style>${css}</style></head>
<body><main>
<header><h1>${escape(data.name)}</h1><p class="role">${escape(c.role)}</p>
<p class="contact">${escape(c.location)} · <a href="tel:${data.phone.replaceAll(' ', '')}">${escape(data.phone)}</a> · <a href="mailto:${escape(data.email)}">${escape(data.email)}</a></p>
<p class="links">${data.links.map((link) => `<a href="${escape(link.href)}">${escape(link.label)}</a>`).join(' · ')}</p></header>
<section><h2>${escape(c.headings.profile)}</h2><p>${escape(c.profile)}</p></section>
<section><h2>${escape(c.headings.experience)}</h2>${c.experience.map((item) => `<article><h3>${escape(item.role)} <span class="company">| ${escape(item.company)}</span> <span class="meta">| ${escape(item.meta)}</span></h3>${list(item.bullets)}</article>`).join('')}</section>
<section><h2>${escape(c.headings.projects)}</h2>${c.projects.map((item) => `<article><h3>${escape(item.name)} <span class="company">| <a href="${escape(item.url)}">${escape(item.label)}</a></span> <span class="meta">| ${escape(item.status)}</span></h3>${list(item.bullets)}</article>`).join('')}</section>
<section class="education"><h2>${escape(c.headings.education)}</h2>${c.education.map((item) => `<p><strong>${escape(item.title)}</strong> <span class="meta">| ${escape(item.detail)}</span></p>`).join('')}</section>
<section class="skills"><h2>${escape(c.headings.skills)}</h2>${c.skills.map(([label, text]) => `<p><strong>${escape(label)}:</strong> ${escape(text)}</p>`).join('')}<p class="languages"><strong>${escape(c.languagesLabel)}:</strong> ${escape(c.languages)}</p></section>
</main></body></html>\n`;
}

const FILES = { es: 'CamiloTaba-CV.pdf', en: 'CamiloTaba-CV-en.pdf' };

if (process.argv.includes('--html-only')) {
  mkdirSync('reports/cv', { recursive: true });
  for (const lang of Object.keys(FILES)) writeFileSync(resolve(`reports/cv/cv-${lang}.html`), render(lang));
  console.log('HTML in reports/cv/');
} else {
  const browser = await puppeteer.launch({ executablePath: process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe' });
  const page = await browser.newPage();
  for (const [lang, file] of Object.entries(FILES)) {
    await page.setContent(render(lang), { waitUntil: 'load' });
    await page.pdf({ path: resolve('public', file), preferCSSPageSize: true, printBackground: true });
    console.log(`public/${file}`);
  }
  await browser.close();
}
