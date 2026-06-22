# CLAUDE.md

@AGENTS.md

## Claude Code Notes

- Treat `AGENTS.md` as the shared source of truth for project context, Next.js rules, SEO guardrails, data files, and automation scripts.
- Before changing App Router pages, metadata, routing, sitemap behavior, server components, route handlers, middleware/proxy, or `next.config.ts`, read the matching bundled Next.js doc under `node_modules/next/dist/docs/`.
- Keep trailing slash behavior intact. This project uses Next.js 16 with `trailingSlash: true`; public links should end with `/`.
- Public dynamic routes should keep `export const dynamicParams = false` unless there is a deliberate routing change.
- Scripts run through `tsx`; prefer existing npm scripts when present, especially `npm run seo:audit`, `npm run content:promote`, `npm run content:generate-comparisons`, `npm run workflow:plan`, and `npm run content:opportunities`.
- Do not promote all draft/review tools in bulk. Use `npm run content:promote -- --slug <tool-slug> --apply` after manual review.
- Never publish generated content or pricing/spec claims unless supported by current source evidence. If evidence is incomplete, mark it as unverified rather than guessing.
