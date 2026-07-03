## Overview
This memo compares Skip and VS Code for a developer or team deciding which tool to adopt. Skip is a specialized tool for mobile developers who want to write iOS and Android apps from a single Swift/SwiftUI codebase. VS Code is a general-purpose code editor with broad language support, extensions, and AI features. The decision hinges on whether you need cross-platform mobile development from Swift or a flexible editor for any programming task. Skip is free and open source but has limited verified feature data; VS Code is also free, widely adopted, and well-documented.

## Key Differences
1. **Purpose and scope**: Skip is a transpiler and build toolchain for creating native mobile apps from Swift code. VS Code is a full-featured code editor for any language or platform.
2. **Target audience**: Skip serves mobile developers (especially iOS-first teams) who want to target Android without learning Kotlin. VS Code serves all developers, from web to data science to embedded systems.
3. **Feature depth**: VS Code has extensive verified features (IntelliSense, debugging, Git integration, extensions, remote development). Skip’s feature list is minimal and lacks verified details on debugging, testing, or IDE integration.
4. **Community and ecosystem**: VS Code has 186,931 GitHub stars and 45,000 reviews. Skip has 3,109 stars and zero reviews, indicating a much smaller user base and less community support.
5. **AI capabilities**: VS Code explicitly advertises AI-powered coding with GitHub Copilot. Skip’s evidence brief does not mention any AI or Copilot integration.

## Feature Comparison
| Feature | Skip | VS Code |
|---------|------|---------|
| Open source | Yes (permissive licenses) | Yes |
| Pricing | Free (no license key, no trial, no revenue threshold, no per-seat pricing) | Free ($0, unlimited usage) |
| Primary function | Transpile Swift/SwiftUI to native iOS and Android apps | General-purpose code editor |
| IntelliSense / code completion | Not verified | Yes |
| Debugging | Not verified | Yes (built-in) |
| Git integration | Not verified | Yes (built-in) |
| Extensions / plugins | Not verified | Yes (marketplace) |
| Remote development | Not verified | Yes |
| AI / Copilot support | Not verified | Yes (GitHub Copilot) |
| Mobile platform output | iOS and Android (native) | Not applicable |
| GitHub stars | 3,109 | 186,931 |
| Reviews count | 0 | 45,000 |

## Pricing
- **Skip**: Free and open source. No license key, no trial period, no revenue threshold, no per-seat pricing. All core components are under permissive licenses. No additional pricing tiers are verified.
- **VS Code**: Free ($0) with unlimited usage. No paid tiers are mentioned in the evidence brief. Extensions and Copilot may have separate pricing, but that is not verified here.

## When to Choose Skip
- You are an iOS developer or team with existing Swift/SwiftUI expertise and want to release an Android version without learning a new language or framework.
- You need a free, open source tool with no revenue sharing or per-seat costs, and you are comfortable with a smaller community and less documentation.
- Your project is a mobile app where native performance on both platforms is critical, and you are willing to trade editor features for cross-platform code sharing.

## When to Choose VS Code
- You work on any type of software project (web, backend, desktop, mobile) and need a reliable, feature-rich editor with strong debugging, Git, and extension support.
- You want AI-assisted coding with GitHub Copilot, or you rely on a large ecosystem of verified extensions for your workflow.
- You value a mature, well-reviewed tool with a massive community, frequent updates, and extensive documentation.
- Your team includes developers using multiple languages (Python, JavaScript, TypeScript, C++, etc.) and needs a single editor for all tasks.

## Trade-offs and Limits
- **Skip’s feature gaps are significant**: The evidence brief lacks verified details on debugging, testing, IDE integration, and extension support. If your team needs these, Skip may require additional tooling or manual workarounds. This is a critical unknown for any serious mobile development workflow.
- **Skip’s community is tiny**: With zero reviews and only 3,109 GitHub stars, you will have limited third-party resources, tutorials, and troubleshooting help. VS Code’s community is orders of magnitude larger.
- **Migration friction**: Switching from VS Code to Skip means losing a general-purpose editor and its ecosystem. You would need to adopt Skip’s toolchain and likely keep VS Code (or another editor) for non-Swift tasks. Conversely, moving from Skip to VS Code means losing the Swift-to-Android transpilation—you would need to rewrite your Android app in a different language.
- **VS Code’s AI features are not free**: While the editor is free, GitHub Copilot requires a subscription. This is not explicitly stated in the evidence brief, but it is a known cost that should be factored in.
- **No verified performance data**: Neither tool’s evidence brief includes benchmarks, build times, or app size comparisons. For Skip, this is especially important because transpilation can introduce overhead.

## Verdict
- **Choose Skip if**: You are an iOS developer or a small team with Swift expertise, you need a free, open source way to target Android natively, and you are willing to accept a less mature tool with limited community support and unverified features. Skip is a specialized solution for a narrow use case.
- **Choose VS Code if**: You are any other developer or team—especially if you work in multiple languages, need a proven editor with strong debugging and Git support, or want AI assistance. VS Code is the safer, more versatile choice with a massive ecosystem and verified capabilities.
- **Avoid both if**: You need a cross-platform mobile solution but are not committed to Swift—consider Flutter, React Native, or Kotlin Multiplatform instead. Skip only makes sense if Swift is your starting point.