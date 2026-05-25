# Quality Review Report — 2026-05-25

## Summary

| Metric | Count |
|--------|-------|
| Total tools | 57 |
| Keep (quality) | 39 |
| Needs review | 16 |
| Suggest hide | 2 |
| Suggest remove | 0 |

## Pipeline Health

Moderate. Many high-quality tools are well-maintained, but there is a significant number of low-data-quality entries and missing GitHub URLs, indicating discovery and verification gaps.

### Strengths
- High worthiness scores for popular tools (e.g., Notion, VS Code, Discord) show good discovery of relevant tools.
- Data quality is excellent for top tools, indicating reliable verification for well-known entries.
- No missing website URLs, ensuring basic contact info is available.

### Weaknesses
- 24 tools (42%) missing GitHub URL, limiting source code verification and community assessment.
- 25 tools (44%) have zero reviews, making it hard to gauge user satisfaction.
- 11 tools (19%) have low data quality (<60), suggesting verification failures or incomplete data.
- 6 tools (10%) have low worthiness (<40), indicating potential noise in discovery.
- Several tools (e.g., claude-code, markitdown) have high worthiness but low data quality, suggesting missed verification steps.

### Prompt Improvement Suggestions

| Prompt | Issue | Suggested Fix |
|--------|-------|---------------|
| discovery_prompt | Tools with very low worthiness (e.g., Ephe, Colanode) are being discovered, indicating threshold too low or poor filtering. | Increase minimum worthiness threshold in discovery prompt from 0 to 30, and add a requirement that the tool must have at least 1 review or a GitHub repository with stars. |
| verification_prompt | High-worthiness tools like claude-code (worthiness=95) have low data quality (50), suggesting verification prompt fails to gather key metrics like GitHub stars or reviews. | Add explicit instructions to verify GitHub repository existence, star count, and recent activity. Require at least one review or community mention for verification. |
| data_quality_prompt | Many tools have missing GitHub URLs (24) and zero reviews (25), indicating data collection gaps. | Add a mandatory field for GitHub URL and a minimum of 1 review. If not found, mark as 'review' and flag for manual check. |

### Threshold Suggestions

| Parameter | Current | Suggested | Reason |
|-----------|---------|-----------|--------|
| Minimum worthiness score for auto-keep | 40 | 60 | Reduce noise from low-worthiness tools (e.g., Tasker, Ephe) that are unlikely to be useful. |
| Minimum data quality score for auto-keep | 60 | 70 | Ensure tools have sufficient verified data (e.g., GitHub stars, reviews) before being kept active. |
| Minimum number of reviews for auto-keep | 0 | 1 | Tools with zero reviews lack user feedback; require at least one review to confirm utility. |
| GitHub URL presence for auto-keep | optional | required | Missing GitHub URL (24 tools) hinders verification; require it for active status. |

## Suggest Hide

### Ephe (`ephe`) — W:25 D:20
- Tool is very niche with only 200 GitHub stars and no reviews, indicating limited adoption.
- Data quality is poor: pricing and features are copied from GitHub, not Ephe.
- Website URL points to a different GitHub repo than the tool's own repo.

### Colanode, (`colanode-`) — W:25 D:20
- Tool is very niche with only 500 GitHub stars and no reviews
- Description and features appear to be copied from GitHub's own product, not Colanode
- Pricing plan is for GitHub, not Colanode
- Website URL points to a GitHub repo, not a dedicated product site

## Needs Review

### claude-code (`claude-code`) — W:95 D:50
- Claude Code is a highly popular open-source tool with over 126k GitHub stars, indicating significant market presence and developer adoption.
- The tool is well-known in the AI-assisted coding space, developed by Anthropic, a reputable company.
- The data quality is poor: the description and features appear to be copied from GitHub's free plan, not Claude Code's actual features.
- The pricing plans listed are for GitHub, not Claude Code, which is a major data issue.
  Data issues:
  - Pricing plans are incorrect; they describe GitHub's free plan, not Claude Code's pricing.
  - Features list is identical to GitHub's free plan features, not Claude Code's features.
  - Website URL points to GitHub repository, which is acceptable for an open-source tool, but the tagline and description should match the tool's actual capabilities.
  - Rating of 4.95/5 with 0 reviews is suspicious; likely a placeholder or error.
  Fixes:
  → Update pricing plans to reflect Claude Code's actual pricing (if any) or indicate it's free/open-source.
  → Replace features list with Claude Code's actual features (e.g., natural language code editing, terminal integration, git workflow support).
  → Verify and correct the rating or remove it if no reviews exist.
  → Ensure description accurately describes Claude Code, not GitHub.

### markitdown (`markitdown`) — W:85 D:40
- Tool is a well-known Microsoft open-source project with high GitHub stars, but the pricing and features data are incorrect (copied from GitHub's own plans, not markitdown's).
  Data issues:
  - Pricing plans and features are for GitHub, not for markitdown.
  - Tagline and description are accurate but could be more specific.
  Fixes:
  → Remove pricing plans and features; markitdown is free and open-source with no paid plans.
  → Update tagline to reflect Microsoft's tool for converting files to Markdown.

### Bodhi (`bodhi`) — W:45 D:70
- Tool has a niche but legitimate use case with real GitHub stars (500) and active development.
- However, it is not widely known and has no user reviews, placing it in the smaller/niche category.
- Data quality is decent but has issues with website URL and missing details.
  Data issues:
  - Website URL (https://bodhi.com) appears to be a placeholder or unrelated domain; likely incorrect.
  - No user reviews despite a rating of 3.75/5 (0 reviews) - rating seems inconsistent.
  - Pricing plans are minimal; only one free plan listed.
  - GitHub stars (500) is moderate but not high for a tool claiming to be a 'well-known' alternative.
  Fixes:
  → Verify and correct the website URL to the actual project page or repository.
  → Remove or clarify the rating if no reviews exist.
  → Add more pricing details if available (e.g., enterprise plans).
  → Consider adding more features or use cases to better describe the tool's value.

### AnkiAIUtils (`anki`) — W:95 D:60
- Anki is a highly reputable and widely used flashcard app with a large user base, but the tool name and description suggest it is a companion tool, not the core app itself.
- The GitHub URL points to the main Anki repository, not a separate 'AnkiAIUtils' project, causing confusion.
  Data issues:
  - Tool name 'AnkiAIUtils' does not match the actual product (Anki).
  - GitHub URL points to the main Anki repo, not a separate AI utilities project.
  - Description implies it's a companion tool, but the website and GitHub are for the core Anki app.
  - No reviews despite high rating.
  Fixes:
  → Rename tool to 'Anki' or clarify that it is the core Anki app.
  → Update GitHub URL to the correct repository if it exists, or remove if not applicable.
  → Ensure description accurately reflects the product (core Anki app).
  → Remove or correct rating if no reviews exist.

### Stagewise (`stagewise`) — W:45 D:70
- Tool is open source with 300 GitHub stars, indicating some traction but not yet widely known.
- Tagline and description are clear and appropriate for the category.
- Pricing is minimal (only free plan) which may be incomplete.
- Website URL (stagewise.com) appears legitimate but needs verification.
- Rating of 3.5/5 with 0 reviews is suspicious; likely no user feedback yet.
  Data issues:
  - Rating shows 3.5/5 but 0 reviews, which is inconsistent.
  - Only one pricing plan listed; may be missing other plans.
  - GitHub URL points to a personal account (nicholasgriffintn) rather than an organization, which may affect credibility.
  Fixes:
  → Remove rating or update to reflect actual reviews.
  → Add more pricing plans if available, or clarify that only free self-hosted plan exists.
  → Consider moving repository to an organization account for better credibility.

### Dyad, (`dyad`) — W:45 D:70
- Open-source project with 200 GitHub stars, indicating a small but real user base.
- Tagline and description are clear and accurate.
- Pricing plans are detailed and realistic.
- Website and GitHub URLs are valid.
- Category 'development' is appropriate.
- Rating of 3.5/5 with 0 reviews is suspicious; likely a placeholder or insufficient data.
  Data issues:
  - Rating shows 3.5/5 but 0 reviews, which is inconsistent.
  - Features list is incomplete compared to pricing plans (missing Pro and Max features).
  Fixes:
  → Update rating to reflect actual reviews or remove if no reviews exist.
  → Expand features list to include all features from pricing plans.

### Tasker (`tasker`) — W:25 D:70
- Very niche tool with low GitHub stars (150) and no reviews, indicating minimal adoption. However, it is open-source and has a real website and GitHub repository.
  Data issues:
  - Rating is 3.5/5 but has 0 reviews, which is inconsistent.
  - Pricing plan 'Free' with 'All features' is vague.
  Fixes:
  → Remove rating or indicate it's based on limited data.
  → Clarify pricing features or add more plans if available.

### ToolJet (`tooljet`) — W:80 D:40
- ToolJet is a well-known open-source low-code platform with significant GitHub stars (37,935) and active development, making it worthy of listing.
- However, the data quality is poor: the tagline, description, features, and pricing plans appear to be copied from GitHub's own product page, not ToolJet's actual features and pricing.
  Data issues:
  - Tagline, description, features, and pricing plans are incorrect; they describe GitHub, not ToolJet.
  - Website URL points to GitHub repository instead of the actual product website (tooljet.com).
  - Rating shows '0 reviews' which may be inaccurate or missing.
  - Pricing plans do not reflect ToolJet's actual pricing (e.g., self-hosted free, cloud plans).
  Fixes:
  → Update tagline to reflect ToolJet's actual value proposition.
  → Rewrite description to accurately describe ToolJet's capabilities.
  → Replace features list with ToolJet's actual features (e.g., drag-and-drop UI builder, database integrations, workflow automation).
  → Correct pricing plans to match ToolJet's offerings (e.g., Free self-hosted, Team, Enterprise).
  → Change website URL to https://tooljet.com.
  → Ensure rating and review count are accurate or remove placeholder.

### Onlook (`onlook`) — W:65 D:30
- Open-source project with 8000 GitHub stars indicates significant interest and activity.
- Tagline and description are coherent and align with the tool's purpose.
- Pricing data appears to be copied from GitHub, not from Onlook itself.
- Features list is identical to GitHub's free plan features, not specific to Onlook.
- Website URL points to a GitHub repository, not a product website.
  Data issues:
  - Pricing plans and features are mismatched: they describe GitHub's free plan, not Onlook's.
  - Website URL is a GitHub repo, not a dedicated product site.
  - GitHub URL points to a different repository (nicholasgriffintn/onlook) than the website URL (onlook-dev/onlook).
  Fixes:
  → Update pricing plans to reflect Onlook's actual pricing (likely free/open-source).
  → Update features list to describe Onlook's actual features (e.g., visual editing, AI integration).
  → Verify correct GitHub URL and website URL; ensure they point to the same project.
  → Consider adding a proper product website URL if available.

### InstantDB (`instantdb`) — W:55 D:30
- The tool has a real GitHub repository with 3000 stars, indicating some community interest.
- The tagline and description are plausible but the features and pricing appear to be copied from GitHub, not InstantDB.
- The website URL points to a GitHub repo, not a proper product website, which is unusual for a backend platform.
  Data issues:
  - Features listed are GitHub features (repositories, CI/CD minutes, etc.) not relevant to InstantDB.
  - Pricing plan is for GitHub, not InstantDB.
  - Website URL is a GitHub repo, not a dedicated product site.
  - No reviews despite a rating of 4/5.
  Fixes:
  → Update features to reflect InstantDB's actual capabilities (auth, permissions, storage, presence, streams).
  → Provide correct pricing plans for InstantDB.
  → Set website URL to the actual product website (e.g., instantdb.dev or similar).
  → Remove rating if no reviews exist, or add real reviews.

### Langfuse (`langfuse`) — W:85 D:40
- Langfuse is a well-known open source LLM engineering platform with significant GitHub stars (27k+), indicating strong community adoption and market presence.
- However, the pricing plans and features appear to be incorrectly copied from GitHub's own plans, not Langfuse's actual offerings.
  Data issues:
  - Pricing plans are not specific to Langfuse; they describe GitHub's free plan features (e.g., 'Unlimited public/private repositories', 'Dependabot security updates').
  - Features listed also correspond to GitHub, not Langfuse.
  - Website URL points to GitHub repository instead of the actual product website (likely langfuse.com).
  Fixes:
  → Update pricing plans to reflect Langfuse's actual pricing (e.g., self-hosted free, cloud tiers).
  → Replace features with Langfuse-specific capabilities like observability, evaluations, prompt management.
  → Correct website URL to https://langfuse.com or the official product site.

### awesome-claude-skills (`awesome-claude-skills`) — W:45 D:85
- The tool is a GitHub repository (awesome list), not a standalone software tool, which may not fit the comparison website's focus.
- It has a high number of GitHub stars (61k), indicating significant community interest, but the actual utility as a 'tool' is limited to a curated list.
- The category 'development' is appropriate, but the tool's nature as a list of resources rather than an executable tool may confuse users.
  Data issues:
  - Tagline and description accurately describe the repository, but the tool is not a software tool in the traditional sense.
  - Pricing plan is free, which is correct for an open-source repository.
  - Website URL is the same as GitHub URL, which is acceptable for a GitHub-hosted project.
  Fixes:
  → Consider re-categorizing as 'resource' or 'curated list' if such categories exist.
  → Ensure the description clarifies that this is a collection of links and resources, not a standalone tool.

### Antigravity-Manager (`antigravity-manager`) — W:25 D:50
- The tool appears to be a niche account manager for a specific set of tools (Antigravity Tools), which may not be widely known.
- The GitHub stars (29,376) are suspiciously high for a niche tool, possibly indicating fake stars or a mistake.
- The tagline and description are well-written but the tool's purpose is very narrow.
- No user reviews or ratings exist, making it hard to gauge real-world usage.
  Data issues:
  - GitHub stars count seems inflated for a niche tool; likely inaccurate.
  - No reviews or ratings available.
  - The tool's name and description reference 'Antigravity Tools', which is not a well-known product line.
  Fixes:
  → Verify the GitHub stars count and correct if necessary.
  → Gather user reviews or usage data to assess real adoption.
  → Clarify what 'Antigravity Tools' refers to or consider if the tool is too obscure.

### Workout.cool (`workout-cool`) — W:25 D:40
- Very niche open-source project with no GitHub stars, no reviews, and limited community adoption. However, it appears to be a real product with a functional website and clear purpose.
  Data issues:
  - GitHub URL points to undefined
  - GitHub Stars is N/A but GitHub URL is provided
  - Category 'other' may not be ideal; could be 'fitness' or 'health'
  Fixes:
  → Update GitHub URL to correct repository
  → Add proper category
  → Consider adding more pricing details if applicable

### Rowboat (`rowboat`) — W:25 D:40
- Very niche and unproven tool with no GitHub stars or reviews, but appears to be a real open-source project with a defined purpose.
  Data issues:
  - GitHub URL points to undefined
  - No GitHub stars despite being open-source
  - No user reviews
  - Pricing only lists free self-hosted version
  Fixes:
  → Update GitHub URL to correct repository
  → Add GitHub stars if available
  → Encourage user reviews
  → Consider adding more pricing details if applicable

### Axilla (`axilla`) — W:45 D:60
- Tool appears legitimate with a real GitHub repository and active development, but has very low community awareness (no reviews, no stars). It is a niche framework for AI development in TypeScript, which may be useful but not yet established.
  Data issues:
  - GitHub URL points to undefined, likely a data entry error; actual repo is github.com/axilla-io/ax
  - No GitHub stars count provided, but repo exists
  Fixes:
  → Update GitHub URL to correct repository
  → Fetch and include GitHub stars count if available

## Keep

- **Notion** (`notion`) — W:95 D:95
- **Obsidian** (`obsidian`) — W:95 D:90
- **Figma** (`figma`) — W:95 D:90
- **Penpot** (`penpot`) — W:95 D:90
- **Linear** (`linear`) — W:90 D:95
- **GitHub Issues** (`github-issues`) — W:95 D:85
- **Cursor** (`cursor`) — W:85 D:95
- **VS Code** (`vscode`) — W:95 D:100
- **Slack** (`slack`) — W:95 D:95
- **Discord** (`discord`) — W:95 D:100
- **composio** (`composio`) — W:85 D:90
- **Skip** (`skip`) — W:65 D:85
- **Jira** (`jira`) — W:95 D:90
- **Trello** (`trello`) — W:95 D:95
- **Asana** (`asana`) — W:95 D:95
- **ClickUp** (`clickup`) — W:95 D:90
- **GitLab** (`gitlab`) — W:95 D:85
- **Docker** (`docker`) — W:95 D:90
- **Postman** (`postman`) — W:95 D:90
- **Zoom** (`zoom`) — W:95 D:90
- **Confluence** (`confluence`) — W:95 D:95
- **Miro** (`miro`) — W:95 D:95
- **Airtable** (`airtable`) — W:95 D:90
- **Zapier** (`zapier`) — W:95 D:85
- **Vercel** (`vercel`) — W:95 D:90
- **Supabase** (`supabase`) — W:95 D:95
- **Microsoft Teams** (`microsoft-teams`) — W:95 D:90
- **Google Meet** (`google-meet`) — W:95 D:95
- **Telegram** (`telegram`) — W:95 D:90
- **GitHub Copilot** (`github-copilot`) — W:95 D:90
- **Resend** (`resend`) — W:85 D:95
- **Cal.com** (`cal-com`) — W:85 D:95
- **Unkey** (`unkey`) — W:75 D:95
- **Trigger.dev** (`trigger-dev`) — W:85 D:95
- **system-prompts-and-models-of-ai-tools** (`system-prompts-and-models-of-ai-tools`) — W:85 D:90
- **gstack** (`gstack`) — W:85 D:90
- **deer-flow** (`deer-flow`) — W:85 D:95
- **nanobot** (`nanobot`) — W:85 D:90
- **claude-code-templates** (`claude-code-templates`) — W:75 D:85
