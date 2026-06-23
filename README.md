# ToolAlts

ToolAlts is an open-source decision site for people comparing software alternatives.
It helps developers, founders, and small teams choose cheaper, open source,
self-hosted, and privacy-friendly SaaS options with source-backed comparisons.

## Why this exists

Software choices shape cost, control, and long-term resilience. Too many product
directories only add noise. ToolAlts exists to turn scattered tool information
into clear, evidence-based decisions so teams can spend less, own more of their
stack, and adopt tools they can trust.

## What you will find

- Tool pages with pricing, features, and alternatives
- Comparison pages like `X vs Y`
- `Best X alternatives` pages for high-intent searches
- Verification reports with source-backed checks
- Blog content focused on migration, cost, and tradeoffs

## How it works

ToolAlts runs as a fully automated content pipeline:

1. Discover candidate tools from public sources
2. Verify them against GitHub and official websites
3. Enrich structured tool data
4. Generate comparison and support content
5. Publish static pages to the site

The system is designed to publish only content that passes quality and
indexability checks.

## Tech Stack

- Next.js 16 App Router
- Tailwind CSS 4
- Static export on Vercel
- JSON as the source of truth for public data
- GitHub Actions for automation
- Playwright for scraping and screenshots
- DeepSeek for structured extraction and generation
- Ollama web search and fetch for enrichment

## Repository Structure

- `src/app/` - public pages and admin views
- `src/content/` - generated markdown content
- `data/` - tool, comparison, and category data
- `scripts/` - discovery, verification, enrichment, and publishing scripts
- `docs/` - operating plans and workflow notes

## Local Development

```bash
npm install
npm run dev
```

Useful scripts:

```bash
npm run lint
npm run build
npm run seo:audit
npm run content:opportunities
npm run workflow:plan
```

## Content and Automation

The site is intentionally opinionated:

- prioritize high-intent comparison clusters
- keep thin pages out of the sitemap
- favor source-backed claims over generic AI copy
- publish only content that helps people make a better decision

## Environment Variables

Local automation may use:

- `LLM_PROVIDER`
- `LLM_API_KEY`
- `LLM_MODEL`
- `OLLAMA_URL`
- `OLLAMA_API_KEYS`
- `OLLAMA_API_KEY`

Never commit secrets to the repository.

## Contributing

Changes should preserve the public mission of the site:

- make the content more useful
- make the data more trustworthy
- make the pages easier to index
- make the automation more selective

