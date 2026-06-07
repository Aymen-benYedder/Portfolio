import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT = path.resolve(__dirname, '..');
const sitemapPath = path.join(ROOT, 'sitemap.xml');
const outDir = path.join(ROOT, 'diagnostics');

function extractLocs(xml) {
  const re = /<loc>([\s\S]*?)<\/loc>/gi;
  const out = [];
  let m;
  while ((m = re.exec(xml)) !== null) out.push(m[1].trim());
  return out;
}

function parseCsvRow(line) {
  const values = [];
  let cur = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i += 1) {
    const chr = line[i];
    if (chr === '"') {
      if (inQuotes && line[i + 1] === '"') {
        cur += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (chr === ',' && !inQuotes) {
      values.push(cur);
      cur = '';
      continue;
    }
    cur += chr;
  }
  values.push(cur);
  return values;
}

function readCsvUrls(csvText) {
  const lines = csvText.split(/\r?\n/).filter((line) => line.trim());
  if (lines.length === 0) return [];
  const header = parseCsvRow(lines[0]).map((h) => h.trim().toLowerCase());
  const urlIdx = header.findIndex((h) => ['url', 'loc', 'location', 'page'].includes(h));
  const urls = [];
  for (let i = 1; i < lines.length; i += 1) {
    const values = parseCsvRow(lines[i]);
    const value = urlIdx >= 0 ? values[urlIdx] : values[0];
    if (value && value.trim()) urls.push(value.trim());
  }
  return urls;
}

function readJsonUrls(jsonText) {
  const data = JSON.parse(jsonText);
  if (!Array.isArray(data)) return [];
  return data
    .map((item) => {
      if (typeof item === 'string') return item.trim();
      if (item && typeof item.url === 'string') return item.url.trim();
      return '';
    })
    .filter((url) => url);
}

function extractCanonical(html) {
  const m = html.match(/<link[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["'][^>]*>/i);
  return m ? m[1] : '';
}
function extractRobots(html) {
  const m = html.match(/<meta[^>]*name=["']robots["'][^>]*content=["']([^"']+)["'][^>]*>/i);
  return m ? m[1] : '';
}

async function loadUrls(inputPath) {
  if (!inputPath) {
    const xml = await fs.readFile(sitemapPath, 'utf8');
    return extractLocs(xml);
  }

  const text = await fs.readFile(inputPath, 'utf8');
  const ext = path.extname(inputPath).toLowerCase();
  if (ext === '.json') {
    return readJsonUrls(text);
  }
  return readCsvUrls(text);
}

async function run() {
  try {
    await fs.mkdir(outDir, { recursive: true });
    const inputArg = process.argv[2];
    const inputPath = inputArg ? path.resolve(process.cwd(), inputArg) : null;
    const inputName = inputPath ? path.basename(inputPath, path.extname(inputPath)) : 'sitemap';
    const urls = await loadUrls(inputPath);
    if (urls.length === 0) {
      console.error('No URLs found in input. Provide a sitemap.xml or a CSV file with a URL column.');
      process.exit(1);
    }

    const rows = [];
    for (const url of urls) {
      let status = null;
      let finalUrl = '';
      let canonical = '';
      let robots = '';
      let notes = '';
      try {
        const res = await fetch(url, { redirect: 'follow' });
        status = res.status;
        finalUrl = res.url;
        const text = await res.text();
        canonical = extractCanonical(text);
        robots = extractRobots(text);
        if (finalUrl !== url) notes += 'redirected;';
        if (robots && /noindex/i.test(robots)) notes += 'robots:noindex;';
        if (status >= 400) notes += 'http_error;';
      } catch (e) {
        notes += `fetch_error:${e.message}`;
      }
      rows.push({ url, status, finalUrl, canonical, robots, notes });
    }

    const jsonOutPath = path.join(outDir, `gsc-diagnostic-${inputName}-${new Date().toISOString().slice(0,10)}.json`);
    await fs.writeFile(jsonOutPath, JSON.stringify(rows, null, 2), 'utf8');
    console.log('Wrote', jsonOutPath);
  } catch (e) {
    console.error('Error:', e.message);
    process.exit(1);
  }
}

run();
