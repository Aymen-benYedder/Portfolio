import { readFileSync } from 'node:fs';

const key = process.env.DEVTO_API_KEY;
if (!key) {
  console.error('DEVTO_API_KEY env var required');
  process.exit(1);
}

const md = readFileSync('workspace/devto-ai-code-review-verification-2026.md', 'utf8');
const m = md.match(/^---\n([\s\S]*?)\n---\n\n([\s\S]*)$/);
if (!m) {
  console.error('frontmatter parse failed');
  process.exit(1);
}
const fm = m[1];
const body = m[2];

const fmObj = {};
for (const line of fm.split('\n')) {
  const mm = line.match(/^([a-z_]+):\s*(.*)$/);
  if (!mm) continue;
  let v = mm[2].trim();
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) v = v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) v = v.slice(1, -1).split(',').map((x) => x.trim());
  fmObj[mm[1]] = v;
}

const payload = {
  article: {
    title: fmObj.title,
    description: fmObj.description,
    tags: fmObj.tags,
    cover_image: fmObj.cover_image,
    canonical_url: fmObj.canonical_url,
    published: true,
    body_markdown: body,
  },
};

const res = await fetch('https://dev.to/api/articles', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'api-key': key },
  body: JSON.stringify(payload),
});

console.log('STATUS=' + res.status);
const text = await res.text();
if (res.ok) {
  const j = JSON.parse(text);
  console.log('ID=' + j.id);
  console.log('URL=' + j.url);
  console.log('PUBLISHED=' + j.published);
  console.log('CANONICAL=' + j.canonical_url);
  console.log('TAGS=' + (j.tags || []).join(','));
} else {
  console.log(text.slice(0, 1500));
  process.exit(1);
}
