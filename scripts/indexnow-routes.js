/**
 * IndexNow Express Middleware
 * Add this to backend/email-server.js or create a separate route file
 * 
 * Usage in Express:
 *   const indexnowRouter = require('./indexnow-routes');
 *   app.use('/api', indexnowRouter);
 * 
 * Then POST to: /api/indexnow
 */

const https = require('https');
const express = require('express');
const router = express.Router();

const INDEX_NOW_KEY = process.env.INDEX_NOW_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
const DOMAIN = 'aymen.benyedder.top';
const KEY_LOCATION = `https://${DOMAIN}/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt`;

/**
 * POST /api/indexnow
 * Submit URLs to IndexNow
 * 
 * Body:
 * {
 *   "urls": ["https://example.com/url1", "https://example.com/url2"],
 *   "key": "optional-custom-key"
 * }
 */
router.post('/indexnow', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'urls array is required' });
    }

    if (urls.length > 10000) {
      return res.status(400).json({ error: 'Max 10,000 URLs per request' });
    }

    const payload = {
      host: DOMAIN,
      key: INDEX_NOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls
    };

    // Submit to IndexNow (non-blocking, log result)
    submitIndexNow(payload)
      .then((result) => {
        console.log(`✅ IndexNow submission: ${result.statusCode}`);
      })
      .catch((err) => {
        console.error(`❌ IndexNow submission failed:`, err.message);
      });

    // Return immediately
    res.json({
      success: true,
      message: 'URLs submitted to IndexNow',
      count: urls.length,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper function to submit to IndexNow
 */
function submitIndexNow(payload) {
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
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.write(JSON.stringify(payload));
    req.end();
  });
}

module.exports = router;
