#!/usr/bin/env node

/**
 * IndexNow Submission Script
 * Auto-submits updated URLs to search engines (Bing, Yandex, etc.)
 * 
 * Usage:
 *   node scripts/indexnow-submit.js https://aymen.benyedder.top/blog/post.html
 *   node scripts/indexnow-submit.js < urls.txt (reads from stdin)
 */

import https from 'https';
import readline from 'readline';

const INDEX_NOW_KEY = process.env.INDEX_NOW_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
const DOMAIN = 'aymen.benyedder.top';
const KEY_LOCATION = `https://${DOMAIN}/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt`;

/**
 * Submit URLs to IndexNow
 * @param {string[]} urlList - Array of URLs to submit
 * @returns {Promise<boolean>}
 */
function submitToIndexNow(urlList) {
  if (!urlList || urlList.length === 0) {
    console.warn('⚠️  No URLs to submit');
    return Promise.resolve(false);
  }

  if (urlList.length > 10000) {
    console.error('❌ Too many URLs (max 10,000 per request)');
    return Promise.reject(new Error('URL limit exceeded'));
  }

  const payload = {
    host: DOMAIN,
    key: INDEX_NOW_KEY,
    keyLocation: KEY_LOCATION,
    urlList: urlList
  };

  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.bing-webmaster.com',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'IndexNowSubmitter/1.0'
      }
    };

    const req = https.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        const success = res.statusCode === 200 || res.statusCode === 202;
        const statusText = {
          200: 'OK - Submitted successfully',
          202: 'Accepted - Validation pending',
          400: 'Bad Request - Invalid format',
          403: 'Forbidden - Invalid key',
          422: 'Unprocessable Entity - URLs invalid',
          429: 'Too Many Requests - Rate limited'
        }[res.statusCode] || `Unknown (${res.statusCode})`;

        console.log(`\n📊 IndexNow Response: ${statusText}`);
        console.log(`   Submitted ${urlList.length} URL${urlList.length !== 1 ? 's' : ''}`);

        if (data) console.log(`   Details: ${data}`);

        resolve(success);
      });
    });

    req.on('error', (err) => {
      console.error('❌ Request failed:', err.message);
      reject(err);
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    const payloadStr = JSON.stringify(payload);
    req.write(payloadStr);
    req.end();
  });
}

/**
 * Parse command-line arguments or stdin
 */
async function main() {
  let urls = [];

  // Check command-line arguments
  if (process.argv.length > 2) {
    urls = process.argv.slice(2);
  } else if (!process.stdin.isTTY) {
    // Read from stdin if piped
    const rl = readline.createInterface({
      input: process.stdin,
      output: process.stdout,
      terminal: false
    });

    for await (const line of rl) {
      const url = line.trim();
      if (url && url.startsWith('http')) {
        urls.push(url);
      }
    }
  }

  if (urls.length === 0) {
    console.log(`
📝 IndexNow Submission Tool
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

Usage:
  node scripts/indexnow-submit.js <url1> [url2] [url3] ...
  node scripts/indexnow-submit.js < urls.txt

Environment:
  INDEX_NOW_KEY (default: a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6)

Examples:
  node scripts/indexnow-submit.js https://aymen.benyedder.top/blog/new-post.html
  echo "https://aymen.benyedder.top/blog/post1.html" | node scripts/indexnow-submit.js
`);
    process.exit(1);
  }

  console.log(`\n🚀 Submitting ${urls.length} URL${urls.length !== 1 ? 's' : ''} to IndexNow...`);
  console.log(`   Domain: ${DOMAIN}`);
  console.log(`   Key: ${INDEX_NOW_KEY.substring(0, 8)}...`);

  try {
    const success = await submitToIndexNow(urls);
    process.exit(success ? 0 : 1);
  } catch (error) {
    console.error('❌ Submission failed:', error.message);
    process.exit(1);
  }
}

main();
