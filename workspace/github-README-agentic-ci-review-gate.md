# agentic-ci-review-gate

> Reference implementation of a **hybrid-strict** AI review gate for GitHub Actions — the
> architecture from the guide at
> [aymen.benyedder.top](https://aymen.benyedder.top/blog/agentic-ai-cicd-review-gates-2026/).

An advisory AI reviewer that runs on every pull request: the agent analyzes the diff and posts
findings as comments, **never** approves, **never** merges. Human sign-off lives in branch
protection, where it belongs.

## Why "hybrid strict"

2026 telemetry across 100 teams and 23,847 PRs:

| Configuration | Median review time | 30-day defect escape |
|---|---|---|
| No AI review | 4.2 hours | 2.8% |
| **Hybrid strict (this repo)** | **1.9 hours** | **1.7%** |
| AI-only auto-approve | 3.8 hours | 4.1% |

## The workflow

```yaml
name: review-gate
on:
  pull_request:
    types: [opened, synchronize]
permissions:
  contents: read
  pull-requests: write
jobs:
  agent-gate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
        with:
          persist-credentials: false
      - run: make ci-checks
      - name: Agentic review (advisory)
        uses: your-org/agent-review@v1
        with:
          model: high-reasoning
          scope: diff-only
```

The `permissions:` block is load-bearing: read access to contents, write access to pull
requests, nothing else. `persist-credentials: false` keeps tokens off the checked-out repo.

## Guardrails config (`review.json`)

```json
{
  "review": {
    "mode": "hybrid-strict",
    "autoApprove": false,
    "autoMerge": false,
    "commentThreshold": "critical",
    "maxDiffLinesWarn": 400,
    "maxDiffLinesBlock": 1000,
    "requiredReviewers": 1,
    "sensitivePaths": ["auth/", "crypto/", "payment/", ".github/", "**/*.tf"]
  }
}
```

## Hardening notes

- Use OIDC + short-lived credentials for anything beyond the repo itself.
- Pin every action to a SHA, not a tag.
- Treat `CLAUDE.md` / `AGENTS.md` as review-required, security-sensitive files.
- Measure 30-day post-merge defect escape before and after rollout; dismiss-rate above 40%
  means developers stop reading the tool.

## Related articles

- [AI Coding Agents in CI/CD: Turning Review Gates Into Your First Line of Defense](https://aymen.benyedder.top/blog/agentic-ai-cicd-review-gates-2026/)
- [The Execution Layer Breach: Hackerbot-Claw](https://aymen.benyedder.top/blog/execution-layer-breach-hackerbot-claw-cicd-compromise/)
- [DevOps on a VPS for Startups](https://aymen.benyedder.top/blog/devops-vps-startups/)
