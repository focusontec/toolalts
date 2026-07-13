## Overview

This memo compares ClickUp and GitHub Issues as project management tools for software teams. ClickUp positions itself as an all-in-one productivity platform that unifies tasks, docs, goals, and communication in a single workspace. GitHub Issues is a lightweight issue tracker embedded directly in GitHub repositories, designed for teams that already use GitHub for code hosting. The core decision is whether your team needs a broad, customizable project management suite (ClickUp) or a tightly integrated, code-centric issue tracker (GitHub Issues). The evidence brief provides detailed pricing for ClickUp but only a single "included with GitHub" line for GitHub Issues, which limits direct price comparisons.

## Key Differences

1. **Scope and Purpose**: ClickUp is a full productivity platform covering tasks, docs, goals, whiteboards, and chat. GitHub Issues is a focused issue tracker that lives inside GitHub repositories, with optional project boards via GitHub Projects.
2. **Integration with Code**: GitHub Issues links directly to pull requests, commits, and branches. ClickUp integrates with GitHub via third-party connections but does not have native code repository features.
3. **Customization and Views**: ClickUp offers Kanban, Gantt, Whiteboard, Calendar, Timeline, and Mind Map views. GitHub Issues provides labels, milestones, and assignees, with board/table views only through GitHub Projects (a separate feature).
4. **Pricing Model**: ClickUp has a free tier with 60MB storage and paid plans starting at $7/user/month. GitHub Issues is included with any GitHub plan, meaning its cost is bundled with your existing GitHub subscription—no separate per-user fee for issue tracking.
5. **Automation Capabilities**: ClickUp offers automations with per-month limits (5K on Business, 250K on Enterprise). GitHub Issues automates via GitHub Actions, which has its own usage limits and pricing separate from issue tracking.

## Feature Comparison

| Feature | ClickUp | GitHub Issues |
|---|---|---|
| Task tracking | Unlimited tasks with custom statuses | Issues with labels, milestones, assignees |
| Views | Kanban, Gantt, Whiteboard, Calendar, Timeline, Mind Map | List view; board/table via GitHub Projects |
| Docs | Collaborative docs with real-time editing | Markdown task lists in issues |
| Time tracking | Native time tracking (Unlimited plan+) | Not available natively |
| Goals/Portfolio | Goals & Portfolio Management (Unlimited plan+) | Not available natively |
| Automation | Built-in automations (limits per plan) | Via GitHub Actions (separate pricing) |
| Integrations | 1000+ tools (Unlimited plan+) | Native GitHub ecosystem (PRs, commits, Actions) |
| Storage | 60MB free, unlimited on paid plans | Not applicable (issues are text-based) |
| Open source | No | No |
| Free tier | Yes (60MB storage, unlimited tasks) | Yes (included with free GitHub account) |

## Pricing

**ClickUp**: Free Forever plan (60MB storage, unlimited tasks, 1 form). Unlimited plan at $7/user/month billed yearly (unlimited storage, integrations, time tracking). Business plan at $12/user/month billed yearly (5K automations/month, mind mapping, whiteboards). Enterprise at custom pricing (SAML SSO, audit log, HIPAA). AI add-ons: Brain AI at $9/user/month, Everything AI at $28/user/month.

**GitHub Issues**: Included with all GitHub plans. No separate pricing for issue tracking. GitHub itself has free, Team ($4/user/month), and Enterprise ($21/user/month) plans, but the evidence brief does not detail these—pricing for GitHub hosting is not verified here.

**Unknowns**: The brief does not specify GitHub plan pricing, GitHub Actions automation limits, or whether GitHub Projects (board/table views) requires a specific GitHub plan. These gaps affect cost comparison for teams needing advanced project views.

## When to Choose ClickUp

Choose ClickUp if your team needs a single platform for tasks, docs, goals, time tracking, and communication. It suits non-engineering teams (marketing, HR, operations) or engineering teams that want to separate project management from code hosting. The Gantt, Whiteboard, and Mind Map views support planning and brainstorming workflows that GitHub Issues cannot match. Teams that need native time tracking, portfolio management, or custom fields will find ClickUp’s Unlimited plan ($7/user/month) cost-effective compared to adding separate tools.

## When to Choose GitHub Issues

Choose GitHub Issues if your team already uses GitHub for code and wants minimal tool overhead. It excels for bug tracking, feature requests, and task lists that link directly to pull requests and commits. Teams that value tight code-to-issue traceability will find GitHub Issues frictionless. It is also the right choice for open-source projects or small teams that want free issue tracking without managing a separate platform. If your workflow is purely issue-driven (no docs, time tracking, or Gantt charts), GitHub Issues avoids the complexity of a full productivity suite.

## Trade-offs and Limits

- **Migration Friction**: Moving from ClickUp to GitHub Issues means losing docs, time tracking, goals, and multiple views. Moving from GitHub Issues to ClickUp requires re-creating issue templates, labels, and milestone structures, and may break pull request linking.
- **Missing Data**: The brief does not verify GitHub Issues’ automation limits, GitHub Projects pricing, or whether GitHub’s free plan includes unlimited collaborators. These gaps matter for teams evaluating total cost.
- **ClickUp Complexity**: ClickUp’s breadth can overwhelm teams that only need issue tracking. The free tier’s 60MB storage limit is restrictive for teams that store files in tasks.
- **GitHub Issues Limitations**: No native time tracking, Gantt charts, or goal management. Teams needing these features must add third-party tools, increasing cost and complexity.
- **Vendor Lock-in**: ClickUp stores all data in its platform; exporting to another tool may lose formatting or relationships. GitHub Issues data is tied to GitHub repositories, making migration to other code hosts difficult.

## Verdict

- **For engineering teams already on GitHub**: Use GitHub Issues. It eliminates tool sprawl and keeps issue tracking where code lives. Only switch to ClickUp if you need features GitHub cannot provide (time tracking, Gantt charts, portfolio management).
- **For cross-functional teams (engineering + marketing + ops)**: Choose ClickUp. Its unified workspace reduces the need for multiple tools, and the Unlimited plan ($7/user/month) is cheaper than maintaining separate task, doc, and time-tracking apps.
- **For small teams or open-source projects**: GitHub Issues is the pragmatic choice—free, simple, and integrated with code. ClickUp’s free tier is viable but limited by storage and form count.
- **For teams needing advanced planning (Gantt, Whiteboards, Mind Maps)**: ClickUp is the only option. GitHub Issues does not offer these views natively.