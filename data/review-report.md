# Quality Review Report — 2026-06-01

## Summary

| Metric | Count |
|--------|-------|
| Total tools | 61 |
| Keep (quality) | 39 |
| Needs review | 21 |
| Suggest hide | 0 |
| Suggest remove | 1 |

## Pipeline Health

Moderate - strong core tools but significant data quality issues and many low-worthy tools in draft/review.

### Strengths
- High worthiness scores for well-known tools (Notion, Figma, VS Code, etc.)
- No missing website URLs
- Good coverage of popular developer tools

### Weaknesses
- 24 tools missing GitHub URL (39% of total)
- 29 tools with zero reviews (48% of total)
- 12 tools with data quality <60
- 7 tools with worthiness <40
- Many tools in draft/review with low data quality scores

### Prompt Improvement Suggestions

| Prompt | Issue | Suggested Fix |
|--------|-------|---------------|
| discovery_prompt | Too many low-quality tools discovered (e.g., Antigravity-Manager, Workout.cool) | Add stricter criteria: require at least 50 GitHub stars or 1000 users, and enforce a minimum number of reviews or community signals. |
| verification_prompt | Data quality scores are low for many tools due to missing GitHub URLs and zero reviews | Instruct LLM to flag tools with missing GitHub URL or zero reviews as 'review' or 'remove' unless other strong signals exist. Add explicit check for GitHub URL presence. |
| review_prompt | Tools like claude-code, markitdown, ToolJet have high worthiness but low data quality (40) - inconsistent | Require LLM to explain why data quality is low despite high worthiness, and suggest specific data to collect (e.g., GitHub stars, recent commits, user count). |

### Threshold Suggestions

| Parameter | Current | Suggested | Reason |
|-----------|---------|-----------|--------|
| Minimum GitHub stars for discovery | None | 100 | Filter out very obscure tools with no community adoption (e.g., Antigravity-Manager, Workout.cool) |
| Minimum data quality score for 'keep' | None (manual) | 60 | Tools with data quality <60 often have missing critical fields (GitHub URL, reviews) and need re-verification |
| Minimum worthiness score for 'keep' | None (manual) | 50 | Tools with worthiness <50 are unlikely to be valuable; consider removing or re-discovering |

## Suggest Remove

### Antigravity-Manager (`antigravity-manager`) — W:15 D:30
- The tool name and description reference 'Antigravity Tools', which does not appear to be a real product or service.
- The GitHub repository has an implausibly high number of stars (29,523) for a niche tool with zero reviews, suggesting possible star manipulation or fake data.
- The tool is extremely obscure and lacks any evidence of real users or community presence.
  Fixes:
  → Verify the existence of 'Antigravity Tools' and the tool's actual functionality.
  → Investigate the GitHub repository for authenticity of star count.
  → If the tool is legitimate, provide evidence of real users or development activity.

## Needs Review

### claude-code (`claude-code`) — W:95 D:40
- Claude Code is a highly popular open-source tool with 129k GitHub stars, indicating significant market presence and developer adoption.
- However, the data quality is poor: the pricing plans and features appear to be copied from GitHub (e.g., Dependabot, CI/CD minutes, Packages storage), not relevant to Claude Code.
- The website URL points to GitHub, but the tagline and description describe a terminal-based coding tool, which is accurate, but the pricing/features mismatch is a major data quality issue.
  Data issues:
  - Pricing plans are incorrect; they describe GitHub's free plan, not Claude Code's pricing.
  - Features list is incorrect; it includes GitHub-specific features (Dependabot, CI/CD minutes, Packages storage) instead of Claude Code's actual features.
  - Rating of 4.95/5 with 0 reviews is inconsistent; should be either no rating or based on actual reviews.
  - Website URL is GitHub repo, which is acceptable for an open-source tool, but the pricing/features need to be corrected.
  Fixes:
  → Update pricing plans to reflect Claude Code's actual pricing (likely free or subscription-based, but not GitHub's plan).
  → Update features list to include actual Claude Code features (e.g., natural language commands, codebase understanding, terminal integration, git workflow support).
  → Remove or correct the rating if no reviews exist.
  → Ensure description and tagline are consistent with the actual product.

### markitdown (`markitdown`) — W:85 D:40
- Tool is a well-known Microsoft open-source project with high GitHub stars, indicating significant market presence.
- Data quality issues: pricing and features are incorrectly copied from GitHub's pricing, not the tool's own.
  Data issues:
  - Pricing plans are for GitHub, not for MarkItdown.
  - Features listed are for GitHub, not for MarkItdown.
  Fixes:
  → Remove pricing plans or set to 'Free' with appropriate description.
  → Replace features with actual MarkItdown features (e.g., PDF support, Office conversion, AI integration).

### Bodhi (`bodhi`) — W:45 D:70
- Tool is open-source with a small but real GitHub presence (133 stars), but it's not well-known and has no reviews. The website URL (bodhi.com) appears to be a placeholder or unrelated, which is a red flag.
  Data issues:
  - Website URL (https://bodhi.com) likely does not point to the actual tool; it may be a generic domain. No user reviews despite a rating displayed. Pricing is only free, which is plausible but lacks detail.
  Fixes:
  → Verify and update the website URL to the correct project page (e.g., GitHub Pages or a dedicated site). Add more pricing details if available. Consider gathering user feedback or reviews.

### AnkiAIUtils (`anki`) — W:95 D:60
- Anki is a highly popular, well-known flashcard app with a large user base and active development.
- The tool name 'AnkiAIUtils' does not match the actual product (Anki) and the GitHub URL points to the main Anki repository, not an AI utilities add-on.
- The description and features are accurate for Anki itself, but the tagline and name suggest a specific AI add-on that may not exist as described.
  Data issues:
  - Tool name 'AnkiAIUtils' is misleading; the actual product is Anki, a flashcard app.
  - GitHub URL points to the main Anki repository (ankitects/anki) with 28k stars, but the tool is described as an AI utility add-on.
  - Website URL (apps.ankiweb.net) is the official Anki site, not a separate AI utilities tool.
  - Pricing plans are for Anki itself (Desktop free, iOS paid, Android free), not for an AI add-on.
  - No reviews despite high rating, which is suspicious.
  Fixes:
  → Rename tool to 'Anki' and update tagline/description to reflect the core flashcard app.
  → If the tool is indeed an AI add-on, correct the GitHub and website URLs to point to the actual add-on repository and page.
  → Add real user reviews or remove the rating if no reviews exist.
  → Ensure pricing plans match the tool being listed.

### Stagewise (`stagewise`) — W:65 D:85
- Tool has significant GitHub stars (6689) and is open source, indicating real user base and active development. However, it is relatively new and not yet widely known in the broader developer tools market. The tagline and description are clear and accurate. Pricing is minimal (free, self-hosted). Category is appropriate. The rating of 3.5/5 with 0 reviews is suspicious; likely the rating is auto-generated or from a small sample. The tool is in draft status, suggesting it may not be fully launched.
  Data issues:
  - Rating of 3.5/5 with 0 reviews is inconsistent; should either have no rating or have reviews to support it.
  - Tool is in draft status, which may indicate it is not yet publicly available or fully verified.
  Fixes:
  → Remove the rating if there are no reviews, or update with actual review data.
  → If the tool is publicly available, change status from 'draft' to 'published'.

### Tasker (`tasker`) — W:35 D:70
- Tool has a niche but legitimate concept with open-source code and a website, but very low GitHub stars (105) and no reviews, indicating minimal traction. The name 'Tasker' conflicts with a well-known Android app.
  Data issues:
  - Website URL (tasker.ai) does not resolve to a real site (likely placeholder or parked domain)
  - Rating of 3.5/5 with 0 reviews is inconsistent
  - GitHub stars are very low for a tool claiming AI-powered automation
  Fixes:
  → Verify website URL and update if incorrect
  → Remove rating or add actual review count
  → Consider if tool has enough community adoption to be listed

### ToolJet (`tooljet`) — W:85 D:40
- ToolJet is a well-known open-source low-code platform with significant GitHub stars (37,958) and active development.
- The tagline and description are accurate and well-written.
- The category 'development' is appropriate.
- However, the pricing plans and features listed appear to be copied from GitHub (e.g., 'Unlimited public/private repositories', 'Dependabot'), not ToolJet's own pricing. This is a major data quality issue.
  Data issues:
  - Pricing plans and features are incorrect; they seem to be from GitHub, not ToolJet.
  - Website URL points to GitHub repository instead of the actual product website (likely https://tooljet.com).
  Fixes:
  → Update pricing plans to reflect ToolJet's actual plans (e.g., Free self-hosted, Team, Enterprise).
  → Update features to match ToolJet's capabilities (e.g., drag-and-drop UI builder, database integrations, workflow automation).
  → Correct the website URL to https://tooljet.com.

### Ephe (`ephe`) — W:35 D:20
- The tool appears to be a small open-source project with limited community awareness (577 stars).
- The tagline and description describe an ephemeral markdown editor, but the pricing plans and features are copied from GitHub, indicating data mismatch.
  Data issues:
  - Pricing plans and features are not for Ephe but for GitHub.
  - Website URL points to GitHub repository, not a dedicated product site.
  - Rating has 0 reviews, making it unreliable.
  Fixes:
  → Update pricing plans to reflect actual Ephe pricing (likely free or donation-based).
  → Update features to match Ephe's actual capabilities (e.g., markdown editing, sharing).
  → Add a proper website URL if available, or note that the GitHub repo is the primary site.

### Colanode (`colanode`) — W:55 D:30
- The tool has a significant GitHub star count (4884) and is open-source, indicating some community interest.
- However, the website URL points to GitHub, not a dedicated product site, and the description/pricing/features appear to be copied from GitHub, not Colanode itself.
- The tagline and description describe a Slack/Notion alternative, but the features and pricing are for GitHub, suggesting data contamination.
  Data issues:
  - Website URL is GitHub repo, not a product website.
  - Pricing plans and features are clearly from GitHub, not Colanode.
  - No reviews despite a rating of 3.5/5.
  - Category 'productivity' may be appropriate but needs verification.
  Fixes:
  → Update website URL to actual Colanode product site (if exists).
  → Replace pricing and features with accurate Colanode data.
  → Remove or correct the rating if no reviews exist.
  → Verify the tool's actual status and market presence.

### Onlook (`onlook`) — W:85 D:40
- Tool is open-source with high GitHub stars (25k+), indicating significant community interest and active development.
- Tagline and description are clear and align with the category 'design'.
- Pricing data appears to be copied from GitHub's pricing, not the tool's own pricing, which is a major data quality issue.
- Features listed are GitHub features, not Onlook's features, suggesting the data was incorrectly populated.
  Data issues:
  - Pricing plans and features are from GitHub, not Onlook.
  - Website URL points to GitHub repo, not a dedicated product website.
  - No reviews or rating data available.
  Fixes:
  → Update pricing plans to reflect Onlook's actual pricing (likely free/open-source).
  → Replace features with Onlook-specific features (e.g., visual editing, AI-powered design, React component generation).
  → Add a proper website URL if available, or keep GitHub as primary but note it's open-source.

### InstantDB (`instantdb`) — W:70 D:40
- InstantDB has a strong GitHub presence with over 10k stars, indicating real usage and community interest.
- The tool is open source and actively developed, fitting the niche of backend for AI-coded apps.
- However, the data quality is poor: the tagline and description are generic and not specific to InstantDB, and the pricing and features appear to be copied from GitHub, not InstantDB.
- The website URL points to GitHub instead of a dedicated product site, which is unusual for a backend service.
  Data issues:
  - Pricing plans and features are identical to GitHub's free plan, not InstantDB's actual offerings.
  - Website URL is a GitHub repository, not a product website.
  - Tagline and description are generic and may not accurately represent InstantDB's unique value proposition.
  Fixes:
  → Update pricing plans to reflect InstantDB's actual pricing (likely free tier with paid options).
  → Change website URL to the official product site (e.g., instantdb.dev or similar).
  → Revise tagline and description to be specific to InstantDB's features (auth, permissions, storage, presence, streams).
  → Update features list to match InstantDB's capabilities.

### Langfuse (`langfuse`) — W:85 D:40
- Langfuse is a well-known open source LLM engineering platform with significant GitHub stars and active development, making it worthy of listing. However, the data quality is poor because the pricing and features appear to be copied from GitHub, not Langfuse.
  Data issues:
  - Pricing plans and features are incorrect; they describe GitHub, not Langfuse.
  - Website URL points to GitHub instead of the actual product website.
  Fixes:
  → Update pricing plans with Langfuse's actual plans (e.g., Cloud Free, Team, Self-Hosted).
  → Update features to reflect Langfuse's capabilities (observability, evaluations, prompt management, etc.).
  → Set correct website URL (e.g., https://langfuse.com).

### gstack (`gstack`) — W:85 D:60
- Tool is associated with Garry Tan, a well-known figure in tech, and has an extremely high GitHub star count (105k), indicating significant interest.
- However, the star count seems implausibly high for a niche tool (more than many major projects), suggesting possible data error or manipulation.
- The tool is open-source and has a clear purpose, but the tagline and description are somewhat vague about what the tools actually do.
  Data issues:
  - GitHub stars (105,301) are unrealistically high for a project with only 23 tools and no visible community activity; likely a data entry error.
  - Website URL is same as GitHub URL, which is acceptable for open-source projects but may lack a dedicated site.
  - Rating is 0/5 with 0 reviews, which is inconsistent with high star count.
  - Features list is generic and lacks specific technical details.
  Fixes:
  → Verify GitHub star count and correct if necessary.
  → Add more detailed feature descriptions or examples of the 23 tools.
  → Consider adding a dedicated website or documentation page.
  → Encourage user reviews to build credibility.

### awesome-claude-skills (`awesome-claude-skills`) — W:55 D:70
- GitHub stars are very high (62,740) indicating popularity, but it's a curated list repository, not a standalone tool.
- Tagline and description are accurate, but the tool is essentially a GitHub repo, which may not fit the typical tool listing.
- Pricing is free and open source, which is appropriate.
  Data issues:
  - Category 'development' is appropriate but could be more specific like 'AI/ML' or 'Developer Tools'.
  - Rating is 0/5 with no reviews, which is expected for a repo but may mislead users.
  - Website URL is same as GitHub URL, which is fine but might be considered a data issue if a separate product site is expected.
  Fixes:
  → Consider adding a more specific category or subcategory.
  → Add a note that this is a GitHub repository rather than a standalone tool.
  → If possible, include a link to a dedicated website or documentation.

### claude-code-templates (`claude-code-templates`) — W:65 D:70
- High GitHub stars (27k) indicate significant community interest, but the tool is relatively new and niche.
- Tagline and description are clear and accurate.
- Pricing is free and open-source, which is appropriate.
- Website URL (aitmpl.com) appears to be a real site, but the tool name suggests it's for Claude Code, which may limit its audience.
  Data issues:
  - No reviews or ratings available, making it hard to gauge real user satisfaction.
  - The tool is specifically for Claude Code, which is a niche within development tools.
  - The website URL (aitmpl.com) does not directly match the tool name, which could cause confusion.
  Fixes:
  → Encourage user reviews to build credibility.
  → Consider adding a more descriptive slug or clarifying the tool's scope.
  → Ensure the website URL is prominently linked to the tool's purpose.

### Workout.cool (`workout-cool`) — W:25 D:40
- Very niche, low community awareness, no GitHub stars or reviews, but appears to be a real open-source project with active development.
  Data issues:
  - GitHub URL points to undefined
  - GitHub stars N/A but should be 0
  - Category 'other' is vague
  Fixes:
  → Update GitHub URL to correct repository
  → Set GitHub stars to 0 if none
  → Assign a more specific category like 'fitness' or 'health'

### Rowboat (`rowboat`) — W:35 D:50
- Very niche tool with low community awareness; no GitHub stars or reviews; but appears to be a real open-source project with a defined purpose.
  Data issues:
  - GitHub URL points to undefined; no GitHub stars despite being open-source; no user reviews; pricing only lists free self-hosted version, no other plans.
  Fixes:
  → Update GitHub URL to correct repository; verify if GitHub stars are actually available; consider adding more pricing details if applicable.

### Axilla (`axilla`) — W:45 D:60
- The tool appears to be a legitimate open-source project but has low visibility (no GitHub stars, no reviews). The tagline and description are generic, and the framework may be too niche or early-stage for broad listing.
  Data issues:
  - GitHub URL points to undefined
  - GitHub stars missing
  - No reviews or ratings
  - Website URL is GitHub repo, not a dedicated site
  Fixes:
  → Update GitHub URL to correct repository
  → Add GitHub stars if available
  → Consider adding more specific features or use cases
  → Improve tagline to differentiate from other AI frameworks

### Hyperdiv (`hyperdiv`) — W:45 D:60
- Hyperdiv is a legitimate open-source Python framework for reactive UIs, but it is relatively new and has limited community adoption. The GitHub URL is incorrect (points to undefined), and the GitHub stars are missing, which suggests data quality issues.
  Data issues:
  - GitHub URL is https://github.com/undefined instead of the actual repository
  - GitHub Stars is N/A but should be retrievable
  - Status is undefined
  Fixes:
  → Update GitHub URL to the correct repository (e.g., https://github.com/hyperdiv/hyperdiv)
  → Fetch and include GitHub stars count
  → Set status to 'active' or similar

### Colanode, (`colanode-`) — W:35 D:60
- Very niche, limited community awareness, no GitHub stars or reviews, but appears to be a real open-source project with a clear purpose.
  Data issues:
  - GitHub URL is https://github.com/undefined (invalid)
  - GitHub Stars is N/A but should be 0 or actual count
  - Status is undefined
  - Rating is 0/5 with 0 reviews, but that may be correct
  Fixes:
  → Update GitHub URL to correct repository
  → Set GitHub Stars to actual count (likely 0)
  → Set Status to 'active' or 'inactive'
  → Consider adding more pricing details or note that it's self-hosted

### Open (`open`) — W:35 D:40
- The tool is open source and has a clear purpose, but it is very niche with limited community awareness (no GitHub stars, no reviews). The website URL points to a GitHub repo that may not be the official project page.
  Data issues:
  - GitHub URL is set to undefined
  - GitHub stars are N/A but could be 0
  - Website URL is a GitHub repo, not a dedicated site
  - Category is 'other' which is vague
  - No reviews or ratings
  Fixes:
  → Update GitHub URL to actual repo if exists
  → Set GitHub stars to 0 if not available
  → Consider adding a more specific category
  → Verify if the tool is actively maintained

## Keep

- **Notion** (`notion`) — W:95 D:95
- **Obsidian** (`obsidian`) — W:95 D:90
- **Figma** (`figma`) — W:95 D:90
- **Penpot** (`penpot`) — W:95 D:95
- **Linear** (`linear`) — W:95 D:95
- **GitHub Issues** (`github-issues`) — W:95 D:85
- **Cursor** (`cursor`) — W:95 D:100
- **VS Code** (`vscode`) — W:95 D:100
- **Slack** (`slack`) — W:95 D:95
- **Discord** (`discord`) — W:95 D:100
- **composio** (`composio`) — W:85 D:90
- **Dyad** (`dyad`) — W:85 D:90
- **Skip** (`skip`) — W:65 D:90
- **Jira** (`jira`) — W:95 D:90
- **Trello** (`trello`) — W:95 D:95
- **Asana** (`asana`) — W:95 D:90
- **ClickUp** (`clickup`) — W:95 D:90
- **GitLab** (`gitlab`) — W:95 D:90
- **Docker** (`docker`) — W:95 D:90
- **Postman** (`postman`) — W:95 D:90
- **Zoom** (`zoom`) — W:95 D:85
- **Confluence** (`confluence`) — W:95 D:95
- **Miro** (`miro`) — W:95 D:95
- **Airtable** (`airtable`) — W:95 D:90
- **Zapier** (`zapier`) — W:95 D:85
- **Vercel** (`vercel`) — W:95 D:95
- **Supabase** (`supabase`) — W:95 D:90
- **Microsoft Teams** (`microsoft-teams`) — W:95 D:90
- **Google Meet** (`google-meet`) — W:95 D:95
- **Telegram** (`telegram`) — W:95 D:95
- **GitHub Copilot** (`github-copilot`) — W:95 D:90
- **Resend** (`resend`) — W:75 D:95
- **Cal.com** (`cal-com`) — W:90 D:95
- **Unkey** (`unkey`) — W:75 D:95
- **Trigger.dev** (`trigger-dev`) — W:82 D:95
- **system-prompts-and-models-of-ai-tools** (`system-prompts-and-models-of-ai-tools`) — W:85 D:90
- **deer-flow** (`deer-flow`) — W:85 D:95
- **nanobot** (`nanobot`) — W:85 D:95
- **codegraph** (`codegraph`) — W:75 D:85
