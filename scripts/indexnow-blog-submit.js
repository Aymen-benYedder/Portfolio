#!/usr/bin/env node

/**
 * Auto-Discover & Submit Blog Posts to IndexNow
 * Scans blog/ directory and submits new/modified URLs
 * 
 * Usage:
 *   node scripts/indexnow-blog-submit.js
 *   node scripts/indexnow-blog-submit.js --all (force all)
 *   node scripts/indexnow-blog-submit.js --since 24h (files modified in last 24h)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const DOMAIN = 'aymen.benyedder.top';
const BLOG_DIR = path.join(__dirname, '..', 'blog');
const CACHE_FILE = path.join(__dirname, '.indexnow-cache.json');

/**
 * Get recently modified files (uses git or file mtime)
 */
function getModifiedFiles(since = '1h') {
  try {
    // Use git to find recently modified files
    const cmd = `git log --since="${since}" --name-only --pretty=format: -- ${BLOG_DIR}/*.html | sort -u`;
    const output = execSync(cmd, { encoding: 'utf8', cwd: path.dirname(BLOG_DIR) });
    return output.trim().split('\n').filter(Boolean);
  } catch (err) {
    console.warn('⚠️  Git not available, falling back to filesystem check');
    return [];
  }
}

/**
 * Get all blog HTML files
 */
function getAllBlogFiles() {
  if (!fs.existsSync(BLOG_DIR)) {
    console.warn(`⚠️  Blog directory not found: ${BLOG_DIR}`);
    return [];
  }

  return fs.readdirSync(BLOG_DIR)
    .filter(f => f.endsWith('.html') && f !== 'index.html')
    .map(f => path.join(BLOG_DIR, f));
}

/**
 * Convert file paths to URLs
 */
function toUrls(files) {
  return files
    .filter(f => fs.existsSync(f))
    .map(f => {
      const relPath = path.relative(path.join(__dirname, '..'), f);
      return `https://${DOMAIN}/${relPath.replace(/\\/g, '/')}`;
    });
}

/**
 * Load submission cache
 */
function loadCache() {
  if (fs.existsSync(CACHE_FILE)) {
    try {
      return JSON.parse(fs.readFileSync(CACHE_FILE, 'utf8'));
    } catch (err) {
      return {};
    }
  }
  return {};
}

/**
 * Save submission cache
 */
function saveCache(cache) {
  fs.writeFileSync(CACHE_FILE, JSON.stringify(cache, null, 2));
}

/**
 * Main
 */
async function main() {
  const args = process.argv.slice(2);
  const forceAll = args.includes('--all');
  const sinceMatch = args.find(a => a.startsWith('--since='));
  const since = sinceMatch ? sinceMatch.split('=')[1] : '1h';

  console.log('\n📚 Scanning blog directory...');

  let files;
  if (forceAll) {
    console.log('📋 Mode: All blog posts');
    files = getAllBlogFiles();
  } else {
    console.log(`📋 Mode: Modified in last ${since}`);
    const modified = getModifiedFiles(since);
    files = modified.length > 0 ? modified : [];

    // Fallback: check by filesystem mtime
    if (files.length === 0) {
      const sineSeconds = 3600; // default 1h
      const allFiles = getAllBlogFiles();
      const now = Date.now();
      files = allFiles.filter(f => {
        const mtime = fs.statSync(f).mtimeMs;
        return (now - mtime) < sineSeconds * 1000;
      });
    }
  }

  if (files.length === 0) {
    console.log('✅ No new files to submit');
    return;
  }

  const urls = toUrls(files);
  console.log(`\n📝 Found ${urls.length} file${urls.length !== 1 ? 's' : ''}:`);
  urls.forEach(u => console.log(`   • ${u}`));

  // Add homepage + blog index
  const allUrls = [
    `https://${DOMAIN}/`,
    `https://${DOMAIN}/blog/`,
    ...urls
  ];

  console.log(`\n🚀 Submitting ${allUrls.length} URL${allUrls.length !== 1 ? 's' : ''}...`);

  try {
    const submitScript = path.join(__dirname, 'indexnow-submit.js');
    execSync(`node "${submitScript}" ${allUrls.map(u => `"${u}"`).join(' ')}`, {
      stdio: 'inherit'
    });

    // Update cache
    const cache = loadCache();
    allUrls.forEach(url => {
      cache[url] = new Date().toISOString();
    });
    saveCache(cache);
  } catch (err) {
    console.error('❌ Submission failed:', err.message);
    process.exit(1);
  }
}

main();
