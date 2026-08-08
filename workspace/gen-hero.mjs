import { promises as fs } from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const root = process.cwd();
const svgPath = path.join(root, 'workspace', 'hero-ai-review-verification.svg');
const outPath = path.join(root, 'public', 'assets', 'img', 'ai-code-review-verification-2026.webp');

const svg = await fs.readFile(svgPath);

await sharp(svg, { density: 96 })
  .resize(1200, 630)
  .webp({ quality: 82, effort: 4 })
  .toFile(outPath);

const stat = await fs.stat(outPath);
console.log('OK ' + outPath + ' ' + stat.size + ' bytes');
