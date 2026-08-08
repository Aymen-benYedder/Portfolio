# SEO / GEO / AEO Fix Plan — aymen.benyedder.top

**Prepared:** 2026-08-01
**Site:** Astro 6 static site → Cloudflare Pages (`wrangler.toml`: name `new-portfolio`, output `dist/`)
**State:** 33 pages built, 0 indexed, 8 not indexed (7× "Crawled - currently not indexed", 1× "Redirect error").
**Scope:** Planning only. No files were modified.

All file paths are relative to `C:\projects\Portfolio\refactoring`.

---

## 0. Verified state of the codebase (grounding)

| Area | Finding (file:line) |
|---|---|
| Deployed robots | `public/robots.txt` (copied verbatim into `dist/robots.txt` by Astro) is the source of truth at the edge. Root `robots.txt` is a stale copy with a dashboard instruction comment. |
| robots conflict | CF **managed** AI-crawler block (Google-Extended, Applebot-Extended, GPTBot, ClaudeBot, Bytespider, CCBot, Amazonbot, meta-externalagent) is merged at the edge, then `public/robots.txt:6-13` **re-allows** Google-Extended, Applebot-Extended, OAI-SearchBot, PerplexityBot. Contradictory rules for the same UAs. |
| Googlebot | Allowed in every variant — the robots conflict does **not** block Google indexation. It is a GEO/AI-crawler hygiene problem. |
| Sitemap (live) | `GET /sitemap.xml` → **404**. `GET /sitemap-0.xml` → 200 (32 URLs). `GET /sitemap-index.xml` → 200 (references only sitemap-0.xml). GSC has a dead `/sitemap.xml` submission. |
| Sitemap (build) | `astro.config.mjs:19-44` `@astrojs/sitemap` → `dist/sitemap-0.xml` + `dist/sitemap-index.xml`. `scripts/generate-sitemap.mjs` generates a **different, legacy** root `sitemap.xml` that walks the repo for `.html` files and includes junk (`draft-*.html`, `injected-*.html`, `body-*.html`). This legacy file is **not deployed** but is what `scripts/gsc-diagnostic.mjs` reads. |
| Deploy staleness | `dist/sitemap-0.xml` is dated 2026-07-29 and is **missing** `blog/docker-security-hardening-2026/` even though it exists in `src/data/posts.ts:23`. Current source ≠ deployed output → rebuild + redeploy is required before requesting indexing. |
| Blog data source | Hybrid: 23 local posts (`src/data/posts.ts`) **plus** Sanity (`@sanity/astro`, `src/lib/blog.ts:125-151`). `getStaticPaths` in `src/pages/blog/[...slug].astro:15-43` merges Sanity slugs at build time. Evidence Sanity is live: `dist/blog/web-dev-beliefs-that-are-quietly-costing-you-debunked/` exists and is **not** in `posts.ts`. |
| Canonical bug (HIGH) | Service pages declare canonicals **without** trailing slash: `src/pages/services/ci-cd-infrastructure.astro:7`, `mern-development.astro:7`, `wordpress-development.astro:7`. Verified live: `/services/ci-cd-infrastructure` → **308** → `/services/ci-cd-infrastructure/`, and the target page's `<link rel="canonical">` points **back** at the 308 URL → **circular canonical reference**. The sitemap lists the slash-form. This is the strongest candidate for the **"Redirect error"** not-indexed page and a genuine indexability defect for the 3 service pages. |
| OG image broken (HIGH) | `src/components/seo/BaseSeo.astro:11` default `og:image`/`twitter:image` = `https://aymen.benyedder.top/assets/img/preview.webp` → verified **404** (file lives at repo `assets/img/preview.webp`, never copied to `public/`). Same 404 URL is used for `Person.image` and `Organization.logo` in `src/components/seo/HeadSchema.astro:17`, `:319`. Only 1 of 23 posts defines an image (`posts.ts:1574`), and it uses a **relative** URL (`/assets/npm-...webp`) which is invalid for `og:image`. |
| Meta robots | `BaseSeo.astro:18` emits `index, follow, max-snippet:-1, max-image-preview:large` — correct. No `X-Robots-Tag` in `public/_headers`. Only `404.astro:8` sets `noIndex`. |
| Canonical everywhere | All pages render `<link rel="canonical">` via `BaseLayout` → `BaseSeo`. Blog/author/home/blog-index canonicals are correct slash-form. |
| Structured data | `src/lib/schema.ts` + components: WebSite, WebPage, Person, Organization, LocalBusiness, ProfessionalService, SoftwareApplication (all in `HeadSchema` graph, `schema.ts:299-343`), BreadcrumbList, FAQPage, BlogPosting, TechArticle, ItemList, JobPosting (`hire.astro:21`), Person (author page). **Every blog post emits BOTH `BlogPosting` AND `TechArticle`** (`src/pages/blog/[...slug].astro:106-129`) — competing types on one page. |
| E-E-A-T | Homepage About + Experience + Education (`src/pages/index.astro`), Sanity-backed author page (`src/pages/author/[slug].astro`). No dedicated `/about` page. Only 1 case study (`projects/eatorder.astro`); Riskvision/Lavocato link to `/#contact`. |
| Internal linking | `getRelatedPosts` (`src/lib/blog.ts:243-263`) → "Related Articles" per post. Homepage links only 3 posts. Posts do **not** link to service pages or `/hire/`. Tags render as plain spans (no tag hubs). |
| AEO | `public/llms.txt` exists but is **stale** (missing ~10 newer posts). `dist/rss.xml` exists. |
| Google verification file | `googlec2359b4f38019308.html` sits at repo root, **not** in `public/` → not deployed. GSC works (DNS-verified), but the file should live in `public/` defensively. |

---

## 1. Root-cause analysis (ranked)

The property is ~3 months old. GSC: 1 click, 72 impressions, all branded, avg position 6.7, 0 pages indexed.

1. **Site age + near-zero authority (HIGH confidence, primary driver).** A brand-new domain with no backlinks and only branded impressions is exactly the population Google defers in "Crawled - currently not indexed". The 7× "crawled-not-indexed" pattern (not "discovered but blocked") is Google's standard treatment of low-trust new sites: it crawls, then parks pages pending quality signals. Evidence: 0 non-branded impressions means Google has no query relevance signal to rank for, so nothing is worth indexing yet.
2. **Canonical → 308 circular reference on the 3 service pages (HIGH, technical).** `services/*.astro:7` canonical points at a URL that 308-redirects to itself-in-slash-form whose canonical points back. This is a self-perpetuating redirect/canonicalization defect and the most probable source of the single **"Redirect error"** page (`GSC Pages → Not indexed → Redirect error`). It also blocks correct indexation of `/services/`, `/services/ci-cd-infrastructure/`, `/services/mern-development/`, `/services/wordpress-development/` (which in turn weakens crawl-path signals from the money pages).
3. **Deployed sitemap is stale vs source (MEDIUM-HIGH).** `dist/sitemap-0.xml` predates `docker-security-hardening-2026` and any Sanity-only posts added after 2026-07-29. GSC therefore has an incomplete view of the site; the newest content (Docker security, published 2026-07-28) has **never** been in the sitemap. Additionally the dead `/sitemap.xml` GSC submission (404) sends Google to a 404 and adds noise.
4. **Crawlability hygiene — robots.txt conflict (MEDIUM).** Conflicting Allow/Disallow for Google-Extended, Applebot-Extended etc. (CF managed vs `public/robots.txt:6-13`). **Does not affect Googlebot indexing**, but it (a) undermines GEO/AI crawling (some parsers resolve the conflict by blocking), (b) signals an unmanaged infra to Google's crawl diagnostics, and (c) wastes crawl budget on contradictory directives for AI crawlers that then hammer the site. Low direct impact on "0 indexed".
5. **Thin/split content, low E-E-A-T density (MEDIUM).** Most posts are strong, long-form, cited (good). But 4 posts are off-topic for a DevOps brand (Canada work-permit / LMIA cluster: `c16-francophone…`, `canada-global-talent…`, `lmia-exemption-codes…`, `devops-digital-nomad…`), diluting topical authority. Only 1 case study is real; 2 project cards dead-end to `/#contact`. No `/about`, no certifications, no `Experience` schema. This is a secondary factor that will cap how fast indexing converts once crawl trust returns.
6. **No indexation demand (MEDIUM).** 1 click in 3 months means no users, no shares, no links — Google has no reason to prioritize. Requesting indexing only works if the page is otherwise strong.

**Conclusion:** Fix (2)+(3)+(4) to remove hard blockers, then drive (1)+(5)+(6) via the indexing-push + authority phases. Without authority work, fixing technical issues alone will likely convert only a handful of the 7 crawled-not-indexed pages.

---

## 2. Critical fixes (do now)

### 2.1 Resolve the robots.txt conflict — ONE canonical robots file
- **Dashboard action (do this, it's the actual fix):** Cloudflare dashboard → Security → Bots → **AI Crawlers** → toggle **OFF "Cloudflare managed"**. This removes the injected CF section that contradicts the custom file. Keep the instruction comment in the file as documentation.
- **Files:** `public/robots.txt` (deployed source of truth). Delete the stale root `robots.txt` (or keep it only as a note — it is not deployed).
- **Exact recommended content** (single source of truth, no per-UA contradictions, GEO-positive):

```txt
# AYMEN.DEV — robots.txt (single source of truth)
# Requires: Cloudflare Dashboard > Security > Bots > AI Crawlers > "Cloudflare managed" OFF
# Strategy: allow all search + AI crawlers (GEO/AEO goal is to be cited by LLMs).

User-agent: *
Allow: /
Disallow: /admin/
Disallow: /sample-post/
Disallow: /template/

# Search engines
User-agent: Googlebot
Allow: /
User-agent: Bingbot
Allow: /
User-agent: Applebot
Allow: /
User-agent: Yandex
Allow: /

# AI / answer engines (explicit allow, GEO/AEO)
User-agent: Google-Extended
Allow: /
User-agent: GPTBot
Allow: /
User-agent: OAI-SearchBot
Allow: /
User-agent: ChatGPT-User
Allow: /
User-agent: ClaudeBot
Allow: /
User-agent: anthropic-ai
Allow: /
User-agent: PerplexityBot
Allow: /
User-agent: Applebot-Extended
Allow: /
User-agent: CCBot
Allow: /
User-agent: Bytespider
Allow: /
User-agent: meta-externalagent
Allow: /
User-agent: Amazonbot
Allow: /

Sitemap: https://aymen.benyedder.top/sitemap-index.xml
```

- **Expected impact:** No contradictory directives for any agent; AI crawlers stop getting a mixed signal; if you keep any tiered block it must be expressed once per UA. Note the deliberate tradeoff: blocking GPTBot/ClaudeBot (previous policy) removes the two biggest LLM-citation surfaces — this plan chooses **GEO upside** over training-crawler blocking. If you prefer to keep training crawlers blocked, apply Option B below instead (still single-group, non-contradictory):

```txt
# Option B (conservative) — omit the explicit Allow groups above and instead keep only:
User-agent: *
Allow: /
Disallow: /admin/
Disallow: /sample-post/
Disallow: /template/
User-agent: GPTBot
Disallow: /
User-agent: ClaudeBot
Disallow: /
User-agent: anthropic-ai
Disallow: /
Sitemap: https://aymen.benyedder.top/sitemap-index.xml
```

- **Effort:** S (10 min).

### 2.2 Fix the canonical → 308 circular reference (service pages)
- **Files:**
  - `src/pages/services/ci-cd-infrastructure.astro:7`
  - `src/pages/services/mern-development.astro:7`
  - `src/pages/services/wordpress-development.astro:7`
  - Also fix the matching Breadcrumb URLs in the same files (`:8`) to slash-form.
- **Exact change:** `canonical="https://aymen.benyedder.top/services/ci-cd-infrastructure"` → `canonical="https://aymen.benyedder.top/services/ci-cd-infrastructure/"` (same for the other two).
- **Expected impact:** Removes the self-referencing redirect loop; sitemap ↔ canonical now agree for all 4 service URLs. High likelihood this resolves the GSC **"Redirect error"** page. Verify after deploy: `curl -I /services/ci-cd-infrastructure` → 200 (no 308) and `<link rel="canonical">` self-references the 200 URL.
- **Effort:** S (10 min).

### 2.3 Sitemap cleanup
- **GSC:** Sitemaps → remove the dead `/sitemap.xml` submission. Keep `/sitemap-index.xml`; after redeploy, re-submit it (expect ~32-33 discovered, not 27).
- **Repo hygiene (optional but prevents future drift):** the legacy root `sitemap.xml` (from `scripts/generate-sitemap.mjs`) lists dead `draft-*.html`, `injected-*.html`, `body-*.html` URLs. It is not deployed today, but `scripts/gsc-diagnostic.mjs:82` reads it — point that script at `dist/sitemap-0.xml` instead, and delete the root `sitemap.xml` + `robots.txt` + `robots.template.txt` artifacts (or gate them out of the walker). Do **not** put these scraped HTML files (`draft-*.html`, `injected-*.html`, `body-*.html`) into `public/`; if any are ever served, they must be `noindex` (they have no canonical pages).
- **Expected impact:** GSC validates a single healthy sitemap; crawl budget no longer pointed at dead URLs.
- **Effort:** S (20 min).

### 2.4 Rebuild + redeploy (make source == deployed)
- **Commands:** `npm run build` then deploy to Cloudflare Pages (wrangler: `wrangler pages deploy dist` or via the existing pipeline). Confirm `dist/sitemap-0.xml` now contains **33 URLs** including `docker-security-hardening-2026/` and any Sanity posts.
- **Expected impact:** GSC sees the newest content; sitemap is complete.
- **Effort:** S (15 min).

### 2.5 Fix the broken OG / logo images (social + schema)
- **Files:**
  - Copy the images from `assets/img/` (repo) into `public/assets/img/`: `preview.webp`, `Hackerbot-Claw_breach.webp`, `Real-Time-Visualization.webp`, `OpenTofu_&_Terragrunt.webp` (optionally downscale `preview.webp` — it's 663 KB; target ≤ 1200×630, ~100-200 KB).
  - `src/components/seo/BaseSeo.astro:11` — default image stays `https://aymen.benyedder.top/assets/img/preview.webp` (now valid). Ensure `og:image`/`twitter:image` are always **absolute**.
  - `src/data/posts.ts:1574` — change image URL to absolute: `'https://aymen.benyedder.top/assets/npm-vs-pnpm-vs-yarn-vs-bun-2026.webp'`.
  - Add per-post `image` to the top ~6 posts using the moved assets (Docker → preview/placeholder, Hackerbot-Claw post → `Hackerbot-Claw_breach.webp`, observability post → `Real-Time-Visualization.webp`, multi-cloud post → `OpenTofu_&_Terragrunt.webp`, etc.).
- **Expected impact:** Social/AI-share previews render; `Organization.logo`, `Person.image` in schema resolve (removes invalid-image warnings in Rich Results/Schema validators). Bonus: unique OG images on posts improve CTR in social + AI answer surfaces.
- **Effort:** S-M (1-2 h).

### 2.6 Structured-data hygiene (quick wins)
- **Files:** `src/pages/blog/[...slug].astro:106-129` — emit **one** article type per post. Keep `ArticleSchema` (BlogPosting); remove the `TechArticleSchema` block (or fold `proficiencyLevel`/`dependencies` into the BlogPosting `learningResourceType`). Conflicting `BlogPosting`+`TechArticle` on one page confuses Google's rich-result picker and validates as two competing types.
- `src/lib/schema.ts:237-250` — drop `SoftwareApplication` from the `HeadSchema` graph (`schema.ts:332-337`): the whole site is not a software app; it injects an Offer/price on every page and adds noise.
- `HeadSchema` (`schema.ts:75-86, 316-322`) — `Organization.logo` must point at a real logo file (after 2.5) and `Organization.name` should be `AYMEN.DEV` (site brand) rather than the person's name+jobtitle string.
- **Expected impact:** Cleaner, faster-to-validate markup; fewer invalid-entity warnings in Rich Results Test.
- **Effort:** S (30 min).

### 2.7 Move Google verification file into the deploy path
- **File:** move `googlec2359b4f38019308.html` → `public/googlec2359b4f38019308.html` so it survives every rebuild.
- **Effort:** S (2 min).

**Ordering for section 2:** 2.1 → 2.2 → 2.4 (rebuild+deploy after code changes) → verify → 2.3 (GSC sitemap resubmit) → 2.5/2.6/2.7 (can ship in the same or next deploy).

---

## 3. Indexing push strategy (exact GSC sequence)

Only start **after** section 2 is deployed and verified (robots single, sitemap 200/complete, service canonicals 200).

### 3.1 Find the "Redirect error" URL (do this first)
- **Path:** GSC → Indexing → Pages → "Not indexed" → **Redirect error** → drill into the URL list.
- **If the URL isn't surfaced there:** test candidate URLs with URL Inspection (or `curl -I`) in this order:
  1. `https://aymen.benyedder.top/services/ci-cd-infrastructure` (no slash — 308 loop, **most likely**)
  2. `https://aymen.benyedder.top/services/mern-development` / `wordpress-development` (no slash)
  3. Old `.html` post scheme: `https://aymen.benyedder.top/blog/ai-powered-workflow-orchestration-stack.html` and any other `blog/*.html` from the legacy era
  4. `https://aymen.benyedder.top/index.html` (normal CF 308 — expected, ignore)
  5. Legacy root pages: `/draft-*.html`, `/injected-*.html`, `/body-*.html`, `/sample-post/`, `/template/`, `/admin/`
  6. `https://aymen.benyedder.top/blog/how-i-help-canadian-startups-skip-lmia-headache/` (the `public/_redirects:1` 301 target exists → fine)
- **Remedy per case:** canonical loop → fixed in 2.2; `.html` legacy → add `_redirects` lines (`/blog/x.html /blog/x/ 301`) or let them 404 (they were never indexed). Then URL Inspection → Request Indexing on the resolved form.
- **Effort:** S (30-45 min).

### 3.2 Request indexing — order and cadence
Google allows ~50 requests/URL/day but spreading them yields better results. Plan **5-8 URLs/day**, each **once** (re-requesting resets the queue):

- **Day 1 (highest priority, most likely to index):**
  1. `https://aymen.benyedder.top/`
  2. `https://aymen.benyedder.top/blog/`
  3. `https://aymen.benyedder.top/blog/docker-security-hardening-2026/` (newest, never in sitemap)
  4. `https://aymen.benyedder.top/blog/gitops-2026-argocd-fluxcd/`
  5. `https://aymen.benyedder.top/services/`
- **Day 2-3:**
  - `/services/ci-cd-infrastructure/`, `/services/mern-development/`, `/services/wordpress-development/`
  - `/hire/`, `/blog/terraform-production-state-management-modules-multi-environment-iac/`, `/blog/prometheus-grafana-self-hosted-monitoring-stack-vps/`, `/blog/production-docker-multi-stage-builds-security-scanning-optimization/`
- **Day 4-6:** the remaining ~16 blog posts, oldest-to-newest, 5-8/day. Author page + `/projects/eatorder/` in this window.
- **Afterwards:** do **not** re-request the same URLs within 30 days. Track which return "Indexed" vs "Crawled - not indexed".

### 3.3 Handling the 7 crawled-not-indexed pages
- After the fixes + requests, give Google 2 weeks.
- If a page stays "Crawled - not currently indexed" after 2 re-crawls: **stop technical interventions** for that page. This is a quality/trust decision, not a technical one — the correct lever is authority (section 4), not more requests.
- Expect a realistic near-term outcome: homepage, `/blog/`, and 3-8 strong posts index within 4-8 weeks; the immigration-cluster posts will likely stay parked (topic mismatch) — decide in section 4 whether to consolidate them.

### 3.4 Bing (optional, 5-min)
- The repo already has IndexNow plumbing (`scripts/indexnow-submit.js`, `indexnow-blog-submit.js`, `indexnow-routes.js`). Register in Bing Webmaster Tools, host the key file at the `keyLocation`, and submit the post URLs. Google ignores IndexNow, so this only helps Bing/Yandex.
- **Effort:** S.

---

## 4. Content & authority plan (30-90 days)

### 4.1 Topical clusters (build on the 23 existing posts)
Group posts into hub clusters; each hub gets a crawlable `/blog/category/<x>/` (or `/insights/`) index page that lists and links every member. `src/pages/blog/index.astro` already computes categories (`:23`) — generate category pages from the same `getNormalizedPosts()`.

1. **Container & Supply-Chain Security** — `docker-security-hardening-2026`, `production-docker-multi-stage-builds-security-scanning-optimization`, `vibe-coding-security-disaster-real-numbers`, `execution-layer-breach-hackerbot-claw-cicd-compromise`
2. **GitOps & Platform Engineering** — `gitops-2026-argocd-fluxcd`, `platform-engineering-2026-building-idp-backstage-kubernetes-gitops`, `terraform-production-state-management-modules-multi-environment-iac`
3. **Multi-Cloud IaC** — `architecting-multi-cloud-resilience-opentofu-terragrunt-mandatory-2026`, `terraform-production-…`
4. **Self-Hosted / VPS / AI infra** — `devops-vps-startups`, `prometheus-grafana-self-hosted-monitoring-stack-vps`, `ai-powered-workflow-orchestration-stack`, `deploying-scaling-llms-production-devops-self-hosted-ai-inference`, `unified-type-safety-hono-tanstack-docker`
5. **Observability & Performance** — `from-logs-to-logic-…`, `state-of-web-performance-2026`, `web-resilience-2026`, `css-engineering-2026`
6. **Canada DevOps hiring (deliberate, links to `/hire/`)** — `c16-francophone-mobility-lmia-exemption-canada`, `canada-global-talent-stream-2026-…`, `lmia-exemption-codes-…`, `devops-digital-nomad-visas-2026-comparison`. Either (a) keep as a coherent cluster wired to the `JobPosting` hire page (recommended — it matches the "francophone, LMIA-exempt, remote" positioning), or (b) if you'd rather keep the brand 100% DevOps-technical, move these under `/careers/` and keep them indexable but off the homepage. Do **not** leave them scattered mid-blog.

### 4.2 Internal linking (highest-ROI change in this phase)
- **Posts → services:** add 1-2 contextual links per post to `/services/ci-cd-infrastructure/`, `/services/mern-development/`, or `/services/` (e.g., Docker post → CI/CD service; Hono/TanStack post → MERN service).
- **Posts → hire:** add a "Hire me for this" CTA block (already `DeployMeta`-adjacent) linking `/hire/` on 3-5 top posts.
- **Posts ↔ posts:** enrich `getRelatedPosts` output (`src/lib/blog.ts:243`) with manual curation per cluster hub so every post links to its 2-3 cluster siblings (beyond the auto 3).
- **Posts → author:** already present via the "By …" link (`[...slug].astro:143`). Ensure the author page (`/author/aymen-ben-yedder/`) is always in the sitemap and add `sameAs` links.
- **Tags:** convert tag spans in `[...slug].astro:211-213` into links to generated `/blog/tags/<tag>/` archive pages (new crawlable hubs).
- **Effort:** M (4-8 h across all posts + a `src/lib/blog.ts` extension for tag/category pages).

### 4.3 E-E-A-T additions
- **Dedicated `/about` page** (`src/pages/about.astro`): full professional narrative, experience timeline (from Sanity `experience`), education, tools, certifications, and a downloadable résumé (`assets/*.pdf` → `public/assets/`). Link from navbar + footer.
- **Author page expansion** (`src/pages/author/[slug].astro`): add `alumniOf`, `knowsAbout`, `hasCredential`, `workLocation` to the Person JSON-LD (`:52-69`), plus sameAs links to LinkedIn/GitHub (already fetched from Sanity).
- **Experience schema:** add `AlumniOf`/`WorkHistory`-style `ProfilePage` data or a standalone `Person.worksFor`/`hasOccupation` block on the about page using the Alizeth/DevCom/CB Audit timeline already in `src/pages/index.astro:277-297`.
- **Case studies:** convert Riskvision/Lavocato cards (`index.astro:313-314`) into real `/projects/` pages instead of `/#contact` dead-ends (mirror `projects/eatorder.astro`).
- **Consistency fixes:** resolve the name variant (task notes "Aymen ben Yedder" vs "AYMEN.DEV" branding) — pick one canonical casing for `name`/`author` across `schema.ts`, `posts.ts` author, and Sanity.
- **Effort:** M (1-2 days).

### 4.4 Backlink acquisition (targets for a DevOps engineer)
Prioritize cheap, thematically perfect links before paid:
- **Write-for-us / community pubs:** DigitalOcean Community tutorials (accepted for DevOps), dev.to, Hashnode, `#ShowDevops` (security/CI-CD topics), Learnk8s / Kubernetes blog, CNCF blog guest posts.
- **Republish strategy:** cross-post 2-3 best posts on dev.to / Medium / Hashnode with canonical tags pointing back to `aymen.benyedder.top` (feeds domain authority).
- **GitHub:** add READMEs + the llms.txt/`blog` link from your profile and from open-source contributions; keep `github.com/Aymen-benYedder` profile-linked bio → site.
- **Community Q&A:** answer r/devops, r/kubernetes, r/selfhosted, r/gitops, Stack Overflow (DevOps/CI-CD tags) and cite your posts only where genuinely useful.
- **Tool roundups:** get the "GitOps in 2026" and "Docker security checklist" posts into industry roundups/newsletters (e.g., DevOps Weekly, KubeWeekly, The New Stack reader submissions).
- **HN / Reddit drops:** responsibly share genuinely useful long-form posts (not SEO bait).
- **Indexable profiles:** ensure LinkedIn (`/in/aymenby`) bio + featured links, X profile, and GitHub profile all link the site (these are cheap, consistent, indexable citations).
- **Effort:** ongoing, ~1-2 h/week. Target 5-10 quality links in 90 days — enough to move the "crawled-not-indexed → indexed" conversion.

### 4.5 Content velocity
- 2 posts/month for 90 days (6 posts), mapped to the clusters with the highest non-branded search potential (e.g., "Terraform vs OpenTofu 2026", "self-hosted LLM inference cost", "ArgoCD vs FluxCD security"). Each post: ≥1200 words, code samples, FAQ block (already supported by the `faq` field in the CMS/posts), direct-answer paragraph at top (`post.directAnswer` already rendered at `[...slug].astro:156-161`).

---

## 5. GEO/AEO layer

### 5.1 What's already in place (audit result)
- `llms.txt` (`public/llms.txt`) — good AEO signal, **stale** (missing Docker security, Terraform production, Prometheus/Grafana, Platform Engineering, etc.).
- JSON-LD graph on every page (`HeadSchema`): Person, WebSite, WebPage, Organization, LocalBusiness, ProfessionalService, SoftwareApplication.
- Per-content: BreadcrumbList, FAQPage (home + posts with `faq`), BlogPosting + TechArticle (duplicated), ItemList (blog index), JobPosting (hire), Person (author).
- Visible FAQ sections + "Direct Answer" + "Key Takeaways" blocks (`[...slug].astro:156-175`) — these are the exact extractive patterns LLM answer engines look for. **Strong AEO foundation.**

### 5.2 Recommended additions/cleanups (prioritized)
1. **De-duplicate article types** (from 2.6): single `BlogPosting` per post. LLM/answer engines + Google rich results prefer one unambiguous type.
2. **Unify Person `@id`** so citations resolve to one entity:
   - Central node: `https://aymen.benyedder.top/#person` (`schema.ts:27`).
   - Author page JSON-LD (`author/[slug].astro:52-69`) should use `@id: 'https://aymen.benyedder.top/#person'` (or at least the same URL form with trailing slash) so BlogPosting author (`authorUrl`, `[...slug].astro:115`) connects to it.
   - Point `sameAs` at LinkedIn/GitHub in both places.
3. **Add `speakable`** (`cssSelector` targeting the Direct Answer + first `<p>`) to each post's BlogPosting — optimizes for voice/AI answer extraction.
4. **Add `citation`/`about`/`mentions`** to posts that cite sources (e.g., Docker post footnotes) — strengthens authority claims in AI summarization.
5. **Add `profilePage`, `hasCredential`, `knowsAbout`, `alumniOf`** on the author/Person node (certifications, education from `index.astro:427-450`).
6. **Per-service schema:** add `Service`/`ProfessionalService` JSON-LD on each service page (currently only Breadcrumb), reusing the `areaServed`/`serviceType` from `schema.ts:324-331` with per-page content.
7. **Refresh `llms.txt`** on every deploy (generate from `getNormalizedPosts()` in a small `scripts/generate-seo-assets.mjs` step — the file already exists) so LLM crawlers see all posts, not 8.
8. **Fix `Organization` naming/logo** (from 2.6) and remove the spammy `SoftwareApplication` node.
9. **Optional:** `WebSite.potentialAction` SearchAction (sitelinks searchbox) — low priority for a portfolio.
10. **Validate:** run `node scripts/validate-jsonld.mjs` + Google Rich Results Test on `/`, a post, `/hire/`, a service page after the changes.
- **Effort:** M (half day), ranked 1-4 as the core, 5-10 as polish.

### 5.3 GEO strategy note
For an AI search play, the deciding factors after clean markup are: (a) llms.txt freshness, (b) allowing GPTBot/ClaudeBot/PerplexityBot/CCBot (done in 2.1), (c) extractable, cited, opinionated content (the existing posts already fit this), and (d) being **linked/cited elsewhere** — AI engines weight references, so section 4.4 doubles as the GEO distribution play (dev.to reposts, GitHub, HN). The direct-answer + FAQ structure in every post is the single best lever already present — standardize it on all 6 new posts.

---

## 6. Measurement plan

### 6.1 GSC — weekly (15 min, every Monday)
- **Indexing rate:** Indexing → Pages: count `Indexed` (baseline 0 → target ≥10 in 60 days), watch the 7 crawled-not-indexed names, watch for the redirect-error row disappearing.
- **Impressions by query:** Performance → Queries. **The first leading signal: any non-branded query with impressions** (e.g., "terraform opentofu 2026", "argocd fluxcd"). Until then, all traffic is brand-search noise. Set a filter for queries excluding "ben yedder/aymen".
- **CTR fix loop:** any query with impressions ≥10 and CTR <2% → revise title/meta (`BaseSeo.astro:15-16` or post `seoTitle`/`seoDescription` from the CMS).
- **Sitemap status:** confirm `/sitemap-index.xml` stays "Success" and the `/sitemap.xml` row is removed.
- **CWV:** once CrUX traffic accumulates (needs real visits; expect several weeks), check Core Web Vitals report. Baseline is already healthy-looking: Astro static, fonts `display=optional` (`BaseLayout.astro:43-44`), `loading="lazy"` images. Watch **INP** (heavy React islands: `NavbarIsland`, `CommandPalette`, `CustomCursor`, `FAQAccordion` — `BaseLayout.astro:61-63`) and LCP.

### 6.2 PageSpeed / Lighthouse retry (once the 429 clears)
- Run on: `/`, `/blog/`, `/blog/docker-security-hardening-2026/`, `/services/ci-cd-infrastructure/`, `/hire/`.
- Use `npx lighthouse https://aymen.benyedder.top/ --preset=perf --output-path=…` or the PageSpeed Insights API with **backoff retry** (sleep 60s between runs) until rate-limit clears.
- If LCP/INP regress, ship the already-flagged perf scripts (`scripts/optimize-cwv.mjs`, `body-css-engineering-2026.html` artifacts suggest prior CWV work).

### 6.3 Milestones
| Week | Check | Target |
|---|---|---|
| 1 | Redirect-error row gone; service pages URL-Inspect clean | All 4 service URLs indexable |
| 2 | First request-indexed URLs show "Indexed" | homepage + /blog/ |
| 4 | Non-branded query appears in Performance | ≥1 query, any impressions |
| 8 | Indexed count | ≥10 |
| 12 | Non-branded clicks | ≥10-25/mo |
| 12 | Backlinks (Ahrefs/Search Console Links) | 5-10 quality |

---

## Execution summary (prioritized)

| # | Action | Effort | Phase |
|---|---|---|---|
| 1 | Fix robots.txt conflict + disable CF managed AI section | S | Now |
| 2 | Fix service-page canonical → 308 loop | S | Now |
| 3 | Rebuild + redeploy; refresh/resubmit sitemap; remove dead `/sitemap.xml` | S | Now |
| 4 | Fix broken OG/logo images + duplicate article schema | S-M | Now |
| 5 | Find redirect-error URL; request indexing in batches | S | Week 1 |
| 6 | Category/tag hubs + internal linking + /about + E-E-A-T schema | M | Weeks 2-6 |
| 7 | Backlinks + republishing (dev.to/HN/communities) | M (ongoing) | Weeks 4-12 |
| 8 | llms.txt refresh + speakable/citation schema + GEO validation | M | Weeks 4-8 |
| 9 | Weekly GSC dashboard + Lighthouse retry | S (weekly) | Ongoing |
