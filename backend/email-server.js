/**
 * Email API Handler - Node.js/Express Backend
 * This can be used if PHP is not available
 * Install dependencies: npm install express nodemailer body-parser cors dotenv
 */

require('dotenv').config();
const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Email configuration
// Uses environment variables for credentials
const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email service
  auth: {
    user: process.env.EMAIL_USER || 'your-email@gmail.com',
    pass: process.env.EMAIL_PASSWORD || 'your-app-password'
  }
});

/**
 * POST /api/send-email
 * Receives contact form data and sends email
 */
app.post('/api/send-email', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    // Validate input
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email address' });
    }

    // Prepare email content
    const mailOptions = {
      from: process.env.EMAIL_USER || 'noreply@portfolio.com',
      to: 'aymen.ben.yedder@mail.com',
      replyTo: email,
      subject: `New Portfolio Contact: ${subject} from ${name}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>Name:</strong> ${escapeHtml(name)}</p>
        <p><strong>Email:</strong> ${escapeHtml(email)}</p>
        <p><strong>Project Type:</strong> ${escapeHtml(subject)}</p>
        <p><strong>Message:</strong></p>
        <pre>${escapeHtml(message)}</pre>
        <hr>
        <p><small>Sent from Portfolio Contact Form</small></p>
      `
    };

    // Send email
    const info = await transporter.sendMail(mailOptions);
    console.log('Email sent:', info.messageId);

    res.status(200).json({ 
      success: true, 
      message: 'Email sent successfully',
      messageId: info.messageId 
    });

  } catch (error) {
    console.error('Email error:', error);
    res.status(500).json({ 
      error: 'Failed to send email',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

/**
 * Escape HTML to prevent XSS attacks
 */
function escapeHtml(text) {
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;'
  };
  return text.replace(/[&<>"']/g, m => map[m]);
}

/**
 * IndexNow API Integration
 * Submit URLs to search engines for faster indexing
 */
const https = require('https');

const INDEX_NOW_KEY = process.env.INDEX_NOW_KEY || 'a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6';
const DOMAIN = 'aymen.benyedder.top';
const KEY_LOCATION = `https://${DOMAIN}/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt`;

/**
 * POST /api/indexnow
 * Submit URLs to IndexNow for faster indexing
 * 
 * Body: { "urls": ["https://example.com/url1", "https://example.com/url2"] }
 */
app.post('/api/indexnow', async (req, res) => {
  try {
    const { urls } = req.body;

    if (!urls || !Array.isArray(urls) || urls.length === 0) {
      return res.status(400).json({ error: 'urls array is required' });
    }

    if (urls.length > 10000) {
      return res.status(400).json({ error: 'Max 10,000 URLs per request' });
    }

    // Validate all URLs belong to our domain
    const invalidUrls = urls.filter(u => !u.startsWith(`https://${DOMAIN}`) && !u.startsWith(`http://${DOMAIN}`));
    if (invalidUrls.length > 0) {
      return res.status(400).json({ 
        error: 'All URLs must belong to ' + DOMAIN,
        invalid: invalidUrls
      });
    }

    const payload = {
      host: DOMAIN,
      key: INDEX_NOW_KEY,
      keyLocation: KEY_LOCATION,
      urlList: urls
    };

    // Submit to IndexNow (non-blocking)
    submitToIndexNow(payload)
      .then((result) => {
        console.log(`✅ IndexNow: ${result.statusCode} - ${urls.length} URLs submitted`);
      })
      .catch((err) => {
        console.error(`❌ IndexNow error:`, err.message);
      });

    // Return immediately
    res.json({
      success: true,
      message: 'URLs queued for IndexNow submission',
      count: urls.length,
      domain: DOMAIN,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

/**
 * Helper: Submit to IndexNow API
 */
function submitToIndexNow(payload) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'www.bing-webmaster.com',
      path: '/indexnow',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json; charset=utf-8',
        'User-Agent': 'PortfolioIndexNowSubmitter/1.0'
      },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        resolve({ statusCode: res.statusCode, data });
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.destroy();
      reject(new Error('Request timeout'));
    });

    req.write(JSON.stringify(payload));
    req.end();
  });
}

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', indexnow: true });
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Email API server running on port ${PORT}`);
  console.log('Make sure to set EMAIL_USER and EMAIL_PASSWORD environment variables');
});
