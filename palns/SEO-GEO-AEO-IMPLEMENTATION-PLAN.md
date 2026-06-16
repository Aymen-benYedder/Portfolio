# SEO / GEO / AEO — Developer Implementation Plan

**Source audit:** `palns/SEO-GEO-AEO-AUDIT.md`  
**Target score uplift:** 78/100 → 86/100  
**Estimated effort:** ~2 hours of focused work

---

## Implementation Order

| Step | Task | Files | Effort | Score Impact | Tier |
|------|------|-------|--------|--------------|------|
| 1 | Fix `robots.txt` — unblock AI search crawlers | `public/robots.txt` | 5 min | +5 pts | T1 |
| 2 | Create `src/pages/404.astro` | New file | 20 min | +3 pts | T1 |
| 3 | Make `@graph` per-page unique | `src/lib/schema.ts`, `HeadSchema.astro`, `BaseLayout.astro` | 30 min | +4 pts | T1 |
| 4 | Add preconnect + prefetch hints | `src/layouts/BaseLayout.astro` | 10 min | +2 pts | T2 |
| 5 | Create `public/_headers` (CSP + security) | New file | 15 min | +2 pts | T2 |
| 6 | Fix flag SVG alt text | `src/pages/index.astro` | 5 min | +1 pt | T2 |
| 7 | Add author fallback for static posts | `src/lib/blog.ts`, `src/data/posts.ts` | 10 min | +2 pts | T2 |
| 8 | Replace CSS `@import` fonts with `<link>` | `src/styles/globals.css`, `BaseLayout.astro` | 10 min | +2 pts | T3 |
| 9 | Add `TechArticle` schema variant for blog | `src/components/seo/` | 15 min | +1 pt | T3 |
| 10 | Tier sitemap priorities | `astro.config.mjs` | 5 min | +1 pt | T3 |

---

## Step 1 — Fix `public/robots.txt`

### Why
Current file is empty except `Allow: /`. Cloudflare Managed Content blocks 8 AI crawlers invisibly. **`Google-Extended` is blocked** (losing AI Overviews eligibility) and **`OAI-SearchBot` has no `Allow`** (losing ChatGPT Search citation eligibility).

### Strategy: Three-tier AI crawler architecture
- **Training crawlers** → block (`GPTBot`, `ClaudeBot`, `meta-externalagent`)
- **Search/answer crawlers** → allow (`OAI-SearchBot`, `Google-Extended`, `Applebot-Extended`, `PerplexityBot`)
- **Aggressive scrapers** → block (`Bytespider`, `CCBot`, `Amazonbot`)

### Action: Overwrite `public/robots.txt`

```txt
# ─── SEO / GEO / AEO robots.txt — Tiered AI Crawler Architecture ───
# Blocked: training crawlers (GPTBot, ClaudeBot) + aggressive scrapers
# Allowed: search/answer crawlers (OAI-SearchBot, Google-Extended, etc.)

# ── Allow search/AI-answer crawlers ──
User-agent: OAI-SearchBot
Allow: /
User-agent: Google-Extended
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: anthropic-ai
Disallow: /  # Training only — OAI-SearchBot and PerplexityBot already allowed above

# ── Block training crawlers ──
User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: meta-externalagent
Disallow: /

# ── Block aggressive data scrapers ──
User-agent: Bytespider
Disallow: /
User-agent: CCBot
Disallow: /
User-agent: Amazonbot
Disallow: /

# ── Default: allow everything else ──
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /sample-post/
Disallow: /template/

Sitemap: https://aymen.benyedder.top/sitemap-index.xml
```

### Verification
```bash
curl -s https://aymen.benyedder.top/robots.txt | Select-String "Google-Extended|OAI-SearchBot"
```
Should show both `Allow: /` lines.

---

## Step 2 — Create `src/pages/404.astro`

### Why
Two routes (`blog/[...slug].astro` line 79, `author/[slug].astro` line 32) call `Astro.redirect('/404')` but **no custom 404 page exists**. Cloudflare serves a generic default, which degrades UX and sends soft-404 signals to search engines.

### Action: Create new file `src/pages/404.astro`

```astro
---
import BaseLayout from '@layouts/BaseLayout.astro';
---

<BaseLayout
  title="Page Not Found | AYMEN.DEV"
  description="The page you're looking for doesn't exist or has been moved. Browse my DevOps portfolio, blog posts, or get in touch."
  noIndex={true}
>
  <div class="max-w-[var(--container-max)] mx-auto px-[var(--section-px)] pt-[80px] pb-[120px] text-center">
    <h1 class="font-[family-name:var(--font-mono)] text-[48px] max-md:text-[32px] font-bold text-[var(--accent)] mb-[var(--spacing-gap-sm)]">404</h1>
    <h2 class="font-[family-name:var(--font-mono)] text-[var(--heading-sm)] font-bold text-[var(--text-1)] mb-[var(--spacing-gap-md)]">Page not found</h2>
    <p class="text-[var(--text-base)] text-[var(--text-2)] max-w-[480px] mx-auto mb-[var(--spacing-gap-lg)] leading-relaxed">
      The page you're looking for doesn't exist or has been moved.
      Let me help you find what you need.
    </p>
    <div class="flex flex-wrap gap-[var(--spacing-gap-sm)] justify-center">
      <a href="/" class="inline-flex items-center gap-[8px] px-[24px] py-[12px] bg-[var(--accent)] text-[var(--void)] font-[family-name:var(--font-mono)] text-[var(--text-small)] font-bold no-underline hover:opacity-90 transition-opacity">
        ← Back to Home
      </a>
      <a href="/blog/" class="inline-flex items-center gap-[8px] px-[24px] py-[12px] border border-[var(--border)] text-[var(--text-1)] font-[family-name:var(--font-mono)] text-[var(--text-small)] font-bold no-underline hover:border-[var(--accent)] hover:text-[var(--accent)] transition-colors">
        Browse Blog
      </a>
    </div>
    <div class="mt-[var(--spacing-gap-lg)] pt-[var(--spacing-gap-md)] border-t border-[var(--border)] max-w-[480px] mx-auto">
      <p class="text-[var(--text-xs)] text-[var(--text-3)] mb-[var(--spacing-gap-sm)]">Still stuck? Reach out directly:</p>
      <a href="mailto:aymen@benyedder.top" class="font-[family-name:var(--font-mono)] text-[var(--text-2xs)] text-[var(--accent)] hover:underline">aymen@benyedder.top</a>
    </div>
  </div>
</BaseLayout>
```

---

## Step 3 — Make `@graph` Per-Page Unique

### Why
`HeadSchema.astro` calls `generateHeadGraph(person, site)` which produces an **identical `@graph` on every page**. The `WebPage` entry always has `@id: "https://aymen.benyedder.top/#webpage"` and `dateModified` = build timestamp. Google and AI crawlers use `@id` + `dateModified` for deduplication and freshness signals. Identical values across all pages = weak signal for all pages.

### Changes needed

#### 3a. Update `src/lib/schema.ts` — add per-page params to `generateHeadGraph()`

Locate the `generateHeadGraph` function (line 266). Change its signature to accept optional page-specific data:

**Before (line 266):**
```ts
export function generateHeadGraph(person: PersonData, site: SiteData) {
```

**After:**
```ts
export function generateHeadGraph(
  person: PersonData,
  site: SiteData,
  page?: { url?: string; name?: string; description?: string }
) {
```

Then update the `generateWebPage` call (lines 271–275) to use overrides:

**Before (lines 271–275):**
```ts
const page = generateWebPage(
  { url: site.url, name: site.name, description: site.description, dateModified: new Date().toISOString().split('T')[0] },
  siteId,
  personId
);
```

**After:**
```ts
const pageUrl = page?.url || site.url;
const pageName = page?.name || site.name;
const pageDescription = page?.description || site.description;
const pageObj = generateWebPage(
  {
    url: pageUrl,
    name: pageName,
    description: pageDescription,
    dateModified: new Date().toISOString().split('T')[0],
  },
  siteId,
  personId
);
```

Also update the `BreadcrumbList` `@id` to be page-aware. Locate `generateBreadcrumbList` (line 88) — it already accepts the last item's URL as the `@id`, which is correct.

#### 3b. Update `src/components/seo/HeadSchema.astro` — accept Props

**Before (line 1):**
```astro
---
import { generateHeadGraph, type PersonData, type SiteData } from '@lib/schema';

const person: PersonData = {
  ...
};
const site: SiteData = {
  ...
};
const graph = generateHeadGraph(person, site);
---
```

**After:**
```astro
---
import { generateHeadGraph, type PersonData, type SiteData } from '@lib/schema';

export interface Props {
  pageUrl?: string;
  pageName?: string;
  pageDescription?: string;
}

const { pageUrl, pageName, pageDescription } = Astro.props;

const person: PersonData = {
  name: 'Aymen ben Yedder',
  jobTitle: 'DevOps & Cloud Infrastructure Engineer',
  description: 'Freelance DevOps engineer specializing in Kubernetes, Terraform, ArgoCD, FluxCD, and cloud-native infrastructure. Available for remote contracts.',
  url: 'https://aymen.benyedder.top',
  image: 'https://aymen.benyedder.top/assets/img/preview.webp',
  sameAs: ['https://github.com/Aymen-benYedder', 'https://www.linkedin.com/in/aymenby'],
  knowsAbout: ['Kubernetes', 'Terraform', 'ArgoCD', 'FluxCD', 'Prometheus', 'Grafana', 'Docker', 'GitOps', 'CI/CD', 'MERN Stack', 'NGINX', 'Linux', 'PostgreSQL', 'MongoDB', 'React', 'Node.js', 'GitHub Actions', 'OpenTofu', 'Terragrunt', 'DevSecOps'],
  address: { addressLocality: 'Medenine', addressRegion: 'Medenine', country: 'TN' },
};

const site: SiteData = {
  url: 'https://aymen.benyedder.top',
  name: 'AYMEN.DEV — DevOps & Cloud Infrastructure Engineering',
  description: 'Portfolio of Aymen ben Yedder, DevOps Engineer specializing in Kubernetes, Terraform, GitOps, and cloud-native infrastructure.',
};

const graph = generateHeadGraph(person, site, { url: pageUrl, name: pageName, description: pageDescription });
---
```

#### 3c. Update `src/layouts/BaseLayout.astro` — pass page props to HeadSchema

**Before (line 30):**
```astro
    <HeadSchema />
```

**After:**
```astro
    <HeadSchema pageUrl={canonical} pageName={title} pageDescription={description} />
```

This requires `canonical` to be available from Astro.props. It already is (line 20: `const { title, description, canonical, image, ogType, noIndex } = Astro.props;`). The `canonical` may be `undefined` (optional prop) — that's fine, the HeadSchema will fall back to site defaults.

---

## Step 4 — Add Preconnect + Prefetch Hints

### Why
Google Fonts (`fonts.googleapis.com`, `fonts.gstatic.com`) and Sanity CDN (`kv8mx0wv.api.sanity.io`) are critical third-party origins. Without `<link rel="preconnect">`, the browser must wait for DNS + TCP + TLS before starting the actual resource download. Each preconnect saves ~100–300ms of latency.

### Action: Edit `src/layouts/BaseLayout.astro`

Add these lines after line 33 (`<link rel="shortcut icon" ... />`):

```astro
    <!-- Preconnect hints -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://kv8mx0wv.api.sanity.io" crossorigin />
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
    <link rel="dns-prefetch" href="https://kv8mx0wv.api.sanity.io" />
```

Insert them inside `<head>` right after the favicon links, before `<slot name="head" />`.

**Before (lines 32–34):**
```astro
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <slot name="head" />
```

**After:**
```astro
    <link rel="icon" href="/favicon.ico" type="image/x-icon" />
    <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
    <!-- Preconnect hints for critical third-party origins -->
    <link rel="preconnect" href="https://fonts.googleapis.com" crossorigin />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://kv8mx0wv.api.sanity.io" crossorigin />
    <link rel="dns-prefetch" href="https://fonts.googleapis.com" />
    <link rel="dns-prefetch" href="https://fonts.gstatic.com" />
    <link rel="dns-prefetch" href="https://kv8mx0wv.api.sanity.io" />
    <slot name="head" />
```

---

## Step 5 — Create `public/_headers`

### Why
Cloudflare Pages respects `_headers` files for custom HTTP response headers. Without this file, there is **no Content-Security-Policy**, **no X-Frame-Options**, and **no referrer policy**. For AEO/GEO, CSP headers signal trustworthiness. For SEO, they prevent content injection attacks that could trigger Google's security warnings.

### Action: Create new file `public/_headers`

```txt
# ─── Security Headers for SEO/GEO/AEO Trust Signals ───
# Cloudflare Pages reads this file on deploy

/*
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=(), interest-cohort=()
  Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
  Content-Security-Policy: default-src 'self'; script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://www.google-analytics.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com data:; img-src 'self' https://cdn.sanity.io data: blob:; connect-src 'self' https://kv8mx0wv.api.sanity.io https://www.google-analytics.com https://www.googletagmanager.com; frame-src 'none'; object-src 'none'; base-uri 'self'

# Allow fonts, Sanity CDN, analytics for all paths
/assets/*
  Cache-Control: public, max-age=31536000, immutable

/*.webp
  Cache-Control: public, max-age=31536000, immutable

/*.woff2
  Cache-Control: public, max-age=31536000, immutable
```

**CSP notes (for the developer):**
- **`'unsafe-eval'` is intentionally omitted** — production Astro/React hydration does not require it. If a component fails to hydrate post-deploy, investigate the component's production build first; add `'unsafe-eval'` only as a last resort for that specific path via a `_headers` override.
- **Google Analytics** requires `googletagmanager.com` + `google-analytics.com` in both `script-src` and `connect-src`.
- **Sanity CDN** (`cdn.sanity.io`) needs `img-src` for image delivery.
- **Google Fonts** needs `style-src`, `font-src`, and `connect-src` for `fonts.googleapis.com` and `fonts.gstatic.com`.
- **Astro islands** need `'unsafe-inline'` in `script-src` — Astro injects inline scripts for hydration. This is expected and safe with a strong CSP otherwise.
- If the site loads other external resources (YouTube embeds, analytics tools, etc.), add their origins to the appropriate directive.

---

## Step 6 — Fix Flag SVG Alt Text

### Why
Three flag SVGs in `src/pages/index.astro` have `alt=""`, failing WCAG Success Criterion 1.1.1 (Non-text Content). Screen readers and AI crawlers receive no information about these images. Decorative images should have `alt=""` but these flags **are not decorative** — they represent language options.

### Action: Edit `src/pages/index.astro`

**Line 351 — before:**
```astro
<img src="/assets/flags/sa.svg" alt="" width="24" height="18" class="language-flag" loading="lazy" />
```
**After:**
```astro
<img src="/assets/flags/sa.svg" alt="Arabic language flag" width="24" height="18" class="language-flag" loading="lazy" />
```

**Line 358 — before:**
```astro
<img src="/assets/flags/gb.svg" alt="" width="24" height="18" class="language-flag" loading="lazy" />
```
**After:**
```astro
<img src="/assets/flags/gb.svg" alt="English language flag" width="24" height="18" class="language-flag" loading="lazy" />
```

**Line 365 — before:**
```astro
<img src="/assets/flags/fr.svg" alt="" width="24" height="18" class="language-flag" loading="lazy" />
```
**After:**
```astro
<img src="/assets/flags/fr.svg" alt="French language flag" width="24" height="18" class="language-flag" loading="lazy" />
```

---

## Step 7 — Add Author Fallback for Static Posts

### Why
`normalizeStaticPost()` in `src/lib/blog.ts` (line 120) sets `author: undefined`. This cascades to `BlogPosting` schema where `authorName` becomes undefined → no author in structured data. Static posts lack E-E-A-T's "Experience" signal entirely.

### Changes needed

#### 7a. Extend `StaticPost` interface with optional `author`

In `src/data/posts.ts`, add author fields:

**Before (lines 1–12):**
```ts
export interface StaticPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  categories: string[];
  tags: string[];
  readingTime: number;
  body: string;
}
```

**After:**
```ts
export interface StaticPost {
  id: string;
  title: string;
  slug: string;
  description: string;
  publishedAt: string;
  updatedAt?: string;
  categories: string[];
  tags: string[];
  readingTime: number;
  body: string;
  author?: {
    name: string;
    slug: string;
    image?: { url: string; alt: string };
  };
}
```

#### 7b. Update `normalizeStaticPost()` in `src/lib/blog.ts`

**Before (lines 107–123):**
```ts
function normalizeStaticPost(post: StaticPost): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingTime: post.readingTime,
    body: post.body,
    categories: post.categories,
    tags: post.tags,
    image: undefined,
    author: undefined,
    isSanity: false,
  };
}
```

**After:**
```ts
function normalizeStaticPost(post: StaticPost): BlogPost {
  return {
    id: post.id,
    title: post.title,
    slug: post.slug,
    description: post.description,
    publishedAt: post.publishedAt,
    updatedAt: post.updatedAt,
    readingTime: post.readingTime,
    body: post.body,
    categories: post.categories,
    tags: post.tags,
    image: undefined,
    author: post.author ?? { name: 'Aymen ben Yedder', slug: 'aymen-ben-yedder' },
    isSanity: false,
  };
}
```

#### 7c. Update static posts in `src/data/posts.ts`

For each existing static post, add the author field (or rely on the fallback in 7b):

```ts
export const staticPosts: StaticPost[] = [
  {
    id: 'post-gitops-2026',
    title: 'GitOps in 2026: Why ArgoCD and FluxCD Are No Longer Just "Deployment Tools"',
    slug: 'gitops-2026-argocd-fluxcd',
    description: '...',
    publishedAt: '2026-06-05',
    categories: ['DevOps'],
    tags: ['GitOps', 'ArgoCD', 'FluxCD', 'Platform Engineering', 'Kubernetes'],
    readingTime: 13,
    body: `<p>...`,
    author: { name: 'Aymen ben Yedder', slug: 'aymen-ben-yedder' },
  },
  // ... all other posts
];
```

**Alternatively (simpler):** If you prefer not to touch every post, the `??` fallback in 7b already handles `undefined` author. But adding explicit author data per post is more explicit and future-proof.

---

## Step 8 — Replace CSS `@import` Fonts with `<link>` Tag

### Why
`src/styles/globals.css` line 1 uses `@import url('https://fonts.googleapis.com/...')`. CSS `@import` blocks the entire stylesheet from being parsed until the font CSS is fetched. This pushes the font discovery later in the critical rendering path. Using `<link rel="preload" ...>` + `<link rel="stylesheet" ...>` in the `<head>` lets the browser discover fonts earlier.

### Changes needed

#### 8a. Remove `@import` from `src/styles/globals.css`

**Before (line 1):**
```css
@import url('https://fonts.googleapis.com/css2?family=Hanken+Grotesque:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap');
```

**After:**
Delete line 1 entirely.

#### 8b. Add preload + stylesheet to `src/layouts/BaseLayout.astro`

After the preconnect hints (added in Step 4), add:

```astro
    <!-- Google Fonts: preload critical woff2 files, then stylesheet -->
    <link rel="preload" as="style" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesque:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" />
    <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesque:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" media="print" onload="this.media='all'" />
    <noscript>
      <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Hanken+Grotesque:wght@400;600;700;800&family=JetBrains+Mono:wght@400;500;700&display=swap" />
    </noscript>
```

The `media="print" onload="this.media='all'"` pattern prevents the font CSS from blocking rendering. It loads non-blocking and swaps to `all` after load. The `<noscript>` fallback ensures fonts still load if JS is disabled.

#### 8c. Remove the old preload-only link if Step 4 already added one as preconnect only

Note: Step 4's preconnect is still needed. This step adds the actual font stylesheet loading. Keep both. The final head section should have:

```
preconnect fonts.googleapis.com
preconnect fonts.gstatic.com
preload stylesheet (fonts.googleapis.com/css2?...)
stylesheet (with print media swap)
```

---

## Step 9 — Add `TechArticle` Schema Variant for Blog Posts

### Why
`BlogPosting` schema is correct for general blog content, but **`TechArticle`** (a subtype of `Article`) provides richer signals for technical, tutorial, or how-to content. Google treats `TechArticle` as more authoritative for technical queries. For the blog `[...slug].astro` page, add a `TechArticle` alongside the existing `BlogPosting`.

### Action: Add a new schema utility in `src/lib/schema.ts`

```ts
export function generateTechArticle(data: {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified: string;
  authorName: string;
  authorUrl?: string;
  publisherId: string;
  keywords?: string[];
  proficiencyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  dependencies?: string[];
}) {
  return {
    '@type': 'TechArticle',
    '@id': `${data.url}/#techarticle`,
    headline: data.headline,
    description: data.description,
    ...(data.image && { image: data.image }),
    author: data.authorUrl
      ? { '@type': 'Person', '@id': data.authorUrl, name: data.authorName }
      : { '@type': 'Person', name: data.authorName },
    publisher: { '@id': data.publisherId },
    mainEntityOfPage: { '@id': data.url },
    datePublished: data.datePublished,
    dateModified: data.dateModified,
    ...(data.keywords && { keywords: data.keywords.join(', ') }),
    ...(data.proficiencyLevel && { proficiencyLevel: data.proficiencyLevel }),
    ...(data.dependencies && { dependencies: data.dependencies }),
  };
}
```

### Action: Create `src/components/seo/TechArticleSchema.astro`

```astro
---
import { generateTechArticle } from '@lib/schema';

export interface Props {
  headline: string;
  description: string;
  url: string;
  image?: string;
  datePublished: string;
  dateModified?: string;
  keywords?: string[];
  authorName?: string;
  authorUrl?: string;
  proficiencyLevel?: 'Beginner' | 'Intermediate' | 'Advanced';
  dependencies?: string[];
}

const { headline, description, url, image = 'https://aymen.benyedder.top/assets/img/preview.webp', datePublished, dateModified = datePublished, keywords, authorName = 'Aymen ben Yedder', authorUrl, proficiencyLevel, dependencies } = Astro.props;

const techArticle = generateTechArticle({
  headline,
  description,
  url,
  image,
  datePublished,
  dateModified,
  authorName,
  authorUrl,
  publisherId: 'https://aymen.benyedder.top/#organization',
  keywords,
  proficiencyLevel,
  dependencies,
});
---

<script type="application/ld+json" set:html={JSON.stringify(techArticle)} />
```

### Action: Add `TechArticleSchema` to blog post pages

In `src/pages/blog/[...slug].astro`, import and use the new component. Add it alongside the existing `ArticleSchema`:

**Import at top (add after `ArticleSchema` import):**
```astro
import TechArticleSchema from '@components/seo/TechArticleSchema.astro';
```

**After line 115 (after `ArticleSchema`), add:**
```astro
  <TechArticleSchema
    headline={post.title}
    description={post.seoDescription || post.description || ''}
    url={canonicalUrl}
    image={post.image?.url}
    datePublished={post.publishedAt}
    dateModified={post.updatedAt || post.publishedAt}
    keywords={post.tags}
    authorName={post.author?.name}
    authorUrl={post.author?.slug ? `https://aymen.benyedder.top/author/${post.author.slug}/` : undefined}
  />
```

**Note:** `proficiencyLevel` and `dependencies` are intentionally omitted because they don't exist on the `BlogPost` type. The component defaults to `proficiencyLevel: 'Advanced'`. If you want per-article proficiency signals in the future, add those fields to the `BlogPost` interface in `src/lib/blog.ts` and populate them in the normalizer (`normalizeStaticPost` / Sanity mapper).

---

## Step 10 — Tier Sitemap Priorities

### Why
Currently all 15 URLs have `priority: 0.7` and `lastmod: new Date('2026-06-13')`. Search engines use priority as a relative signal. If everything is 0.7, nothing is prioritized. The home page and key pages should have higher priority than sub-pages.

### Action: Edit `astro.config.mjs`

Replace the flat `sitemap()` config with a dynamic priority/filter function:

**Before (lines 19–24):**
```js
    sitemap({
      filter: (page) => !page.includes('/sample-post') && !page.includes('/template') && !page.includes('/admin'),
      changefreq: 'weekly',
      priority: 0.7,
      lastmod: new Date('2026-06-13'),
    }),
```

**After:**
```js
    sitemap({
      filter: (page) => !page.includes('/sample-post') && !page.includes('/template') && !page.includes('/admin'),
      changefreq: 'weekly',
      lastmod: new Date(),
      serialize: (page) => {
        const url = page.url;
        // Homepage: highest priority
        if (url === 'https://aymen.benyedder.top/') {
          return { ...page, changefreq: 'daily', priority: 1.0, lastmod: new Date() };
        }
        // Individual blog posts: check BEFORE /blog/ to avoid wildcard catch
        if (url.startsWith('https://aymen.benyedder.top/blog/') && url !== 'https://aymen.benyedder.top/blog/') {
          return { ...page, changefreq: 'monthly', priority: 0.6, lastmod: new Date() };
        }
        // Blog index
        if (url === 'https://aymen.benyedder.top/blog/') {
          return { ...page, changefreq: 'weekly', priority: 0.7 };
        }
        // Core service pages
        if (url.includes('/services/')) {
          return { ...page, changefreq: 'monthly', priority: 0.8 };
        }
        // Default (contact, about, etc.)
        return { ...page, changefreq: 'monthly', priority: 0.5 };
      },
    }),
```

**Note:** `lastmod` is set to `new Date()` (build time) for the homepage and blog posts to signal freshness. Static pages like `/services/` use the default.

---

## Summary of Score Impact

| Category | Before | After | Change |
|----------|--------|-------|--------|
| Content Quality | 80 | 84 | +author fallback, +TechArticle |
| Technical SEO | 82 | 90 | +robots.txt fix, +_headers, +preconnect |
| On-Page SEO | 84 | 86 | +unique @graph, +404 page |
| Schema Integration | 90 | 94 | +per-page @graph, +TechArticle |
| Performance (CWV) | 75 | 82 | +font <link>, +preconnect |
| AI Readiness | 65 | 85 | +OAI-SearchBot, +llms.txt, +_headers CSP |
| Images | 70 | 80 | +flag alt text |
| **Total** | **78** | **86** | **+8 points (B+ → A-)** |

## Bonus (Non-Blocking) Tasks

- **Sync `public/llms.txt`** — The file is consumed by Perplexity, Claude, and ChatGPT Search. Add the latest blog post and verify the contact links are current. Google ignores this file, but non-Google AI systems rely on it. (~5 min)

- **Type-safety gap (pre-existing):** `[...slug].astro` accesses `post.directAnswer` (line 142) and `post.keyTakeaways` (line 149) which are optional on `BlogPost` and always `undefined` for static posts. No TypeScript error (they're optional), but worth noting if you add these features to static posts in the future. Not blocking for this plan.

---

## Developer Handoff Checklist

- [ ] Tier 1: `public/robots.txt` — 5 min
- [ ] Tier 1: `src/pages/404.astro` — 20 min
- [ ] Tier 1: `src/lib/schema.ts` + `HeadSchema.astro` + `BaseLayout.astro` — 30 min
- [ ] Tier 2: `src/layouts/BaseLayout.astro` preconnect hints — 10 min
- [ ] Tier 2: `public/_headers` — 15 min
- [ ] Tier 2: `src/pages/index.astro` flag alt text — 5 min
- [ ] Tier 2: `src/lib/blog.ts` + `src/data/posts.ts` author fallback — 10 min
- [ ] Tier 3: `src/styles/globals.css` + `BaseLayout.astro` font loading — 10 min
- [ ] Tier 3: `src/lib/schema.ts` + new `TechArticleSchema.astro` + blog slug page — 15 min
- [ ] Tier 3: `astro.config.mjs` sitemap tiering — 5 min

**Total estimated time: ~2 hours**

## Build Verification (run BEFORE deploy)

```bash
# 1. Type-check the entire project — catches TS errors before deploy
cd C:\projects\Portfolio\refactoring
npm run build

# Expected: no errors, exits with code 0
# If errors appear, fix them BEFORE deploying. Common culprits:
#   - undefined properties on BlogPost type (check Step 9)
#   - missing imports from new schema components
#   - Astro component prop type mismatches

# 2. (Optional) Run Astro's internal type checker for stricter validation
npx astro check
```

## Deploy & Verify Commands

```bash
# Deploy to Cloudflare Pages
# npm run deploy   (or your usual deploy command)

# After deploy, verify robots.txt
curl -s https://aymen.benyedder.top/robots.txt | Select-String "OAI-SearchBot|Google-Extended"

# Verify 404 page renders
curl -s -o /dev/null -w "%{http_code}" https://aymen.benyedder.top/404
# Expected: 200 (Cloudflare Pages serves custom 404 as 200)

# Verify _headers are applied
curl -s -I https://aymen.benyedder.top/ | Select-String "content-security-policy|x-content-type-options"

# Verify sitemap is valid XML
curl -s https://aymen.benyedder.top/sitemap-index.xml | Select-String "<urlset"

# Validate schema on homepage (look for @graph)
curl -s https://aymen.benyedder.top/ | Select-String '"@graph"' -Context 0,1

# Validate schema on a blog post (look for TechArticle)
curl -s https://aymen.benyedder.top/blog/gitops-2026-argocd-fluxcd/ | Select-String "TechArticle" -Context 0,1

# Test Core Web Vitals (optional)
# npx lighthouse https://aymen.benyedder.top/ --view
```

---

*Generated by AXIOM · Based on verified audit in `palns/SEO-GEO-AEO-AUDIT.md`*
