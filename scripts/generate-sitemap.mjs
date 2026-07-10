#!/usr/bin/env node
/*
 * scripts/generate-sitemap.mjs
 * Generate sitemap.xml and robots.txt (from template) for the site.
 * Usage: BASE_URL=https://example.com node scripts/generate-sitemap.mjs
 */

import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

function usage() {
  console.log('Usage: BASE_URL=https://example.com node scripts/generate-sitemap.mjs [outputDir]');
}

const baseUrl = process.env.BASE_URL || process.argv[2] || 'https://aymen.benyedder.top';
const outputDir = process.argv[3] || ROOT; // default write to repo root

/** Recursively walk directory and collect .html files */
async function collectHtmlFiles(dir, baseDir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue;
    const full = path.join(dir, ent.name);
    const rel = path.relative(baseDir, full).replace(/\\/g, '/');
    if (ent.isDirectory()) {
      if (['node_modules', '.git', '.github', 'scripts', 'mockups'].includes(ent.name)) continue;
      files.push(...await collectHtmlFiles(full, baseDir));
    } else if (ent.isFile() && ent.name.endsWith('.html')) {
      if (/^google[a-z0-9]+\.html$/i.test(ent.name)) continue;
      if (await hasNoindexHtml(full)) continue;
      files.push({ full, rel });
    }
  }
  return files;
}

function priorityFor(rel) {
  if (rel === 'index.html' || rel === 'index.htm') return '1.0';
  if (rel.startsWith('blog/')) return '0.8';
  if (rel.startsWith('services/')) return '0.7';
  return '0.5';
}

function changefreqFor(rel) {
  if (rel === 'index.html') return 'daily';
  if (rel.startsWith('blog/')) return 'weekly';
  return 'monthly';
}

async function statIso(file) {
  try {
    const s = await fs.stat(file);
    return s.mtime.toISOString();
  } catch (e) {
    return new Date().toISOString();
  }
}

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

async function hasNoindexHtml(file) {
  try {
    const html = await fs.readFile(file, 'utf8');
    return /<meta\s+[^>]*name=["']robots["'][^>]*content=["'][^"']*noindex[^"']*["'][^>]*>/i.test(html);
  } catch (e) {
    return false;
  }
}

async function buildSitemap() {
  const files = await collectHtmlFiles(ROOT, ROOT);
  // Deduplicate and sort
  const map = new Map();
  for (const f of files) map.set(f.rel.replace(/index\.html$/, ''), f.full);
  const rows = [];
  for (const [rel, full] of map) {
    // calculate url path
    let urlPath = rel;
    if (urlPath === '') urlPath = '/';
    else urlPath = '/' + urlPath.replace(/index\.html$/, '');
    const lastmod = await statIso(full);
    const relNormalized = (rel === '') ? 'index.html' : rel;
    rows.push({ loc: baseUrl.replace(/\/$/, '') + urlPath, lastmod, rel: relNormalized });
  }

  // sort by loc
  rows.sort((a, b) => a.loc.localeCompare(b.loc));

  const urlset = rows.map(r => {
    const p = priorityFor(r.rel);
    const c = changefreqFor(r.rel);
    return `  <url>\n    <loc>${escapeXml(r.loc)}</loc>\n    <lastmod>${r.lastmod}</lastmod>\n    <changefreq>${c}</changefreq>\n    <priority>${p}</priority>\n  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urlset}\n</urlset>`;

  const sitemapPath = path.join(outputDir, 'sitemap.xml');
  await fs.writeFile(sitemapPath, xml, 'utf8');
  console.log('Wrote', sitemapPath);

  // Generate robots.txt from template if present
  const robotsTplPath = path.join(ROOT, 'robots.template.txt');
  try {
    const tpl = await fs.readFile(robotsTplPath, 'utf8');
    const robots = tpl.replace(/\{\{SITEMAP_URL\}\}/g, baseUrl.replace(/\/$/, '') + '/sitemap.xml');
    const robotsOut = path.join(outputDir, 'robots.txt');
    await fs.writeFile(robotsOut, robots, 'utf8');
    console.log('Wrote', robotsOut);
  } catch (e) {
    console.warn('No robots.template.txt found — skipping robots.txt generation.');
  }
}

if (process.argv.includes('--help') || process.argv.includes('-h')) {
  usage();
  process.exit(0);
}

buildSitemap().catch(err => {
  console.error(err);
  process.exit(1);
});
