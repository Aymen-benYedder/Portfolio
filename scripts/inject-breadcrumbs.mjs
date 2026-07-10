import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const BASE_URL = process.env.BASE_URL || process.argv[2] || 'https://aymen.benyedder.top';

async function listHtml(dir) {
  const names = await fs.readdir(dir);
  return names.filter(n => n.endsWith('.html')).map(n => path.join(dir, n));
}

function extractTitle(html) {
  const m = html.match(/<title>([^<]+)<\/title>/i);
  if (m) return m[1].replace(/\s*\|.*$/,'').trim();
  const h1 = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1) return h1[1].replace(/<[^>]+>/g,'').trim();
  return '';
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]+rel=["']canonical["'][^>]+href=["']([^"']+)["'][^>]*>/i);
  if (m) return m[1];
  return null;
}

function hasBreadcrumb(html) {
  return /"@type"\s*:\s*"BreadcrumbList"|<script[^>]+type=["']application\/ld\+json["'][\s\S]*?BreadcrumbList/i.test(html);
}

function buildBreadcrumbJson(title, url) {
  const home = BASE_URL.replace(/\/$/, '') + '/';
  const blog = BASE_URL.replace(/\/$/, '') + '/blog/';
  return `  <script type="application/ld+json">\n  {\n    "@context": "https://schema.org",\n    "@type": "BreadcrumbList",\n    "itemListElement": [\n      {"@type":"ListItem","position":1,"name":"Home","item":"${home}"},\n      {"@type":"ListItem","position":2,"name":"Blog","item":"${blog}"},\n      {"@type":"ListItem","position":3,"name":"${escapeJson(title)}","item":"${url}"}\n    ]\n  }\n  </script>\n\n`;
}

function escapeJson(s) {
  return s.replace(/\\/g,'\\\\').replace(/"/g,'\\\"');
}

async function run() {
  const files = await listHtml(BLOG_DIR);
  for (const file of files) {
    const html = await fs.readFile(file, 'utf8');
    if (hasBreadcrumb(html)) {
      console.log('Breadcrumb exists:', path.basename(file));
      continue;
    }
    const title = extractTitle(html) || path.basename(file);
    const canonical = extractCanonical(html) || (BASE_URL.replace(/\/$/, '') + '/blog/' + path.basename(file));
    const breadcrumb = buildBreadcrumbJson(title, canonical);
    // insert before </head>
    const updated = html.replace(/<\/head>/i, breadcrumb + '</head>');
    await fs.writeFile(file, updated, 'utf8');
    console.log('Injected breadcrumb into', path.basename(file));
  }
}

run().catch(err => { console.error(err); process.exit(1); });

