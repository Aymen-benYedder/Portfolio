41% of all code produced globally is now AI-generated, and in some organizations AI authorship already sits at 90% [1]. Only 29% of developers trust the accuracy of the tools that write it, and 66% report spending more time debugging AI output than they expected [2]. Adoption and distrust are rising on the same chart, and that divergence is the whole story of engineering in 2026.

How do you review AI-generated code in 2026? Treat it like code from a capable junior who is fast, confident, and occasionally hallucinating: verify behavior by execution, not by reading; treat tests as evidence, not proof; resolve every suggested dependency against the registry; and never auto-merge. Concretely, that means running both the happy path and the error path, hunting for self-referential tests, and escalating human scrutiny by risk — light review for boilerplate, standard review for business logic, and full senior review with SAST and a threat model for anything touching auth, crypto, payments, or infrastructure. The bottleneck has moved from generation to verification, and the senior skill is now verifying AI output faster than the models can produce it.

## The Trust Collapse Is Measurable

Stack Overflow's 2025 survey of 49,009 developers across 166 of 177 countries shows a workforce that adopted AI universally and lost faith in it simultaneously [2]. **84% use or plan to use AI tools, up from 76% in 2024.** Trust in the accuracy of AI answers fell from **40% to 29%** in a single year. Only **3% of respondents "highly trust"** AI output, while **46% actively distrust** it. Experienced developers with 10+ years of tenure are the most cautious cohort: just 2.6% highly trust AI answers, and 20% highly distrust them. The people with the deepest scar tissue are the least convinced.

The debugging burden confirms the skepticism is earned. **66% of developers spend more time debugging AI-generated code than expected.** Between **45% and 66%** name "almost right, but not quite" as their top frustration with AI tools — the exact failure mode that converts a five-minute review into a forty-minute archaeology session. Yet the habit persists: **75% still ask another human** when they do not trust an AI answer. Aggregate favorability toward AI tools has slid from **77% in 2023 to 72% in 2024 to 60% in 2025.** Stack Overflow's leadership read the data as a "growing lack of trust in AI tools." The developer base is willing but reluctant: it uses the tools because they are free and fast, and it verifies the results because they are neither accurate nor safe.

## The Perception Gap: Devs Think It's Faster. It Isn't.

The strongest evidence that perceived AI speed is a fiction comes from a randomized controlled trial by METR, published July 2025 (arXiv:2507.09089) [3]. Sixteen experienced open-source developers — averaging five years on their own repositories, which together carry 22k+ stars and 1M+ lines of code — were assigned 246 real issues from their own codebases, with AI access randomized per task. These were not toy kata problems; these were issues on the developers' own mature projects, where domain context was maximal.

The result was a clean three-way split between belief and measurement. Participants forecast that AI would cut their time by 24%. After the study, they still believed they had been about 20% faster. The measured effect was **19% slower**, with a confidence interval of +2% to +39% — the true effect could not be ruled out as zero or worse, and in no scenario did it constitute a speedup. Developers accepted fewer than **44% of AI suggestions**; the rest required review, fixes, or outright rejection. METR's February 2026 follow-up with 57 developers and 800+ tasks narrowed the deficit to roughly a 4% slowdown — less negative, but still no speedup. The study names the cause: context gaps, code cleanup burden, prompt overhead, and the cost of verifying output.

The engineering conclusion is not that AI is useless. It is that the constraint has moved. **"The old constraint was writing code. The new constraint is reviewing it."** A developer who measures throughput by code written will see gains; a developer who measures by merged, correct, secure code is now spending that time in review. The tool did not remove the bottleneck; it relocated it, and it relocated it onto the most expensive human activity in the building.

## The Security Data Nobody Reads

Veracode's GenAI Code Security report evaluated 100+ LLMs across 80 tasks in Java, Python, C#, and JavaScript. The headline: **45% of AI-generated code introduces an OWASP Top 10-class flaw** [4]. At comparable codebases, AI-generated code carries **2.74x more vulnerabilities than human-written code**. Java is the worst case at a **70%+ failure rate** (71.5–72% across runs), while Python fails at 38%, JavaScript at 43–45%, and C# at 45%. By weakness: **86% of AI-generated XSS attempts fail, and 88% of log injection (CWE-117) output fails.**

The trend line is the part that should alarm engineering leadership. Since 2023, the syntax pass rate of AI code has climbed from roughly 50% to ~95%, while the security pass rate has stayed **flat at 45–55% across every model generation**. Models got better at everything except what breaks production. The same report found that **41% of all code produced globally is AI-generated** [1], with some organizations reporting 90% AI authorship — code that will be reviewed by humans who already distrust it, written by systems that have not improved on security in three years.

Independent data agrees. CodeRabbit's analysis of 470 open-source pull requests found that AI-contributed PRs create **1.7x more issues** and are **1.88x more likely to introduce a vulnerability** than human PRs [5]. None of this is a reason to ban AI. It is a reason to assume the output is compromised until verified — which is exactly what the maintainers in the next section concluded.

## The Maintainer Revolt

The people who merge code for a living have started enforcing the verification burden at the policy level. In January 2026, cURL's Daniel Stenberg shut down the project's six-year, **$86,000 bug bounty program** [6]. Twenty percent of submissions were AI-generated garbage. The valid-report rate fell from 15% to 5%. In the first three weeks after the AI flood began, cURL received 20 AI-generated bug reports; seven arrived in a single 16-hour burst. None was real.

The responses cascade across the ecosystem:

- Ghostty's Mitchell Hashimoto adopted zero tolerance for drive-by AI pull requests — "not anti-AI... anti-idiot." [7]
- Godot's Rémi Verschelde called AI-generated PRs "increasingly draining and demoralizing"; a contributor described the experience as "a total shitshow." [8]
- QEMU, Gentoo, NetBSD, Debian, and Cloud Hypervisor formally ban or restrict AI contributions. QEMU's rule is structural: an AI cannot satisfy the Developer's Certificate of Origin, so it cannot vouch for provenance. [9]
- Flux CD's Stefan Prodan: **"AI slop is DDOSing OSS maintainers."** [10]

The pain is measurable, not anecdotal. EchoSift's July 2026 clustering of 24,485 pain signals from GitHub, Stack Overflow, Hacker News, and Bluesky ranks "Codex/AI review failures" as the single highest cluster, with a pain score of 109 and still growing 6% [11]. GitHub shipped the ability to disable pull requests entirely. "The bottleneck has moved from generation to verification" is no longer a metaphor — it is a support queue.

## How to Review AI Code Like a Senior Engineer

### Know the "almost right" failure modes

AI output fails in predictable patterns, and each pattern needs a specific check. The five that cost teams real incident time:

1. **Self-referential tests.** Generated tests frequently re-implement the logic they claim to verify instead of calling the functions under test. The test passes because it asserts against its own implementation, not against the code. It is green, and it proves nothing.
2. **Code that looks complete but does nothing.** The canonical example is a cache implementation that creates the cache and never stores anything: every function present, zero behavior. The diff reads as finished; execution reads as a no-op.
3. **Hallucinated dependencies.** Sonatype found that **27.76% of AI upgrade recommendations reference versions that do not exist** — a direct typosquatting and supply-chain vector [12]. Endor Labs found that **49% of AI-imported dependencies carry known CVEs** [13]. Never accept a dependency suggestion without checking the registry.
4. **Convention blindness.** The code is correct in isolation and wrong in your codebase: it violates naming, structure, and error-handling conventions, and it silently accumulates friction for every future contributor.
5. **Plausible bugs.** George Hotz's observation is the most dangerous one: bugs that "look plausible" evade notice longer [14]. Human reviewers extend the benefit of the doubt to code that reads well. AI produces fluent, well-formatted, confidently wrong code by default — it manufactures exactly the appearance that suppresses scrutiny.

### The 10-point verification checklist

A practical checklist for every AI-assisted pull request, in order:

1. **Read the tests first.** Do they assert behavior, or do they echo the implementation? Delete any test that re-implements the logic under test.
2. **Run the code, don't read it.** Execute the happy path and the error path. If the error path is untestable, that is a design problem, not a testing limitation.
3. **Check the diff for deletion smell.** AI is additive by instinct. A pull request that only adds code and never removes any is a pull request building the wrong abstraction.
4. **Verify dependencies resolve.** Every suggested version must resolve to a real, current version in the registry. Never trust an upgrade suggestion without checking.
5. **Search for silent swallow.** Empty catch blocks, ignored return values, and discarded errors are where production incidents are born.
6. **Trace the security-sensitive paths yourself.** Auth, crypto, payment, and filesystem code gets a manual trace from input to trust boundary. No shortcut, no delegation.
7. **Run SAST/SCA and mutation testing.** Mutation testing specifically catches self-referential tests: if killing a mutant does not fail the suite, the tests are not testing the code.
8. **Check conventions.** Naming, structure, and error handling must match your repository, not the model's training distribution.
9. **Verify error messages and edge cases actually trigger.** A generated error path that can never fire is dead code that lies about its own existence.
10. **Timebox verification.** If you cannot verify the change within a reasonable window, rewrite it yourself or split the pull request. Reviewing a 400-line generated diff is not faster than writing 80 lines by hand.

### Trust tiers — how much human verification does AI output deserve?

Not all AI output deserves the same scrutiny, and treating it uniformly wastes the only resource that matters: senior attention. Use escalating tiers:

- **Tier 0 — Boilerplate, configuration, documentation, migration scaffolding:** light review. The cost of failure is low and recoverable. Read it, run it once, move on.
- **Tier 1 — Business logic, CRUD, tests:** normal review plus run the test suite. Standard peer review applies; the diff still gets a human read.
- **Tier 2 — Auth, crypto, payments, infrastructure, concurrency:** full senior review, SAST, and a threat model. Never auto-merge, never rubber-stamp, and treat generated tests in this tier as inadmissible evidence until mutation-tested.

The tier system only works if the gates are enforced mechanically. Hybrid-strict review gates — auto-approving nothing above Tier 1, requiring a named human approver at Tier 2 — showed a **1.7% defect escape rate versus 4.1% under auto-approve** in the review-gates work on this site [15]. An honor system collapses the moment a Friday deployment deadline arrives; a gate in the pipeline does not.

### Tooling that catches what eyes miss

Human review does not scale to the volume AI can produce, so the verification stack has to be automated where it can be:

- **SAST at the right stage:** Semgrep, CodeQL, or Veracode run on every pull request, with the AI-authored diff treated as a first-class security input rather than a low-risk change.
- **SCA for dependencies:** OWASP Dependency-Check or Trivy to neutralize the hallucinated-version and known-CVE vectors before they reach a lockfile.
- **Secrets detection pre-commit:** Gitleaks, TruffleHog, or GitHub push protection. Generated code loves to hardcode credentials.
- **Mutation testing:** Stryker and equivalents catch the self-referential test pattern that no linter sees.
- **Provenance and attribution:** DryRun Security and Endor Labs attribute AI commits so review gates can apply the trust tiers automatically instead of from memory.
- **Better prompts:** Backslash found that security-focused prompting measurably improves output, with some models reaching 100% correctness under explicit "write secure code" instructions [16]. Prompting is not a replacement for review, but it reduces the defect count arriving at the gate. Veracode's Fix case study reports a **92% reduction in vulnerability detection time, 200%+ faster remediation, and 80%+ fix acceptance** [17] — the tooling economics work once the gate exists.

## Closing

The reviewer is the new senior role. Generation is a commodity; verification is the scarce skill, and the market has already priced it: maintainers are banning unverified AI contributions, security pass rates have been flat for three years, and developers who measure real outcomes are measurably slower with AI than without it. Forrester warns of a "technical debt tsunami" [18] — and unverified AI output is the floodwater.

The correct stance is not anti-AI. It is pro-verification. Use the models for scaffolding, boilerplate, and the first pass — 77% of professionals already refuse to treat vibe coding as real work [16] — and spend the saved effort where it matters: reviewing, tracing, and securing the output. If you are a senior engineer, that is your job description now. If you are hiring one, test for it. If you are building pipelines, put the review gate in before the AI writes another line. The rest of this site is built around exactly that practice: review gates, security tooling, and the CI/CD plumbing that makes verification cheaper than generation.

## Footnotes

[1] Veracode GenAI Code Security Report (2025, with Spring 2026 update) — supports the 41% global AI-generated code share and 90% AI authorship at some organizations.

[2] Stack Overflow Developer Survey 2025 (49,009 respondents, 166/177 countries) — supports the trust collapse: 84% vs 76% adoption, 40%→29% trust in accuracy, 3% highly trust, 46% actively distrust, 66% debugging time, 45–66% "almost right, but not quite," 75% ask a human, favorability 77%→72%→60%.

[3] METR — "Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity" (arXiv:2507.09089, July 2025; February 2026 follow-up) — supports the 24%/20%/19% belief-vs-measurement split, 44% acceptance rate, and ~4% follow-up slowdown.

[4] Veracode GenAI Code Security Report — supports the 45% OWASP Top 10-class flaw rate, 2.74x vulnerability ratio, 70%+ Java failure, 86% XSS failure, 88% CWE-117 failure, and flat 45–55% security pass rate.

[5] CodeRabbit analysis (470 open-source PRs) — supports the 1.7x issue ratio and 1.88x vulnerability likelihood of AI PRs.

[6] cURL / Daniel Stenberg (January 2026) — supports the $86k bug bounty shutdown, 20% AI garbage submissions, 15%→5% valid rate, and the 20/7 AI report counts.

[7] Ghostty / Mitchell Hashimoto — supports the zero-tolerance AI PR policy and the "anti-idiot" quote.

[8] Godot / Rémi Verschelde — supports the "draining and demoralizing" characterization of AI PRs.

[9] QEMU, Gentoo, NetBSD, Debian, Cloud Hypervisor contribution policies — supports the formal bans/restrictions and the QEMU Developer's Certificate of Origin position.

[10] Stefan Prodan (Flux CD) — supports the "AI slop is DDOSing OSS maintainers" quote.

[11] EchoSift Developer Pain Points (July 2026) — supports the 24,485 pain-signal corpus and the "Codex/AI review failures" cluster at pain score 109, growing 6%.

[12] Sonatype — supports the 27.76% non-existent-version rate in AI upgrade recommendations.

[13] Endor Labs — supports the 49% known-CVE rate among AI-imported dependencies.

[14] George Hotz — supports the claim that plausible-looking bugs evade notice longer.

[15] Aymen ben Yedder, agentic-ai-cicd-review-gates-2026 (this site) — supports the hybrid-strict gate defect-escape comparison (1.7% vs 4.1% auto-approve).

[16] Backslash security research — supports security-focused prompt improvements and the 77% figure for professionals who do not consider vibe coding real work.

[17] Veracode Fix case study — supports the 92% detection-time reduction, 200%+ faster remediation, and 80%+ fix acceptance.

[18] Forrester — supports the "technical debt tsunami" forecast.
