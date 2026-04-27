#!/usr/bin/env node
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');

async function readFiles(dir) {
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    if (e.isDirectory()) {
      if (['node_modules', '.git', '.github', 'scripts'].includes(e.name)) continue;
      files.push(...await readFiles(path.join(dir, e.name)));
    } else if (e.isFile() && e.name.endsWith('.html')) {
      files.push(path.join(dir, e.name));
    }
  }
  return files;
}

async function extractJsonLd(content) {
  const re = /<script[^>]*type=(?:"|')application\/ld\+json(?:"|')[^>]*>([\s\S]*?)<\/script>/gi;
  const matches = [];
  let m;
  while ((m = re.exec(content)) !== null) matches.push(m[1].trim());
  return matches;
}

function checkArticle(obj) {
  const required = ['headline','author','datePublished','mainEntityOfPage'];
  for (const r of required) if (!obj[r]) return `missing ${r}`;
  return null;
}

async function main() {
  const files = await readFiles(ROOT);
  const problems = [];
  for (const f of files) {
    const content = await fs.readFile(f, 'utf8');
    const blocks = await extractJsonLd(content);
    if (blocks.length === 0) continue; // okay
    for (const b of blocks) {
      try {
        const obj = JSON.parse(b);
        if (Array.isArray(obj)) {
          for (const item of obj) {
            if (item['@type'] === 'Article') {
              const err = checkArticle(item);
              if (err) problems.push(`${path.relative(ROOT,f)}: Article ${err}`);
            }
          }
        } else {
          if (obj['@type'] === 'Article') {
            const err = checkArticle(obj);
            if (err) problems.push(`${path.relative(ROOT,f)}: Article ${err}`);
          }
        }
      } catch (e) {
        problems.push(`${path.relative(ROOT,f)}: invalid JSON-LD (${e.message})`);
      }
    }
  }

  if (problems.length) {
    console.error('JSON-LD issues found:');
    for (const p of problems) console.error(' -', p);
    process.exit(2);
  }
  console.log('JSON-LD validation passed.');
}

main().catch(e=>{ console.error(e); process.exit(1); });
