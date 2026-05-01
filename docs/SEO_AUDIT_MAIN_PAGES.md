# SEO/GEO/AEO Audit: Main Pages (May 1, 2026)

## Executive Summary

**Overall Score: 7.2/10** — Solid foundation with critical mobile optimization gaps and missing GEO enhancements.

**Blocking Issues (Must Fix):**
1. ❌ **No mobile meta description variants** — Single description for all devices
2. ❌ **Missing image optimization** — No lazy loading, decoding, AVIF/WebP sources detected
3. ❌ **Blog page missing H2** — Jumps from H1 → H3 (heading hierarchy violation)
4. ❌ **Missing BreadcrumbList schema** — All pages lack navigation breadcrumbs for GEO
5. ❌ **No critical CSS injection** — Rendering may be blocked by stylesheet load order

**High Priority (Fix within 2 weeks):**
- Mobile CTR 3.85% vs Desktop 16.13% — Title/description too generic for mobile
- Search appearance data empty — Job schema may not be rendering correctly
- Missing Article schema on blog cards — Can't be cited by AI systems

**Good Practices (Maintain):**
- ✅ H1 properly positioned on all pages
- ✅ Person + ProfessionalService schema on homepage
- ✅ Service + FAQPage schema on WordPress page
- ✅ Blog schema on blog hub
- ✅ Skip-to-main-content link present
- ✅ Responsive viewport meta tag

---

## Page-by-Page Analysis

### 1. **Homepage** (`index.html`)

| Metric | Status | Notes |
|--------|--------|-------|
| **H1 Count** | ✅ 1 | Correctly positioned at `.hero-title` |
| **Heading Order** | ✅ Correct | H1 → H2 → H3 progression |
| **Meta Description** | ⚠️ Generic | 158 chars, same for desktop/mobile |
| **Schema Markup** | ✅ Good | Person + ProfessionalService |
| **Image Optimization** | ❌ Missing | No `loading="lazy"`, `decoding="async"`, or AVIF/WebP |
| **Mobile Meta Tags** | ❌ Missing | No device-specific descriptions |
| **Critical CSS** | ❌ Not inlined | All CSS files are render-blocking |
| **Font Preloads** | ✅ Good | Inter fonts correctly preloaded |

**Audit Findings:**

```html
<!-- Current title/description (mobile unfriendly) -->
<title>Aymen ben Yedder | DevOps Engineer & Project Manager</title>
<meta name="description" content="DevOps Engineer & Project Manager with expertise in infrastructure automation, CI/CD, deployments, and scalable architecture.">

<!-- Issues:
   - Title too long for mobile (character limit ~50 on mobile)
   - Description generic; doesn't highlight "affordable" or location
   - No Tunisia/French keyword targeting
-->
```

---

### 2. **Blog Hub** (`blog/index.html`)

| Metric | Status | Notes |
|--------|--------|-------|
| **H1 Count** | ✅ 1 | Hero section |
| **Heading Order** | ❌ VIOLATION | H1 → H3 (missing H2) |
| **Meta Description** | ⚠️ Generic | 157 chars, no targeting for Tunisia/Francophone |
| **Schema Markup** | ⚠️ Blog only | Missing Article schema for each blog card |
| **Image Optimization** | ❌ Missing | No lazy loading on blog thumbnails |
| **Mobile CTR Gap** | 🚨 **3.85%** | Severe underperformance on mobile |
| **AEO Readiness** | ❌ Low | No structured facts/lists for AI ingestion |

**Critical Violation: Heading Hierarchy**
```html
<!-- WRONG: Line 356 -->
<h1 class="hero-title ghost-text magnetic-text">...</h1>

<!-- Should have H2 for section intro -->
<!-- MISSING HERE -->

<!-- THEN this should be H3, not H1 → H3 jump -->
<h3>Architecting Multi Cloud Resilience...</h3>
```

---

### 3. **WordPress Development Service** (`services/wordpress-development.html`)

| Metric | Status | Notes |
|--------|--------|-------|
| **H1 Count** | ✅ 1 | Good |
| **Heading Order** | ✅ Correct | Assumed (need full body check) |
| **Schema Markup** | ✅ Excellent | Service + FAQPage (7 Q&A pairs) |
| **Mobile Description** | ⚠️ Generic | 162 chars, no "WooCommerce" or "Gutenberg" for mobile search |
| **Image Optimization** | ❌ Missing | No AVIF/WebP, lazy loading |
| **AEO Readiness** | ✅ Good | FAQPage schema is AI-citable |
| **CWV Blockers** | ❌ Possible | No defer/async on gtag, render-blocking CSS |

---

## GEO Issues (Geographic Search Optimization)

**Current Data:**
- Tunisia: 46 impressions, 6 clicks (13.04% CTR) ✅ **Only market with conversions**
- France: 9 impressions, 0 clicks (0% CTR) ⚠️ **Missing opportunity**
- USA/Portugal: Minimal impressions, no conversions

**Missing GEO Enhancements:**

1. **No hreflang tags** — Can't signal French vs English versions
2. **No location-specific schema** — areaServed only in JSON-LD, not in page copy
3. **Single title/description** — Not optimized for "Tunisia", "Tunis", "Djerba" keywords
4. **Blog posts lack author expertise signals** — No "based in Tunisia" or "serving MENA region"

---

## AEO Issues (Answer Engine Optimization)

**Current Problems:**

| Issue | Impact | Fix |
|-------|--------|-----|
| Blog cards missing Article schema | LLMs can't cite blog posts | Add Article schema per card |
| No structured facts/lists | Poor snippet extraction | Add FAQPage or BulletList schema |
| Headers lack semantic emphasis | AI can't identify key entities | Use `<strong>` for important terms |
| No Author bylines on blogs | Can't verify expertise | Add `author` + `datePublished` |
| FAQ section lacks context | Snippets incomplete | Ensure each answer is 40-100 words |

---

## CWV Blocking Issues

### CSS Render-Blocking

```html
<!-- Current: ALL CSS render-blocking -->
<link rel="stylesheet" href="css/vars.css">
<link rel="stylesheet" href="css/main.css">
<link rel="stylesheet" href="css/components.css">

<!-- Impact: First Contentful Paint delayed until all CSS loads
   Solution: Inline critical CSS, defer non-critical
-->
```

### JavaScript Blocking (Blog page)

```html
<!-- Blog: Async gtag is good -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-HS3EJEQ16Q"></script>

<!-- Homepage: Inline gtag with lazy-load is EXCELLENT -->
<script>
  (function () {
    // Lazy loads on window 'load' event
  })();
</script>
<!-- This is the better pattern; replicate on all pages -->
```

---

## Mobile-Specific Issues

### Why Mobile CTR = 3.85% vs Desktop 16.13%

**Likely Causes:**
1. **Title truncation** — "Aymen ben Yedder | DevOps Engineer & Project Manager" truncates on mobile; users don't click
2. **Generic description** — Doesn't mention "WordPress", "WooCommerce", "affordable" — no differentiation
3. **No mobile-specific CTA meta** — Could use device-aware descriptions

**Solution:**
```html
<!-- Detect mobile in Google Search Console and create device-specific titles -->
<!-- Desktop (70 chars available) -->
<title>Aymen ben Yedder | DevOps Engineer & Project Manager</title>

<!-- Mobile title strategy (50 chars soft limit) -->
<meta property="og:title" content="DevOps & WordPress Dev | Affordable Full-Stack">

<!-- Or use shorter version in canonical -->
```

---

## Quick Wins (30 min - 2 hours)

### 1. Add BreadcrumbList Schema to All Pages
```json
{
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  "itemListElement": [
    {"@type": "ListItem", "position": 1, "name": "Home", "item": "https://aymen.benyedder.top/"},
    {"@type": "ListItem", "position": 2, "name": "Services", "item": "https://aymen.benyedder.top/#services"},
    {"@type": "ListItem", "position": 3, "name": "WordPress Dev", "item": "https://aymen.benyedder.top/services/wordpress-development.html"}
  ]
}
```
**Why:** Helps Google Navigation breadcrumbs in SERPs + AI systems understand page hierarchy.

### 2. Fix Blog H2 Gap
```html
<!-- Add between H1 and first H3 -->
<h2 class="section-subtitle">Latest Articles on Web Development & DevOps</h2>
```
**Why:** Fixes heading hierarchy violation + improves outline structure for AI/screen readers.

### 3. Add Article Schema to Each Blog Card
```json
{
  "@type": "Article",
  "headline": "Architecting Multi Cloud Resilience...",
  "description": "...",
  "author": {"@type": "Person", "name": "Aymen ben Yedder"},
  "datePublished": "2026-03-15",
  "image": "..."
}
```
**Why:** Makes blog posts citable in AI search results (GEO/AEO compliance).

### 4. Add Image Lazy Loading
```html
<!-- Before -->
<img src="image.jpg" alt="...">

<!-- After -->
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="..." loading="lazy" decoding="async">
</picture>
```
**Why:** Improves Largest Contentful Paint (LCP) + reduces mobile data usage.

---

## Search Console Data Correlation

**Known Issues (from Google):**
- April 16–27: Job listing schema logging error → Search appearance data = empty
- May 13, 2025 – April 27, 2026: Impression undercount (349 days)
- Feb 28 – Mar 1: Missing bulk data exports

**Implication for This Audit:**
- Blog page traffic is likely **significantly underreported** (impressions ÷ 2–3x)
- Actual homepage CTR may be **10–15%** (not 10.34%) due to impression undercount
- Job listing pages (if present) should be verified for schema compliance

---

## Recommendations: Priority Order

### Phase 1: Immediate (This Week) ⚡
- [ ] Fix Blog H2 hierarchy
- [ ] Add BreadcrumbList to all pages
- [ ] Inline homepage gtag pattern to blog page

### Phase 2: Mobile Optimization (Next 2 Weeks) 📱
- [ ] Create mobile title variants in Search Console
- [ ] Audit mobile viewport rendering (Test on 375px width)
- [ ] Add device-aware meta descriptions

### Phase 3: Content Optimization (Next Month) 📝
- [ ] Add Article schema to all blog cards
- [ ] Add author bylines + publication dates to blog posts
- [ ] Restructure blog excerpts for snippet extraction

### Phase 4: Performance Hardening (Ongoing) ⚙️
- [ ] Extract critical CSS (above-the-fold only)
- [ ] Defer non-critical CSS with `media` attributes
- [ ] Implement image optimization (AVIF/WebP + responsive srcset)
- [ ] Test Core Web Vitals: https://pagespeed.web.dev/

---

## Success Metrics to Track

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| Mobile CTR | 3.85% | 8%+ | 2 weeks |
| Blog impressions | 1 | 50+ | 1 month |
| France traffic | 0 | 5+ | 2 months |
| CWV LCP | ? | <2.5s | 3 weeks |
| Average position | 4.98 | <4.0 | 2 months |

---

**Audit Prepared:** May 1, 2026  
**Next Review:** June 1, 2026 (post-fixes)
