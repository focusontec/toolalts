## Overview

This memo compares GitHub Issues and Jira for a software team deciding which tool to use for issue tracking and project management. GitHub Issues is tightly integrated into the GitHub code hosting platform, making it a natural choice for teams already using GitHub. Jira is a standalone, purpose-built project management tool designed for agile software development at scale. The decision hinges on whether your team prioritizes code proximity and simplicity (GitHub Issues) or advanced agile workflows, reporting, and cross-team scalability (Jira).

## Key Differences

1. **Code Integration vs. Agile Specialization**: GitHub Issues is embedded in GitHub repositories, linking issues directly to pull requests and commits. Jira is a dedicated project management tool with deep support for Scrum, Kanban, sprint planning, and roadmaps.
2. **Workflow Flexibility**: GitHub Issues uses labels, milestones, and assignees for lightweight workflows. Jira offers custom workflows with statuses, transitions, and automation rules that can model complex approval chains.
3. **Scale and Reporting**: Jira provides real-time dashboards, burndown charts, and velocity tracking out of the box. GitHub Issues relies on GitHub Projects for board views and lacks built-in agile reporting.
4. **Integration Ecosystem**: Jira connects with over 3,000 apps via its marketplace. GitHub Issues integrates primarily with the GitHub ecosystem (Actions, Projects) and has fewer third-party connectors.
5. **Pricing Model**: GitHub Issues is included with any GitHub plan (free or paid). Jira has a separate pricing structure starting at free for up to 10 users, then per-user monthly costs.

## Feature Comparison

| Feature | GitHub Issues | Jira |
|---|---|---|
| Issue tracking | Labels, milestones, assignees, saved filters | Custom fields, statuses, workflows |
| Agile boards | Via GitHub Projects (board/table views) | Native Scrum and Kanban boards |
| Sprint planning | Not built-in; manual via milestones | Sprint planning, backlog management |
| Roadmaps | Not built-in | Advanced roadmaps (Premium tier) |
| Automation | GitHub Actions (code-driven) | Built-in automation rules |
| Reporting | No built-in reporting | Real-time dashboards, burndown charts |
| Integrations | GitHub ecosystem (Actions, Projects) | 3,000+ app integrations |
| Templates | Issue templates (markdown) | Custom issue type schemes |
| Storage limits | Not specified (depends on GitHub plan) | 2GB (Free), 250GB (Standard), Unlimited (Premium) |
| User limits | Unlimited (with GitHub plan) | 10 users (Free), up to 35,000 (Standard) |

## Pricing

**GitHub Issues**: Included with all GitHub plans (Free, Team, Enterprise). No separate pricing for Issues. Storage and user limits depend on the GitHub plan chosen.

**Jira**:
- Free: $0 for up to 10 users, 2GB storage
- Standard: $8.15/user/month for up to 35,000 users, 250GB storage
- Premium: $16/user/month for advanced roadmaps, sandbox, unlimited storage
- Enterprise: Custom pricing for unlimited sites and cross-org insights

Note: Pricing for GitHub Issues is not separately verified beyond being included with GitHub. Jira pricing tiers are verified from the evidence brief.

## When to Choose GitHub Issues

- Your team already uses GitHub for code hosting and wants issues to live in the same place as pull requests and commits.
- You need lightweight issue tracking without complex workflows or agile ceremonies.
- Your team is small or prefers simplicity over feature-rich project management.
- You want to automate issue workflows using GitHub Actions and repository events.
- You do not require advanced reporting, roadmaps, or cross-team scalability.

## When to Choose Jira

- Your team follows Scrum or Kanban and needs sprint planning, backlog management, and velocity tracking.
- You require custom workflows with multiple statuses, transitions, and approval gates.
- You need real-time dashboards, burndown charts, and reporting for stakeholders.
- Your organization has multiple teams that need cross-project visibility and advanced roadmaps.
- You rely on integrations with tools like Slack, Confluence, or CI/CD platforms beyond GitHub.

## Trade-offs and Limits

- **Migration friction**: Moving from Jira to GitHub Issues means losing custom workflows, sprint data, and reporting history. Moving from GitHub Issues to Jira requires importing issues and reconfiguring workflows.
- **Missing data**: GitHub Issues does not have built-in sprint planning, roadmaps, or reporting. These are not verified as available even with GitHub Projects.
- **Scale limits**: Jira’s free tier caps at 10 users; GitHub Issues has no separate user limit but depends on the GitHub plan.
- **Integration depth**: Jira’s 3,000+ integrations are verified, but GitHub Issues’ integration scope is limited to the GitHub ecosystem.
- **Storage**: Jira specifies storage limits (2GB free, 250GB standard). GitHub Issues storage is not verified and depends on the GitHub plan.

## Verdict

- **Choose GitHub Issues** if your team is already on GitHub, values code proximity, and needs simple issue tracking without agile overhead. It’s ideal for small teams or open-source projects where lightweight tracking suffices.
- **Choose Jira** if your team needs structured agile workflows, sprint management, advanced reporting, or cross-team coordination. It’s better for larger teams or organizations that require scalability and custom processes.
- **Avoid switching** if your team is deeply invested in one tool’s workflows and data—migration costs and lost history can outweigh benefits.