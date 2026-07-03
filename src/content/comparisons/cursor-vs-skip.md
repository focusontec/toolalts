## Overview

This memo compares Cursor and Skip, two fundamentally different developer tools. Cursor is an AI-powered code editor designed to accelerate coding for individual developers and teams through agentic assistance, cloud agents, and automated code review. Skip is an open-source transpiler that lets iOS developers write a single Swift/SwiftUI codebase and deploy it natively on both iOS and Android. The decision context is not about choosing between two similar tools—they solve different problems. You are either evaluating an AI coding assistant (Cursor) versus alternatives like GitHub Copilot, or evaluating a cross-platform mobile framework (Skip) versus Flutter, React Native, or Kotlin Multiplatform. This memo helps you decide which tool fits your specific workflow.

## Key Differences

1. **Purpose**: Cursor is an AI coding agent that boosts productivity across any codebase. Skip is a Swift-to-Kotlin transpiler for sharing mobile app logic between iOS and Android.
2. **Target User**: Cursor serves any developer or team writing code. Skip serves iOS developers who want to target Android without learning Kotlin or another cross-platform framework.
3. **Pricing Model**: Cursor uses a freemium subscription model (Free, $20/mo Pro, $40/user/mo Teams, Custom Enterprise). Skip is completely free and open source with no licensing, revenue thresholds, or per-seat costs.
4. **Open Source**: Skip is fully open source under permissive licenses. Cursor is proprietary.
5. **Maturity and Reviews**: Cursor has 850 reviews and a 5.0 rating. Skip has zero reviews and a 3.5 rating, with limited product-specific feature data available.

## Feature Comparison

| Feature | Cursor | Skip |
|---|---|---|
| AI code agent | Yes (Agent requests, Tab completions) | No |
| Cloud agents / automations | Yes (Pro and Teams) | No |
| Automated code review (Bugbot) | Yes (usage-based billing) | No |
| Team billing & administration | Yes (Teams plan) | No |
| SAML/OIDC SSO | Yes (Teams and Enterprise) | No |
| Audit logs | Yes (Enterprise) | No |
| Cross-platform mobile development | No | Yes (Swift → iOS + Android) |
| Open source | No | Yes (permissive license) |
| Pricing | Free tier, then $20–$40+/user/mo | Free, no limits |
| Reviews count | 850 | 0 |

## Pricing

**Cursor**: Hobby (Free, limited Agent and Tab completions), Pro ($20/mo, extended limits, frontier models, cloud agents), Teams ($40/user/mo, centralized billing, team marketplace, Bugbot, SSO), Enterprise (Custom, pooled usage, SCIM, audit logs, priority support). Usage limits for the free tier are not verified in detail.

**Skip**: Completely free and open source. No license key, no trial period, no revenue threshold, no per-seat pricing. All core frameworks are open source under permissive licenses. No paid tiers exist.

## When to Choose Cursor

- You are a developer or team that wants AI-assisted coding with agentic features, tab completions, and automated code reviews.
- You need cloud agents that run autonomously, or team-wide privacy and SSO controls.
- You are willing to pay $20–$40+/user/mo for productivity gains and are comfortable with a proprietary tool.
- You work in any language or framework and want an AI editor, not a cross-platform mobile solution.

## When to Choose Skip

- You are an iOS developer who wants to share business logic and UI across iOS and Android without learning Kotlin, Flutter, or React Native.
- You need a free, open-source solution with no licensing costs or vendor lock-in.
- You value native performance on both platforms and prefer Swift/SwiftUI as your primary language.
- You are evaluating cross-platform mobile frameworks and want to avoid per-seat pricing.

## Trade-offs and Limits

- **Cursor** is not a cross-platform mobile tool. If you need to share code between iOS and Android, Cursor won't help.
- **Skip** has limited product-specific feature data in the evidence brief. Its rating of 3.5 with zero reviews suggests it may be early-stage or niche. The actual quality of Android output, performance, and ecosystem support are not verified.
- **Migration friction**: Switching to Cursor means adopting a new editor (or its AI features within VS Code). Switching to Skip means rewriting your mobile app architecture to use Swift/SwiftUI for both platforms, which may not be trivial for existing Android codebases.
- **Missing data**: Skip's feature list is sparse—no details on debugging, testing, or third-party library support. Cursor's free-tier limits are not fully specified. Neither tool's integration with CI/CD pipelines is documented in this evidence.
- **Vendor risk**: Cursor is proprietary; Skip is open source. If Cursor changes pricing or shuts down, you lose access. Skip's open-source nature reduces that risk, but its community and long-term maintenance are unproven.

## Verdict

- **Choose Cursor** if you are a developer or team seeking an AI coding agent to accelerate daily coding, code review, and automation. It is a mature, well-reviewed tool with clear pricing tiers for individuals and organizations. It is not for mobile cross-platform work.
- **Choose Skip** if you are an iOS developer who wants to deploy on Android with minimal extra effort, using a free and open-source tool. Be prepared for limited documentation, a small community, and unverified Android output quality. It is not an AI assistant.
- **Avoid both** if you need a general-purpose cross-platform framework (use Flutter or React Native) or if you want a free AI coding assistant (evaluate alternatives like Continue.dev or Cody).