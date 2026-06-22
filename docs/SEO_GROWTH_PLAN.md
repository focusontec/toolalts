# ToolAlts SEO and Growth Operating Plan

Last updated: 2026-06-22

## Current Mission

ToolAlts should not be treated as a generic auto-generated directory. The working positioning is:

> ToolAlts.dev helps developers, founders, and small teams choose cheaper, open source, self-hosted, or privacy-friendly SaaS alternatives with practical comparisons, cost calculations, and migration guidance.

Every agent starting work in this repository should preserve this direction. Prioritize fewer high-quality decision pages over publishing many shallow pages.

## Operating Priorities

### P0: Index Health and Trust

Status: in progress.

Goal: make sure search engines only see real, useful, canonical public URLs.

Required rules:

- Public sitemap must include only `active` tools.
- Public comparison pages must only use pairs where both tools are `active`.
- Duplicate comparison slugs must not create duplicate sitemap URLs.
- `/alternative-to/[slug]/` pages with no useful alternatives and no substantial supporting content must not enter sitemap.
- Thin alternatives pages should be `noindex, follow` until they have enough content.
- `/search/` must exist because the homepage WebSite schema declares a SearchAction.
- Markdown frontmatter must never render as page body content.

Today's implemented fixes:

- `src/app/sitemap.ts` now uses active/indexable public URL sets and de-duplicates output.
- `src/lib/tools.ts` now exposes indexable alternative and comparison helpers.
- `src/app/compare/[slug]/page.tsx` strips markdown frontmatter and only generates indexable public comparisons.
- `src/app/alternative-to/[slug]/page.tsx` marks weak alternative pages `noindex`.
- `src/app/search/page.tsx` and `src/components/SearchClient.tsx` provide a real search target.
- `scripts/seo-audit.ts` adds a local SEO guardrail.
- `npm run seo:audit` is wired into generation workflows.

Next P0 checks:

- Run `npm run seo:audit`.
- Run `npm run build`.
- After deploy, verify live sitemap has 0 duplicate URLs and 0 404 URLs.

## Phase 1: SEO Foundation, 1-2 Weeks

Goal: move the site from technically crawlable to worth crawling.

Tasks:

- Expand `scripts/seo-audit.ts` to crawl built output or live preview URLs.
- Add title/description duplicate checks.
- Add canonical checks.
- Add JSON-LD parse checks.
- Add internal broken-link checks for markdown content.
- Add page word-count thresholds:
  - home: 600+ words
  - tool page: 500+ words
  - alternative page: 800+ words
  - comparison page: 800+ words
  - blog page: 900+ words
  - report page: noindex or exclude from sitemap if under 500 words
- Keep low-quality generated pages out of sitemap until they pass the threshold.

Core page template improvements:

- Alternative pages should include a decision summary, comparison table, 3-5 alternatives, pricing/free limits, self-hosting support, migration notes, cost calculator link, related migration guide, and FAQ.
- Tool pages should include pricing, free plan limits, open source/self-hosting/privacy, best alternatives, pros/cons, migration notes, FAQ, and last-checked dates.
- Comparison pages should include a verdict, who should choose each tool, pricing table, migration difficulty, key tradeoffs, and FAQ.

## Phase 2: Positioning and Content Clusters, 2-4 Weeks

Goal: win high-intent clusters before expanding the catalog.

Primary content clusters:

1. Productivity / Knowledge Base
   - `/alternative-to/notion/`
   - `/compare/notion-vs-obsidian/`
   - `/migration-guides/notion-to-obsidian/`
   - `/blog/notion-open-source-alternatives/`
   - calculator entry for Notion cost savings

2. Communication
   - `/alternative-to/slack/`
   - `/compare/slack-vs-mattermost/`
   - `/compare/slack-vs-rocket-chat/`
   - `/migration-guides/slack-to-rocket-chat/`
   - `/blog/slack-self-hosted-alternatives/`

3. Design
   - `/alternative-to/figma/`
   - `/compare/figma-vs-penpot/`
   - `/migration-guides/figma-to-penpot/`
   - `/blog/open-source-figma-alternatives/`

4. Developer Tools
   - `/alternative-to/github-copilot/`
   - `/alternative-to/cursor/`
   - `/compare/cursor-vs-vscode/`
   - `/compare/claude-code-vs-cursor/`
   - `/blog/ai-code-editors-compared/`

Content standard:

- Prefer specific, opinionated decision help over generic lists.
- Each core page should answer: who should choose what, what it costs, what tradeoffs matter, and how hard it is to migrate.
- Cite official sources for pricing, limits, GitHub stats, licenses, and migration steps.

## Phase 3: Automation Pipeline, 2-6 Weeks

Goal: change automation from "auto-publish more pages" to "auto-generate candidates, enrich facts, then publish only when quality gates pass."

Target state flow:

```text
discovered -> verified -> enriched -> content_ready -> active
```

Script improvements:

- `discover-tools.ts`
  - Score candidates by GitHub stars, last commit, license, website, docs, pricing page, category confidence, and known alternative target.
  - Write candidates to `pending-tools.json`; do not make them public.

- `ai-verify.ts`
  - Produce structured verification: decision, confidence, product validity, open source status, license, stars, last commit, pricing evidence, alternatives target, risks, and sources.
  - Only index report pages that contain substantial evidence and source-backed analysis.

- `auto-approve.ts`
  - Require confidence >= 80 for automatic public activation.
  - Require category, tagline, description, pricing, features, and source-backed metadata.
  - Require open source tools to have GitHub URL, license, stars, and last commit.
  - Generate comparisons only when both tools are active.
  - Enforce globally unique comparison slugs.

- `generate-comparisons.ts`
  - Generate from structured facts, not just tool names.
  - Require pricing, self-hosting, free limits, integrations, migration difficulty, best-for/not-good-for.
  - Run quality checks before writing.

- `sync-tools.ts`
  - Extend data sync to forks, open issues, last commit date, license, release date, website status, and pricing last-checked date.

- `scripts/seo-audit.ts`
  - Grow into the non-LLM release gate for public URL quality.

## Phase 4: Authority and Distribution, 1-3 Months

Goal: earn signals that make the site trustworthy beyond technical SEO.

Weekly publishing:

- Publish 2 deep articles per week for the selected clusters.
- Include methodology on every substantial page:
  - pricing
  - self-hosting
  - import/export support
  - GitHub activity
  - team collaboration
  - migration difficulty

Distribution:

- Product Hunt launch when P0/P1 are stable.
- Hacker News Show HN after the calculator and 3-4 clusters are useful.
- Reddit posts in relevant communities such as self-hosted, open source, SaaS, and developer tools.
- GitHub "awesome" repository for open source SaaS alternatives.
- Pull requests to open source project docs where a ToolAlts comparison or migration guide is genuinely useful.

## How Agents Should Work

When a Codex or Claude Code session starts:

1. Read this file first.
2. Check whether the requested task affects SEO/index quality.
3. Run `npm run seo:audit` after data, sitemap, route, or content-generation changes.
4. Do not publish draft, hidden, removed, empty, or thin pages into sitemap.
5. Do not expand page count before the core clusters are strong.

