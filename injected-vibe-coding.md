# Vibe Coding Is a Security Disaster Waiting to Happen — And Nobody's Talking About the Real Numbers

## The App That Lasted Three Days

Launched January 2026: a "social network for AI agents" called Moltbook. Three days later, it all came apart. **1.5 million API authentication tokens, 35,000+ email addresses, 4,060 private messages, and plaintext OpenAI API keys** — just gone, exposed to anyone who knew how to ask. The founder's public admission? He **hadn't written a single line of code manually**. The entire app was vibe-coded. Wiz Research found the Supabase database had **Row-Level Security fully disabled**. Every table. Every row. Accessible to any authenticated user. No exploit. No sophisticated attack chain. Just an API call that returned data belonging to someone else. The AI had scaffolded everything with the most permissive defaults possible because that's what made it *work* in development.

Think about that. The database had been sitting that way since launch. Wide open. And the only thing that makes Moltbook different from thousands of other AI-generated applications hitting production right now is that someone caught it.

---

## What "Vibe Coding" Actually Is

Andrej Karpathy coined the term on February 2, 2025. The post generated **4.5 million views**. His exact framing:

> *"There's a new kind of coding I call 'vibe coding', where you fully give in to the vibes, embrace exponentials, and forget that the code even exists... I 'Accept All' always, I don't read the diffs anymore... The code grows beyond my usual comprehension."*

He framed it as something for "throwaway weekend projects." That framing? It didn't survive contact with reality. By November 2025, Collins Dictionary made it **Word of the Year**. The New York Times profiled it. And somewhere along that timeline — quietly, without anyone noticing — the first wave of production applications built this way started hitting infrastructure.

Then, by early 2026, Karpathy had already declared vibe coding obsolete. He introduced **"agentic engineering"** — orchestrating AI agents rather than writing code directly. He told Sequoia Capital's AI Ascent:

> *"Sometimes I get a little bit of a heart attack because it's not like super amazing code necessarily all the time. It's very bloaty, and there's a lot of copy-paste, and there's awkward abstractions that are brittle, and it works, but it's just really gross."* [^karpathy]

Read that twice. The coiner is warning us. The question is whether anyone in production engineering is acting on it.

## The Numbers Are Not Optional

Whatever we think about vibe coding, the hard truth is: it's past the point of being stoppable.

- **84%** of developers are using or planning to use AI coding tools (Stack Overflow 2025, n=49,000+) [^stackoverflow]
- **90%** use AI regularly at work (JetBrains, n=10,000+)
- **72%** of those who've tried it use AI daily (SonarSource 2026) [^sonarsource]
- GitHub Copilot: **20 million** cumulative users, **4.7 million** paid subscribers
- Cursor: **$2B+ ARR**. Lovable: **$400M ARR**

Anyone operating infrastructure should pay attention to this part — anyone who's ever been woken up by a pager at 3 AM:

- **46%** of all code on GitHub is now AI-generated (GitHub State of Octoverse 2025)
- Developers self-report **42%** of their code comes from AI (SonarSource 2026)
- Gartner projects **60%** by end of 2026
- **25%** of Y Combinator's W25 startups have **95%+ AI-generated codebases** [^yc]
- **256 billion** lines of AI code produced in 2024 alone

Do the math that nobody in the boardroom is doing. 46% of new code is AI-generated. An independent body of research shows **45-62% of AI-generated code contains security vulnerabilities**. So roughly **20-28% of everything being deployed right now shipped with known vulnerability classes baked in from generation**. That's not a prediction. That's arithmetic.

## The Convergence Nobody's Connecting

We don't have one study telling us AI code is insecure. We have **eight**. Different methodologies. Different toolchains. Different vulnerability taxonomies. And they all converge on the same ugly truth.

**Veracode** tested **100+ LLMs** across **80 real-world coding tasks** [^veracode]. **45%** of AI-generated code introduced OWASP Top 10 vulnerabilities. Java hit **>70%**. Cross-Site Scripting (CWE-80) failed **86%** of the time. Log Injection (CWE-117) failed **88%**. The alarming detail: syntax correctness improved from ~50% to **>95%** between 2023 and 2025, but security pass rates stayed stuck at ~55%. Veracode's CTO put it bluntly: *"Models are getting better at coding accurately but are not improving at security."* The **Cloud Security Alliance** independently replicated this at **62%** [^csa].

What happens when you audit the actual PRs? CodeRabbit looked at **470 open-source pull requests** [^coderabbit] where AI had co-authored code. The per-PR issue count came back at **1.7x** the human baseline. Let me be specific: XSS at **2.74x**, insecure object references at **1.91x**, improper password handling at **1.88x**, business logic errors at **>2x**, excessive I/O at **~8x**. Eight times. For I/O.

The fallout on velocity is measurable. Apiiro tracked **7,000+ developers** across **62,000 repositories** inside Fortune 50 enterprises [^apiiro]. AI-assisted developers churned out **3-4x more commits** — but bundled them into **fewer, wider PRs**. The nightmare scenario for any code review. Security findings? **10x higher**. By mid-2025, organizations were seeing **10,000+ new security findings per month** from AI-originated code. Privilege escalation paths: **+322%**. Architectural design flaws: **+153%**. AI-assisted developers leaked Azure Service Principals and Storage Access Keys **nearly 2x as often**. Apiiro's Itay Nussbaum: *"Unlike a bug that can be caught in testing, a leaked key is live access: an immediate path into the production cloud infrastructure."*

If this is starting to sound familiar, it should.

**28.65 million** hardcoded secrets in public GitHub commits last year alone. That's GitGuardian's tally [^gitguardian] — up **34%** year-over-year, the largest single-year jump they've ever recorded. Drill down: **Claude Code-assisted commits leak secrets at ~3.2% — double the baseline rate**. AI-service secrets specifically: **1,275,105 — an 81% increase**. Twelve of the fifteen fastest-growing leaked secret categories were AI services. And **64%** of credentials confirmed valid in 2022 are still active. Unrevoked. Sitting there.

The growth curve is exponential, not linear. Georgia Tech's Vibe Security Radar [^gatech] tracks actual CVEs traceable to AI-generated code. As of March 2026: **78 confirmed AI-linked CVEs** (14 critical, 25 high). 18 cases across all of H2 2025. Then **56 cases in Q1 2026 alone**. Then **35 in March 2026 — more than the entire previous year combined**. Researchers estimate the **true count is 5-10x higher** (~400-700) because most AI tooling doesn't leave identifiable commit metadata. Hanqing Zhao: *"When an agent builds something without authentication, that's not a typo. It's a design flaw baked in from the start."*

And then there's what the broader landscape looks like when you zoom out. Escape.tech swept **5,600 publicly deployed vibe-coded applications** [^escape] and found **2,000+ high-impact vulnerabilities**, **400+ exposed secrets**, **175 instances of exposed PII** — including medical records. **65%** had at least one security issue; **58%** had a critical issue. GitClear's analysis of **211 million lines of code** found refactoring had dropped **44%** while code duplication increased **8-fold** [^gitclear]. Meanwhile, Kaspersky documented something counterintuitive: each additional prompt iteration made code *less* secure — after **5 rounds of prompting**, AI-generated code contained **37% more critical vulnerabilities**. More prompts, more danger.

Every study is measuring a different slice of the same reality. The bottom line emerges clearly: **AI-generated code is measurably less secure than human-written code, and the gap is not closing.**

## Real Breaches, Not Benchmarks

Moltbook is the cleanest case study because attribution is unambiguous. The founder said he wrote zero lines. The pattern — **Broken Object Level Authorization (BOLA)** — is exactly what you expect when a model optimizes for "works" and never considers "works safely."

**Lovable**, valued at **$400M+ ARR**, suffered the same BOLA vulnerability in April 2026 [^lovable]. Any free-tier account could read another user's source code. Database credentials. Customer data. The researcher demonstrated the exploit in **5 API calls**. Five. Lovable confirmed authentication but **never verified object ownership**. The exposure window: **48 days** after the initial HackerOne report. Separately, **CVE-2025-48757** documented missing Supabase RLS in **170+ Lovable-generated applications**.

**Base44** suffered an authentication bypass via a public app_id visible in every app URL. **Claude Code** shipped a **59.8 MB source map file** in its npm package, exposing **~512,000 lines of proprietary TypeScript** — the tool had itself been partly vibe-coded, and the leak came from a speed-over-review packaging error. A Lovable-built exam app exposed **18,697 users** including students from top U.S. universities — **16 vulnerabilities, 6 critical**. **Enrichlead** followed a pattern Willem Delbare calls "client-side security theatre": the founder built with Cursor, security lived entirely in the browser, and any user who knew where to look had full data access.

Notice the pattern. Every breach follows the same arc. The AI generates authentication but not authorization. It ships secrets with client code. It builds infrastructure that deploys cleanly but has no security boundaries. The developer, operating in "vibe" mode, never inspects the output deeply enough. They can't. They don't know what to look for.

## The DevOps Blind Spot

Now the story shifts. From "insecure app code" to something much more consequential for anyone running infrastructure.

Infrastructure as Code is the weakest link in the AI security chain. And it's almost entirely undiscussed in the mainstream coverage. Nobody's talking about this.

The **MITRE/Checkov IaC-Eval study (2026)** found LLMs generate syntactically correct IaC with **5-15 security policy violations per script** [^mitre]. **Firouzi et al. (arXiv, 2026)** tested ChatGPT and Gemini on IaC: **75% of ChatGPT's** and **56% of Gemini's** outputs were insecure — **without any security warnings** [^firouzi]. The worst finding: when explicitly prompted for "secure" code, **44% of ChatGPT's and 34% of Gemini's outputs still contained security smells**. Only **7% of outputs were fully secure**. Seven percent.

**Quali** captured the IaC failure mode perfectly: *"When GenAI Gets IaC Wrong, It Looks Exactly Right."* [^quali] AI-generated infrastructure failures aren't syntax errors — they're wrong assumptions and incomplete reasoning. A Terraform plan will parse. It will apply. It will create resources. And you'll have an S3 bucket open to the world because the model learned "public-read" from its training data and never asked whether that was appropriate.

The **Spacelift Infrastructure Automation Report (June 2026)** should be a boardroom document at every organization shipping AI code [^spacelift]:

| Metric | Figure |
|--------|--------|
| Organizations with AI-caused infrastructure incidents | **93%** |
| Organizations with proper AI governance foundations | **19%** |
| Ship AI-generated infra code without review | **78%** |
| Would deploy AI-generated code directly to production | **33%** |
| Dev ahead of infra in AI adoption | **67%** |
| AI increased demands on infra teams | **86%** |
| Plan to adopt agentic AI for infrastructure | **89%** |
| Have formal AI governance policy | **30%** |
| Monitor volume of AI-generated infra code | **15%** |

Let me read that back to you. **93%** of organizations have already had an AI-caused infrastructure incident. **78%** ship AI-written infra code without review. **33%** would deploy AI-generated code directly to production. And **89%** plan to adopt agentic AI for infrastructure — AI agents that autonomously manage infrastructure — while only **19%** have the governance to do it safely. That is not a gap. That's a chasm.

From a DevOps perspective, the failure chain is disturbingly tight:

1. Developer prompts AI → code generated → "works on my machine"
2. Committed → no human review of AI-generated sections
3. CI/CD runs → tests pass (because AI wrote the tests too)
4. Deployed → misconfiguration not caught until breach

Uncle Bob identified the testing problem: when the same AI agent writes function and test in the same session, *"the test will almost always pass. This is not a sign of quality. It's a sign of self-consistency."* [^unclebob]

Apiiro's finding that AI commits are **fewer and wider** means code review breaks down. A single PR might touch a dozen services. The reviewer, faced with thousands of lines of generated Terraform and application code, trusts the authoritative-looking output. This is the "mis-reviewed > unreviewed" problem. The confident tone suppresses critical instincts. I've seen it happen. You've probably seen it happen.

And the blast radius amplifies everything. A buggy function crashes one service. An IaC misconfiguration opens every resource in an account. CISA added Langflow CVE-2026-33017 (code injection via AI-generated code) to its KEV catalog in March 2026 [^cisa]. In May 2026, CISA issued alerts on supply chain compromises targeting CI/CD pipelines through Nx Console. The attack surface isn't just the code — it's the pipeline that ships it.

## Trust Has Already Collapsed

The sentiment data tells a story the industry should have heeded earlier. Developer trust in AI code accuracy fell from **~40% (2024) to 29% (2025)** — an 11-point drop in one year. AI tool favorability dropped from **77% (2023) to 60% (2025)** [^stackoverflow]. SonarSource found **96% of developers "do not fully trust that AI-generated code is functionally correct"** [^sonarsource]. Only **3%** report high trust. Three.

The frustrations are data points in themselves:
- **66%** cite "AI solutions that are almost right, but not quite"
- **45%** say debugging AI code takes longer than writing it themselves
- **35%** of Stack Overflow visits now fix AI-related problems
- **72%** say vibe coding isn't part of their professional work

Developers have figured out what the data confirms. AI code looks right but isn't. It compiles, it runs, it returns the right shape of data — and then falls over on an edge case the model never considered, or exposes a database the model never thought to lock down.

Willem Delbare, CTO of Aikido Security: *"Vibe coding makes software development more accessible but introduces massive security debt. Developers who don't understand the underlying code cannot possibly secure it... There is no accountability. AI coding agents are installing dependencies and making architectural decisions with no understanding of the security implications."* [^aikido]

## What We Do About It

I don't believe the answer is "stop using AI tools." The productivity gains are real. Adoption is irreversible. I've been around long enough to know that rolling back an adoption curve at this scale isn't how this industry works. But the infrastructure side needs to treat AI-generated code as **unverified input** — the same way we treat third-party dependencies. The CSA put it directly: *"Organizations should treat AI-generated code as unverified input, not trusted output."* [^csa]

**Mandatory pre-commit security gates.** AI-generated code should pass SAST and secret scanning before entering the repository. GitGuardian, TruffleHog — tools that catch hardcoded credentials at commit time. This needs to be as non-negotiable as a passing build.

If you're shipping AI-generated infrastructure, validation needs to be a pipeline requirement, not a post-mortem aspiration. Every Terraform or Pulumi config that comes out of an LLM should pass through policy-as-code frameworks (Checkov, Sentinel, OPA) before any plan applies. The "it looks right" failure mode is specifically what these tools were built to catch.

Separate function and test generation. If the same agent wrote both, neither is independently verified. Uncle Bob's advice — *"ban mocks at system boundaries. Real HTTP. Real databases. Mocked boundaries let the agent test its own fiction"* — should be organizational policy, not a suggestion.

The review process itself needs to change. AI-generated diffs require different questions — the shift is from "does this look correct?" to "what is the developer not aware they introduced?" Apiiro's finding that AI PRs are wider means teams need permission to split them and validate each service boundary independently.

**Infrastructure governance before agentic AI.** The **89%** that plan to adopt agentic AI for infrastructure need foundations first. The **19%** that have them ("Pioneers," per Spacelift) report fewer incidents and faster remediation. AI agents should operate in sandboxed environments. Infrastructure changes should require human approval through a separate channel. All AI-generated infrastructure should be subject to automated drift detection.

**Vulnerability tracking.** Tag AI-generated commits. Track security findings against them as a distinct metric. The Georgia Tech model — tracking actual CVEs — needs to become industry practice. We can't fix what we aren't measuring. I've cleaned up enough production incidents to know that one cold.

## The Discipline Didn't Die — It Moved One Step to the Right

Karpathy said something at Sequoia AI Ascent 2026 that I keep coming back to:

> *"You can outsource thinking, but you cannot outsource understanding."*

This is the line between productive use of AI tools and the disaster that's already deployed. The AI can generate Terraform that parses correctly. It can scaffold authentication flows that return 200 OK. But it cannot understand the security context of the infrastructure it's configuring. Blast radius of the permissions it's granting? Invisible. The difference between "works in development" and "is secure in production"? It cannot tell.

The original "I Accept All" workflow — Karpathy's throwaway weekend project from February 2025 — is now someone's production pipeline. And the difference between a weekend project and production infrastructure is the difference between "works" and "works safely."

Vibe coding didn't create security problems. It just made every existing one reproducible at the speed of autocomplete. The code compiles, sure. The containers start. The tests pass on the first run. The infrastructure deploys. And none of that tells you whether any of it is secure.

**91.5%** of vibe-coded applications shipped in Q1 2026 contained at least one vulnerability traceable to an AI hallucination. The disaster isn't coming. It's already deployed. Whether your organization has the infrastructure governance to survive it depends on what you do between now and your next pipeline run.

---

[^karpathy]: Andrej Karpathy, Sequoia Capital AI Ascent 2026 — https://www.youtube.com/watch?v=96jN2OCOfLs
[^stackoverflow]: Stack Overflow Developer Survey 2025 — https://survey.stackoverflow.co/2025/ai
[^sonarsource]: SonarSource State of Code 2026 — https://www.sonarsource.com/state-of-code-developer-survey-report.pdf
[^yc]: Garry Tan, YC blog 2025
[^veracode]: Veracode 2025 GenAI Code Security Report & Spring 2026 Update — https://www.veracode.com/resources/analyst-reports/2025-genai-code-security-report/
[^coderabbit]: CodeRabbit, State of AI vs Human Code Generation Report, Dec 2025 — https://coderabbit.ai/blog/state-of-ai-vs-human-code-generation-report
[^apiiro]: Apiiro, "4x Velocity, 10x Vulnerabilities," Sep 2025 — https://apiiro.com/blog/4x-velocity-10x-vulnerabilities-ai-coding-assistants-are-shipping-more-risks/
[^gitguardian]: GitGuardian, State of Secrets Sprawl 2026 — https://www.gitguardian.com/state-of-secrets-sprawl-report-2026
[^gatech]: Georgia Tech Vibe Security Radar — https://vibe-radar-ten.vercel.app/
[^escape]: Escape.tech, State of Security of Vibe-Coded Apps — https://escape.tech/state-of-security-of-vibe-coded-apps
[^gitclear]: GitClear, AI Copilot Code Quality 2025 — https://www.gitclear.com/ai_assistant_code_quality_2025_research
[^lovable]: The Register, "Lovable denies data leak," Apr 2026 — https://www.theregister.com/security/2026/04/21/lovable-denies-data-leak-cites-intentional-behavior/5226233
[^mitre]: MITRE/Checkov IaC-Eval 2026 — https://www.merl.com/publications/docs/TR2026-036.pdf
[^firouzi]: Firouzi et al., arXiv 2026 — https://arxiv.org/pdf/2602.03648
[^quali]: Quali, "When GenAI Gets IaC Wrong, It Looks Exactly Right," Mar 2026 — https://www.quali.com/blog/when-genai-gets-iac-wrong-it-looks-exactly-right/
[^spacelift]: Spacelift Infrastructure Automation Survey 2026 — https://spacelift.io/infrastructure-automation-survey-2026
[^unclebob]: Robert C. Martin — https://paddo.dev/blog/idiot-savant-needs-guardrails/
[^cisa]: CISA KEV catalog and supply chain alerts, 2026
[^aikido]: Willem Delbare, Aikido Security — https://thenewstack.io/aikido-ai-agents-security/
[^csa]: Cloud Security Alliance, "AI Vulnerability Debt," 2026 — https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-codegen-vulnerability-debt-20260406-csa/
