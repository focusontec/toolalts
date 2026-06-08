# Quality Review Report — 2026-06-08

## Summary

| Metric | Count |
|--------|-------|
| Total tools | 62 |
| Keep (quality) | 40 |
| Needs review | 18 |
| Suggest hide | 3 |
| Suggest remove | 1 |

## Pipeline Health

Moderate - strong core tools but significant data quality issues and many low-utility tools in pipeline

### Strengths
- High worthiness scores for established tools (Notion, Figma, VS Code, etc.)
- Good coverage of popular developer tools and platforms
- Most active tools have high data quality scores

### Weaknesses
- 24 tools missing GitHub URL (39% of total) - critical for verification
- 30 tools have zero reviews - insufficient social proof
- 19 tools have low data quality (<60) - likely missing metadata
- 10 tools have low worthiness (<40) - potential noise in pipeline
- Several tools with high worthiness but low data quality (e.g., claude-code, markitdown) need enrichment

### Prompt Improvement Suggestions

| Prompt | Issue | Suggested Fix |
|--------|-------|---------------|
| discovery_prompt | Too many low-utility tools being discovered (e.g., Antigravity-Manager, Workout.cool) | Add requirement that tools must have at least 100 GitHub stars or 50 reviews to be included, and exclude tools with no clear developer use case |
| verification_prompt | Tools with high worthiness but low data quality are marked 'review' but not given specific enrichment instructions | For tools with worthiness >80 and dataQuality <60, automatically generate a task to fetch missing metadata (GitHub URL, reviews, description) and re-verify |
| data_enrichment_prompt | 24 tools missing GitHub URL - likely not being fetched during discovery | Add a mandatory step: after discovering a tool, attempt to find its GitHub repository via search and populate the GitHub URL field |

### Threshold Suggestions

| Parameter | Current | Suggested | Reason |
|-----------|---------|-----------|--------|
| Minimum GitHub stars for discovery | 0 | 100 | Filter out obscure or non-viable tools early; 24 tools missing GitHub URL suggests discovery is too permissive |
| Minimum number of reviews for verification | 0 | 10 | 30 tools have zero reviews, making it hard to assess community trust; requiring reviews ensures social proof |
| Worthiness threshold for 'hide' action | 30 | 40 | Several tools with worthiness 25-35 are still in pipeline; raising threshold reduces noise without losing potentially valuable tools |

## Suggest Remove

### Open (`open`) — W:15 D:10
- The tool appears to be a GitHub repository for a different product (GitHub pricing and features), not the described Raspberry Pi security camera. The name, tagline, and description do not match the actual content. The GitHub URL is invalid and the pricing plans are for GitHub, not Open.
  Fixes:
  → Either correct the data to match the actual product (if it exists) or remove the entry entirely.

## Suggest Hide

### Workout.cool (`workout-cool`) — W:25 D:20
- Tool appears to be a very niche open-source project with no GitHub stars or community presence
- Pricing and features are copied from GitHub, not related to the actual product
- Website URL points to a GitHub repo with no evidence of active development or user base

### Hyperdiv (`hyperdiv`) — W:30 D:20
- Hyperdiv is a real but very niche Python framework with limited community awareness and adoption.
- The data appears to be copied from GitHub's pricing page, not related to Hyperdiv.
- The GitHub URL is malformed (https://github.com/undefined) and the features/pricing are for GitHub, not Hyperdiv.

### Colanode, (`colanode-`) — W:25 D:20
- Tool appears very niche with no GitHub stars or reviews, suggesting minimal adoption.
- Description and features are copied from GitHub's pricing page, not Colanode's own features.
- Website URL points to a GitHub repo with no evidence of active development or community.

## Needs Review

### claude-code (`claude-code`) — W:95 D:45
- Claude Code is a highly popular open-source tool with 130K GitHub stars, indicating significant market presence and developer interest.
- The tagline and description accurately describe the tool's capabilities.
- The pricing plans and features appear to be copied from GitHub (e.g., CI/CD minutes, Packages storage) rather than being specific to Claude Code, which is a data quality issue.
- The tool is open-source and has a real GitHub URL, but the website URL points to the same GitHub page, which is acceptable.
- The rating of 4.95/5 with 0 reviews is suspicious; likely a placeholder or error.
  Data issues:
  - Pricing plans and features are identical to GitHub's free plan, not Claude Code's actual pricing.
  - Rating shows 4.95/5 but 0 reviews, which is inconsistent.
  - Status is 'draft' but the tool is well-known and should be published.
  - Category 'development' is appropriate but could be more specific (e.g., 'AI coding assistant').
  Fixes:
  → Update pricing plans to reflect Claude Code's actual pricing (likely free or usage-based).
  → Remove or correct the rating if no reviews exist.
  → Change status from 'draft' to 'published'.
  → Verify and update features to match Claude Code's capabilities (e.g., terminal-based, natural language commands, codebase understanding).

### markitdown (`markitdown`) — W:85 D:30
- Tool is a well-known Microsoft project with high GitHub stars, but the data is inaccurate (pricing and features are for GitHub, not markitdown).
  Data issues:
  - Pricing plans and features are for GitHub, not markitdown.
  - Rating is 5/5 with 0 reviews, which is suspicious.
  Fixes:
  → Update pricing to reflect that markitdown is free and open-source with no paid plans.
  → Remove or correct features to match markitdown's actual capabilities (file conversion, AI integration).
  → Update rating to reflect actual reviews or remove.

### Bodhi (`bodhi`) — W:35 D:70
- Low GitHub stars (133) and no reviews indicate very limited adoption; website URL (bodhi.com) appears unrelated to the tool, likely incorrect; tool is open-source but lacks community traction.
  Data issues:
  - Website URL (bodhi.com) does not match the tool; likely placeholder or incorrect.
  - No user reviews despite a rating of 3.75/5.
  Fixes:
  → Update website URL to the correct GitHub repository or a proper project page.
  → Verify if the tool has any user base or active development beyond the GitHub repo.

### AnkiAIUtils (`anki`) — W:95 D:40
- Tool is actually Anki, a well-known flashcard app with massive user base and GitHub stars, but name and description misrepresent it as a utility for Anki rather than the core app itself.
- Data quality issues: tagline and description are misleading, GitHub URL points to Anki's repo not AnkiAIUtils, and pricing plans are for Anki not this tool.
  Data issues:
  - Name 'AnkiAIUtils' does not match the actual product (Anki).
  - Tagline and description describe a non-existent AI utility, not the core Anki app.
  - GitHub URL points to Anki's repository, not a separate 'AnkiAIUtils' project.
  - Pricing plans are for Anki (Desktop, iOS, Android), not for an AI utility.
  - Features list is generic and matches Anki's core features, not AI utilities.
  Fixes:
  → Rename tool to 'Anki' or correct the name to reflect the actual product.
  → Update tagline and description to accurately describe Anki as a flashcard app.
  → Ensure GitHub URL points to the correct repository if it exists, or remove if not.
  → Update pricing plans to match the actual product (e.g., free desktop, paid iOS).
  → Revise features to reflect Anki's capabilities.

### Tasker (`tasker`) — W:45 D:70
- Tool is open-source with a niche but real user base (105 GitHub stars), but lacks significant market presence and reviews. Data is mostly accurate but pricing is overly simplistic and website URL may not be official (tasker.ai appears to be a different product).
  Data issues:
  - Website URL tasker.ai likely does not belong to this tool (Tasker is a common name, and tasker.ai seems to be a different product).
  - Pricing plan 'Free' with 'All features' is too vague and unrealistic.
  - Rating of 3.5/5 with 0 reviews is inconsistent.
  Fixes:
  → Verify and correct the website URL to the actual project page (e.g., GitHub or official site).
  → Provide more detailed pricing or indicate if truly free.
  → Remove rating or add real reviews.

### ToolJet (`tooljet`) — W:85 D:45
- ToolJet is a well-known open-source low-code platform with significant GitHub stars (38k), indicating strong community presence and real usage.
- The description and tagline are accurate, but the pricing and features data appear to be copied from GitHub's own plans, not ToolJet's actual pricing.
- The website URL points to GitHub instead of the official ToolJet website (tooljet.com), which is a data quality issue.
  Data issues:
  - Pricing plans are incorrect; they describe GitHub's free plan, not ToolJet's.
  - Features list is also from GitHub, not ToolJet's actual features.
  - Website URL should be https://tooljet.com, not the GitHub repo.
  Fixes:
  → Update pricing plans to reflect ToolJet's actual plans (e.g., self-hosted free, cloud plans).
  → Replace features with ToolJet's real features (e.g., drag-and-drop UI, database integrations, workflow automation).
  → Change website URL to https://tooljet.com.

### Ephe (`ephe`) — W:35 D:20
- The tool has a very small user base (578 GitHub stars) and is not well-known.
- The tagline and description describe an ephemeral markdown editor, but the pricing and features are copied from GitHub, indicating data quality issues.
- The website URL points to a GitHub repository, not a dedicated product site.
  Data issues:
  - Pricing plans and features are for GitHub, not for Ephe.
  - Website URL is a GitHub repo, not a proper product website.
  - No reviews or user feedback available.
  Fixes:
  → Update pricing and features to accurately reflect Ephe's offering.
  → Provide a proper website URL for the tool.
  → Consider if the tool is sufficiently developed to be listed.

### Colanode (`colanode`) — W:65 D:30
- Tool has significant GitHub stars (4903) and is open-source, indicating community interest.
- However, the tagline and description describe it as a Slack/Notion alternative, but the pricing and features are copied from GitHub, suggesting data quality issues.
- Website URL points to GitHub repo, not a dedicated product site, which is acceptable for open-source but may reduce perceived legitimacy.
  Data issues:
  - Pricing plans and features are identical to GitHub's free plan, not Colanode's own.
  - No reviews despite a rating of 3.5/5.
  - Category 'productivity' may be too broad; more specific like 'team collaboration' would be better.
  Fixes:
  → Update pricing and features to reflect Colanode's actual offerings.
  → Remove or correct the rating if no reviews exist.
  → Consider a more specific category.

### Onlook (`onlook`) — W:85 D:40
- High GitHub stars (25k+) and open-source nature indicate significant community interest and activity.
- Tagline and description are well-written and clearly convey the tool's purpose.
- Pricing data appears to be copied from GitHub, not Onlook's own pricing, which is a major data quality issue.
- Website URL points to GitHub repository instead of a dedicated product website.
  Data issues:
  - Pricing plans are for GitHub, not Onlook. Onlook is free and open-source, but the listed plans are incorrect.
  - Website URL should be a dedicated product site, not the GitHub repo.
  - Features list is also from GitHub, not Onlook's features.
  Fixes:
  → Update pricing to reflect Onlook's actual pricing (likely free/open-source).
  → Set website URL to the correct product website if available, or keep as GitHub if no other site exists.
  → Update features list to match Onlook's actual features (e.g., visual editing, AI assistance, React support).

### InstantDB (`instantdb`) — W:65 D:30
- InstantDB has a significant GitHub presence with over 10k stars, indicating real usage and community interest.
- The tool appears to be a legitimate backend platform for AI-coded apps, fitting the development category.
- However, the pricing and features listed appear to be copied from GitHub's pricing, not InstantDB's own plans.
- The website URL points to GitHub, not a dedicated product site, which is unusual for a commercial tool.
  Data issues:
  - Pricing plans are clearly for GitHub, not InstantDB. They mention 'public/private repositories', 'CI/CD minutes', etc.
  - Features list is also from GitHub, not relevant to InstantDB's described functionality (auth, permissions, storage, etc.).
  - Website URL is a GitHub repository, not a product website. This may be acceptable for open-source tools but is misleading for a backend platform.
  - Rating shows 4/5 with 0 reviews, which is inconsistent.
  Fixes:
  → Replace pricing plans with actual InstantDB pricing (likely free tier or usage-based).
  → Update features to reflect InstantDB's actual capabilities: authentication, permissions, storage, presence, streams.
  → Update website URL to a proper product page if one exists, or keep GitHub if that is the primary site.
  → Remove or correct the rating if no reviews exist.

### Langfuse (`langfuse`) — W:85 D:30
- Langfuse is a well-known open source LLM engineering platform with significant GitHub stars (28k+) and active development, making it worthy of listing.
- However, the data quality is poor: the pricing plans and features are incorrectly copied from GitHub (not Langfuse's own pricing), and the website URL points to GitHub instead of the actual product site.
  Data issues:
  - Pricing plans are for GitHub, not Langfuse.
  - Features are for GitHub, not Langfuse.
  - Website URL is GitHub repo, not the official product website (likely https://langfuse.com).
  Fixes:
  → Update pricing plans to reflect Langfuse's actual plans (e.g., Cloud Free, Team, Enterprise).
  → Update features to match Langfuse's capabilities (observability, evaluations, prompt management, etc.).
  → Change website URL to https://langfuse.com.

### GitHub Copilot (`github-copilot`) — W:95 D:70
- GitHub Copilot is a highly popular and well-known AI coding assistant with significant market presence, but the provided data has issues: pricing plans only list a free plan that appears to be for GitHub itself, not Copilot; features also seem mismatched (e.g., CI/CD minutes, Packages storage are GitHub features, not Copilot-specific).
  Data issues:
  - Pricing plans do not reflect actual Copilot pricing (e.g., Copilot Individual is $10/month, Copilot Business $19/month).
  - Features listed are GitHub features, not Copilot-specific features (e.g., inline suggestions, chat, function generation).
  - Rating and review count seem plausible but are not verified.
  Fixes:
  → Update pricing plans to include Copilot Individual ($10/month) and Copilot Business ($19/month) with correct features.
  → Replace features list with Copilot-specific features: inline code suggestions, chat-based assistance, function generation, multi-language support, etc.
  → Verify rating source or remove if unverifiable.

### system-prompts-and-models-of-ai-tools (`system-prompts-and-models-of-ai-tools`) — W:85 D:40
- High GitHub stars (138k) indicate significant interest and community value.
- Tagline and description are accurate and well-written.
- Category 'development' is appropriate.
- Pricing and features appear to be copied from GitHub's own plans, not specific to this tool.
- Website URL points to GitHub repository, which is acceptable for an open-source project.
- No reviews yet, but that's common for new listings.
  Data issues:
  - Pricing plans and features are generic GitHub plans, not specific to this tool.
  - Features list includes GitHub-specific features like CI/CD minutes and Packages storage, which are not directly relevant to the tool's purpose.
  Fixes:
  → Update pricing to reflect the tool's actual cost (likely free, open-source).
  → Replace features with tool-specific features (e.g., collection of system prompts, AI models, etc.).

### gstack (`gstack`) — W:75 D:30
- The tool is created by a well-known figure (Garry Tan) and has a high GitHub star count, indicating significant interest.
- However, the description and features appear to be copied from GitHub's own features, not specific to gstack, suggesting data quality issues.
  Data issues:
  - Pricing plans and features are identical to GitHub's free plan, not gstack's own.
  - GitHub stars (108,145) likely refer to the repository, but the tool itself may not have that many users.
  - Tagline mentions '23 opinionated tools' but features list does not reflect that.
  Fixes:
  → Update pricing and features to accurately reflect gstack's own offerings.
  → Verify and correct the GitHub stars count or clarify that it's for the repo.
  → Ensure description and features align with the actual tool.

### awesome-claude-skills (`awesome-claude-skills`) — W:25 D:30
- The tool is a GitHub repository curating resources, not a standalone software tool.
- The pricing plan is for GitHub, not for this repository.
- The features listed are GitHub features, not features of the curated collection.
- The repository has a high star count, indicating popularity, but the data is misleading.
  Data issues:
  - Pricing and features are incorrectly attributed to the repository instead of GitHub.
  - Tagline and description are accurate but the rest of the data is mismatched.
  - Category 'development' is appropriate but the tool is not a typical development tool.
  Fixes:
  → Remove pricing and features, or replace with repository-specific info (e.g., no pricing, features like curated list of skills).
  → Consider re-categorizing as 'resources' or 'learning'.
  → If the tool is meant to be the GitHub repository itself, update data to reflect that it's a free resource with no pricing.

### Antigravity-Manager (`antigravity-manager`) — W:20 D:40
- The tool appears to be a real project with a GitHub repository and website, but it is extremely niche (specific to Antigravity Tools, which itself is obscure). The GitHub stars (29661) seem implausibly high for such a niche tool, suggesting possible inaccuracy or manipulation. The tool has no reviews and limited community presence.
  Data issues:
  - GitHub stars count (29661) is suspiciously high for a niche tool with 0 reviews and no apparent widespread use.
  - Tagline and description refer to 'Antigravity Tools' which is not a well-known product, making the tool's purpose unclear to most users.
  - No user reviews or ratings available.
  Fixes:
  → Verify the GitHub stars count from the repository; if inflated, correct the data.
  → Provide more context about what Antigravity Tools is, or consider if this tool is too niche for the directory.
  → Gather user reviews or evidence of real usage to support listing.

### Rowboat (`rowboat`) — W:25 D:30
- The tool appears to be a real open-source project but has no GitHub stars and limited community presence.
- The description and features seem copied from GitHub's pricing page, not specific to Rowboat.
- The website URL leads to a GitHub repo, but the repo name is 'rowboatlabs/rowboat' which may not exist or is very obscure.
  Data issues:
  - Features and pricing are identical to GitHub's free plan, not Rowboat's own features.
  - GitHub URL is set to undefined, indicating missing or incorrect data.
  - No reviews or community engagement (0 ratings).
  Fixes:
  → Verify the actual GitHub repository and update the URL accordingly.
  → Correct the features and pricing to reflect Rowboat's actual offerings.
  → Add a proper website URL if available, or confirm the tool's existence.

### Axilla (`axilla`) — W:35 D:20
- Axilla appears to be a real project but is very niche and has low community awareness. The GitHub URL is missing stars and the provided pricing and features are copied from GitHub, not Axilla itself.
  Data issues:
  - GitHub URL points to axilla-io/ax but stars are N/A; likely not fetched correctly
  - Pricing and features are for GitHub, not Axilla
  - Website URL is GitHub repo, not a product site
  Fixes:
  → Update GitHub URL to correct repo and fetch stars
  → Replace pricing and features with actual Axilla data
  → Provide a proper website URL if exists

## Keep

- **Notion** (`notion`) — W:95 D:95
- **Obsidian** (`obsidian`) — W:95 D:90
- **Figma** (`figma`) — W:95 D:95
- **Penpot** (`penpot`) — W:95 D:95
- **Linear** (`linear`) — W:85 D:95
- **GitHub Issues** (`github-issues`) — W:95 D:85
- **Cursor** (`cursor`) — W:85 D:95
- **VS Code** (`vscode`) — W:95 D:100
- **Slack** (`slack`) — W:95 D:95
- **Discord** (`discord`) — W:95 D:95
- **composio** (`composio`) — W:75 D:85
- **Stagewise** (`stagewise`) — W:65 D:85
- **Dyad** (`dyad`) — W:75 D:90
- **Skip** (`skip`) — W:65 D:85
- **Jira** (`jira`) — W:95 D:90
- **Trello** (`trello`) — W:95 D:90
- **Asana** (`asana`) — W:95 D:95
- **ClickUp** (`clickup`) — W:95 D:90
- **GitLab** (`gitlab`) — W:95 D:85
- **Docker** (`docker`) — W:95 D:95
- **Postman** (`postman`) — W:95 D:95
- **Zoom** (`zoom`) — W:95 D:90
- **Confluence** (`confluence`) — W:95 D:95
- **Miro** (`miro`) — W:95 D:95
- **Airtable** (`airtable`) — W:95 D:95
- **Zapier** (`zapier`) — W:95 D:85
- **Vercel** (`vercel`) — W:95 D:90
- **Supabase** (`supabase`) — W:95 D:95
- **Microsoft Teams** (`microsoft-teams`) — W:95 D:95
- **Google Meet** (`google-meet`) — W:95 D:95
- **Telegram** (`telegram`) — W:95 D:95
- **Resend** (`resend`) — W:80 D:95
- **Cal.com** (`cal-com`) — W:95 D:95
- **Unkey** (`unkey`) — W:75 D:95
- **Trigger.dev** (`trigger-dev`) — W:85 D:95
- **deer-flow** (`deer-flow`) — W:85 D:95
- **nanobot** (`nanobot`) — W:75 D:90
- **claude-code-templates** (`claude-code-templates`) — W:85 D:90
- **codegraph** (`codegraph`) — W:85 D:90
- **project-nomad** (`project-nomad`) — W:85 D:70
