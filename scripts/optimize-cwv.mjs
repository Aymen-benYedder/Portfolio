import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');

async function findHtmlFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  let files = [];
  for (const ent of entries) {
    if (ent.name.startsWith('.')) continue;
    const fullPath = path.join(dir, ent.name);
    if (ent.isDirectory()) {
      if (['node_modules', '.git', '.github', 'scripts'].includes(ent.name)) continue;
      files.push(...await findHtmlFiles(fullPath));
    } else if (ent.isFile() && ent.name.endsWith('.html')) {
      files.push(fullPath);
    }
  }
  return files;
}

function addImageOptimizations(html) {
  let updated = html;

  updated = updated.replace(/<img\s+([^>]*?)src=["']([^"']+)["']([^>]*?)>/gi, (match, before, src, after) => {
    if (/loading\s*=/i.test(match) && /decoding\s*=/i.test(match)) return match;

    let attrs = before + 'src="' + src + '"' + after;
    
    if (!/loading\s*=/i.test(attrs)) {
      attrs = attrs.replace(/>$/, ' loading="lazy">');
    }
    if (!/decoding\s*=/i.test(attrs)) {
      attrs = attrs.replace(/>$/, ' decoding="async">');
    }
    if (!/width\s*=/i.test(attrs) && !/height\s*=/i.test(attrs)) {
      attrs = attrs.replace(/>$/, ' width="auto" height="auto">');
    }

    return attrs;
  });

  updated = updated.replace(/<link\s+rel=["']preload["']\s+as=["']font["'][^>]*href=["']([^"']+)["'][^>]*>/gi, (match) => {
    if (/crossorigin/i.test(match)) return match;
    return match.replace(/>$/, ' crossorigin>');
  });

  return updated;
}

async function run() {
  const files = await findHtmlFiles(ROOT);
  let modified = 0;

  for (const file of files) {
    let html = await fs.readFile(file, 'utf8');
    const optimized = addImageOptimizations(html);

    if (optimized !== html) {
      await fs.writeFile(file, optimized, 'utf8');
      console.log('Optimized:', path.relative(ROOT, file));
      modified++;
    }
  }

  console.log(`\nCore Web Vitals optimization complete. ${modified} files updated.`);
  console.log('Added: loading="lazy", decoding="async" to <img> tags');
  console.log('Added: width, height attributes where missing');
  console.log('Added: crossorigin to <link rel="preload" as="font">');
}

run().catch(err => { console.error(err); process.exit(1); });
