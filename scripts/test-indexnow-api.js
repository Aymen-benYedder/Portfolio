#!/usr/bin/env node

/**
 * IndexNow API Test Client
 * Test the /api/indexnow endpoint in your backend
 * 
 * Usage:
 *   node scripts/test-indexnow-api.js
 */

import https from 'https';

const API_URL = process.env.API_URL || 'http://localhost:3001';
const TEST_URLS = [
  'https://aymen.benyedder.top/',
  'https://aymen.benyedder.top/blog/',
];

/**
 * Test the API endpoint
 */
async function testAPI() {
  console.log('🧪 Testing IndexNow API Endpoint\n');
  console.log(`API URL: ${API_URL}/api/indexnow`);
  console.log(`Test URLs: ${TEST_URLS.length}`);
  console.log('───────────────────────────────────────────\n');

  const payload = JSON.stringify({ urls: TEST_URLS });

  const url = new URL(`${API_URL}/api/indexnow`);
  const isHttps = url.protocol === 'https:';
  const http = isHttps ? https : (await import('http')).default;

  const options = {
    hostname: url.hostname,
    port: url.port || (isHttps ? 443 : 80),
    path: url.pathname,
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': payload.length
    }
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        console.log(`📊 Status: ${res.statusCode}`);
        console.log(`Headers:`, res.headers);
        console.log(`\nResponse:\n${JSON.stringify(JSON.parse(data), null, 2)}`);

        if (res.statusCode === 200 || res.statusCode === 202) {
          console.log('\n✅ API test successful!');
        }
        resolve();
      });
    });

    req.on('error', (err) => {
      console.error(`\n❌ Connection failed: ${err.message}`);
      console.log('\n💡 Make sure the backend is running:');
      console.log(`   node backend/email-server.js`);
      reject(err);
    });

    console.log('📤 Sending request...\n');
    req.write(payload);
    req.end();
  });
}

testAPI().catch(() => process.exit(1));
