# SEO/GEO/AEO Final — ai-code-review-verification-2026

## Structured fields

- **seoTitle:** AI Code Review in 2026: How to Verify AI-Generated Code
- **seoDescription:** 41% of code is AI-generated, yet only 29% of devs trust it. How to review AI code: failure modes, 10-point checklist, trust tiers.
- **directAnswer:** Treat AI-generated code like code from a capable junior who is fast, confident, and occasionally hallucinating: verify behavior by execution, not by reading; treat tests as evidence, not proof; resolve every suggested dependency against the registry; and never auto-merge. Escalate human scrutiny by risk — light review for boilerplate, standard review for business logic, and full senior review with SAST and a threat model for anything touching auth, crypto, payments, or infrastructure. The bottleneck has moved from generation to verification.
- **keyTakeaways:**
  1. AI writes 41% of all code globally, yet only 29% of developers trust its accuracy and 66% spend more time debugging AI output than expected (Stack Overflow 2025).
  2. METR's randomized controlled trial measured developers 19% slower with AI despite predicting 24% faster — the bottleneck moved from writing code to reviewing it.
  3. 45% of AI-generated code introduces OWASP Top 10-class flaws and carries 2.74x more vulnerabilities than human code; the security pass rate has stayed flat at 45–55% since 2023.
  4. The five "almost right" failure modes are predictable: self-referential tests, no-op code, hallucinated dependencies, convention blindness, and plausible bugs.
  5. Use trust tiers (boilerplate → business logic → auth/crypto/infra) with hybrid-strict review gates: 1.7% defect escape vs 4.1% under auto-approve.
- **faq:**
  - Q: Why don't developers trust AI-generated code in 2026?
    A: Because the data says they shouldn't. Stack Overflow's 2025 survey of 49,009 developers found trust in AI accuracy fell from 40% to 29% in one year — only 3% highly trust AI output while 46% actively distrust it, and 66% spend more time debugging AI code than expected. Adoption (84%) and distrust are rising on the same chart.
  - Q: Is AI-assisted coding actually faster?
    A: Measured, no. METR's randomized controlled trial of 16 experienced open-source developers on 246 real issues found they were 19% slower with AI even though they predicted 24% faster and believed afterward they were 20% faster. Developers accepted fewer than 44% of AI suggestions. The February 2026 follow-up narrowed the deficit to about 4% but still found no speedup.
  - Q: How do I spot AI-generated code in a pull request?
    A: Look for the five failure modes: self-referential tests that echo the implementation instead of asserting behavior, code that looks complete but does nothing, hallucinated dependencies (27.76% of AI upgrade suggestions reference non-existent versions), convention blindness, and fluent plausible bugs that suppress scrutiny.
  - Q: What is the best way to verify AI code?
    A: Run it, don't just read it — exercise both the happy path and the error path. Run SAST/SCA and mutation testing (which catches self-referential tests), verify every dependency against the registry, and apply trust tiers: light review for boilerplate, normal review for business logic, and full senior review with a threat model for auth, crypto, payments, and infrastructure.
  - Q: Should I ban AI-generated code contributions?
    A: The maintainer revolt — cURL's bounty shutdown, Ghostty's zero tolerance, QEMU and Gentoo bans — is a reaction to unverified volume, not to AI itself. The pro-verification stance works better: keep AI for scaffolding and first passes, then enforce review gates with human approval. Hybrid-strict gates cut defect escape to 1.7% versus 4.1% under auto-approve.

## Body (HTML, 17 footnotes)

```html
<p>41% of all code produced globally is now AI-generated, and in some organizations AI authorship already sits at 90%.<sup><a href="#fn1" id="fnref1">1</a></sup> Only 29% of developers trust the accuracy of the tools that write it, and 66% report spending more time debugging AI output than they expected.<sup><a href="#fn2" id="fnref2">2</a></sup> Adoption and distrust are rising on the same chart, and that divergence is the whole story of engineering in 2026.</p>

<p>How do you review AI-generated code in 2026? Treat it like code from a capable junior who is fast, confident, and occasionally hallucinating: verify behavior by execution, not by reading; treat tests as evidence, not proof; resolve every suggested dependency against the registry; and never auto-merge. Concretely, that means running both the happy path and the error path, hunting for self-referential tests, and escalating human scrutiny by risk — light review for boilerplate, standard review for business logic, and full senior review with SAST and a threat model for anything touching auth, crypto, payments, or infrastructure. The bottleneck has moved from generation to verification, and the senior skill is now verifying AI output faster than the models can produce it.</p>

<h2>The Trust Collapse Is Measurable</h2>

<p>Stack Overflow's 2025 survey of 49,009 developers across 166 of 177 countries shows a workforce that adopted AI universally and lost faith in it simultaneously.<sup><a href="#fn2" id="fnref2">2</a></sup> <strong>84% use or plan to use AI tools, up from 76% in 2024.</strong> Trust in the accuracy of AI answers fell from <strong>40% to 29%</strong> in a single year. Only <strong>3% of respondents "highly trust"</strong> AI output, while <strong>46% actively distrust</strong> it. Experienced developers with 10+ years of tenure are the most cautious cohort: just 2.6% highly trust AI answers, and 20% highly distrust them. The people with the deepest scar tissue are the least convinced.</p>

<p>The debugging burden confirms the skepticism is earned. <strong>66% of developers spend more time debugging AI-generated code than expected.</strong> Between <strong>45% and 66%</strong> name "almost right, but not quite" as their top frustration with AI tools — the exact failure mode that converts a five-minute review into a forty-minute archaeology session. Yet the habit persists: <strong>75% still ask another human</strong> when they do not trust an AI answer. Aggregate favorability toward AI tools has slid from <strong>77% in 2023 to 72% in 2024 to 60% in 2025.</strong> The developer base is willing but reluctant: it uses the tools because they are free and fast, and it verifies the results because they are neither accurate nor safe.</p>

<h2>The Perception Gap: Devs Think It's Faster. It Isn't.</h2>

<p>The strongest evidence that perceived AI speed is a fiction comes from a randomized controlled trial by METR, published July 2025 (arXiv:2507.09089).<sup><a href="#fn3" id="fnref3">3</a></sup> Sixteen experienced open-source developers — averaging five years on their own repositories, which together carry 22k+ stars and 1M+ lines of code — were assigned 246 real issues from their own codebases, with AI access randomized per task. These were not toy kata problems; these were issues on the developers' own mature projects, where domain context was maximal.</p>

<p>The result was a clean three-way split between belief and measurement. Participants forecast that AI would cut their time by 24%. After the study, they still believed they had been about 20% faster. The measured effect was <strong>19% slower</strong>, with a confidence interval of +2% to +39% — the true effect could not be ruled out as zero or worse, and in no scenario did it constitute a speedup. Developers accepted fewer than <strong>44% of AI suggestions</strong>; the rest required review, fixes, or outright rejection. METR's February 2026 follow-up with 57 developers and 800+ tasks narrowed the deficit to roughly a 4% slowdown — less negative, but still no speedup. The study names the cause: context gaps, code cleanup burden, prompt overhead, and the cost of verifying output.</p>

<p>The engineering conclusion is not that AI is useless. It is that the constraint has moved. <strong>"The old constraint was writing code. The new constraint is reviewing it."</strong> A developer who measures throughput by code written will see gains; a developer who measures by merged, correct, secure code is now spending that time in review. The tool did not remove the bottleneck; it relocated it, and it relocated it onto the most expensive human activity in the building.</p>

<h2>The Security Data Nobody Reads</h2>

<p>Veracode's GenAI Code Security report evaluated 100+ LLMs across 80 tasks in Java, Python, C#, and JavaScript. The headline: <strong>45% of AI-generated code introduces an OWASP Top 10-class flaw</strong>.<sup><a href="#fn4" id="fnref4">4</a></sup> At comparable codebases, AI-generated code carries <strong>2.74x more vulnerabilities than human-written code</strong>. The language breakdown is uneven, and the weakness-level numbers are worse:</p>

<table>
<thead>
<tr><th>Language / weakness</th><th>AI-generated code failure rate</th></tr>
</thead>
<tbody>
<tr><td>Java</td><td>72%</td></tr>
<tr><td>C#</td><td>45%</td></tr>
<tr><td>JavaScript</td><td>43–45%</td></tr>
<tr><td>Python</td><td>38%</td></tr>
<tr><td>Cross-site scripting (XSS)</td><td>86%</td></tr>
<tr><td>Log injection (CWE-117)</td><td>88%</td></tr>
</tbody>
</table>

<p>Measured across 100+ LLMs and 80 coding tasks.<sup><a href="#fn4" id="fnref4">4</a></sup></p>

<p>The trend line is the part that should alarm engineering leadership. Since 2023, the syntax pass rate of AI code has climbed from roughly 50% to about 95%, while the security pass rate has stayed <strong>flat at 45–55% across every model generation</strong>. Models got better at everything except what breaks production. The same report found that <strong>41% of all code produced globally is AI-generated</strong>,<sup><a href="#fn1" id="fnref1">1</a></sup> with some organizations reporting 90% AI authorship — code that will be reviewed by humans who already distrust it, written by systems that have not improved on security in three years.</p>

<p>Independent data agrees. CodeRabbit's analysis of 470 open-source pull requests found that AI-contributed PRs create <strong>1.7x more issues</strong> and are <strong>1.88x more likely to introduce a vulnerability</strong> than human PRs.<sup><a href="#fn5" id="fnref5">5</a></sup> None of this is a reason to ban AI. It is a reason to assume the output is compromised until verified — which is exactly what the maintainers in the next section concluded.</p>

<h2>The Maintainer Revolt</h2>

<p>The people who merge code for a living have started enforcing the verification burden at the policy level. In January 2026, cURL's Daniel Stenberg shut down the project's six-year, <strong>$86,000 bug bounty program</strong>.<sup><a href="#fn6" id="fnref6">6</a></sup> Twenty percent of submissions were AI-generated garbage. The valid-report rate fell from 15% to 5%. In the first three weeks after the AI flood began, cURL received 20 AI-generated bug reports; seven arrived in a single 16-hour burst. None was real.</p>

<p>The responses cascade across the ecosystem:</p>

<ul>
<li>Ghostty's Mitchell Hashimoto adopted zero tolerance for drive-by AI pull requests — "not anti-AI... anti-idiot."<sup><a href="#fn7" id="fnref7">7</a></sup></li>
<li>Godot's Rémi Verschelde called AI-generated PRs "increasingly draining and demoralizing"; a contributor described the experience as "a total shitshow."<sup><a href="#fn8" id="fnref8">8</a></sup></li>
<li>QEMU, Gentoo, NetBSD, Debian, and Cloud Hypervisor formally ban or restrict AI contributions. QEMU's rule is structural: an AI cannot satisfy the Developer's Certificate of Origin, so it cannot vouch for provenance.<sup><a href="#fn9" id="fnref9">9</a></sup></li>
<li>Flux CD's Stefan Prodan: <strong>"AI slop is DDOSing OSS maintainers."</strong><sup><a href="#fn10" id="fnref10">10</a></sup></li>
</ul>

<p>The pain is measurable, not anecdotal. EchoSift's July 2026 clustering of 24,485 pain signals from GitHub, Stack Overflow, Hacker News, and Bluesky ranks "Codex/AI review failures" as the single highest cluster, with a pain score of 109 and still growing 6%.<sup><a href="#fn11" id="fnref11">11</a></sup> GitHub shipped the ability to disable pull requests entirely.<sup><a href="#fn9" id="fnref9">9</a></sup> "The bottleneck has moved from generation to verification" is no longer a metaphor — it is a support queue.</p>

<h2>How to Review AI Code Like a Senior Engineer</h2>

<h3>Know the "almost right" failure modes</h3>

<p>AI output fails in predictable patterns, and each pattern needs a specific check. The five that cost teams real incident time:</p>

<ol>
<li><strong>Self-referential tests.</strong> Generated tests frequently re-implement the logic they claim to verify instead of calling the functions under test. The test passes because it asserts against its own implementation, not against the code. It is green, and it proves nothing.</li>
<li><strong>Code that looks complete but does nothing.</strong> The canonical example is a cache implementation that creates the cache and never stores anything: every function present, zero behavior. The diff reads as finished; execution reads as a no-op.</li>
<li><strong>Hallucinated dependencies.</strong> Sonatype found that <strong>27.76% of AI upgrade recommendations reference versions that do not exist</strong> — a direct typosquatting and supply-chain vector.<sup><a href="#fn12" id="fnref12">12</a></sup> Endor Labs found that <strong>49% of AI-imported dependencies carry known CVEs</strong>.<sup><a href="#fn13" id="fnref13">13</a></sup> Never accept a dependency suggestion without checking the registry — the <a href="/blog/execution-layer-breach-hackerbot-claw-cicd-compromise/">supply-chain incident reports</a> of 2026 are full of exactly this failure.</li>
<li><strong>Convention blindness.</strong> The code is correct in isolation and wrong in your codebase: it violates naming, structure, and error-handling conventions, and it silently accumulates friction for every future contributor.</li>
<li><strong>Plausible bugs.</strong> George Hotz's observation is the most dangerous one: bugs that "look plausible" evade notice longer. Human reviewers extend the benefit of the doubt to code that reads well. AI produces fluent, well-formatted, confidently wrong code by default — it manufactures exactly the appearance that suppresses scrutiny.</li>
</ol>

<h3>The 10-point verification checklist</h3>

<p>A practical checklist for every AI-assisted pull request, in order:</p>

<ol>
<li><strong>Read the tests first.</strong> Do they assert behavior, or do they echo the implementation? Delete any test that re-implements the logic under test.</li>
<li><strong>Run the code, don't read it.</strong> Execute the happy path and the error path. If the error path is untestable, that is a design problem, not a testing limitation.</li>
<li><strong>Check the diff for deletion smell.</strong> AI is additive by instinct. A pull request that only adds code and never removes any is a pull request building the wrong abstraction.</li>
<li><strong>Verify dependencies resolve.</strong> Every suggested version must resolve to a real, current version in the registry. Never trust an upgrade suggestion without checking.</li>
<li><strong>Search for silent swallow.</strong> Empty catch blocks, ignored return values, and discarded errors are where production incidents are born.</li>
<li><strong>Trace the security-sensitive paths yourself.</strong> Auth, crypto, payment, and filesystem code gets a manual trace from input to trust boundary. No shortcut, no delegation.</li>
<li><strong>Run SAST/SCA and mutation testing.</strong> Mutation testing specifically catches self-referential tests: if killing a mutant does not fail the suite, the tests are not testing the code.</li>
<li><strong>Check conventions.</strong> Naming, structure, and error handling must match your repository, not the model's training distribution.</li>
<li><strong>Verify error messages and edge cases actually trigger.</strong> A generated error path that can never fire is dead code that lies about its own existence.</li>
<li><strong>Timebox verification.</strong> If you cannot verify the change within a reasonable window, rewrite it yourself or split the pull request. Reviewing a 400-line generated diff is not faster than writing 80 lines by hand.</li>
</ol>

<h3>Trust tiers — how much human verification does AI output deserve?</h3>

<p>Not all AI output deserves the same scrutiny, and treating it uniformly wastes the only resource that matters: senior attention. Use escalating tiers:</p>

<ul>
<li><strong>Tier 0 — Boilerplate, configuration, documentation, migration scaffolding:</strong> light review. The cost of failure is low and recoverable. Read it, run it once, move on.</li>
<li><strong>Tier 1 — Business logic, CRUD, tests:</strong> normal review plus run the test suite. Standard peer review applies; the diff still gets a human read.</li>
<li><strong>Tier 2 — Auth, crypto, payments, infrastructure, concurrency:</strong> full senior review, SAST, and a threat model. Never auto-merge, never rubber-stamp, and treat generated tests in this tier as inadmissible evidence until mutation-tested.</li>
</ul>

<p>The tier system only works if the gates are enforced mechanically. Hybrid-strict review gates — auto-approving nothing above Tier 1, requiring a named human approver at Tier 2 — showed a <strong>1.7% defect escape rate versus 4.1% under auto-approve</strong> in the <a href="/blog/agentic-ai-cicd-review-gates-2026/">review-gates work on this site</a>.<sup><a href="#fn14" id="fnref14">14</a></sup> An honor system collapses the moment a Friday deployment deadline arrives; a gate in the pipeline does not.</p>

<h3>Tooling that catches what eyes miss</h3>

<p>Human review does not scale to the volume AI can produce, so the verification stack has to be automated where it can be:</p>

<ul>
<li><strong>SAST at the right stage:</strong> Semgrep, CodeQL, or Veracode run on every pull request, with the AI-authored diff treated as a first-class security input rather than a low-risk change.</li>
<li><strong>SCA for dependencies:</strong> OWASP Dependency-Check or Trivy to neutralize the hallucinated-version and known-CVE vectors before they reach a lockfile.</li>
<li><strong>Secrets detection pre-commit:</strong> Gitleaks, TruffleHog, or GitHub push protection. Generated code loves to hardcode credentials.</li>
<li><strong>Mutation testing:</strong> Stryker and equivalents catch the self-referential test pattern that no linter sees.</li>
<li><strong>Provenance and attribution:</strong> DryRun Security and Endor Labs attribute AI commits so review gates can apply the trust tiers automatically instead of from memory.</li>
<li><strong>Better prompts:</strong> Backslash found that security-focused prompting measurably improves output — with a simple "write secure code" instruction, one leading model scored 10/10 on secure-code tests that naive prompting failed.<sup><a href="#fn15" id="fnref15">15</a></sup> Prompting is not a replacement for review, but it reduces the defect count arriving at the gate. Veracode's Fix case study reports a <strong>92% reduction in vulnerability detection time, 200%+ faster remediation, and 80%+ fix acceptance</strong><sup><a href="#fn16" id="fnref16">16</a></sup> — the tooling economics work once the gate exists.</li>
</ul>

<h2>Closing</h2>

<p>The reviewer is the new senior role. Generation is a commodity; verification is the scarce skill, and the market has already priced it: maintainers are banning unverified AI contributions, security pass rates have been flat for three years, and developers who measure real outcomes are measurably slower with AI than without it. Forrester warns of a "technical debt tsunami"<sup><a href="#fn17" id="fnref17">17</a></sup> — and unverified AI output is the floodwater.</p>

<p>The correct stance is not anti-AI. It is pro-verification. Use the models for scaffolding, boilerplate, and the first pass — but treat anything you would not have written from scratch as untrusted input until it runs, tests, and reviews clean. If you are a senior engineer, that is your job description now. If you are hiring one, test for it. If you are building pipelines, put the <a href="/blog/agentic-ai-cicd-review-gates-2026/">review gate</a> in before the AI writes another line — and never let <a href="/blog/vibe-coding-security-disaster-real-numbers/">vibe coding</a> ship unreviewed. The rest of this site is built around exactly that practice: review gates, security tooling, and the CI/CD plumbing that makes verification cheaper than generation.</p>

<hr />

<h2>Footnotes</h2>

<div class="footnotes">
<ol>
<li id="fn1">
<a href="https://www.veracode.com/blog/genai-code-security-report/" target="_blank" rel="noopener">Veracode — 2025 GenAI Code Security Report</a> — 41% of all code produced globally is AI-generated, with some organizations at 90% AI authorship; 100+ LLMs tested across 80 tasks in Java, Python, C#, and JavaScript.
<a class="footnote-backref" href="#fnref1" aria-label="Back">↩</a>
</li>
<li id="fn2">
<a href="https://survey.stackoverflow.co/2025/ai" target="_blank" rel="noopener">Stack Overflow 2025 Developer Survey — AI section</a> — 49,009 respondents across 166/177 countries: 84% use or plan to use AI (vs 76% in 2024); trust in AI accuracy fell 40% to 29%; only 3% highly trust while 46% distrust; 66% spend more time debugging; 45–66% cite "almost right, but not quite"; 75% still ask another human; favorability slid 77% → 72% → 60%.
<a class="footnote-backref" href="#fnref2" aria-label="Back">↩</a>
</li>
<li id="fn3">
<a href="https://metr.org/blog/2025-07-10-early-2025-ai-experienced-os-dev-study/" target="_blank" rel="noopener">METR — Measuring the Impact of Early-2025 AI on Experienced Open-Source Developer Productivity</a> — randomized controlled trial, 16 experienced developers, 246 real issues: predicted 24% faster, believed 20% faster, measured 19% slower (+2% to +39% CI); under 44% of AI suggestions accepted. See also <a href="https://arxiv.org/abs/2507.09089" target="_blank" rel="noopener">arXiv:2507.09089</a> and the February 2026 follow-up (57 developers, 800+ tasks, ~4% slowdown).
<a class="footnote-backref" href="#fnref3" aria-label="Back">↩</a>
</li>
<li id="fn4">
<a href="https://www.veracode.com/blog/genai-code-security-report/" target="_blank" rel="noopener">Veracode — 2025 GenAI Code Security Report</a> — 45% of AI code introduces OWASP Top 10 flaws; 2.74x more vulnerabilities than human code; Java 72% failure; XSS 86%; log injection (CWE-117) 88%. Security pass rate stayed flat at 45–55% from 2023 through the <a href="https://www.veracode.com/blog/spring-2026-genai-code-security/" target="_blank" rel="noopener">Spring 2026 update</a> — see also the <a href="https://labs.cloudsecurityalliance.org/research/csa-research-note-ai-generated-code-vulnerability-surge-2026" target="_blank" rel="noopener">CSA research note on the AI-generated vulnerability surge</a>.
<a class="footnote-backref" href="#fnref4" aria-label="Back">↩</a>
</li>
<li id="fn5">
<a href="https://www.coderabbit.ai/blog/coderabbit-series-b-60-million-quality-gates-for-code-reviews" target="_blank" rel="noopener">CodeRabbit — Quality Gates for Code Reviews</a> — analysis of 470 open-source PRs: AI-contributed PRs create 1.7x more issues and are 1.88x more likely to introduce a vulnerability than human PRs.
<a class="footnote-backref" href="#fnref5" aria-label="Back">↩</a>
</li>
<li id="fn6">
<a href="https://daniel.haxx.se/blog/2026/01/26/the-end-of-the-curl-bug-bounty/" target="_blank" rel="noopener">Daniel Stenberg — The End of the curl Bug Bounty</a> — cURL's six-year, $86,000 HackerOne program shut down January 2026; ~20% of submissions AI-generated, valid rate 15% to 5%; 20 AI reports in the first three weeks of 2026, seven in one 16-hour burst, none real. See also <a href="https://www.bleepingcomputer.com/news/security/curl-ending-bug-bounty-program-after-flood-of-ai-slop-reports/" target="_blank" rel="noopener">BleepingComputer coverage</a>.
<a class="footnote-backref" href="#fnref6" aria-label="Back">↩</a>
</li>
<li id="fn7">
<a href="https://github.com/ghostty-org/ghostty/blob/main/AI_POLICY.md" target="_blank" rel="noopener">Ghostty — AI Usage Policy</a> — strict disclosure rules and zero tolerance for bad AI contributions: "Our reason for the strict AI policy is not due to an anti-AI stance... It's the people, not the tools, that are the problem." Policy merged via <a href="https://github.com/ghostty-org/ghostty/pull/10412" target="_blank" rel="noopener">PR #10412</a>.
<a class="footnote-backref" href="#fnref7" aria-label="Back">↩</a>
</li>
<li id="fn8">
<a href="https://www.theregister.com/software/2026/02/18/godot-maintainers-struggle-with-demoralizing-ai-slop-prs/4206219" target="_blank" rel="noopener">The Register — Godot maintainers struggle with "draining and demoralizing" AI slop submissions</a> — Rémi Verschelde on AI-generated PRs; contributor Adriaan de Jongh: "it's a total shitshow."
<a class="footnote-backref" href="#fnref8" aria-label="Back">↩</a>
</li>
<li id="fn9">
<a href="https://www.buildmvpfast.com/blog/ai-assisted-coding-backlash-developers-2026" target="_blank" rel="noopener">buildMVPfast — AI-Assisted Coding Backlash: Why Developers Are Pushing Back</a> — QEMU, Gentoo, NetBSD, Debian, and Cloud Hypervisor restrict or ban AI contributions; QEMU's Developer's Certificate of Origin rationale (a machine cannot attest to provenance); GitHub added the ability to disable pull requests entirely.
<a class="footnote-backref" href="#fnref9" aria-label="Back">↩</a>
</li>
<li id="fn10">
<a href="https://www.infoq.com/news/2026/02/ai-floods-close-projects/" target="_blank" rel="noopener">InfoQ — AI "Vibe Coding" Threatens Open Source as Maintainers Face Floods</a> — Stefan Prodan (Flux CD): "AI slop is DDOSing OSS maintainers, and the platforms hosting OSS projects have no incentive to stop it."
<a class="footnote-backref" href="#fnref10" aria-label="Back">↩</a>
</li>
<li id="fn11">
<a href="https://echosift.io" target="_blank" rel="noopener">EchoSift — Developer Pain Points 2026</a> — clustering of 24,485 pain signals across GitHub, Stack Overflow, Hacker News, and Bluesky; "Codex/AI review failures" is the top cluster at pain score 109, growing 6%.
<a class="footnote-backref" href="#fnref11" aria-label="Back">↩</a>
</li>
<li id="fn12">
<a href="https://www.sonatype.com/state-of-the-software-supply-chain/2026/ai-agents" target="_blank" rel="noopener">Sonatype State of the Software Supply Chain 2026 — AI Agents</a> — 27.76% of AI upgrade recommendations referenced non-existent versions (10,000+ hallucinated releases).
<a class="footnote-backref" href="#fnref12" aria-label="Back">↩</a>
</li>
<li id="fn13">
<a href="https://www.endorlabs.com/learn/when-ai-imports-vulnerable-dependencies-securing-ai-generated-code" target="_blank" rel="noopener">Endor Labs — When AI Imports Vulnerable Dependencies</a> — 49% of AI-imported dependency versions carry known CVEs.
<a class="footnote-backref" href="#fnref13" aria-label="Back">↩</a>
</li>
<li id="fn14">
<a href="https://aymen.benyedder.top/blog/agentic-ai-cicd-review-gates-2026/" target="_blank" rel="noopener">Aymen ben Yedder — AI Coding Agents in CI/CD: Turning Review Gates Into Your First Line of Defense</a> — hybrid-strict review gates cut defect escape to 1.7% vs 4.1% under AI-only auto-approve (100 teams, 23,847 PRs).
<a class="footnote-backref" href="#fnref14" aria-label="Back">↩</a>
</li>
<li id="fn15">
<a href="https://www.infosecurity-magazine.com/news/llms-vulnerable-code-default/" target="_blank" rel="noopener">Infosecurity Magazine — Popular LLMs Found to Produce Vulnerable Code by Default</a> — Backslash Security's analysis of seven GPT, Claude, and Gemini models: naive prompts produced insecure code vulnerable to 4+ CWEs for every model, while security-focused prompts lifted the best performer to 10/10 on tested CWEs.
<a class="footnote-backref" href="#fnref15" aria-label="Back">↩</a>
</li>
<li id="fn16">
<a href="https://www.veracode.com/blog/genai-code-security-report/" target="_blank" rel="noopener">Veracode — GenAI Code Security Report and Veracode Fix</a> — vendor case study: 92% reduction in vulnerability detection time, 200%+ faster remediation, and 80%+ fix acceptance once AI-assisted remediation runs inside a review gate.
<a class="footnote-backref" href="#fnref16" aria-label="Back">↩</a>
</li>
<li id="fn17">
<a href="https://www.buildmvpfast.com/blog/ai-generated-code-technical-debt-management-2026" target="_blank" rel="noopener">buildMVPfast — AI Generated Code Technical Debt: How to Manage It</a> — covers Forrester's "technical debt tsunami" forecast and the quality-perception inversion between senior and junior developers.
<a class="footnote-backref" href="#fnref17" aria-label="Back">↩</a>
</li>
</ol>
</div>
```
