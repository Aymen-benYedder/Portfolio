# Image Brief — Article Visuals (AYMEN.DEV)

Date: 2026-08-07
Scope: Featured/OG images + inline diagrams for blog articles. Primary target: `agentic-ai-cicd-review-gates-2026`.

---

## 0. Global Style Anchor (append to EVERY generation prompt)

```
Style: dark background (#0B0E14), emerald green (#10B981) neon accents, subtle circuit/grid lines,
soft volumetric glow, high-tech, minimal, professional, cinematic lighting, wide banner composition
(1200x630 or 16:9), no text, no letters, no words, no watermark, no logo, no people's faces, 8k detail
```

- **Aspect ratio:** generate 1200×630 (2:1-ish) for OG/featured cards; 16:9 for inline banners.
- **Output:** convert to `.webp` (~80-100 KB target), save in `public/assets/img/`.
- **ALT + CAPTION:** required for every image (SEO + accessibility + GEO citation).

---

## 1. Featured / OG Card — NEW ARTICLE (primary)

**File:** `public/assets/img/agentic-ai-cicd-review-gates-2026.webp` (1200×630)

**Concept:** AI agent standing guard at a CI/CD review gate. A glowing emerald "gate" formed by two
vertical light beams; streams of code particles flowing through it; a translucent holographic AI
entity observing the stream (never blocking it); a small human silhouette at the far end with a
subtle checkmark glow (human holds merge authority).

**Generation prompt (copy-paste):**
```
A futuristic dark control room, wide horizontal composition. In the center, a glowing emerald green
gateway formed by two vertical beams of light with particles of code flowing through it like a river.
Beside the gate, a translucent holographic AI entity with a single eye-like core watches the data
stream calmly. At the far end, a small human silhouette stands on a raised platform, a faint
checkmark glow above its hand. Deep navy-black background (#0B0E14), subtle circuit board grid,
emerald (#10B981) and teal accents, soft volumetric light, cinematic, ultra-detailed. Style: dark
background, emerald neon, minimal, professional, no text, no letters, no watermark, no logo, 8k
```
**Negative prompt:** text, letters, words, watermark, logo, faces, cartoon, bright white background

**Stock search terms (if searching instead of generating):**
- `dark code review terminal green`
- `AI circuit gate dark background`
- `developer terminal green glow abstract`
- `pipeline abstract emerald dark`
- `cybersecurity gateway dark neon`
- `neural network green dark background`

**alt:** "AI coding agent positioned as a review gate in a CI/CD pipeline, with a human approving the merge"
**caption:** "In 2026 the winning placement is the agent at the gate — advisory, never the merge button."

---

## 2. Pipeline Flow Diagram (inline, Architecture section)

**Recommendation: DO NOT use AI image generation for this.** Text-heavy diagrams from image models
produce garbled labels. Hand-author as SVG (I can do this) or use Mermaid/Excalidraw then export SVG.

**Flow to visualize (5 nodes):**
```
commit → deterministic checks (lint · SAST · secret scan)
       → AI review gate (advisory comments, never auto-approve)
       → human approval (branch protection / required reviewers)
       → merge
```

**File:** `public/assets/img/agentic-ai-review-gate-flow.svg`
Style: dark bg, emerald nodes, mono-font labels, thin arrows. Accessible `<title>` + `<desc>` inside SVG.

**If you still want to generate an abstract version:**
```
Abstract horizontal pipeline of glowing emerald nodes connected by arrows on a dark navy background,
the third node larger and glowing with a shield outline, data particles flowing left to right,
minimal, no text
```

---

## 3. Security / Guardrails Visual (inline, Security section)

**File:** `public/assets/img/agentic-ai-guardrails.svg` (hand-authored, or generated abstract)

**Generation prompt (abstract version):**
```
A digital shield made of layered hexagonal plates with glowing emerald edges, a padlock icon embedded
in the center, dark navy background, faint fragments of terminal code fading in the background,
minimal, premium, no text
```

**Stock search terms:** `digital shield dark green`, `cybersecurity lock dark`, `zero trust abstract green`

---

## 4. Quick Concepts — Other Popular Articles (when rolling out)

| Article slug | Concept | Search terms | Gen hint |
|---|---|---|---|
| docker-security-hardening-2026 | Stack of glowing cargo containers, one locked | `docker containers abstract green dark` | container + shield |
| terraform-production-state-… | Geometric building blocks assembling into a structure | `infrastructure blocks dark green` | blocks + nodes |
| prometheus-grafana-self-hosted-… | Glowing line charts on dark dashboard | `monitoring dashboard dark green` | line charts + glow |
| gitops-2026-argocd-fluxcd | Two synchronized circular arrows (git sync) | `git merge abstract green dark` | two arrows, synced |
| state-of-web-performance-2026 | Speedometer / lightning bolt | `website speed test dark green` | bolt + gauge |
| deploying-scaling-llms-production | Server racks with brain hologram above | `GPU server AI dark green` | racks + brain |
| vibe-coding-security-… | Warning sign with code fragments | `cyber warning dark green` | caution + code |
| npm-vs-pnpm-vs-yarn-vs-bun-2026 | Has image field already — **re-host** the webp into `public/assets/img/` (current URL may 404) | — | — |

---

## 5. Conventions

- **Naming:** `public/assets/img/<post-slug>.webp` (featured) · `<post-slug>-<topic>.svg` (inline)
- **Format:** WebP for photos/OG cards; SVG for diagrams (crisp, accessible, GEO-friendly)
- **AEO RULE:** Images complement — never replace — HTML tables, FAQ, and direct answers. Keep
  structured content in markup so snippets/LLMs still read it.
- **Alt text:** descriptive + keyword-natural; **figcaption:** short, adds context (the template
  already renders caption when present).
