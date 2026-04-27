# SEO & Accessibility Audit — `index.html` & `blog/index.html`

Date: 2026-04-27
Scope: `index.html` (root) and `blog/index.html` (blog archive)

SUMMARY (high level)
- Both pages contain core SEO metadata (title, description, canonical) and social cards (OG/Twitter).
- Structured data exists: root uses `Person` + `ProfessionalService`, blog index uses `Blog` schema — good baseline.
- Accessibility: skip-link present, `nav` landmarks used, important buttons include `aria-label` — good.
- Performance: fonts are preloaded, main JS files use `defer`, analytics loading is lazy in root. Still opportunities to improve LCP and overall CWV.

PRIORITY ISSUES & RECOMMENDATIONS (actionable)

1) Heading hierarchy on blog index — High
- Issue: page-level H1 exists (`TECHNICAL BLOG`) but article cards use `h3` for titles. This can reduce scannability for crawlers and AEO/GEO models.
- Fix: change article card titles to `h2` (or wrap posts in `section` with appropriate heading levels) so hierarchy is H1 → H2 (posts) → H3 (subheadings).
- Why: LLMs and search engines rely on strict heading sequences to extract sections and content boundaries — correct headings improve snippet extraction and content chunking.

2) Missing Article JSON-LD on individual posts — High
- Issue: blog index has `Blog` schema, root has `Person`/`ProfessionalService`, but individual post pages must include full `Article` schema.
- Fix: insert `application/ld+json` Article schema for each post (include `headline`, `author`, `datePublished`, `dateModified`, `mainEntityOfPage`, `image` with width/height, `publisher`).
- Template (copy-paste):
```json
{
  "@context": "https://schema.org",
  "@type": "Article",
  "mainEntityOfPage": {"@type":"WebPage","@id":"{{url}}"},
  "headline": "{{title}}",
  "description": "{{description}}",
  "image": {"@type":"ImageObject","url":"{{imageUrl}}","width":{{width}},"height":{{height}}},
  "author": {"@type":"Person","name":"Aymen ben Yedder","url":"https://aymen.benyedder.top"},
  "publisher": {"@type":"Organization","name":"AYMEN.DEV","logo":{"@type":"ImageObject","url":"https://aymen.benyedder.top/assets/img/preview.webp"}},
  "datePublished": "{{datePublished}}",
  "dateModified": "{{dateModified}}"
}
```
- Why: Article schema increases the chance an LLM or SERP feature cites the page as the authoritative answer and enables rich results.

3) Images: add dimensions and responsive sources — High
- Issue: OG image is webp; however in-body images lack explicit width/height attributes, srcset, or lazy-loading in templates.
- Fix: ensure all `<img>` tags include `width` and `height`, `loading="lazy"`, `decoding="async"`, and provide `srcset`/`sizes` with AVIF/WebP fallbacks. Preload the hero image if it's critical.
- Why: Explicit dimensions prevent layout shifts (CLS); responsive images reduce bandwidth and LCP.

4) Critical CSS & render-blocking styles — High/Medium
- Issue: full CSS files are linked in head; consider extracting critical CSS for hero/above-the-fold content.
- Fix: inline minimal critical CSS for hero and nav; defer non-critical CSS via `media="print" onload="this.media='all'"` pattern or use server-side critical CSS injection.
- Why: Reduces time-to-first-contentful-paint and improves LCP for crawlers and users.

5) Analytics snippet handling — Medium
- Observation: root `index.html` lazy-loads gtag via requestIdleCallback; blog index runs gtag async directly in head. Standardize to lazy-load analytics after first paint (or via consent) to reduce competition with LCP.
- Why: Delaying analytics reduces main-thread contention at startup and improves CWV.

6) ARIA and mobile menu semantics — Medium
- Issue: blog `nav-toggle` lacks `aria-controls` and `aria-expanded` management in some places; ensure toggles update `aria-expanded` and that focus is trapped/returned when menu opens/closes.
- Fix: Add `aria-controls="mobile-menu"` and script to toggle `aria-expanded`. Add `focus` management for the mobile menu.
- Why: Improves keyboard navigation and ensures automated tools (and LLMs parsing DOM snapshots) see correct interactive states.

7) Sitemap & robots — High
- Issue: No `sitemap.xml` or reference in robots.txt found in repo.
- Fix: Add `sitemap.xml` generation during build and add `Sitemap: https://aymen.benyedder.top/sitemap.xml` to `robots.txt`. Ensure canonical URLs match sitemap entries.
- Why: Sitemap speeds indexing and helps search engines discover all posts; critical for AEO/GEO visibility of new content.

8) BreadcrumbList schema — Medium
- Recommendation: Add `BreadcrumbList` JSON-LD on article pages and critical category pages.
- Why: Breadcrumbs increase the probability of enhanced SERP features and help LLMs map site hierarchy.

9) AEO-friendly content blocks — Medium
- Recommendation: For tutorial and how-to posts, add `FAQPage` schema where appropriate and include short Q&A blocks at top that answer common queries in 1-2 lines. Produce a short structured summary (3-5 bullets) at article top for ZERO-CLICK targets.
- Why: Answers are favored by answer engines and voice assistants.

10) CI & preflight checks — Medium
- Recommendation: Add a CI job to run Lighthouse (headless) for performance/SEO benchmarks, a JSON-LD validator, and a broken-link checker on each PR.
- Why: Prevent regressions and enforce visibility guardrails in PR workflow.

IMPLEMENTATION SPRINT (practical next commits)
1. Update blog index article headings: `h3` → `h2` (minor template change).
2. Add Article JSON-LD template to each blog post file and `template.html`.
3. Add `width`/`height`, `loading`, and `decoding` attributes to all `<img>` in templates; add `srcset` for hero/preview images.
4. Create `scripts/generate-sitemap.mjs` to programmatically build `sitemap.xml` from `blog/*.html` and other canonical pages. Add `robots.txt` with sitemap reference.
5. Add GitHub Actions workflow `seo-check.yml` to run Lighthouse, link-checker, and schema validator on PRs.

METRICS TO TRACK
- LCP (target < 2.5s)
- CLS (target < 0.1)
- INP / TTFB improvements
- Number of indexed pages (via Search Console)
- Rich results impressions (via Search Console)

FINAL NOTES
- This audit is file-based and static; run a headless Lighthouse and Lighthouse CI on a staging deploy for precise numeric measurements.
- Next: I can implement the `Article` JSON-LD insertion for all `blog/*.html` files and create the sitemap generator. Which should I do first?
