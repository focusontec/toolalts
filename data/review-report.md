# Quality Review Report — 2026-07-06

## Summary

| Metric | Count |
|--------|-------|
| Total tools | 65 |
| Keep (quality) | 46 |
| Needs review | 18 |
| Suggest hide | 1 |
| Suggest remove | 0 |

## Pipeline Health

Moderate. Strong core tools but many low-quality entries and missing GitHub URLs.

### Strengths
- High-quality tools (worthiness >90) are well-verified and have high data quality.
- No missing website URLs, indicating good discovery for that field.
- Active tools (36) outnumber drafts (19), showing reasonable pipeline progression.

### Weaknesses
- 25 tools (38%) missing GitHub URL, limiting verification and community assessment.
- 33 tools (51%) have zero reviews, reducing confidence in worthiness scores.
- 7 tools with low worthiness (<40) and 7 with low data quality (<60) suggest poor discovery filtering.
- Several tools (e.g., Antigravity-Manager, Workout.cool) have very low scores and should be hidden or removed.

### Prompt Improvement Suggestions

| Prompt | Issue | Suggested Fix |
|--------|-------|---------------|
| discovery_prompt | Too many low-quality tools discovered (worthiness <40). | Add a minimum threshold for GitHub stars or community activity in the discovery prompt, e.g., 'Only include tools with at least 100 GitHub stars or 50 reviews.' |
| verification_prompt | Some tools with low data quality (e.g., Colanode dataQuality=50) are not flagged for review. | Strengthen the verification prompt to require explicit checks for missing GitHub URL, zero reviews, and low data quality fields, and output a 'rec' of 'hide' if dataQuality < 50. |
| data_enrichment_prompt | 25 tools missing GitHub URL, likely due to incomplete scraping. | Add a step to search for GitHub URL using the tool name and a fallback to 'Not found' if unavailable, and include a note to manually verify. |

### Threshold Suggestions

| Parameter | Current | Suggested | Reason |
|-----------|---------|-----------|--------|
| worthiness minimum for active status | none | 40 | Tools with worthiness <40 (e.g., Antigravity-Manager=15) should not be active; they clutter the pipeline. |
| data quality minimum for keep recommendation | none | 60 | Tools with dataQuality <60 (e.g., Colanode=50) have insufficient data; they should be reviewed or hidden. |
| GitHub URL requirement for active status | none | required | Missing GitHub URL (38% of tools) hinders verification; require it for active status or flag for manual enrichment. |

## Suggest Hide

### Antigravity-Manager (`antigravity-manager`) — W:15 D:30
- Tool appears to be a niche utility for a specific toolset (Antigravity Tools) that is not widely known
- GitHub stars (29998) seem inflated for a tool with 0 reviews and no community presence; likely fake or manipulated
- No evidence of real user base or market presence

## Needs Review

### claude-code (`claude-code`) — W:95 D:70
- Claude Code is a highly popular tool with 136k GitHub stars and strong backing by Anthropic, making it very worthy.
- Data quality issues exist: pricing plans have duplicate names (two 'Max' plans), and the rating is 4.95/5 with 0 reviews, which is suspicious.
  Data issues:
  - Pricing plans contain two entries with the same name 'Max' but different prices and features.
  - Rating is 4.95/5 with 0 reviews, which is inconsistent.
  Fixes:
  → Rename the second 'Max' plan to something like 'Max Pro' or 'Max+', or merge them into one plan.
  → Either remove the rating or add a note that it's based on limited reviews, or correct it to reflect actual reviews.

### Bodhi (`bodhi`) — W:45 D:70
- Tool is legitimate with real GitHub repository and 134 stars, but has very limited community adoption and no user reviews.
- Website URL (bodhi.com) appears to be a placeholder or unrelated domain, not the actual product site.
  Data issues:
  - Website URL (https://bodhi.com) does not seem to be the correct product page; likely should be the GitHub Pages or a different domain.
  - No user reviews despite a rating of 3.75/5 (0 reviews) - rating may be inaccurate or placeholder.
  - Tagline and description are plausible but generic; could be more specific.
  Fixes:
  → Update website URL to the correct project page (e.g., GitHub Pages or actual product site).
  → Remove or correct the rating if it's not based on real reviews.
  → Consider adding more specific features or use cases to differentiate from similar tools.

### Tasker (`tasker`) — W:35 D:70
- Tool has very few GitHub stars (106) and no reviews, indicating low adoption. However, it is open-source and has a clear description. Needs more validation.
  Data issues:
  - Rating is 3.5/5 but has 0 reviews, which is inconsistent.
  - Website URL (tasker.ai) may not be the actual product site; the GitHub repo is pitalco/tasker, which suggests the tool might be a different project.
  Fixes:
  → Verify the website URL matches the actual product.
  → Remove rating if no reviews exist.
  → Consider adding more user feedback or usage data.

### Ephe (`ephe`) — W:45 D:60
- Small but legitimate open-source tool with 580 stars, active development, but very niche and limited market presence.
  Data issues:
  - Website URL points to a different repository (valentinegb/ephe) than GitHub URL (unvalley/ephe).
  - Pricing plans are empty but tool is open source, so should be 'Free' or similar.
  - Rating shows 0 reviews but has a 3.5/5 score, inconsistent.
  Fixes:
  → Verify correct website URL and update if needed.
  → Add a pricing plan indicating 'Free' or 'Open Source'.
  → Remove rating or set to 0 if no reviews exist.

### Colanode (`colanode`) — W:65 D:50
- Open-source project with 4955 GitHub stars indicates significant community interest and active development.
- Website URL points to GitHub instead of a dedicated product site, which may reduce perceived legitimacy.
- No pricing plans listed, which is acceptable for open-source but incomplete for comparison.
- No user reviews, making it hard to gauge real-world satisfaction.
  Data issues:
  - Website URL is GitHub repository, not a proper product website.
  - Pricing plans are empty; should at least indicate 'Free' or 'Self-hosted'.
  - No reviews available, but rating is given as 3.5/5 (likely auto-generated).
  Fixes:
  → Add a proper product website URL if available.
  → Include pricing information (e.g., 'Free (self-hosted)').
  → Remove or clarify the rating if no reviews exist.

### system-prompts-and-models-of-ai-tools (`system-prompts-and-models-of-ai-tools`) — W:75 D:60
- High GitHub stars (141k) indicate significant community interest and usage.
- Tagline and description are clear and accurate.
- Category 'development' is appropriate.
- No pricing plans listed, which is acceptable for an open-source repository.
- Features list is relevant.
  Data issues:
  - Website URL is same as GitHub URL; should ideally point to a dedicated site or documentation.
  - Rating is 0/5 with 0 reviews, which may be due to lack of user feedback integration.
  - Status is 'review' but no specific reason provided in the input.
  Fixes:
  → Consider adding a dedicated website or documentation page if available.
  → Integrate user reviews or ratings from GitHub or other platforms.
  → Update status to 'keep' if data quality issues are resolved.

### gstack (`gstack`) — W:35 D:60
- GitHub stars are extremely high (119k) but the tool is very niche and has no reviews or pricing, suggesting possible data anomaly or inflated stars.
- Tagline and description are vague; '23 opinionated tools' is not clearly explained.
  Data issues:
  - GitHub stars count seems implausibly high for a niche tool with no reviews.
  - No pricing plans listed, which is acceptable for open source but should be noted.
  - Website URL is same as GitHub URL, no dedicated site.
  Fixes:
  → Verify GitHub stars count; if accurate, update status to 'keep' with higher worthiness.
  → Add more detailed description and feature list.
  → Consider adding a dedicated website or documentation page.

### awesome-claude-skills (`awesome-claude-skills`) — W:75 D:60
- High GitHub stars indicate significant community interest, but the tool is a curated list rather than a standalone software tool, which may not fit the comparison site's focus.
  Data issues:
  - No pricing plans listed
  - Website URL points to GitHub repo, not a dedicated product site
  - Category 'development' may be too broad
  Fixes:
  → Add pricing plans or mark as free
  → Consider if a dedicated website exists
  → Refine category to something like 'AI Tools' or 'Developer Resources'

### Workout.cool (`workout-cool`) — W:25 D:40
- Very niche open-source project with no GitHub stars, no reviews, and no pricing info; appears unproven but may be legitimate.
  Data issues:
  - GitHub URL points to undefined
  - No GitHub stars data
  - No pricing plans
  - No user reviews
  Fixes:
  → Update GitHub URL to correct repository
  → Add GitHub stars if available
  → Consider adding pricing or clarifying free status

### Rowboat (`rowboat`) — W:25 D:40
- Very niche open-source project with no GitHub stars or reviews, indicating minimal adoption. Website URL leads to a GitHub repo but no clear product presence.
  Data issues:
  - GitHub URL is https://github.com/undefined (invalid)
  - No pricing plans listed
  - No reviews or rating data
  - GitHub stars missing
  Fixes:
  → Update GitHub URL to correct repository
  → Add pricing information if available
  → Verify product existence and gather user feedback

### Axilla (`axilla`) — W:35 D:40
- Tool appears to be a real open-source project but has very limited visibility (no GitHub stars, no reviews, no pricing). It is niche and unproven, but may have potential.
  Data issues:
  - GitHub URL points to undefined
  - No GitHub stars provided
  - No pricing plans
  - No reviews
  Fixes:
  → Update GitHub URL to correct repository
  → Add GitHub stars count if available
  → Consider adding pricing information or note as free
  → Encourage user reviews

### Hyperdiv (`hyperdiv`) — W:40 D:60
- Hyperdiv is a real open-source project but has very limited community awareness and no reviews. It may be too niche for a general audience.
  Data issues:
  - GitHub URL points to undefined instead of the actual repo
  - GitHub stars not provided
  - No pricing plans listed
  - Website URL is GitHub repo, not a dedicated site
  Fixes:
  → Update GitHub URL to https://github.com/hyperdiv/hyperdiv
  → Add GitHub stars count
  → Consider adding pricing info if applicable
  → Improve description with more detail on use cases

### codegraph (`codegraph`) — W:75 D:60
- High GitHub stars (57k) indicate significant community interest, but the tool is relatively new and niche.
- Website URL points to a different GitHub repo (anthropics/codegraph) than the GitHub URL (colbymchenry/codegraph), causing confusion.
- Tagline and description are clear and compelling, but the tool's actual market presence is unverified.
  Data issues:
  - Website URL (https://github.com/anthropics/codegraph) does not match GitHub URL (https://github.com/colbymchenry/codegraph).
  - No user reviews or rating data available.
  - Pricing plan is vague ('Free' with no details on limitations or enterprise options).
  Fixes:
  → Verify the correct repository and update the Website URL accordingly.
  → Add more detailed pricing tiers or note if it's fully open-source with no paid plans.
  → Consider adding user testimonials or review data if available.

### Open (`open`) — W:25 D:40
- Very niche project with no GitHub stars, no reviews, and no pricing plans; appears to be a small or early-stage open-source project.
  Data issues:
  - GitHub URL points to undefined; no GitHub stars; no pricing plans; website URL is a GitHub repo, not a proper website.
  Fixes:
  → Update GitHub URL to correct repository; add pricing plans if available; verify if the project is active and has a proper website.

### project-nomad (`project-nomad`) — W:75 D:60
- High GitHub stars (32k+) indicate significant interest and community validation.
- Open source and active development, but niche focus on offline AI/survival may limit broad appeal.
- No pricing plans listed, which is acceptable for open source but data is incomplete.
- Website URL points to GitHub, not a dedicated product page, which may affect user trust.
  Data issues:
  - Website URL is a GitHub repository, not a dedicated product or landing page.
  - No pricing plans provided (even for open source, a 'Free' plan is typical).
  - Category 'other' is too generic; a more specific category like 'AI Assistant' or 'Knowledge Base' would be better.
  Fixes:
  → Add a dedicated website or landing page for the project.
  → Include a pricing plan entry (e.g., 'Free' for open source).
  → Update category to a more specific one (e.g., 'AI', 'Productivity', or 'Education').

### Extend (`extend`) — W:45 D:50
- The tool appears to be a real product with a website and pricing, but it is not well-known and has no reviews or GitHub stars.
- The tagline and description mention an open source React UI kit, but the pricing plans and features describe a document processing API service, which is inconsistent.
- The tool is in draft status and lacks community validation.
  Data issues:
  - Tagline and description describe a UI kit, but features and pricing are for an API service.
  - No GitHub URL or stars provided despite claiming open source.
  - Rating is 0/5 with no reviews.
  - Status is draft.
  Fixes:
  → Clarify whether the tool is a UI kit or an API service, and update tagline/description accordingly.
  → Provide a valid GitHub URL if it is open source.
  → Gather user reviews or remove the rating if not applicable.
  → Publish the tool or update status to reflect actual availability.

### headroom (`headroom`) — W:85 D:75
- High GitHub stars (56,898) suggest significant interest, but the repository URL appears to be a personal account with a name that doesn't match the tool name, raising authenticity concerns.
- Tagline and description are clear and compelling, addressing a real need in LLM context optimization.
- Pricing and features are well-defined, but the lack of user reviews and draft status indicate the tool may be early-stage.
  Data issues:
  - GitHub URL points to a personal account (chopratejas) rather than an organization, and the star count seems unusually high for a new tool, potentially inaccurate.
  - Website URL (headroom-docs.vercel.app) is a documentation site, not a main product page, which may confuse users.
  - No user reviews or ratings available, making it hard to gauge real-world adoption.
  Fixes:
  → Verify GitHub repository authenticity and star count; if inflated, correct or note as unverified.
  → Update website URL to a proper product landing page if available.
  → Encourage user reviews or provide more evidence of usage (e.g., case studies, testimonials).

### awesome-claude-code (`awesome-claude-code`) — W:85 D:70
- High GitHub stars (48k+) indicate significant community interest and value
- Topic is relevant and timely (AI coding tools)
- Data quality issues: tagline and description refer to Claude Code but the repo name is 'awesome-claude-code' and the GitHub URL points to a user 'hesreallyhim' which may not be the official Anthropic repository; the website URL is the same as GitHub URL, which is acceptable for an awesome-list
- Pricing is free, which is appropriate for an awesome-list
  Data issues:
  - GitHub URL points to a personal account (hesreallyhim) rather than an official organization; authenticity of the list is unclear
  - No reviews or rating data available (0 reviews) despite high stars
  - Status is 'draft' which may indicate incomplete curation
  Fixes:
  → Verify the repository is the primary/maintained awesome-list for Claude Code
  → Update status to 'published' if the list is complete and maintained
  → Consider adding a note about the unofficial nature of the list if applicable

## Keep

- **Notion** (`notion`) — W:95 D:95
- **Obsidian** (`obsidian`) — W:95 D:85
- **Figma** (`figma`) — W:95 D:90
- **Penpot** (`penpot`) — W:95 D:90
- **Linear** (`linear`) — W:95 D:95
- **GitHub Issues** (`github-issues`) — W:95 D:90
- **Cursor** (`cursor`) — W:95 D:90
- **VS Code** (`vscode`) — W:95 D:95
- **Slack** (`slack`) — W:95 D:90
- **Discord** (`discord`) — W:95 D:100
- **markitdown** (`markitdown`) — W:85 D:90
- **composio** (`composio`) — W:85 D:90
- **AnkiAIUtils** (`anki`) — W:95 D:90
- **Stagewise** (`stagewise`) — W:75 D:85
- **Dyad** (`dyad`) — W:75 D:85
- **ToolJet** (`tooljet`) — W:85 D:90
- **Skip** (`skip`) — W:65 D:85
- **Onlook** (`onlook`) — W:82 D:85
- **InstantDB** (`instantdb`) — W:82 D:85
- **Langfuse** (`langfuse`) — W:85 D:90
- **Jira** (`jira`) — W:95 D:90
- **Trello** (`trello`) — W:95 D:95
- **Asana** (`asana`) — W:95 D:95
- **ClickUp** (`clickup`) — W:95 D:90
- **GitLab** (`gitlab`) — W:95 D:95
- **Docker** (`docker`) — W:95 D:90
- **Postman** (`postman`) — W:95 D:90
- **Zoom** (`zoom`) — W:95 D:90
- **Confluence** (`confluence`) — W:95 D:95
- **Miro** (`miro`) — W:95 D:90
- **Airtable** (`airtable`) — W:95 D:90
- **Zapier** (`zapier`) — W:95 D:90
- **Vercel** (`vercel`) — W:95 D:95
- **Supabase** (`supabase`) — W:95 D:90
- **Microsoft Teams** (`microsoft-teams`) — W:95 D:95
- **Google Meet** (`google-meet`) — W:95 D:100
- **Telegram** (`telegram`) — W:95 D:95
- **GitHub Copilot** (`github-copilot`) — W:95 D:85
- **Resend** (`resend`) — W:85 D:95
- **Cal.com** (`cal-com`) — W:95 D:95
- **Unkey** (`unkey`) — W:75 D:85
- **Trigger.dev** (`trigger-dev`) — W:85 D:95
- **deer-flow** (`deer-flow`) — W:80 D:90
- **nanobot** (`nanobot`) — W:85 D:90
- **claude-code-templates** (`claude-code-templates`) — W:75 D:85
- **container** (`container`) — W:85 D:95
