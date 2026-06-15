# Quality Review Report — 2026-06-15

## Summary

| Metric | Count |
|--------|-------|
| Total tools | 64 |
| Keep (quality) | 39 |
| Needs review | 20 |
| Suggest hide | 4 |
| Suggest remove | 1 |

## Pipeline Health

Moderate. Many high-quality tools are present, but there are significant data quality issues and a number of low-worthiness tools that should be removed or hidden.

### Strengths
- Strong core of well-known, high-quality tools (Notion, Figma, VS Code, etc.) with high worthiness and data quality.
- Active pipeline with 49 active tools out of 64.
- No missing website URLs, indicating good URL collection.

### Weaknesses
- 25 tools missing GitHub URLs, limiting verification and community signal.
- 32 tools have zero reviews, reducing confidence in worthiness scores.
- 19 tools have low data quality (<60), many with data quality scores as low as 20-30.
- 12 tools have low worthiness (<40), some with recommendations to hide or remove, but still present.
- Several tools have data quality scores that are much lower than worthiness, suggesting the LLM may be overestimating worthiness or missing data.

### Prompt Improvement Suggestions

| Prompt | Issue | Suggested Fix |
|--------|-------|---------------|
| verification_prompt | LLM assigns high worthiness to tools with very low data quality (e.g., claude-code: worthiness=95, dataQuality=40). This suggests the verification prompt may not penalize missing data enough. | Add explicit instruction: 'If data quality is below 50, reduce worthiness score proportionally. A tool with data quality 40 should not have worthiness above 60.' |
| discovery_prompt | Several tools with worthiness below 40 (e.g., gstack, Workout.cool, Rowboat) are still in the pipeline. The discovery prompt may not filter out low-quality tools early. | Add a minimum worthiness threshold in the discovery prompt: 'Only include tools with an estimated worthiness above 50 based on initial signals.' |
| data_quality_prompt | Many tools have missing GitHub URLs (25) and zero reviews (32). The data quality prompt may not require these fields. | Add requirement: 'Data quality score must be reduced by 20 points if GitHub URL is missing, and by 10 points if no reviews found.' |

### Threshold Suggestions

| Parameter | Current | Suggested | Reason |
|-----------|---------|-----------|--------|
| Minimum worthiness for active status | None (all tools are active unless hidden/removed) | 40 | 12 tools have worthiness below 40, many with hide/remove recommendations. Setting a minimum of 40 would automatically demote them to draft or review. |
| Minimum data quality for keep recommendation | None (LLM recommends keep even with data quality 40) | 60 | Tools with data quality below 60 (19 tools) have unreliable data. The LLM should not recommend 'keep' for these; instead, force 'review'. |
| Minimum GitHub stars for automatic inclusion | Not specified | 100 | Many low-quality tools have no GitHub presence. Requiring at least 100 stars would filter out obscure or unmaintained tools. |

## Suggest Remove

### Open (`open`) — W:20 D:20
- The tool name 'Open' is generic and the description does not match the pricing and features, which appear to be copied from GitHub. The GitHub URL is invalid and the website URL points to a different repository. The tool seems to be a placeholder or incorrectly imported data.
  Fixes:
  → Remove the tool entirely as it is not a real product.

## Suggest Hide

### Antigravity-Manager (`antigravity-manager`) — W:25 D:60
- Tool is extremely niche, tied to a specific set of tools (Antigravity Tools) that are not widely known.
- Despite high GitHub stars (29757), the repository appears to be a personal project with limited community adoption and no reviews.
- The tagline and description are well-written but the tool's utility is too narrow for a general comparison website.

### Workout.cool (`workout-cool`) — W:25 D:20
- The tool appears to be a very niche, unproven open-source project with no GitHub stars or community presence.
- The pricing and features listed are copied from GitHub, not relevant to this fitness platform.
- The website URL points to a GitHub repository, but the repository name does not match the tool name exactly, and the GitHub URL is set to undefined.

### Rowboat (`rowboat`) — W:25 D:20
- The tool appears to be a GitHub repository with no stars, no reviews, and no evidence of real usage.
- The tagline and description describe an AI coworker, but the pricing and features are copied from GitHub's free plan, indicating data mismatch.
- The GitHub URL is https://github.com/undefined, which is invalid, and the website URL points to a GitHub repo with no activity.
- The tool is not well-known and has no market presence.

### Colanode, (`colanode-`) — W:30 D:20
- Tool appears to be very early stage or not widely adopted; GitHub URL points to a repository but no stars or activity visible.
- Pricing and features are copied from GitHub, not relevant to Colanode's actual product.
- Website URL leads to a GitHub repo, not a proper product website.

## Needs Review

### claude-code (`claude-code`) — W:95 D:40
- Claude Code is a highly popular, open-source tool with 132k GitHub stars, indicating significant market presence and developer trust.
- The tagline and description are well-written and accurately describe the tool's capabilities.
- However, the pricing plans and features appear to be copied from GitHub's free plan, not Claude Code's actual pricing.
- The website URL points to GitHub, which is correct for an open-source tool, but the pricing data is clearly wrong.
  Data issues:
  - Pricing plans are incorrect: they describe GitHub's free plan features (CI/CD minutes, Packages storage, Dependabot) rather than Claude Code's pricing.
  - Features list is also incorrect, matching GitHub's free plan instead of Claude Code's actual features.
  - Rating of 4.95/5 with 0 reviews is suspicious; likely placeholder data.
  Fixes:
  → Update pricing plans to reflect Claude Code's actual pricing (likely free or subscription-based, but needs verification).
  → Update features list to match Claude Code's real capabilities (e.g., terminal-based coding, codebase understanding, natural language commands).
  → Remove or correct the rating if no reviews exist.

### markitdown (`markitdown`) — W:85 D:40
- Tool is a well-known Microsoft open-source project with high GitHub stars, indicating significant market presence and value.
- Data quality issues: pricing and features are incorrectly copied from GitHub's pricing, not the tool's own.
- Tagline and description are accurate, but the pricing and features are misleading.
  Data issues:
  - Pricing plans are for GitHub, not for MarkItDown (which is free and open-source).
  - Features listed are GitHub features, not MarkItDown features.
  - Website URL points to GitHub repo, which is acceptable for an open-source tool, but the pricing/features mismatch is problematic.
  Fixes:
  → Replace pricing plans with 'Free' or 'Open Source' with no cost.
  → Update features to reflect actual tool capabilities (e.g., PDF conversion, Office docs, AI integration).
  → Ensure consistency between tagline, description, and features.

### Bodhi (`bodhi`) — W:35 D:60
- Low GitHub stars (133) and no reviews indicate very limited adoption; the tool is niche and unproven. However, it is open-source and has a clear purpose.
  Data issues:
  - Website URL (bodhi.com) appears unrelated to the tool (likely a placeholder or incorrect); no reviews despite a rating; pricing plan is minimal (only free).
  Fixes:
  → Verify and correct the website URL; add more pricing details if available; consider gathering user reviews or testimonials.

### AnkiAIUtils (`anki`) — W:95 D:30
- Anki is a highly reputable and widely used flashcard app with a large user base, but the tool name and slug suggest a specific add-on or utility, while the data points to the core Anki project.
- The description and features describe Anki itself, not an AI-powered utility. The tagline and description are misleading.
  Data issues:
  - Tool name 'AnkiAIUtils' does not match the actual product (Anki).
  - Slug 'anki' is too generic and could cause confusion.
  - Tagline and description describe a non-existent AI utility, but the GitHub and website URLs point to the core Anki project.
  - GitHub stars (28547) are for the main Anki repository, not for a separate AI utility.
  - Pricing plans describe Anki's official apps, not a separate tool.
  - Features list is generic and matches Anki's core features, not AI utilities.
  Fixes:
  → Rename tool to 'Anki' and update slug accordingly.
  → Rewrite tagline and description to accurately describe Anki (a spaced repetition flashcard app).
  → Ensure GitHub and website URLs match the tool being listed.
  → Update pricing to reflect Anki's actual pricing (free desktop, paid iOS, free Android).
  → If the intent is to list a specific AI add-on, create a separate entry with correct details.

### Dyad (`dyad`) — W:85 D:70
- High GitHub stars and open-source nature indicate significant community interest, but limited user reviews and unclear market presence suggest need for review.
  Data issues:
  - Rating shows 0 reviews but score 3.5/5 is inconsistent.
  - Features list is incomplete compared to pricing plans.
  Fixes:
  → Update rating to reflect actual reviews or remove if none.
  → Expand features to include all from pricing plans.

### Tasker (`tasker`) — W:35 D:70
- Low GitHub stars (105) and no reviews indicate very limited adoption
- Website URL (tasker.ai) does not appear to be a real product site (likely parked or placeholder)
- Open-source but not well-known; niche tool with unproven market presence
  Data issues:
  - Website URL likely invalid or not a real product site
  - No user reviews despite being listed with rating
  - GitHub stars very low for a tool claiming AI-powered automation
  Fixes:
  → Verify website URL and update if incorrect
  → Consider removing or hiding until more traction is shown
  → Add more detailed features or evidence of real usage

### ToolJet (`tooljet`) — W:85 D:40
- ToolJet is a well-known open-source low-code platform with significant GitHub stars (38k+), indicating strong community adoption.
- However, the provided data appears to be incorrect: the website URL points to GitHub instead of the actual product website (https://tooljet.com), and the pricing and features seem to be copied from GitHub's own plans, not ToolJet's.
- The category 'development' is appropriate, but the tagline and description are accurate.
  Data issues:
  - Website URL is https://github.com/ToolJet/ToolJet instead of the actual product website.
  - Pricing plans and features listed are from GitHub, not ToolJet.
  - Rating shows 0 reviews, which may be inaccurate or missing.
  Fixes:
  → Update website URL to https://tooljet.com.
  → Replace pricing plans with ToolJet's actual plans (e.g., Free self-hosted, Team, Enterprise).
  → Update features list to reflect ToolJet's capabilities (e.g., drag-and-drop UI builder, multiple data sources, workflows).
  → Verify and update rating/review data if available.

### Ephe (`ephe`) — W:35 D:20
- Tool has a small but real user base (578 GitHub stars) and is open source, but lacks significant market presence. The pricing and features appear to be copied from GitHub, not matching the described product.
  Data issues:
  - Pricing plans and features are identical to GitHub's free plan, not relevant to Ephe.
  - Website URL points to GitHub repo, not a dedicated product site.
  - Tagline and description describe an ephemeral markdown editor, but features list GitHub-specific items.
  Fixes:
  → Update pricing and features to accurately reflect Ephe's offering.
  → Provide a proper website URL if available.
  → Ensure data consistency between description and features.

### Colanode (`colanode`) — W:55 D:30
- Colanode has a significant GitHub star count (4914) and is open-source, indicating some community interest.
- However, the website URL points to GitHub instead of a proper product site, and the pricing/features appear to be copied from GitHub, not Colanode.
- The description and tagline suggest it's a Slack/Notion alternative, but the data provided (pricing, features) is inconsistent with that description.
  Data issues:
  - Website URL is GitHub repository, not a dedicated product website.
  - Pricing plans and features are identical to GitHub's free plan, not Colanode's own offerings.
  - No reviews or user feedback available despite a rating of 3.5/5.
  - Features listed do not match the described product (e.g., repositories, CI/CD minutes).
  Fixes:
  → Update website URL to the actual product site if it exists.
  → Correct pricing and features to reflect Colanode's actual offerings.
  → Verify if the tool is actively developed and has a real user base beyond GitHub stars.

### Onlook (`onlook`) — W:75 D:30
- Onlook is a promising open-source project with a high number of GitHub stars, indicating community interest. However, it is still in early stages and not yet a widely adopted tool.
- The pricing data appears to be copied from GitHub's pricing, not Onlook's own pricing, which is a significant data quality issue.
  Data issues:
  - Pricing plans are identical to GitHub's plans, not Onlook's. Onlook is likely free or has its own pricing.
  - Features listed are GitHub features, not Onlook's features.
  - Website URL points to GitHub repository, not a dedicated product website.
  Fixes:
  → Update pricing to reflect Onlook's actual pricing (likely free or open-source).
  → Replace features with Onlook-specific features (e.g., visual editing, AI-powered design, React component generation).
  → Add a proper website URL if available, or keep GitHub if that is the primary site.

### InstantDB (`instantdb`) — W:75 D:40
- InstantDB is a legitimate open-source project with over 10k GitHub stars, indicating significant community interest.
- The tool appears to be a real product with active development, but its market presence is not yet at the level of major established tools.
- The pricing and features listed appear to be copied from GitHub's pricing, not InstantDB's own plans, which is a major data quality issue.
  Data issues:
  - Pricing plans and features are incorrectly copied from GitHub's pricing page instead of InstantDB's actual plans.
  - Website URL points to GitHub repository, not a dedicated product website.
  - Tagline and description mention AI-coded apps, but features listed are generic GitHub features, not specific to InstantDB.
  Fixes:
  → Update pricing plans to reflect InstantDB's actual pricing (likely free tier with paid options).
  → Update features list to match InstantDB's capabilities (auth, permissions, storage, presence, streams).
  → Add a proper website URL if available, or clarify that the GitHub repo is the primary site.

### Langfuse (`langfuse`) — W:85 D:40
- Langfuse is a well-known open source LLM engineering platform with significant GitHub stars and active development, making it worthy of listing. However, the data quality is poor because the pricing and features appear to be copied from GitHub, not Langfuse.
  Data issues:
  - Pricing plans and features are incorrect; they describe GitHub, not Langfuse.
  - Website URL points to GitHub, not the actual product website (likely langfuse.com).
  Fixes:
  → Update pricing plans to reflect Langfuse's actual plans (e.g., Cloud Free, Cloud Pro, Self-hosted).
  → Update features to match Langfuse's capabilities (observability, evaluations, prompt management, etc.).
  → Set website URL to https://langfuse.com or the correct domain.

### system-prompts-and-models-of-ai-tools (`system-prompts-and-models-of-ai-tools`) — W:85 D:30
- The tool is a GitHub repository with 140k stars, indicating significant community interest and value.
- The tagline and description are accurate and well-written.
- The category 'development' is appropriate.
- However, the pricing and features appear to be copied from GitHub itself, not from this repository.
- The repository is a collection of prompts and models, not a SaaS tool with pricing plans.
  Data issues:
  - Pricing plans and features are incorrect; they describe GitHub's pricing, not this repository's.
  - Website URL is the same as GitHub URL, which is acceptable but could be improved.
  - Rating is 0/5 with 0 reviews, but that's expected for a repository.
  Fixes:
  → Remove pricing plans and features, or replace with accurate information (e.g., free, open-source).
  → Consider adding a note that the tool is a free GitHub repository.

### gstack (`gstack`) — W:30 D:20
- The tool appears to be a personal curated setup, not a widely recognized product.
- GitHub stars (110k) are suspiciously high for a niche tool; likely a mistake or confusion with the main GitHub repo.
- Pricing and features listed are for GitHub, not for gstack itself.
- Website URL redirects to GitHub repo, no dedicated site.
  Data issues:
  - Pricing plan features are copied from GitHub's free plan, not gstack-specific.
  - GitHub stars likely refer to the main repository of the author, not the tool.
  - Tagline and description describe a toolset, but data suggests it's just a GitHub repo with configuration files.
  - No reviews or evidence of real user base.
  Fixes:
  → Verify actual GitHub stars for the gstack repo.
  → Correct pricing and features to reflect gstack's actual offerings.
  → If gstack is just a configuration collection, consider reclassifying as a template or guide.
  → Provide a dedicated website or documentation page.

### awesome-claude-skills (`awesome-claude-skills`) — W:25 D:30
- The tool is a GitHub repository curating resources, not a standalone software tool.
- The pricing plan and features are copied from GitHub's free plan, not relevant to this repository.
- High GitHub stars but likely due to the organization, not the tool's own merit.
  Data issues:
  - Pricing and features are for GitHub, not for this repository.
  - Tagline and description describe a curated list, but the tool is presented as a product.
  - Website URL is the same as GitHub URL, no dedicated site.
  Fixes:
  → Remove pricing and features, or replace with repository-specific info.
  → Consider if this should be listed as a tool or a resource.
  → Verify if the repository is actively maintained and has real utility.

### Axilla (`axilla`) — W:25 D:30
- Tool appears to be a real but very niche TypeScript framework for AI development; limited community awareness and no GitHub stars or reviews on site.
- Pricing data is clearly incorrect (copied from GitHub) and features list is mismatched.
  Data issues:
  - Pricing plan features are for GitHub, not Axilla.
  - GitHub URL is 'https://github.com/undefined' which is invalid.
  - GitHub stars are N/A but should be available from the repo.
  - Features list is identical to pricing features and not specific to Axilla.
  Fixes:
  → Update pricing plans with actual Axilla pricing or mark as free/open-source.
  → Fix GitHub URL to correct repository (https://github.com/axilla-io/ax).
  → Fetch and include actual GitHub stars.
  → Provide accurate features for Axilla framework.

### Hyperdiv (`hyperdiv`) — W:30 D:20
- Hyperdiv is a real but very niche Python framework for building reactive UIs; it has a GitHub repository but limited community awareness and no reviews on the site.
- The pricing and features data appear to be copied from GitHub's pricing, not Hyperdiv's own plans.
  Data issues:
  - Pricing plans and features are incorrectly attributed to Hyperdiv; they belong to GitHub.
  - GitHub Stars is N/A but could be fetched; GitHub URL is malformed (https://github.com/undefined).
  - Tagline and description are generic and could be improved.
  Fixes:
  → Update pricing plans to reflect Hyperdiv's actual offerings (likely free/open-source).
  → Fix GitHub URL to point to the correct repository: https://github.com/hyperdiv/hyperdiv
  → Remove or correct features list to match Hyperdiv's capabilities.
  → Consider adding more specific details about the framework's unique value.

### codegraph (`codegraph`) — W:85 D:70
- High GitHub stars (49k) indicate significant community interest and adoption
- Clear value proposition as a local-first code intelligence tool for AI agents
- Open source with MIT license adds credibility
- Data quality issues: GitHub stars seem inflated relative to project maturity (repository appears to be a personal project with few commits), pricing data is minimal, and website is a GitHub Pages site
  Data issues:
  - GitHub stars (49,307) are unusually high for a project with limited commits and activity; possible star manipulation or confusion with another repo
  - Pricing plan only lists 'Free' with no details on limitations or enterprise options
  - Website URL is a GitHub Pages site, not a dedicated product website
  - No reviews or ratings available
  - Category 'development' is appropriate but could be more specific
  Fixes:
  → Verify GitHub star count and repository authenticity
  → Add more detailed pricing tiers or clarify if it's purely free
  → Improve website to a proper domain with more information
  → Consider adding more specific features and use cases

### project-nomad (`project-nomad`) — W:85 D:30
- Project N.O.M.A.D appears to be a real project with significant GitHub stars (30k+), indicating community interest and legitimacy.
- However, the data provided is inconsistent: the tagline and description describe a survival computer, but the pricing and features are identical to GitHub's free plan, suggesting a data mix-up.
- The website URL points to a GitHub repository, which is acceptable for an open-source project, but the pricing and features do not match the product description.
  Data issues:
  - Pricing and features are copied from GitHub's free plan, not relevant to Project N.O.M.A.D.
  - Category 'other' is vague; a more specific category like 'Hardware' or 'Offline Tools' would be appropriate.
  - No reviews or rating data available.
  Fixes:
  → Update pricing and features to accurately reflect Project N.O.M.A.D's offerings (likely a hardware device with software).
  → Assign a more specific category.
  → Verify the product's actual website and update the URL if necessary.

### Extend (`extend`) — W:40 D:60
- Open source React UI kit with real functionality (PDF, DOCX, XLSX, CSV viewers) but limited market presence and no GitHub stars or reviews.
- Website URL appears legitimate but the tool is relatively niche and unknown.
  Data issues:
  - GitHub URL is missing despite being open source.
  - GitHub Stars is N/A, which is inconsistent with open source claim.
  - No user reviews (0/5 rating) and no evidence of community adoption.
  Fixes:
  → Add GitHub repository URL if available.
  → Provide GitHub star count or indicate if not applicable.
  → Consider adding more pricing details or usage examples.

## Keep

- **Notion** (`notion`) — W:95 D:95
- **Obsidian** (`obsidian`) — W:95 D:90
- **Figma** (`figma`) — W:95 D:95
- **Penpot** (`penpot`) — W:85 D:95
- **Linear** (`linear`) — W:85 D:95
- **GitHub Issues** (`github-issues`) — W:95 D:90
- **Cursor** (`cursor`) — W:85 D:95
- **VS Code** (`vscode`) — W:95 D:100
- **Slack** (`slack`) — W:95 D:95
- **Discord** (`discord`) — W:95 D:95
- **composio** (`composio`) — W:85 D:90
- **Stagewise** (`stagewise`) — W:65 D:85
- **Skip** (`skip`) — W:65 D:85
- **Jira** (`jira`) — W:95 D:90
- **Trello** (`trello`) — W:90 D:95
- **Asana** (`asana`) — W:95 D:95
- **ClickUp** (`clickup`) — W:95 D:90
- **GitLab** (`gitlab`) — W:95 D:90
- **Docker** (`docker`) — W:95 D:90
- **Postman** (`postman`) — W:95 D:95
- **Zoom** (`zoom`) — W:95 D:90
- **Confluence** (`confluence`) — W:95 D:95
- **Miro** (`miro`) — W:95 D:95
- **Airtable** (`airtable`) — W:95 D:95
- **Zapier** (`zapier`) — W:95 D:85
- **Vercel** (`vercel`) — W:95 D:90
- **Supabase** (`supabase`) — W:95 D:90
- **Microsoft Teams** (`microsoft-teams`) — W:95 D:90
- **Google Meet** (`google-meet`) — W:95 D:95
- **Telegram** (`telegram`) — W:95 D:95
- **GitHub Copilot** (`github-copilot`) — W:95 D:85
- **Resend** (`resend`) — W:80 D:95
- **Cal.com** (`cal-com`) — W:95 D:95
- **Unkey** (`unkey`) — W:75 D:85
- **Trigger.dev** (`trigger-dev`) — W:85 D:95
- **deer-flow** (`deer-flow`) — W:85 D:90
- **nanobot** (`nanobot`) — W:85 D:90
- **claude-code-templates** (`claude-code-templates`) — W:75 D:85
- **container** (`container`) — W:85 D:90
