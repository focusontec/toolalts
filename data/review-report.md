# Quality Review Report — 2026-06-29

## Summary

| Metric | Count |
|--------|-------|
| Total tools | 64 |
| Keep (quality) | 46 |
| Needs review | 17 |
| Suggest hide | 1 |
| Suggest remove | 0 |

## Pipeline Health

Good but has significant gaps in data completeness and discovery quality.

### Strengths
- High-quality tools (worthiness >80) are well-identified and verified.
- No missing website URLs, indicating good initial data collection.
- Most active tools have high data quality scores.

### Weaknesses
- 25 out of 64 tools (39%) missing GitHub URL, limiting verification and community assessment.
- 32 tools (50%) have zero reviews, making it hard to gauge user satisfaction.
- 6 tools have low worthiness (<40) and low data quality (<60), suggesting poor discovery or verification.
- Several tools with borderline scores (e.g., Bodhi, Tasker) need clearer criteria for review vs. keep.

### Prompt Improvement Suggestions

| Prompt | Issue | Suggested Fix |
|--------|-------|---------------|
| discovery_prompt | Tools with low worthiness and missing GitHub URLs suggest the discovery prompt may not be filtering effectively. | Add a requirement to check for GitHub presence and a minimum star count (e.g., 100) before including in the candidate list. |
| verification_prompt | Verification prompt may be too lenient on data quality for tools with zero reviews or missing GitHub. | Add a rule: if GitHub URL is missing or reviews are zero, data quality score should be capped at 50 unless other strong signals exist. |
| review_prompt | Tools like 'codegraph' have high worthiness (75) but low data quality (40), indicating inconsistent scoring. | Explicitly instruct the LLM to cross-check worthiness and data quality: if worthiness >70 and data quality <50, flag for manual review. |

### Threshold Suggestions

| Parameter | Current | Suggested | Reason |
|-----------|---------|-----------|--------|
| Minimum GitHub stars for discovery | Not set (implicitly 0) | 100 | To filter out low-community tools and improve discovery quality. |
| Minimum reviews for active status | 0 | 5 | To ensure tools have some user feedback before being marked active. |
| Worthiness threshold for 'keep' | Likely 60 (based on data) | 70 | To reduce borderline tools in active set and improve overall quality. |

## Suggest Hide

### Antigravity-Manager (`antigravity-manager`) — W:15 D:40
- The tool appears to be a very niche utility for a specific set of tools (Antigravity Tools) that are not widely known or may not exist.
- The GitHub stars count (29938) is suspiciously high for a tool with no reviews and a seemingly obscure purpose, suggesting possible data manipulation or a fake repository.
- The tool has no user reviews and a rating of 0, indicating very limited or no real-world adoption.

## Needs Review

### Bodhi (`bodhi`) — W:45 D:70
- Small but real project with 133 GitHub stars and active development
- Website URL (bodhi.com) appears to be a placeholder or unrelated domain
- No user reviews despite a rating displayed
  Data issues:
  - Website URL likely incorrect (bodhi.com is not the tool's site)
  - Rating shown as 3.75/5 with 0 reviews is inconsistent
  - GitHub URL points to BodhiSearch/BodhiApp but name is just 'Bodhi'
  Fixes:
  → Verify and correct the website URL
  → Remove or clarify the rating if no reviews exist
  → Ensure GitHub URL matches the tool's official repository

### Tasker (`tasker`) — W:45 D:70
- Small but legitimate open-source project with 105 GitHub stars and a real website; however, it has no reviews and limited market presence.
  Data issues:
  - Rating is 3.5/5 but has 0 reviews, which is inconsistent.
  - Website URL (tasker.ai) does not appear to be the official site for this tool (likely a different product).
  Fixes:
  → Remove or correct the rating if no reviews exist.
  → Verify and update the website URL to the correct one (e.g., GitHub page or actual project site).

### Ephe (`ephe`) — W:45 D:60
- Tool has a small but real user base (579 GitHub stars) and is open source, but lacks pricing plans and reviews, indicating limited market presence.
- Website URL points to a different GitHub repo (valentinegb/ephe) than the GitHub URL (unvalley/ephe), causing confusion.
  Data issues:
  - Website URL (https://github.com/valentinegb/ephe) does not match GitHub URL (https://github.com/unvalley/ephe).
  - No pricing plans listed, which may be acceptable for a free tool but should be clarified.
  - Rating shows 3.5/5 with 0 reviews, which is inconsistent.
  Fixes:
  → Verify the correct website URL and update it.
  → Either add a pricing plan (e.g., 'Free') or clarify that the tool is free.
  → Remove the rating or add a note that it's based on user feedback elsewhere.

### Colanode (`colanode`) — W:55 D:60
- Open-source project with nearly 5k GitHub stars, indicating community interest
- Tagline and description are clear and accurate
- No pricing plans listed, which may be acceptable for open-source but needs clarification
- Website URL points to GitHub repo, not a dedicated product site, reducing credibility
- No user reviews available, making it hard to assess real-world usage
  Data issues:
  - Website URL is GitHub repo, not a proper product website
  - No pricing plans provided
  - No user reviews
  Fixes:
  → Add a proper product website URL if available
  → Clarify pricing model (e.g., free, self-hosted, paid plans)
  → Encourage user reviews or add note about early stage

### Onlook (`onlook`) — W:75 D:85
- High GitHub stars (26k) indicate strong community interest and active development
- Open-source and AI-first positioning is compelling for designers
- Pricing plans are missing; likely free/open-source but should be clarified
- No reviews yet, but that's common for newer tools
  Data issues:
  - Pricing plans array is empty; should indicate 'Free' or 'Open Source'
  - Rating is 0/5 with 0 reviews; may need to note it's new
  Fixes:
  → Add pricing plan: 'Free (Open Source)' or similar
  → Consider adding a note about the tool being new if reviews are absent

### system-prompts-and-models-of-ai-tools (`system-prompts-and-models-of-ai-tools`) — W:85 D:70
- Extremely popular GitHub repository with over 141k stars, indicating significant community interest and value.
- Tagline and description accurately describe the repository's purpose.
- Category 'development' is appropriate.
- No pricing plans listed, which is expected for an open-source repository.
- Features list is generic but plausible.
  Data issues:
  - Website URL is same as GitHub URL, which is acceptable for a GitHub repo but might be improved with a dedicated site.
  - No pricing plans provided, but as an open-source project this is acceptable.
  - Rating is 0/5 with 0 reviews, which may be due to lack of user reviews on the comparison site, not the tool's quality.
  Fixes:
  → Consider adding a note that this is an open-source repository with no pricing.
  → Encourage users to leave reviews to populate rating.

### gstack (`gstack`) — W:35 D:50
- GitHub stars are implausibly high (117,858) for a niche tool with 0 reviews and no pricing, suggesting data error or inflated metric
- Tagline and description are vague; '23 opinionated tools' lacks specificity
- No pricing plans listed, which may be acceptable for open source but incomplete for comparison site
- Website URL is same as GitHub, which is acceptable but not ideal for a tool listing
  Data issues:
  - GitHub stars count seems unrealistic (117,858) for a tool with no user reviews and minimal description
  - No pricing information provided
  - Features list is generic and lacks detail
  Fixes:
  → Verify GitHub stars count from actual repository
  → Add more detailed feature descriptions
  → Consider adding pricing model (free, open source, etc.)

### awesome-claude-skills (`awesome-claude-skills`) — W:65 D:70
- High GitHub stars (66k) indicate significant community interest, but it's a curated list, not a standalone tool.
- No pricing plans and no website beyond GitHub, which may limit its appeal as a tool listing.
- Category 'development' is appropriate, but the tool is more of a resource list.
  Data issues:
  - Missing pricing plans (should be 'Free' or 'N/A').
  - Website URL is same as GitHub URL, no dedicated site.
  - Tagline and description are very similar, could be more distinct.
  Fixes:
  → Add pricing plan as 'Free' since it's open source.
  → Consider adding a more descriptive tagline.
  → If possible, include a link to a live demo or additional resources.

### Workout.cool (`workout-cool`) — W:25 D:60
- Very niche open-source project with no GitHub stars or reviews, indicating minimal user base and community awareness.
  Data issues:
  - GitHub URL points to undefined
  - No pricing plans listed
  - No reviews or rating
  - GitHub stars missing
  Fixes:
  → Update GitHub URL to correct repository
  → Add pricing information or note as free
  → Verify if project is active and has any users

### Rowboat (`rowboat`) — W:25 D:40
- Very niche, unproven tool with no GitHub stars or reviews; website is a GitHub repo with no clear product presence.
  Data issues:
  - GitHub URL points to undefined
  - No pricing plans
  - No reviews
  - Website URL is a GitHub repo, not a proper product site
  Fixes:
  → Update GitHub URL to correct repo
  → Add pricing information if available
  → Improve website to a proper product page

### Axilla (`axilla`) — W:40 D:50
- Axilla appears to be a legitimate open-source TypeScript framework for AI development, but it has very limited market presence and no user reviews. The GitHub URL is incorrect (points to undefined), and the actual repository is under axflow/axflow. The tool is in draft status with no pricing plans, which suggests it may be early-stage or not fully launched.
  Data issues:
  - GitHub URL is https://github.com/undefined (invalid)
  - No GitHub stars data provided
  - No user reviews
  - Pricing plans are empty
  - Status is draft
  Fixes:
  → Update GitHub URL to correct repository (https://github.com/axflow/axflow)
  → Fetch actual GitHub stars count
  → Add pricing information if available
  → Consider promoting to published status if the tool is active

### Hyperdiv (`hyperdiv`) — W:35 D:60
- Tool appears to be a real open-source project but has very limited community awareness (no GitHub stars, no reviews, no pricing). It is niche and unproven.
  Data issues:
  - GitHub URL points to undefined
  - Pricing plans empty
  - No reviews or ratings
  - GitHub stars N/A
  Fixes:
  → Update GitHub URL to correct repository
  → Add pricing information or mark as free
  → Consider adding more context about community size or usage

### codegraph (`codegraph`) — W:75 D:40
- Tool has a clear value proposition and targets a real need (code intelligence for AI agents).
- Open source with a large GitHub star count (55k+) indicates significant interest.
- However, the GitHub URL and website URL are inconsistent and the website URL appears incorrect (points to anthropics/codegraph which may not be the same project).
- Pricing data is minimal and features list is short; no reviews yet.
  Data issues:
  - Website URL (https://github.com/anthropics/codegraph) does not match GitHub URL (https://github.com/colbymchenry/codegraph). Likely wrong.
  - Pricing plan only has one free tier with no details; may be incomplete.
  - No user reviews available (rating 0/5).
  - Description and tagline are well-written but could be more detailed.
  Fixes:
  → Verify correct website URL and update accordingly.
  → Add more pricing details if available (e.g., any paid tiers or limitations).
  → Encourage user reviews or add more context about the tool's maturity.
  → Consider adding more features or use cases to the list.

### Open (`open`) — W:35 D:30
- Tool appears to be a real open-source project but is very niche with limited community awareness; GitHub URL is invalid and no stars data available.
  Data issues:
  - GitHub URL points to undefined repository
  - No GitHub stars despite being open source
  - Pricing plans empty (but open source so free)
  - Website URL is a GitHub repo, not a dedicated product site
  Fixes:
  → Update GitHub URL to correct repository if exists
  → Add accurate GitHub stars count
  → Consider adding a proper website URL if available
  → Add pricing plan 'Free' or 'Open Source'

### project-nomad (`project-nomad`) — W:65 D:70
- Project has a significant GitHub star count (32k) indicating community interest, but the website URL points to GitHub instead of a dedicated site, and there are no pricing plans listed. The tagline and description are clear and appropriate for the category.
  Data issues:
  - Website URL is a GitHub repository, not a dedicated product website
  - No pricing plans provided
  Fixes:
  → Add a proper product website URL if available
  → Include pricing plans or mark as free/open source with no paid plans

### Extend (`extend`) — W:45 D:60
- The tool appears to be a real product with a website and pricing, but the name 'Extend' is generic and the website URL (extend.ai/ui) suggests it might be a UI kit for a larger platform, not a standalone tool.
- The tagline and description focus on document viewing components, but the features and pricing plans describe an API-based document processing service (Extract, Parse, Classify, etc.), which is inconsistent.
- No GitHub stars or URL provided despite being open source, which is suspicious.
- The tool has no reviews and is in draft status, indicating it may not be widely used or fully launched.
  Data issues:
  - Tagline and description describe a React UI kit, but features and pricing describe an API service.
  - Open source claim but no GitHub URL or stars provided.
  - Pricing plans list features that are not related to the described UI kit (e.g., Parse API, Extract API, Agentic OCR).
  - No reviews and draft status suggest the tool may not be ready for listing.
  Fixes:
  → Clarify whether the tool is a UI kit or an API service, and update tagline/description accordingly.
  → Provide a valid GitHub URL if open source, or remove the open source flag.
  → Align pricing plans with the actual product offering.
  → Consider waiting until the tool has more user adoption and reviews before listing.

### headroom (`headroom`) — W:65 D:70
- The tool has a very high GitHub star count (53323) which seems unrealistic for a relatively new project, possibly indicating fake stars or a mistake.
- The concept is valuable and addresses a real need in LLM applications, but the GitHub stars discrepancy raises suspicion.
- The website URL is a Vercel docs page, which is plausible but not a strong domain.
- No reviews or ratings on the platform yet, and the tool is in draft status.
  Data issues:
  - GitHub stars (53323) are extremely high for a project with no reviews and a draft status; likely a data error or inflated.
  - No user reviews or ratings available.
  - Website URL is a subdomain (headroom-docs.vercel.app) rather than a dedicated domain, which may affect credibility.
  Fixes:
  → Verify the GitHub star count and correct if erroneous.
  → Add more detailed pricing tiers if available.
  → Encourage user reviews to build credibility.
  → Consider a more professional website domain.

## Keep

- **Notion** (`notion`) — W:95 D:95
- **Obsidian** (`obsidian`) — W:95 D:90
- **Figma** (`figma`) — W:95 D:95
- **Penpot** (`penpot`) — W:95 D:90
- **Linear** (`linear`) — W:85 D:95
- **GitHub Issues** (`github-issues`) — W:95 D:95
- **Cursor** (`cursor`) — W:95 D:90
- **VS Code** (`vscode`) — W:95 D:95
- **Slack** (`slack`) — W:95 D:90
- **Discord** (`discord`) — W:95 D:100
- **claude-code** (`claude-code`) — W:95 D:85
- **markitdown** (`markitdown`) — W:85 D:90
- **composio** (`composio`) — W:85 D:90
- **AnkiAIUtils** (`anki`) — W:95 D:90
- **Stagewise** (`stagewise`) — W:65 D:85
- **Dyad** (`dyad`) — W:75 D:85
- **ToolJet** (`tooljet`) — W:85 D:95
- **Skip** (`skip`) — W:65 D:85
- **InstantDB** (`instantdb`) — W:85 D:90
- **Langfuse** (`langfuse`) — W:85 D:90
- **Jira** (`jira`) — W:95 D:90
- **Trello** (`trello`) — W:95 D:95
- **Asana** (`asana`) — W:95 D:95
- **ClickUp** (`clickup`) — W:95 D:90
- **GitLab** (`gitlab`) — W:95 D:90
- **Docker** (`docker`) — W:95 D:95
- **Postman** (`postman`) — W:95 D:95
- **Zoom** (`zoom`) — W:95 D:90
- **Confluence** (`confluence`) — W:95 D:95
- **Miro** (`miro`) — W:95 D:90
- **Airtable** (`airtable`) — W:95 D:85
- **Zapier** (`zapier`) — W:95 D:85
- **Vercel** (`vercel`) — W:95 D:85
- **Supabase** (`supabase`) — W:95 D:90
- **Microsoft Teams** (`microsoft-teams`) — W:95 D:95
- **Google Meet** (`google-meet`) — W:95 D:95
- **Telegram** (`telegram`) — W:95 D:90
- **GitHub Copilot** (`github-copilot`) — W:95 D:90
- **Resend** (`resend`) — W:85 D:95
- **Cal.com** (`cal-com`) — W:95 D:95
- **Unkey** (`unkey`) — W:75 D:90
- **Trigger.dev** (`trigger-dev`) — W:85 D:95
- **deer-flow** (`deer-flow`) — W:85 D:95
- **nanobot** (`nanobot`) — W:85 D:95
- **claude-code-templates** (`claude-code-templates`) — W:75 D:85
- **container** (`container`) — W:85 D:90
