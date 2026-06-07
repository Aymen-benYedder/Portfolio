# IndexNow Integration Guide

**Status:** ✅ Ready to use  
**Domain:** `aymen.benyedder.top`  
**Key:** `a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6`  
**Verification:** Hosted at `/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt`

---

## Overview

IndexNow notifies search engines (Bing, Yandex, etc.) when you add, update, or delete content. This accelerates indexing and improves your GEO (search engine visibility) by getting your blog posts indexed within **hours instead of days**.

---

## Files Created

### 1. **scripts/indexnow-submit.js** — Core Submission Script
Command-line tool to submit URLs.

**Usage:**
```bash
# Submit single URL
node scripts/indexnow-submit.js https://aymen.benyedder.top/blog/my-post.html

# Submit multiple URLs
node scripts/indexnow-submit.js \
  https://aymen.benyedder.top/ \
  https://aymen.benyedder.top/blog/post1.html \
  https://aymen.benyedder.top/blog/post2.html

# From file or pipe
cat urls.txt | node scripts/indexnow-submit.js
```

**Output:**
```
🚀 Submitting 2 URLs to IndexNow...
   Domain: aymen.benyedder.top
   Key: a1b2c3d4...

📊 IndexNow Response: OK - Submitted successfully
   Submitted 2 URLs
```

---

### 2. **scripts/indexnow-blog-submit.js** — Auto-Discover Posts
Scans `blog/` directory and submits new/modified files automatically.

**Usage:**
```bash
# Submit files modified in last 1 hour
node scripts/indexnow-blog-submit.js

# Submit files modified in last 24 hours
node scripts/indexnow-blog-submit.js --since 24h

# Force submit all blog posts
node scripts/indexnow-blog-submit.js --all
```

---

### 3. **scripts/indexnow-routes.js** — Express Endpoint
Add to your `backend/email-server.js` to create an HTTP endpoint.

**Setup:**
```javascript
// In backend/email-server.js
const indexnowRouter = require('./scripts/indexnow-routes.js');
app.use('/api', indexnowRouter);
```

**Usage:**
```bash
# POST /api/indexnow
curl -X POST http://localhost:3000/api/indexnow \
  -H "Content-Type: application/json" \
  -d '{
    "urls": [
      "https://aymen.benyedder.top/blog/new-post.html",
      "https://aymen.benyedder.top/"
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "message": "URLs submitted to IndexNow",
  "count": 2,
  "timestamp": "2026-06-07T10:00:00Z"
}
```

---

### 4. **.github/workflows/indexnow-submit.yml** — CI/CD Automation
GitHub Actions workflow for automatic submissions.

**Trigger:**
1. **Manual dispatch** via GitHub UI
2. **Auto-trigger** when you push to main (uncomment lines 13-16)

**Setup:**
1. Add GitHub secret: `INDEX_NOW_KEY`
   ```
   Settings → Secrets and variables → Actions
   Add: INDEX_NOW_KEY = a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
   ```

2. Run manually in Actions tab → "Submit to IndexNow on Deploy"

---

## Recommended Workflow

### For Blog Post Publishing

**Step 1:** Create new blog post in `blog/`
```bash
# Example: blog/my-new-post.html
```

**Step 2:** Commit & push
```bash
git add blog/my-new-post.html
git commit -m "Add new blog post: My New Post"
git push origin main
```

**Step 3:** Submit to IndexNow (choose one)

**Option A — Manual CLI (instant)**
```bash
node scripts/indexnow-submit.js https://aymen.benyedder.top/blog/my-new-post.html
```

**Option B — Auto-discover (hands-free)**
```bash
node scripts/indexnow-blog-submit.js
# Submits all files modified in last 1 hour
```

**Option C — GitHub Actions (automated)**
- Go to Actions → "Submit to IndexNow on Deploy"
- Click "Run workflow"
- Paste comma-separated URLs

---

## Environment Variables

For production security, use environment variables instead of hardcoding the key:

```bash
# .env or deployment config
INDEX_NOW_KEY=a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6
```

Scripts will automatically use `process.env.INDEX_NOW_KEY` if set, otherwise fallback to the default.

---

## Benefits for Your Site

| Metric | Impact |
|--------|--------|
| **Indexing Speed** | Hours instead of days |
| **GEO** | AI tools discover content sooner → higher citation likelihood |
| **Freshness** | Updated blog posts reflected in search results faster |
| **Featured Snippets** | Fresh, indexed content ranks faster for Q&A |
| **Crawl Efficiency** | Search engines don't waste budget on unchanged pages |

---

## Troubleshooting

### "HTTP 403 - Forbidden"
- Key file not found at `https://aymen.benyedder.top/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt`
- **Fix:** Verify file exists in root directory and was pushed to production

### "HTTP 429 - Too Many Requests"
- Rate limited (>100 requests per minute)
- **Fix:** Wait 5 minutes before retrying

### "HTTP 422 - Unprocessable Entity"
- URL doesn't belong to the domain or invalid format
- **Fix:** Ensure URLs are fully qualified: `https://aymen.benyedder.top/...`

---

## Next Steps

1. ✅ **Verify key file is live:**
   ```
   https://aymen.benyedder.top/a1b2c3d4e5f6g7h8i9j0k1l2m3n4o5p6.txt
   ```

2. ⏭️ **Push changes to production:**
   ```bash
   git add .github/scripts/
   git commit -m "Add IndexNow integration"
   git push origin main
   ```

3. ⏭️ **Test submission:**
   ```bash
   node scripts/indexnow-submit.js https://aymen.benyedder.top/
   ```

4. ⏭️ **(Optional) Add GitHub secret for CI/CD:**
   - `Settings → Secrets → INDEX_NOW_KEY`

---

**Questions?** Check IndexNow docs: https://www.indexnow.org/
