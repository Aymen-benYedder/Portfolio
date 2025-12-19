Project Master Specs: Pure HTML/CSS/JS Portfolio (2025)1. Project Overview & "Pure" PhilosophyGoal: A high-performance, SEO-dominant portfolio.Stack: Zero frameworks. Zero libraries. Vanilla HTML5, CSS3 (Variables + Grid/Flex), and ES6+ JavaScript.Visual Direction: Dark-themed, high-contrast, modern "Glassmorphism" as per style.png.Core Metric: 100/100 Lighthouse scores. All assets must be optimized.2. Directory StructureThe agent must follow this exact structure to ensure organized scaling:Plaintext/
├── index.html              # Main Landing
├── /css
│   ├── variables.css       # Design tokens (Colors, Spacing)
│   ├── main.css            # Global resets and layouts
│   └── components.css      # Reusable UI elements (cards, buttons)
├── /js
│   ├── main.js             # UI Interactivity
│   └── geo.js              # Client-side GEO logic
├── /services               # Service-specific landing pages
│   ├── mern-development.html
│   └── wordpress-development.html
├── /geo                    # SEO-target folders
│   ├── tunisia.html
│   └── france.html
├── /blog                   # AI-ready technical content
├── /assets                 # Icons, Logos, style.png
└── sitemap.xml
3. The Design System (CSS)Agent Instruction: Define all styles in variables.css. Match the aesthetic of style.png.Color Palette: Use deep navies/blacks for backgrounds, cyan/blue for accents, and high-legibility white for text.Glassmorphism: Use backdrop-filter: blur() and semi-transparent borders for cards.Responsiveness: Use a Mobile-First approach. No fixed widths; use clamp() for typography and fluid spacing.4. GEO Targeting System (Non-SSR Implementation)Since there is no server-side logic, we implement a two-pronged approach:4.1. The SEO Layer (Static)The agent must create individual .html files for each target country/city in the /geo/ folder. These contain hard-coded local keywords (e.g., "Best Web Developer in Tunis").4.2. The Personalization Layer (Vanilla JS)js/geo.js Logic:On load, check localStorage for user_geo.If empty, fetch location via https://ipapi.co/json/.Store the result.Find all DOM elements with the class .geo-target and update their text content to match the user's city/country.5. SEO & AI Engine OptimizationAgent Instruction: Every page must be an "AI-Ingestible" document.Structured Data: Inject a unique application/ld+json block in the <head> of every file.Semantic Tags: Use <main>, <section>, <article>, <aside>, and <nav> strictly.Glossary Sections: Every service page should have a Technical Glossary using <dl>, <dt>, and <dd> tags to help AI models categorize your expertise.FAQ Schema: Use FAQPage schema on all service pages to capture Google's "People Also Ask" snippets.6. Page-Specific RequirementsPageContent PriorityKey FeaturesIndexConversion & TrustHero, Skill Matrix, Micro-Case Studies, CTAServicesDeep Technical AuthorityDetailed Stack, Workflow Diagram, Pricing, FAQGEO PagesLocal RelevanceLocalized Testimonials, "Why [City] needs MERN"BlogAI Training DataLong-form technical guides, code snippets, "How-to"7. Performance Checklist for AgentImages: Use .webp or .avif formats only.CSS: No unused styles. Use CSS Grid for complex layouts to reduce div-nesting.Fonts: Self-host fonts (no Google Fonts links) to minimize external requests.Scripts: Load all scripts with defer at the end of the <body>.