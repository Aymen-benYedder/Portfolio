# RUM & Monitoring Setup Guide

**Purpose:** Track real-world performance, visibility gains, and AEO/GEO effectiveness post-launch.

---

## 1. Core Web Vitals Monitoring (Real User Monitoring)

### Option A: Google Analytics 4 (Recommended for Portfolio)

**Setup Steps:**

1. **Install web-vitals Library:**
```bash
npm install web-vitals
```

2. **Add to index.html and key pages:**
```html
<script type="module">
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'https://cdn.jsdelivr.net/npm/web-vitals@4/+esm';

// Send to Google Analytics
function sendToAnalytics(metric) {
  gtag('event', `page_view`, {
    metric_name: metric.name,
    metric_value: metric.value,
    metric_delta: metric.delta,
    metric_id: metric.id,
  });
}

getCLS(sendToAnalytics);
getFID(sendToAnalytics);
getFCP(sendToAnalytics);
getLCP(sendToAnalytics);
getTTFB(sendToAnalytics);
</script>
```

3. **Monitor in GA4:**
   - Reports → Engagement → Events
   - Filter for `page_view` events with CWV metrics
   - Segment by device, page, geography

### Option B: Google CrUX (Chrome User Experience Report)

**Passive Collection (No Code Required):**
- Google automatically collects real user data for pages indexed in Search Console
- No manual instrumentation needed
- Requires 28+ days of data for reports

**Access CrUX Data:**
1. Sign in to [Search Console](https://search.google.com/search-console)
2. Select property → Experience → Core Web Vitals
3. View historical trends and page-level details

### Option C: PageSpeed Insights API (Automated Monitoring)

**Create a monitoring script (scripts/monitor-cwv.mjs):**
```javascript
import fetch from 'node-fetch';

const BASE_URL = 'https://aymen.benyedder.top';
const API_KEY = process.env.PSI_API_KEY; // Get from Google Cloud Console

const pages = [
  '/',
  '/blog/',
  '/services/mern-development.html',
  '/services/wordpress-development.html'
];

async function checkCWV(page) {
  const url = `https://pagespeedonline.googleapis.com/pagespeedonline/v5/runPagespeed`;
  const params = new URLSearchParams({
    url: `${BASE_URL}${page}`,
    key: API_KEY,
    strategy: 'mobile' // or 'desktop'
  });

  const res = await fetch(`${url}?${params}`);
  const data = await res.json();
  
  const metrics = data.lighthouseResult.audits['metrics'].details.items[0];
  
  console.log(`📊 ${page}`);
  console.log(`  LCP: ${(metrics.largest_contentful_paint / 1000).toFixed(2)}s`);
  console.log(`  CLS: ${metrics.cumulative_layout_shift.toFixed(3)}`);
  console.log(`  FID: ${(metrics.first_input_delay / 1000).toFixed(2)}s`);
  console.log(`  Score: ${data.lighthouseResult.categories.performance.score * 100}`);
}

for (const page of pages) {
  await checkCWV(page);
}
```

**Add to GitHub Actions (workflows/monitor-cwv.yml):**
```yaml
name: Monitor Core Web Vitals

on:
  schedule:
    - cron: '0 9 * * 1' # Weekly on Monday
  workflow_dispatch:

jobs:
  monitor:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run CWV Check
        env:
          PSI_API_KEY: ${{ secrets.PSI_API_KEY }}
        run: node scripts/monitor-cwv.mjs
```

**Target Benchmarks:**
- LCP: < 2.5s (good), < 4s (needs improvement)
- CLS: < 0.1 (good), < 0.25 (needs improvement)
- FID: < 100ms (good), < 300ms (needs improvement)

---

## 2. Search Console Integration

### Setup:

1. **Claim Property:**
   - Go to [Search Console](https://search.google.com/search-console/about)
   - Add `https://aymen.benyedder.top` as property
   - Verify via DNS TXT record (already configured via CNAME)

2. **Submit Sitemap:**
   - Settings → Sitemaps
   - Submit `https://aymen.benyedder.top/sitemap.xml`
   - Verify auto-discovery at `robots.txt`

3. **Monitor Key Metrics:**

| Metric | Target | How to Check |
|--------|--------|-------------|
| Indexed Pages | 20-30+ | Coverage → Indexed pages |
| Clicks | +100% post-launch | Performance → Impressions + CTR |
| Avg Position | Top 3 keywords | Performance → Queries |
| Coverage Issues | 0 warnings | Coverage → Issues |
| Mobile Usability | 100% | Mobile Usability → 0 errors |

### Alerts Setup:

1. **Enable Email Alerts:**
   - Settings → Notifications
   - Enable: Coverage issues, Indexation, Mobile usability

2. **Monitor Featured Snippets:**
   - Performance → Filter by "featured snippet"
   - Target: 5+ snippets from blog posts
   - Each snippet = +20% CTR on average

---

## 3. Rich Results Monitoring

### Validate Schema:

1. **Google Rich Results Test:**
   ```
   https://search.google.com/test/rich-results?url=https://aymen.benyedder.top/blog/sample-post.html
   ```
   Expected: Article, BreadcrumbList, FAQPage (green checkmarks)

2. **JSON-LD Validator:**
   ```
   https://validator.schema.org/
   ```
   Expected: No errors, warnings only for optional fields

### Monitor in Search Console:

- **Experience > Core Web Vitals:** Desktop, mobile, tablet segments
- **Enhancement > Robots.txt Tester:** Verify robots.txt crawlability
- **Enhancement > Sitemaps:** Track indexation progress

---

## 4. Broken Link Detection (Synthetic Monitoring)

### Option A: GitHub Actions Broken Link Checker

**Create workflow (workflows/link-check.yml):**
```yaml
name: Check Broken Links

on:
  schedule:
    - cron: '0 0 * * 1' # Weekly
  pull_request:

jobs:
  linkcheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check Links
        run: |
          npm install -g hyperlink
          hyperlink "https://aymen.benyedder.top" --recursive --skip-file .linkcheck-skip
```

### Option B: Manual Link Audit (scripts/check-links.mjs)

```javascript
import fs from 'fs';
import path from 'path';
import { JSDOM } from 'jsdom';

const baseDir = './';
const results = {};

function findLinks(file) {
  const content = fs.readFileSync(file, 'utf-8');
  const dom = new JSDOM(content);
  const links = Array.from(dom.window.document.querySelectorAll('a[href]'));
  
  return links.map(a => ({
    href: a.getAttribute('href'),
    text: a.textContent,
    file: file
  }));
}

function validateLink(link) {
  // Check internal links exist
  if (link.href.startsWith('/') && !link.href.includes('//')) {
    const filePath = path.join(baseDir, link.href.replace('.html', ''));
    if (!fs.existsSync(filePath + '.html') && !fs.existsSync(filePath + '/index.html')) {
      return { valid: false, reason: '404' };
    }
  }
  return { valid: true };
}

// Scan all HTML files
const files = fs.readdirSync(baseDir).filter(f => f.endsWith('.html'));
files.forEach(file => {
  const links = findLinks(file);
  results[file] = links.map(l => ({...l, ...validateLink(l)}));
});

// Report
const broken = Object.entries(results)
  .flatMap(([file, links]) => links.filter(l => !l.valid).map(l => ({...l, file})));

if (broken.length > 0) {
  console.log('❌ Broken links found:');
  broken.forEach(l => console.log(`  ${l.file}: ${l.href} (${l.reason})`));
  process.exit(1);
} else {
  console.log('✅ All links valid');
}
```

---

## 5. Monitoring Dashboard (Optional)

### Setup with Google Data Studio:

1. **Connect GA4 data source:**
   - Create new report in [Data Studio](https://datastudio.google.com)
   - Add GA4 property
   - Add CWV metrics as cards

2. **Dashboard Layout:**
   ```
   [Core Web Vitals]        [Search Console Overview]
   LCP | CLS | FID          Clicks | Impressions | CTR
   
   [Top Performing Pages]   [Mobile vs Desktop]
   [Indexed Pages Trend]    [Featured Snippet Count]
   ```

3. **Refresh Schedule:** Daily (automatic)

---

## 6. Target Metrics (Post-Launch)

| Metric | Current | Target (30 days) | Target (90 days) |
|--------|---------|------------------|------------------|
| **Core Web Vitals** |
| LCP | TBD | < 2.5s | < 2.0s |
| CLS | TBD | < 0.1 | < 0.05 |
| FID | TBD | < 100ms | < 50ms |
| **Search Visibility** |
| Indexed Pages | 0 | 20+ | 25+ |
| Search Clicks | 0 | +50 | +150 |
| Avg Position | N/A | Top 5 | Top 3 |
| Featured Snippets | 0 | 3-5 | 8-10 |
| **User Engagement** |
| Avg Session Duration | - | 2+ min | 3+ min |
| Bounce Rate | - | < 50% | < 40% |
| Click-Through Rate | - | +15% vs baseline | +30% |

---

## 7. Monthly Review Checklist

Every first Monday:

- [ ] Pull CWV report from CrUX / GA4
- [ ] Check Search Console for new indexation issues
- [ ] Audit featured snippets (count, CTR improvement)
- [ ] Run link checker on updated pages
- [ ] Review top keywords and click trends
- [ ] Compare against benchmarks (above table)
- [ ] Document learnings in `METRICS_REVIEW.md`

---

## 8. Alert Thresholds

| Issue | Threshold | Action |
|-------|-----------|--------|
| LCP > 3s | Any page | Optimize images, defer JS |
| CLS > 0.15 | Any page | Fix layout shifts, add size attributes |
| Broken Links | 1+ | Fix immediately, add to CI |
| Coverage Errors | 1+ | Investigate in Search Console |
| Indexed ↓ 10% | Week-over-week | Check robots.txt, canonicals |
| Featured Snippets ↓ | Month-over-month | Audit schema, update content |

---

## Next Steps

1. **Set up GA4 CWV tracking** (high priority)
2. **Claim Search Console property** (high priority)
3. **Create monitor-cwv.mjs script** (medium priority)
4. **Add link-check workflow** (medium priority)
5. **Set up Data Studio dashboard** (low priority, nice-to-have)
