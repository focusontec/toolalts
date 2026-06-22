# Quality Review Report — 2026-06-22

## Summary

| Metric | Count |
|--------|-------|
| Total tools | 65 |
| Keep (quality) | 39 |
| Needs review | 19 |
| Suggest hide | 4 |
| Suggest remove | 3 |

## Pipeline Health

Moderate - many high-quality tools but significant data quality issues and some low-worthy tools need cleanup.

### Strengths
- Strong core of high-worthy tools (worthiness >90) with good data quality
- Low missing website URLs (0)
- Active tools dominate (49/65)

### Weaknesses
- High number of tools with missing GitHub URLs (25/65)
- Many tools with low data quality (<60: 20 tools) and zero reviews (33 tools)
- Several tools with very low worthiness (<30) that should be removed/hidden
- Inconsistent data quality for tools with high worthiness (e.g., claude-code, markitdown)

### Prompt Improvement Suggestions

| Prompt | Issue | Suggested Fix |
|--------|-------|---------------|
| discovery_prompt | Too many tools with missing GitHub URLs and zero reviews are being discovered | Add requirement: 'Prefer tools with at least one review and a GitHub repository URL. If GitHub URL is missing, require stronger evidence of community adoption.' |
| verification_prompt | Data quality scores are low for many tools, possibly due to insufficient verification of metadata | Add instruction: 'For each tool, verify that at least 3 of the following are present: description, website URL, GitHub URL, reviews, pricing. If fewer than 3, set dataQuality to 30 or lower.' |
| worthiness_prompt | Some tools with low worthiness (e.g., Antigravity-Manager, Workout.cool) are not being filtered out early | Add: 'If a tool has fewer than 10 GitHub stars and no reviews, set worthiness to 20 or lower.' |

### Threshold Suggestions

| Parameter | Current | Suggested | Reason |
|-----------|---------|-----------|--------|
| Minimum GitHub stars for discovery | Not set | 50 | Tools with very low stars (e.g., Antigravity-Manager, Rowboat) have low worthiness and waste pipeline resources. |
| Minimum data quality for active status | Not set | 60 | 20 tools have data quality <60, indicating incomplete metadata. Setting a threshold would force review or improvement. |
| Worthiness threshold for hiding | Not set | 30 | Tools with worthiness <30 (e.g., Antigravity-Manager, Workout.cool) are clearly low-quality and should be hidden automatically. |

## Suggest Remove

### Workout.cool (`workout-cool`) — W:15 D:10
- The tool appears to be a GitHub repository with no evidence of being a real product or having any user base.
- The tagline and description describe a fitness platform, but the features and pricing are copied from GitHub, indicating data contamination.
- No GitHub stars or reviews, and the GitHub URL points to a repository that may not exist or is not the actual tool.
  Fixes:
  → Remove the tool entirely as it does not represent a real product.
  → If the tool exists, correct the data to reflect its actual features, pricing, and GitHub URL.

### Open (`open`) — W:20 D:10
- Tool name 'Open' is generic and likely confused with other products.
- Description and features are mismatched: features describe GitHub, not a security camera system.
- Pricing plans are for GitHub, not the described tool.
- GitHub URL is invalid (undefined), and website URL points to a different repository (secluso/core) that appears unrelated.
- No evidence of a real product; appears to be a data entry error or placeholder.
  Fixes:
  → Remove this entry entirely as it does not represent a real product.
  → If the tool is legitimate, correct all data fields to match the actual product.

### project-nomad (`project-nomad`) — W:20 D:10
- The tool appears to be a misrepresentation: the name and description describe a survival computer, but the GitHub URL and pricing/features are identical to GitHub's free plan, suggesting the data is copied from GitHub. The tool does not seem to be a real product.
  Fixes:
  → Verify the actual product and correct all data fields
  → If the tool is real, provide accurate website, pricing, and features
  → If not real, remove the entry entirely

## Suggest Hide

### awesome-claude-skills (`awesome-claude-skills`) — W:25 D:30
- The tool is a GitHub repository curating resources, not a standalone software tool.
- Pricing and features listed are for GitHub, not for this repository.
- The repository name suggests it's a collection, not a product.

### Antigravity-Manager (`antigravity-manager`) — W:15 D:30
- The tool appears to be a very niche project for a specific toolset (Antigravity Tools) that is not widely known.
- GitHub stars (29828) are suspiciously high for a project with 0 reviews and no significant community presence, suggesting possible inaccuracies.
- The tagline and description are generic and lack evidence of real-world usage.

### Axilla (`axilla`) — W:25 D:30
- The tool appears to be a real project but is very niche and has limited community awareness. The GitHub URL is incorrect (points to undefined), and the pricing and features seem to be copied from GitHub, not Axilla. The description and tagline are generic and do not match the actual product.

### Colanode, (`colanode-`) — W:20 D:10
- Tool appears to be very early stage or not widely known; no GitHub stars or reviews.
- Pricing and features are incorrectly copied from GitHub, not Colanode.
- Website URL points to a GitHub repository that may not exist or is inactive.

## Needs Review

### claude-code (`claude-code`) — W:95 D:40
- Claude Code is a highly popular, open-source tool with 133k GitHub stars, indicating significant market presence and real user base.
- The tool is well-known in the developer community and has active development.
  Data issues:
  - Pricing plans appear to be for GitHub, not for Claude Code itself. Claude Code is a free tool, but the listed plans describe GitHub's free plan.
  - Features listed are GitHub features, not Claude Code features.
  - Rating of 4.95/5 with 0 reviews is inconsistent; likely a placeholder or error.
  - Website URL points to GitHub repository, which is acceptable but may not be the intended primary website.
  Fixes:
  → Update pricing plans to reflect Claude Code's actual pricing (likely free, with usage limits).
  → Replace features with Claude Code-specific features (e.g., natural language commands, codebase understanding, terminal integration).
  → Correct or remove the rating if no reviews exist.
  → Consider adding a more descriptive website URL if available (e.g., Anthropic's official page).

### markitdown (`markitdown`) — W:85 D:40
- Tool is a well-known Microsoft project with high GitHub stars, indicating significant market presence.
- Data quality is poor: pricing and features are copied from GitHub, not specific to markitdown.
- Tagline and description are accurate, but website URL is GitHub repo, not a dedicated product page.
  Data issues:
  - Pricing plans are for GitHub, not for markitdown.
  - Features are for GitHub, not for markitdown.
  - Website URL is GitHub repo, not a dedicated product site.
  - Rating is 5/5 with 0 reviews, which is suspicious.
  Fixes:
  → Remove pricing plans and features, or replace with markitdown-specific info (e.g., free, open-source).
  → Update website URL to a dedicated page if exists, or keep GitHub but note it's the primary site.
  → Remove rating or add real reviews.

### Bodhi (`bodhi`) — W:45 D:70
- Small but real GitHub project with 133 stars, but website URL appears to be a placeholder (bodhi.com is not related to the tool). Tagline and description are clear and accurate. Pricing is free and open source, which is consistent. Category is appropriate. However, the tool is relatively unknown and has limited community adoption.
  Data issues:
  - Website URL (bodhi.com) does not appear to be the correct site for this tool; likely a placeholder or incorrect domain.
  Fixes:
  → Verify and update the website URL to the correct domain (e.g., GitHub repo or actual project site).

### AnkiAIUtils (`anki`) — W:95 D:30
- The tool name and slug suggest a specific add-on, but the description and GitHub URL point to the core Anki project, which is a well-known, high-quality tool. However, the data is inconsistent and may confuse users.
  Data issues:
  - Name 'AnkiAIUtils' does not match the actual product (Anki core).
  - Tagline and description describe an AI add-on, but GitHub and website are for the core Anki app.
  - GitHub stars (28682) are for the core Anki repository, not for 'AnkiAIUtils'.
  - Pricing plans describe Anki's official apps, not the purported AI utilities.
  - Features list is generic and matches core Anki, not AI utilities.
  Fixes:
  → Either rename the tool to 'Anki' and update description to match core Anki, or create a separate entry for the actual AI add-on with correct details.
  → Ensure GitHub URL and stars correspond to the specific tool.
  → Update pricing and features to reflect the actual product.

### Tasker (`tasker`) — W:30 D:70
- Very few GitHub stars (105) and no reviews indicate a niche, unproven tool. However, it is open-source and has a real website.
  Data issues:
  - Rating of 3.5/5 with 0 reviews is inconsistent.
  - Website URL (tasker.ai) may not match the GitHub repo (pitalco/tasker).
  Fixes:
  → Remove rating or clarify it's based on other sources.
  → Verify website URL matches the tool.

### ToolJet (`tooljet`) — W:85 D:40
- ToolJet is a well-known open-source low-code platform with significant GitHub stars (38k), indicating strong community presence.
- The tagline, description, and category are appropriate and accurate.
- However, the pricing plans and features appear to be copied from GitHub, not ToolJet's actual pricing.
- The website URL points to GitHub instead of the official ToolJet website (tooljet.com).
  Data issues:
  - Pricing plans are incorrect: they describe GitHub's free plan, not ToolJet's.
  - Features list is identical to GitHub's features, not ToolJet's.
  - Website URL should be https://tooljet.com, not GitHub.
  Fixes:
  → Update pricing plans to reflect ToolJet's actual plans (e.g., Free, Team, Enterprise).
  → Replace features list with ToolJet-specific features (e.g., drag-and-drop UI, database integrations, workflow automation).
  → Change website URL to https://tooljet.com.

### Ephe (`ephe`) — W:45 D:30
- Tool has a small but real user base (579 GitHub stars) and is open source, but lacks significant market presence.
- Data quality is poor: pricing and features are copied from GitHub, not relevant to Ephe.
- Website URL points to GitHub repo, not a dedicated product page.
- No reviews available, and tagline/description seem plausible but unverified.
  Data issues:
  - Pricing plans are for GitHub, not Ephe.
  - Features list is identical to GitHub's free plan.
  - Website URL is GitHub repo, not a proper product site.
  - Rating has 0 reviews, making it unreliable.
  Fixes:
  → Update pricing plans to reflect Ephe's actual pricing (likely free or donation-based).
  → Replace features with Ephe's actual features (e.g., markdown editing, ephemeral notes, sharing).
  → Add a proper website URL if available, or note that it's a GitHub-hosted tool.
  → Consider removing the rating or marking as unrated.

### Colanode (`colanode`) — W:65 D:30
- Colanode has a significant GitHub following (4921 stars) and is open-source, indicating real interest and development.
- However, the website URL points to GitHub instead of a proper product site, and the pricing and features listed appear to be copied from GitHub, not Colanode itself.
- The tagline and description describe a Slack/Notion alternative, but the features and pricing are for a code hosting platform, suggesting data confusion.
  Data issues:
  - Website URL is a GitHub repository, not a dedicated product website.
  - Pricing plans and features are from GitHub, not Colanode.
  - No reviews or user feedback available on the listing.
  Fixes:
  → Update website URL to the actual Colanode product site (if exists) or correct the listing.
  → Replace pricing and features with accurate information for Colanode.
  → Verify the product's actual status and market presence.

### Onlook (`onlook`) — W:85 D:30
- High GitHub stars (26k) and active development indicate a legitimate, popular open-source project.
- Tagline and description are compelling and align with the tool's purpose.
- Pricing and features appear to be copied from GitHub, not Onlook. This is a critical data quality issue.
  Data issues:
  - Pricing plans and features are identical to GitHub's free plan, not Onlook's own offerings.
  - Website URL points to GitHub repository, not a dedicated product website.
  - No reviews or rating data available.
  Fixes:
  → Update pricing plans to reflect Onlook's actual pricing (likely free/open-source).
  → Replace features with Onlook-specific features (e.g., visual editing, AI-powered design, React component generation).
  → Add a proper website URL if available, or keep GitHub but note it's the primary site.

### InstantDB (`instantdb`) — W:85 D:40
- Tool has high GitHub stars (10k+) and is open source, indicating significant community interest.
- Tagline and description are clear and relevant to the category.
- Pricing data appears to be copied from GitHub, not InstantDB's actual pricing.
- Website URL points to GitHub repo, not a dedicated product site.
- Features listed are GitHub features, not InstantDB's features.
  Data issues:
  - Pricing plans and features are from GitHub, not InstantDB.
  - Website URL is GitHub repo, not a proper product website.
  - No reviews despite a rating shown.
  - Tagline mentions AI-coded apps but features don't reflect that.
  Fixes:
  → Update pricing plans to reflect InstantDB's actual pricing.
  → Update features to match InstantDB's offerings (auth, permissions, storage, etc.).
  → Provide correct website URL (e.g., https://instantdb.com).
  → Remove rating if no reviews exist.

### Langfuse (`langfuse`) — W:85 D:40
- Langfuse is a well-known open source LLM observability platform with 29k+ GitHub stars, indicating significant market presence and community adoption.
- The pricing data is incorrect (copied from GitHub's pricing instead of Langfuse's own plans), and the features listed are also from GitHub, not Langfuse.
  Data issues:
  - Pricing plans are for GitHub, not Langfuse.
  - Features listed are for GitHub, not Langfuse.
  - Website URL points to GitHub repository instead of the actual product website (langfuse.com).
  Fixes:
  → Update pricing plans to reflect Langfuse's actual plans (e.g., Cloud Free, Cloud Pro, Self-hosted).
  → Update features to match Langfuse's capabilities (observability, evaluations, prompt management, etc.).
  → Change website URL to https://langfuse.com.

### GitHub Copilot (`github-copilot`) — W:95 D:70
- GitHub Copilot is a highly recognized AI coding assistant with strong market presence.
- The pricing data is incomplete; only the Free plan is listed, missing the paid plans (e.g., Copilot Individual, Business, Enterprise).
- The features array is a subset of the Free plan features and does not reflect Copilot's core AI features.
  Data issues:
  - Pricing plans missing paid tiers (Individual, Business, Enterprise).
  - Features list is generic and not specific to Copilot (e.g., missing 'AI code suggestions', 'Chat', 'Inline completions').
  Fixes:
  → Add all pricing plans: Copilot Individual ($10/month), Copilot Business ($19/user/month), Copilot Enterprise ($39/user/month).
  → Update features to include Copilot-specific capabilities: 'AI-powered code suggestions', 'Chat-based assistance', 'Natural language to code generation'.

### system-prompts-and-models-of-ai-tools (`system-prompts-and-models-of-ai-tools`) — W:85 D:40
- The tool is a popular open-source GitHub repository with over 141k stars, indicating significant community interest and value.
- However, the data quality is poor: the tagline and description describe a collection of system prompts and AI models, but the pricing and features are copied from GitHub's own plans, not relevant to the actual tool.
- The website URL points to GitHub, which is acceptable for an open-source project, but the pricing and features are misleading.
  Data issues:
  - Pricing plans and features are for GitHub, not for the tool itself.
  - Tagline and description do not match the pricing/features data.
  - No actual product website beyond the GitHub repo.
  Fixes:
  → Remove or replace pricing plans with accurate information (e.g., free, open-source).
  → Update features to reflect the actual content of the repository (e.g., collection of prompts, models).
  → Consider adding a proper website if available, or keep GitHub as the primary URL.

### gstack (`gstack`) — W:75 D:30
- The tool is created by a well-known figure (Garry Tan) and has a high GitHub star count, indicating significant interest.
- The tagline and description describe a curated setup for Claude Code, which is a niche but legitimate use case.
- However, the pricing plans and features listed appear to be copied from GitHub's free plan, not specific to gstack, indicating data quality issues.
  Data issues:
  - Pricing plans and features are identical to GitHub's free plan, not relevant to gstack.
  - GitHub star count (112560) is likely for the repository, but the tool itself may not have that many stars.
  - Website URL is the same as GitHub URL, which is acceptable but may lack a dedicated site.
  Fixes:
  → Update pricing plans to reflect gstack's actual pricing (likely free, open-source).
  → Update features to list the 23 tools included in gstack, not GitHub features.
  → Verify GitHub star count: if it's for the repo, it's fine, but ensure it's attributed correctly.

### claude-code-templates (`claude-code-templates`) — W:65 D:70
- High GitHub stars (28k) indicate significant interest, but the tool is very niche (Claude Code templates) and may not have broad market presence.
- Website URL (aitmpl.com) seems unrelated to the tool name and may be auto-generated or placeholder.
- No user reviews on the comparison site, which is a red flag for actual usage.
  Data issues:
  - Website URL (https://aitmpl.com) does not match the tool name 'claude-code-templates' and appears to be a generic domain.
  - No user reviews available on the platform, making it hard to verify real-world adoption.
  Fixes:
  → Verify the correct website URL for the tool; update if different.
  → Encourage user reviews or gather more evidence of active user base.

### Rowboat (`rowboat`) — W:25 D:30
- Tool appears to be a real open-source project but has no GitHub stars, no reviews, and very limited community presence.
- The description and features seem copied from GitHub (e.g., Dependabot, CI/CD minutes) and do not match the tagline about an AI coworker.
- Pricing plan is for GitHub, not Rowboat itself, indicating data confusion.
  Data issues:
  - Features and pricing plan are from GitHub, not Rowboat.
  - GitHub URL is undefined, and GitHub stars are N/A.
  - No user reviews or ratings.
  - Website URL points to a GitHub repo, not a proper product site.
  Fixes:
  → Correct the features and pricing to reflect Rowboat's actual capabilities.
  → Verify the GitHub repository and update the URL and stars.
  → Provide accurate tagline and description that match the product.
  → Consider if this tool is ready for listing given its early stage.

### Hyperdiv (`hyperdiv`) — W:30 D:20
- Hyperdiv appears to be a real but very niche Python framework for reactive UIs, with limited community awareness.
- The data is severely mismatched: the description and features are copied from GitHub's pricing page, not Hyperdiv's actual features.
- The GitHub URL is malformed (https://github.com/undefined) and the website URL points to a GitHub repo, not a proper website.
- Pricing plans are irrelevant (GitHub plans instead of Hyperdiv's).
  Data issues:
  - Features list is identical to GitHub's free plan features, not Hyperdiv's.
  - Pricing plans are GitHub's, not Hyperdiv's.
  - GitHub URL is broken (undefined).
  - Website URL is a GitHub repo, not a dedicated site.
  - No GitHub stars count provided despite being open source.
  - Category 'development' is too broad; should be more specific like 'web framework' or 'Python UI'.
  Fixes:
  → Replace features with actual Hyperdiv features (e.g., reactive components, Python-only, etc.).
  → Replace pricing with Hyperdiv's actual pricing (likely free/open source).
  → Fix GitHub URL to correct repository (https://github.com/hyperdiv/hyperdiv).
  → Add GitHub stars count if available.
  → Update website URL to a proper documentation or project site.
  → Refine category to something like 'Python Web Framework'.

### Extend (`extend`) — W:55 D:65
- The tool has a real website and appears to be a legitimate product with a clear use case.
- However, the name 'Extend' is very generic and the GitHub stars are N/A despite being open source, which is suspicious.
- The pricing plans and features seem detailed but are more aligned with an API service than a UI kit, causing inconsistency with the tagline.
  Data issues:
  - GitHub stars and URL are N/A for an open source tool.
  - Tagline describes a UI kit but pricing and features describe an API service (e.g., Parse API, Extract API).
  - Category 'development' is broad; a more specific category like 'ui-components' or 'document-processing' would be better.
  Fixes:
  → Verify if the tool is truly open source and provide GitHub URL and stars.
  → Clarify whether the tool is a UI kit or an API service, and update tagline and description accordingly.
  → Reconsider category assignment.

### headroom (`headroom`) — W:45 D:70
- GitHub stars (45620) seem inflated for a relatively unknown tool; likely a data error or confusion with another project.
- No user reviews or ratings available, indicating limited adoption.
- The concept is niche but potentially useful for LLM developers.
  Data issues:
  - GitHub stars count (45620) is suspiciously high for a tool with no reviews and limited web presence.
  - GitHub URL points to a repository with very few stars (likely the actual count is much lower).
  - No evidence of real user base or community engagement.
  Fixes:
  → Verify and correct the GitHub stars count.
  → Add more detailed pricing or feature differentiation.
  → Consider adding user testimonials or case studies if available.

## Keep

- **Notion** (`notion`) — W:95 D:100
- **Obsidian** (`obsidian`) — W:95 D:90
- **Figma** (`figma`) — W:95 D:95
- **Penpot** (`penpot`) — W:90 D:95
- **Linear** (`linear`) — W:95 D:95
- **GitHub Issues** (`github-issues`) — W:95 D:90
- **Cursor** (`cursor`) — W:95 D:90
- **VS Code** (`vscode`) — W:95 D:100
- **Slack** (`slack`) — W:95 D:90
- **Discord** (`discord`) — W:95 D:90
- **composio** (`composio`) — W:75 D:85
- **Stagewise** (`stagewise`) — W:65 D:85
- **Dyad** (`dyad`) — W:85 D:90
- **Skip** (`skip`) — W:65 D:90
- **Jira** (`jira`) — W:95 D:90
- **Trello** (`trello`) — W:95 D:90
- **Asana** (`asana`) — W:95 D:90
- **ClickUp** (`clickup`) — W:95 D:90
- **GitLab** (`gitlab`) — W:95 D:90
- **Docker** (`docker`) — W:95 D:90
- **Postman** (`postman`) — W:95 D:90
- **Zoom** (`zoom`) — W:100 D:95
- **Confluence** (`confluence`) — W:95 D:95
- **Miro** (`miro`) — W:95 D:85
- **Airtable** (`airtable`) — W:95 D:90
- **Zapier** (`zapier`) — W:95 D:85
- **Vercel** (`vercel`) — W:95 D:90
- **Supabase** (`supabase`) — W:95 D:90
- **Microsoft Teams** (`microsoft-teams`) — W:95 D:95
- **Google Meet** (`google-meet`) — W:95 D:95
- **Telegram** (`telegram`) — W:95 D:95
- **Resend** (`resend`) — W:85 D:95
- **Cal.com** (`cal-com`) — W:90 D:95
- **Unkey** (`unkey`) — W:75 D:90
- **Trigger.dev** (`trigger-dev`) — W:85 D:95
- **deer-flow** (`deer-flow`) — W:75 D:85
- **nanobot** (`nanobot`) — W:85 D:95
- **codegraph** (`codegraph`) — W:85 D:80
- **container** (`container`) — W:85 D:95
