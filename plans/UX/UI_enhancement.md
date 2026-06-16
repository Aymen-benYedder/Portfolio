# Portfolio Refactoring — Implementation Plan

**Target Audience:** Recruiters, Hiring Managers, Engineering Leads  
**Primary Goal:** Convert visits → qualified conversations (Calendly bookings)  
**KPI:** Hero CTA click rate > 3%, Time on page > 90s, Scroll depth > 60%

---

## 📋 Progress Tracker

| Phase | Task | Status | Priority | Estimated | Actual |
|-------|------|--------|----------|-----------|--------|
| **0** | Quick wins: scanline opacity, card borders, active scale | ✅ **DONE** | Critical | 2h | ~1h |
| **1** | Hero: headline, subhead, CTA buttons, trust bar | ✅ **DONE** | Critical | 4h | ~2h |
| **2** | Content restructure: merge Exec Summary → About, delete low-value sections | 🔄 **IN PROGRESS** | Critical | 4h | — |
| **3** | Services → Outcome packages (Audit / Build / Retainer) | ⏳ Pending | Critical | 3h | — |
| **4** | Experience with metrics — WorkCard component + data | ⏳ Pending | Critical | 3h | — |
| **5** | Projects → Case studies — ProjectCard component + data | ⏳ Pending | Critical | 3h | — |
| **6** | Skills → Buyer-centric groups | ⏳ Pending | Medium | 1h | — |
| **7** | Contact → Single CTA (Calendly) | ⏳ Pending | High | 2h | — |
| **8** | Footer & cleanup (Education, Languages inline) | ⏳ Pending | Medium | 1h | — |
| **9** | Process section (replace FAQ) | ⏳ Pending | Medium | 2h | — |

---

## ✅ Phase 0: Quick Wins — **COMPLETED**

| Task | File | Change |
|------|------|--------|
| Scanline opacity 0.6 → 0.12 | `globals.css` L334 | `opacity: 0.12` |
| Card border contrast | `globals.css` L231 | `border: 1px solid var(--border-hi)` |
| Active scale 0.98 → 0.995 | `globals.css` L162 | `transform: scale(0.995)` |
| Button styles (primary/secondary) | `globals.css` L396+ | Added `.btn-primary`, `.btn-secondary` |

**Build:** ✅ Passing

---

## ✅ Phase 1: Hero Section — **COMPLETED**

### Changes Made

**File:** `src/components/sections/HeroCard.astro` — **Complete rewrite**

**New Hero Structure:**
```astro
<!-- Eyebrow -->
<p class="label-caps text-[var(--accent)]">DevOps & Platform Engineering Consultant</p>

<!-- Headline -->
<h1>Aymen <span>ben Yedder</span></h1>

<!-- Value prop -->
<p>I help SaaS teams ship faster with zero-downtime deployments, observable infrastructure, and platform tooling developers actually use.</p>

<!-- Dual CTA -->
<a href="#contact" class="btn-primary">Book a 30-min discovery call</a>
<a href="#projects" class="btn-secondary">View selected work →</a>

<!-- Trust signals -->
<div class="flex items-center gap-6 text-sm text-[var(--text-3)]">
  <div>✓ 8+ years production infra</div>
  <div>✓ 24 production deployments</div>
  <div>✓ 0 major incidents (2025)</div>
</div>

<!-- Trust Bar (below fold) -->
<div class="trust-bar">
  <span>Trusted by</span>
  <div>Alizeth · DevCom · CB Audit & Conseil</div>
</div>
```

**Removed:** Terminal simulation, status panel, old CTA buttons ("Deploy to Production", "Initiate Contact"), flickering "System Status" badge

**Build:** ✅ Passing

---

## 🔄 Phase 2: Content Restructure — **IN PROGRESS**

### 2.1 Index Page — Section Restructure

**Current Order (14 sections → too many):**
1. Hero
2. Terminal + Status ❌ **DELETE**
3. About
4. Services
5. Latest Writing
6. Executive Summary ❌ **MERGE INTO ABOUT**
7. Experience
8. Education ❌ **MOVE TO FOOTER**
9. Projects
10. Skills
11. Languages ❌ **INLINE IN FOOTER**
12. FAQ ❌ **REPLACE WITH PROCESS**
13. Contact

**Target Order (8 sections):**
1. Hero (✅ Done)
2. Trust Bar (✅ Done in HeroCard)
3. About (merged with Executive Summary)
4. Services → Outcome Packages
5. Experience (with metrics)
6. Projects → Case Studies
7. Skills (buyer-centric groups)
8. Process (replaces FAQ)
9. Contact (single CTA)
10. Footer (Education, Languages, Social)

### 2.2 Files to Modify

| File | Action |
|------|--------|
| `src/pages/index.astro` | Restructure sections, update imports, remove TerminalCard/StatusPanel |
| `src/components/sections/AboutSection.astro` | **NEW** — Merged About + Executive Summary |
| `src/components/sections/ProcessSection.astro` | **NEW** — Replaces FAQ |
| `src/components/sections/Footer.astro` | **NEW** — Footer component |

---

## 📝 Next Steps (Immediate)

### 2.1 Create Merged About Section
Create `src/components/sections/AboutSection.astro` combining:
- Current About bio
- Executive Summary value props
- "What I solve" checklist

### 2.2 Update `index.astro`
- Remove TerminalCard, StatusPanel imports
- Remove Executive Summary section
- Remove Education section
- Remove Languages section
- Remove FAQ section
- Add AboutSection, ProcessSection, Footer imports

### 2.3 Create Footer Component
Create `src/components/sections/Footer.astro` with:
- Copyright
- Social links (LinkedIn, GitHub, Email)
- Education (inline, linked to LinkedIn)
- Languages (inline)

---

## 🎯 After Phase 2 Complete

| Section | Status |
|---------|--------|
| Hero | ✅ |
| Trust Bar | ✅ |
| About (merged) | 🔄 |
| Services (packages) | ⏳ |
| Experience (metrics) | ⏳ |
| Projects (case studies) | ⏳ |
| Skills (buyer groups) | ⏳ |
| Process | ⏳ |
| Contact (Calendly) | ⏳ |
| Footer | ⏳ |

---

## 📦 Files Modified So Far

| File | Status |
|-------|--------|
| `src/styles/globals.css` | ✅ Phase 0 + Button styles |
| `src/components/sections/HeroCard.astro` | ✅ Phase 1 complete rewrite |
| `src/pages/index.astro` | 🔄 Phase 2 in progress |

---

## 🚀 Next Action

**Create `src/components/sections/AboutSection.astro`** with merged content, then update `index.astro` to use new structure.