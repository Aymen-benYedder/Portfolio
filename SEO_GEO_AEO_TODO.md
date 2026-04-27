# Ultimate Visibility — SEO / GEO / AEO Progress Tracker

Purpose: track implementation progress for the "Ultimate Visibility" plan (Technical SEO, Generative Engine Optimization, Answer Engine Optimization, Performance, CI). Use this file as the canonical checklist and human-readable status log.

## Master Checklist

- [x] Draft `.agent.md` agent for SEO/GEO/AEO
- [ ] Identify ambiguities and ask clarifying questions
- [ ] Finalize `.agent.md` and provide examples/prompts
- [x] Scan `blog/index.html` and `index.html`
- [x] Map related internal pages and assets
- [~] Run initial SEO & accessibility audit on core pages  <!-- ~ = in-progress -->
- [ ] Implement JSON‑LD generation pipeline for pages/components
- [ ] Add automated `sitemap.xml` and dynamic `robots.txt` in CI
- [ ] Improve Core Web Vitals: images, fonts, CSS, JS
- [ ] Choose rendering strategy per route (SSR/SSG/ISR/CSR)
- [ ] Create AEO/GEO content templates (FAQ, Q&A, tables, lists)
- [ ] Enforce canonical URLs, breadcrumb `BreadcrumbList` schema
- [ ] Add pre-deploy CI checks: Lighthouse, schema validation, link-check
- [ ] Instrument monitoring: RUM, synthetic tests, Search Console, alerts
- [ ] Launch checklist, QA, and staged rollout

## Progress Log
- 2026-04-27: Created tracker and added plan (author: agent)

## How to use
- Update this file when a major step completes by toggling the checkbox and adding a short log entry under `Progress Log`.
- Preferred workflow: use the agent to run tasks and update the project's todo tracker (the agent will keep `manage_todo_list` in sync).

## Quick Next Steps (recommended)
1. Run the automated SEO & accessibility audit on `index.html` and `blog/index.html` and attach the report here.
2. Auto-generate JSON‑LD for all blog posts and insert it into each post template.
3. Add CI job `seo-check.yml` to run Lighthouse, schema validation, and broken link checks.

---
File created: `SEO_GEO_AEO_TODO.md`
