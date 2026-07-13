# Quality Review Report — 2026-07-13

## Summary

| Metric | Count |
|--------|-------|
| Total tools | 171 |
| Keep (quality) | 79 |
| Needs review | 80 |
| Suggest hide | 7 |
| Suggest remove | 5 |

## Pipeline Health

Moderate. Strong core tools but many low-quality entries and missing GitHub data.

### Strengths
- High-quality tools (Notion, Obsidian, Figma, etc.) have excellent worthiness and data quality.
- Active tools dominate (141/171), indicating good discovery of popular tools.
- No missing website URLs, ensuring basic discoverability.

### Weaknesses
- 55 tools missing GitHub URL, limiting verification and community assessment.
- 133 tools have zero reviews, making it hard to gauge real-world usage.
- 28 tools have low worthiness (<40) and 43 have low data quality (<60), suggesting many low-value entries.
- Several tools with very low scores (e.g., mlop, VT Chat, WR.DO) should be removed or hidden.

### Prompt Improvement Suggestions

| Prompt | Issue | Suggested Fix |
|--------|-------|---------------|
| discovery_prompt | Discovery includes too many low-quality tools with no GitHub or reviews. | Add a filter to exclude tools with no GitHub URL or zero reviews unless they have high worthiness from other signals. |
| verification_prompt | LLM gives 'review' or 'keep' to tools with very low scores (e.g., Bodhi worthiness=35, dataQuality=60). | Strengthen the criteria for 'keep' to require both worthiness >=70 and dataQuality >=70. For 'hide', require worthiness <30 or dataQuality <30. |
| data_quality_prompt | Many tools have low data quality scores due to missing GitHub and reviews. | Explicitly penalize missing GitHub URL and zero reviews in the data quality calculation, e.g., subtract 20 points for each missing field. |

### Threshold Suggestions

| Parameter | Current | Suggested | Reason |
|-----------|---------|-----------|--------|
| Minimum worthiness score for 'keep' | None (LLM decides) | 70 | Tools below 70 often have low data quality or missing info; raising threshold improves pipeline quality. |
| Minimum data quality score for 'keep' | None | 70 | Ensures tools have sufficient metadata and reviews to be useful. |
| Maximum worthiness for 'hide' | None | 30 | Tools with worthiness <30 are likely noise; hide them to clean up the pipeline. |

## Suggest Remove

### mlop (`mlop`) — W:10 D:20
- Tool appears to be non-existent or placeholder; no GitHub stars, no GitHub URL, no pricing, and website URL redirects to a directory site, not a real product page.
  Fixes:
  → Verify if mlop is a real product; if so, provide correct website and GitHub links, add pricing, and gather reviews. Otherwise, remove from database.

### VT Chat (`vt-chat`) — W:10 D:20
- Tool does not appear to be a real product; no GitHub stars or URL, website is a directory listing, no pricing, no reviews, and no evidence of actual existence.
  Fixes:
  → Remove the tool from the database as it is not a real product

### Sendune (`sendune`) — W:15 D:20
- No evidence of being a real product: no GitHub stars, no GitHub URL, no pricing, no reviews, and the website URL points to a directory listing, not the tool's own site.
- Tagline and description are generic and lack specific details about functionality or unique value.
- Features list is minimal and uninformative.
  Fixes:
  → Verify if the tool actually exists and has a dedicated website.
  → If real, provide accurate GitHub URL and stars.
  → Add pricing information or state if free.
  → Expand features with concrete capabilities.

### WR.DO (`wr-do`) — W:10 D:20
- Tool appears to be a placeholder or non-existent product; no real website, GitHub, or user reviews.
  Fixes:
  → Remove entry if tool does not exist
  → If real, provide actual website and GitHub links

### Wraps (`wraps`) — W:15 D:20
- Tool appears to be a placeholder or non-existent product
- No GitHub stars or URL despite being open-source
- Website URL points to a directory page, not the tool's own site
- No pricing plans, no reviews, and minimal features
  Fixes:
  → Remove the tool if it does not exist as a real product
  → If it is real, provide a valid website URL and GitHub link

## Suggest Hide

### Antigravity-Manager (`antigravity-manager`) — W:15 D:30
- The tool appears to be a fake or joke product (Antigravity Tools is not a real software suite).
- GitHub stars (30k) are implausibly high for a niche, obscure tool, suggesting star manipulation or a non-serious project.
- No user reviews or evidence of real usage.

### Grepture (`grepture`) — W:20 D:30
- Tool appears very obscure with no reviews, no GitHub stars, and no GitHub URL provided
- Website URL points to a directory site (openalternative.co) rather than the tool's own domain
- No pricing plans listed, which may indicate incomplete data or lack of a real product

### Proxed AI (`proxed-ai`) — W:25 D:30
- Tool appears to be very niche or unproven with no GitHub stars, no reviews, and no pricing information. The website URL is a directory page, not the tool's own site.

### Browser Operator (`browser-operator`) — W:20 D:30
- Tool appears to be very niche or unproven with no GitHub stars, no reviews, and no pricing information. The website URL points to a directory page rather than the tool's own site, which is suspicious.

### Suprascribe (`suprascribe`) — W:25 D:40
- Very low GitHub stars (8) and no reviews on the site indicate minimal community adoption.
- Open source but appears to be a very small project with limited evidence of real-world use.
- No pricing plans listed, which is unusual for a subscription billing platform.

### Reqcore (`reqcore`) — W:15 D:40
- Very low GitHub stars (3) and no reviews indicate minimal user adoption
- Website URL does not resolve (likely not a real product or very early stage)
- No pricing plans listed, suggesting incomplete or non-existent product
- Category 'other' is vague and not appropriate for an HR tool

### Reflet (`reflet`) — W:25 D:40
- Very few GitHub stars (76) and no reviews indicate minimal adoption; website URL points to a directory, not the tool's own site; no pricing plans listed; description is generic and lacks detail.

## Needs Review

### claude-code (`claude-code`) — W:90 D:70
- High GitHub stars (137k) and reputable creator (Anthropic) indicate significant market presence and real user base.
- Tagline and description are clear and accurate.
- Pricing data has inconsistencies: duplicate 'Max' plan names and unclear feature descriptions.
  Data issues:
  - Pricing plans have duplicate plan name 'Max' with different prices and features.
  - Features list is vague ('Usage limits apply') and redundant ('Claude Code included in Pro plan' and 'Claude Code included in Max plan').
  - Rating shows 4.95/5 but with 0 reviews, which is suspicious.
  Fixes:
  → Fix duplicate plan names: rename one of the 'Max' plans (e.g., 'Max Annual' vs 'Max Monthly') or merge them.
  → Improve features list with specific, distinct features (e.g., 'Unlimited Claude Code usage', 'Priority support').
  → Remove rating or add a note if reviews are not yet available.

### markitdown (`markitdown`) — W:85 D:70
- High GitHub stars indicate significant community interest and usage
- Developed by Microsoft, adding credibility
- Tagline and description are clear and accurate
- Features list is detailed and relevant
  Data issues:
  - No pricing plans listed (but it's open source, so free)
  - Rating is 5/5 with 0 reviews, which is inconsistent
  - Website URL is same as GitHub URL, not a dedicated product page
  Fixes:
  → Add a note that the tool is free and open source
  → Remove rating or set to N/A if no reviews
  → Consider adding a dedicated website or documentation link

### Bodhi (`bodhi`) — W:35 D:60
- Small GitHub community (134 stars) and no reviews indicate limited adoption; website URL appears generic (bodhi.com) and may not be the actual product site; concept is valid but execution is unproven.
  Data issues:
  - Website URL (bodhi.com) likely not the correct product site; pricing plans lack details beyond free tier; no reviews despite rating.
  Fixes:
  → Verify and update website URL to correct product page; add more pricing details or clarify free-only model; consider adding user testimonials or case studies.

### Stagewise (`stagewise`) — W:65 D:70
- Open source with 6.7k GitHub stars indicates real user base and active development
- Pricing plans have duplicate Pro and Ultra tiers with same price and features, likely a data error
- Features list is incomplete and inconsistent with pricing details
  Data issues:
  - Pricing plans 'Pro' and 'Ultra' are identical ($20/mo, same features) - likely a copy-paste error
  - Features array only contains 3 items, missing many mentioned in pricing (e.g., 'Download for Linux', 'SSO with OIDC and SAML')
  - Rating shows 3.5/5 but 0 reviews - inconsistent
  Fixes:
  → Remove duplicate Pro/Ultra plan or differentiate them
  → Expand features list to include all mentioned in pricing descriptions
  → Clarify rating source or remove if no reviews

### Tasker (`tasker`) — W:35 D:70
- Tool is very niche with only 106 GitHub stars and no reviews, indicating limited adoption. However, it is open-source and has a clear value proposition.
  Data issues:
  - Rating shows 3.5/5 but 0 reviews, which is inconsistent.
  - Website URL (tasker.ai) may not match the GitHub repo (pitalco/tasker) - need to verify.
  Fixes:
  → Remove rating or clarify it's based on limited data.
  → Verify website URL matches the tool.

### Ephe (`ephe`) — W:45 D:60
- Small but legitimate open-source tool with 579 GitHub stars, indicating some user base and active development.
- Niche tool for ephemeral markdown editing, but not widely known; borderline for listing.
  Data issues:
  - Website URL points to a different GitHub repo (valentinegb/ephe) than the GitHub URL (unvalley/ephe).
  - Pricing plans are empty; should be 'Free' or 'Open Source'.
  - Rating shows 3.5/5 but with 0 reviews, which is inconsistent.
  Fixes:
  → Correct the Website URL to match the actual project site or the GitHub repo.
  → Add pricing plan as 'Free' or 'Open Source'.
  → Remove the rating or update it with actual review data.

### Colanode (`colanode`) — W:65 D:50
- Open-source with significant GitHub stars (4967) indicates real user interest
- Local-first, self-hosted alternative to Slack/Notion is a legitimate niche
- No pricing plans listed and website URL points to GitHub instead of a proper product site
- Rating of 3.5/5 with 0 reviews is suspicious
  Data issues:
  - Website URL is GitHub, not a dedicated product website
  - Pricing plans are empty; unclear if it's free or has paid tiers
  - Rating with 0 reviews is inconsistent
  Fixes:
  → Add a proper product website URL if available
  → Clarify pricing model (e.g., free, self-hosted, paid plans)
  → Remove rating or update with actual review count

### system-prompts-and-models-of-ai-tools (`system-prompts-and-models-of-ai-tools`) — W:85 D:70
- High GitHub stars (141k) indicate significant community interest and value.
- Tagline and description are clear and accurate.
- Category 'development' is appropriate.
- No pricing plans listed, but it's an open-source repository, so that's acceptable.
- Data quality issues: Rating is 0/5 with 0 reviews, which may be inaccurate given the star count; status is 'review' but should be 'keep' or 'live'.
  Data issues:
  - Rating is 0/5 with 0 reviews despite 141k stars, suggesting missing review data.
  - Status is 'review' but tool appears worthy of being listed as 'keep'.
  Fixes:
  → Update rating/review data if available, or remove rating if not applicable.
  → Change status from 'review' to 'keep'.

### gstack (`gstack`) — W:20 D:40
- Very niche tool with low community awareness despite high GitHub stars (likely inflated or miscounted). No pricing or reviews. Limited feature set.
  Data issues:
  - GitHub stars (121524) seem implausibly high for a tool with no reviews and limited features; possible data error.
  - No pricing plans listed.
  - No reviews or rating data.
  - Website URL is same as GitHub URL, no dedicated site.
  Fixes:
  → Verify GitHub star count; if incorrect, update to actual number.
  → Add pricing information or mark as free.
  → Encourage user reviews or add placeholder.
  → Consider adding a dedicated website or documentation page.

### awesome-claude-skills (`awesome-claude-skills`) — W:65 D:70
- High GitHub stars (67k) indicate significant community interest, but the tool is a curated list, not a standalone product.
- No pricing plans listed, which is acceptable for open-source, but the description is minimal.
- Category 'development' is appropriate, but the tool is essentially a GitHub repository.
  Data issues:
  - Website URL points to GitHub repo, not a dedicated product site.
  - No pricing plans provided, though not required for open-source.
  - Features are generic and could be more specific.
  Fixes:
  → Consider adding a more descriptive tagline and detailed features.
  → If the tool is just a list, ensure it's clearly categorized as a resource collection.
  → Add a note about the open-source nature and community contributions.

### Workout.cool (`workout-cool`) — W:25 D:50
- Very niche open-source project with no GitHub stars, no reviews, and no pricing info; appears to be a small personal project rather than a widely used tool.
  Data issues:
  - GitHub URL is set to undefined
  - GitHub stars missing
  - No pricing plans
  - No reviews
  - Website URL is a GitHub repo, not a dedicated site
  Fixes:
  → Update GitHub URL to correct repository
  → Add GitHub stars count if available
  → Consider adding pricing info or note as free
  → Add user reviews if any
  → Consider if this tool is ready for listing

### Rowboat (`rowboat`) — W:25 D:40
- Very niche tool with no GitHub stars, no reviews, and no pricing plans; appears to be in early stage or not widely used.
  Data issues:
  - GitHub URL is https://github.com/undefined
  - GitHub stars N/A
  - No pricing plans
  - No reviews
  Fixes:
  → Update GitHub URL to correct repository
  → Add pricing plans if available
  → Consider if tool is ready for listing

### Axilla (`axilla`) — W:40 D:50
- Tool appears to be a legitimate open-source project but has very limited visibility (no reviews, no GitHub stars data, and GitHub URL points to undefined). It is niche and unproven.
  Data issues:
  - GitHub URL is https://github.com/undefined which is invalid
  - No pricing plans listed
  - No reviews or ratings
  - GitHub stars N/A
  Fixes:
  → Update GitHub URL to correct repository (https://github.com/axflow/axflow)
  → Add pricing information if applicable
  → Consider adding more context or reviews

### Hyperdiv (`hyperdiv`) — W:30 D:40
- The tool appears to be a real open-source project but has very limited adoption and no reviews. The GitHub URL is malformed (points to undefined).
  Data issues:
  - GitHub URL is incorrect (https://github.com/undefined)
  - No pricing plans listed
  - No reviews or ratings
  - GitHub stars not available
  Fixes:
  → Correct the GitHub URL to the actual repository
  → Add pricing information if applicable
  → Consider gathering user reviews or ratings

### codegraph (`codegraph`) — W:85 D:50
- High GitHub stars (59k) indicate significant interest, but stars may be inflated or from a different repo; actual GitHub URL points to a personal repo with 0 stars, while website URL points to anthropics/codegraph which may not exist.
- Tagline and description are compelling and fit the development category.
- Pricing and features are minimal but consistent with open-source tool.
  Data issues:
  - GitHub URL (https://github.com/colbymchenry/codegraph) has 0 stars, contradicting the stated 59504 stars.
  - Website URL (https://github.com/anthropics/codegraph) likely does not exist or is not the official site.
  - Rating is 0/5 with 0 reviews, indicating no user feedback yet.
  - Status is 'draft', suggesting incomplete curation.
  Fixes:
  → Verify correct GitHub repository and update URL and star count accordingly.
  → Confirm official website or set to the correct GitHub repo if no separate site.
  → Consider adding more detailed pricing or note that it's fully open-source.
  → Update status to 'published' after verification.

### Open (`open`) — W:30 D:40
- Very niche project with unclear user base and no GitHub stars or reviews
- Website is a GitHub repo, not a proper product page
- Pricing is missing, but it's open source so that may be acceptable
  Data issues:
  - GitHub URL points to undefined
  - No GitHub stars available
  - No reviews or rating
  - Website URL is a GitHub repository, not a dedicated site
  Fixes:
  → Update GitHub URL to correct repository
  → Add pricing information or mark as free
  → Consider adding more context about the project's maturity

### project-nomad (`project-nomad`) — W:45 D:60
- GitHub stars are very high (33k) suggesting significant interest, but the project appears to be a niche tool for emergency preparedness and offline AI, which may limit its general appeal.
- The tool has no pricing plans listed and is open source, which is fine, but the lack of any pricing information might indicate incomplete data.
- The website URL points to GitHub, which is acceptable for open-source projects, but a dedicated website would be better for a comparison site.
- The category 'other' is vague; a more specific category would improve discoverability.
  Data issues:
  - No pricing plans provided.
  - Category is 'other' instead of a more specific category like 'AI' or 'Emergency Tools'.
  - Website URL is the same as GitHub URL, no dedicated landing page.
  Fixes:
  → Add pricing information if available, or mark as 'Free' or 'Open Source'.
  → Assign a more specific category (e.g., 'AI', 'Productivity', 'Emergency Preparedness').
  → Consider adding a dedicated website or at least a more descriptive GitHub page.

### Extend (`extend`) — W:45 D:60
- The tool appears to be a real product with a website and pricing, but it is not well-known and has no reviews or GitHub stars.
- The tagline and description mention an open-source React UI kit, but the website and pricing suggest it is a commercial API service, causing confusion.
- The category 'development' is appropriate, but the tool's focus on document processing APIs rather than UI components may mislead users.
  Data issues:
  - Tagline and description describe a React UI kit, but the website and features point to a document processing API service.
  - No GitHub URL or stars provided despite claiming open source.
  - Pricing plans list API credits and features not related to UI components.
  - Rating is 0/5 with no reviews, indicating lack of user feedback.
  Fixes:
  → Clarify whether the tool is a UI kit or an API service, and update tagline/description accordingly.
  → Provide GitHub URL if open source, or remove open source flag.
  → Ensure features listed match the actual product offering.
  → Consider adding more context to avoid confusion between UI components and API capabilities.

### headroom (`headroom`) — W:65 D:70
- Open-source project with 58.8k GitHub stars indicates significant community interest and real usage.
- Tagline and description are clear and accurate, addressing a real need for LLM context compression.
- Pricing is minimal (only free plan) but consistent with open-source nature.
- GitHub URL points to a repo with high stars, but the repo name 'chopratejas/headroom' may not match the tool's name exactly (could be a different project).
- Website URL appears functional but is a Vercel docs site, which is plausible for a new project.
  Data issues:
  - GitHub URL domain 'chopratejas' suggests the repo owner is an individual, not an organization, which may affect perceived stability.
  - No reviews or rating data available yet.
  - Only one pricing plan listed, which may be incomplete if there are paid tiers.
  Fixes:
  → Verify that the GitHub repo is indeed the correct one for the tool 'headroom' (the high star count may be from a different project).
  → Add more pricing plans if applicable, or clarify that it's fully open-source.
  → Encourage user reviews to build credibility.

### awesome-claude-code (`awesome-claude-code`) — W:35 D:60
- The tool is an awesome-list repository, not a standalone software tool, which may not fit the comparison website's focus.
- It has a high number of GitHub stars (49888), indicating significant community interest, but the repository name 'hesreallyhim' suggests it may be a personal fork or unofficial list.
- The tagline and description are well-written and accurate for an awesome-list, but the tool's value as a 'tool' is limited.
  Data issues:
  - GitHub URL and Website URL point to the same repository, which is unusual for a tool listing.
  - Pricing plan is free but the 'features' list is generic and not specific to a software product.
  - The category 'development' is appropriate, but the tool is more of a resource collection than a development tool itself.
  Fixes:
  → Consider reclassifying as a 'resource' or 'curated list' rather than a development tool.
  → Verify if the repository is the official awesome-claude-code list or a fork; if unofficial, note that in the description.
  → Add more specific features that differentiate it from other similar lists.

### VocalVia (`vocalvia`) — W:45 D:85
- Tool appears legitimate with a functional website and clear value proposition, but has very limited market presence (12 reviews) and is not open source. It's a niche AI tool that may be useful but not yet established.
  Data issues:
  - Pricing plan 'Standard' shows $8/month but billed yearly at $96, which is $8/month, so the yearly billing note is redundant. 'Pro' plan yearly billing at $228 is $19/month, also redundant. 'Free' plan lacks a price per month note.
  Fixes:
  → Clarify pricing: for Free plan, state 'Free' without monthly/yearly confusion. For Standard and Pro, remove the yearly billing note or make it consistent.

### SparkPod (`sparkpod`) — W:55 D:75
- Legitimate product with a real website and user reviews, but relatively new and not yet a major player in the AI podcast space.
- Pricing data is incomplete (Pro plan price not specified).
- Features are well-described and plausible.
  Data issues:
  - Pro plan price is listed as 'Available on website' instead of a specific price.
  - Limited number of reviews (150) and rating (4.2) suggest a smaller user base.
  Fixes:
  → Update Pro plan price to a specific dollar amount or indicate if it's usage-based.
  → Consider adding more details about the free plan limitations.

### ACI.dev (`aci-dev`) — W:20 D:30
- Tool appears to be a real product but has very limited online presence; website URL redirects to openalternative.co instead of aci.dev; no GitHub stars or URL provided; no pricing plans listed; rating is 0/5 with 0 reviews.
  Data issues:
  - Website URL is not the tool's own domain; missing GitHub URL and stars; no pricing information; no user reviews or ratings.
  Fixes:
  → Verify the correct website URL (e.g., https://aci.dev if it exists); add GitHub repository link and stars; include pricing plans if available; gather user reviews or indicate if it's too new.

### AgentOS (`agentos`) — W:65 D:70
- Tool has a real GitHub repo with 3626 stars, indicating a legitimate user base and active development, but lacks pricing plans and reviews, and the website URL may be auto-generated or not fully established.
  Data issues:
  - No pricing plans listed
  - No user reviews
  - Website URL (agentos-sdk.dev) appears to be a placeholder or not well-known
  Fixes:
  → Add pricing plans if available
  → Encourage user reviews
  → Verify website URL is correct and functional

### Agno (`agno`) — W:75 D:70
- High GitHub stars (41k) indicate significant community interest and activity.
- Open-source and active development, but relatively new and less established in the broader market.
- Pricing plans are empty, which may be incomplete or the tool is fully free.
  Data issues:
  - Pricing plans array is empty; should include at least 'Free' or 'Open Source' if no paid plans.
  - Rating is 0 with 0 reviews, which may be accurate but could be improved by adding a note about being new.
  - Website URL points to docs.agno.com, which is fine but the main site might be agno.com or similar.
  Fixes:
  → Add pricing plans: e.g., 'Free (Open Source)' or 'Community'.
  → Consider adding a note about the tool being new if rating is genuinely 0.
  → Verify if the main website should be agno.com instead of docs.agno.com.

### Arize Phoenix (`arize-phoenix`) — W:65 D:40
- Arize Phoenix is a legitimate open-source AI observability tool from a known company (Arize AI), but it is not as widely recognized as top-tier tools.
- The website URL points to openalternative.co instead of the official site (arize.com/phoenix), which is a data quality issue.
  Data issues:
  - Website URL is incorrect; should be the official Arize Phoenix site.
  - GitHub stars and URL are missing; this is open-source and should have a GitHub repo.
  - Pricing plans are empty; even if free, it should be listed.
  - Rating is 0/5 with 0 reviews, which may be inaccurate or incomplete.
  Fixes:
  → Update website URL to https://arize.com/phoenix or https://github.com/Arize-AI/phoenix.
  → Add GitHub URL and stars if available.
  → Add pricing plans (e.g., 'Free' or 'Open Source').
  → Consider adding more features or details to description.

### Bifrost (`bifrost`) — W:65 D:70
- Open-source project with 6470 GitHub stars indicates a real user base and active development.
- Tagline and description are clear and accurate.
- Pricing plans are empty, which may be incomplete or the tool is free; needs clarification.
- Website URL redirects to getmaxim.ai, which seems legitimate but the tool name Bifrost is not directly on the main page; may cause confusion.
  Data issues:
  - Pricing plans array is empty; should at least indicate 'Free' or 'Open Source'.
  - Website URL leads to a domain that doesn't prominently feature Bifrost; could be a subpage or product name mismatch.
  Fixes:
  → Add a pricing plan entry like 'Free' or 'Open Source'.
  → Verify the correct website URL for Bifrost or update the slug/name to match the product.

### ByteChef (`bytechef`) — W:65 D:80
- Tool has a real website, active GitHub with 905 stars, and a clear tagline/description. However, it lacks pricing plans and has no reviews, which may indicate early stage or limited adoption.
  Data issues:
  - Missing pricing plans
  - No user reviews
  Fixes:
  → Add pricing information if available, or mark as 'Contact for pricing'
  → Consider adding placeholder for reviews or note that it's new

### CodeZero (`codezero`) — W:25 D:40
- Very low GitHub stars (113) and no reviews indicate minimal adoption
- Website URL points to openalternative.co, not an official product site
- No pricing plans listed, suggesting incomplete data
  Data issues:
  - Website URL is not the official product site
  - Pricing plans are empty
  - No user reviews or ratings
  Fixes:
  → Update website URL to official product domain if exists
  → Add pricing information or mark as free
  → Verify if tool is actively maintained and has real users

### Envoy AI Gateway (`envoy-ai-gateway`) — W:40 D:30
- Tool appears to be a legitimate open-source project but lacks GitHub stars/URL and has no pricing plans, making it difficult to assess its market presence. The website URL points to a directory site rather than the official product site.
  Data issues:
  - Missing GitHub URL and stars
  - Website URL is not the official product site
  - No pricing plans listed
  Fixes:
  → Add official GitHub URL and stars if available
  → Update website URL to the official product page
  → Add pricing plans or indicate if it's free

### Flowise AI (`flowise-ai`) — W:85 D:65
- Flowise AI is a well-known open-source tool with 54K GitHub stars, strong community presence, and clear value for building LLM apps.
- Data quality issues: missing GitHub stars/URL, no pricing plans, and website URL points to openalternative.co instead of official site.
  Data issues:
  - GitHub Stars and GitHub URL are missing despite being open-source with 54K stars.
  - Pricing plans are empty; should indicate free/open-source or list any paid tiers.
  - Website URL is not the official site (likely https://flowiseai.com).
  Fixes:
  → Add correct GitHub URL (e.g., https://github.com/FlowiseAI/Flowise) and stars count.
  → Update website URL to official domain.
  → Add pricing info: 'Free (open-source)' or list any premium plans.

### Giselle (`giselle`) — W:55 D:70
- Open-source tool with 542 GitHub stars, indicating some community interest but not yet widely known.
- Website and GitHub repo are real, but no pricing plans listed and no user reviews, suggesting early stage.
- Category is appropriate, but tagline and description are generic.
  Data issues:
  - No pricing plans provided.
  - No user reviews or ratings.
  - Features list is short and generic.
  Fixes:
  → Add pricing plans if available, or mark as 'Free' or 'Open Source'.
  → Encourage user reviews or add more detailed feature descriptions.
  → Consider adding more specific features or use cases.

### Suna (`suna`) — W:40 D:60
- Open source with nearly 20k GitHub stars suggests a real project, but website URL (kortix.com) does not match the tool name 'Suna' and the GitHub URL points to a different org (kortix-ai). Pricing is empty, and no reviews exist. The tool may be legitimate but data needs verification.
  Data issues:
  - Website URL (kortix.com) does not match tool name or GitHub org
  - GitHub URL points to 'kortix-ai' org, not 'suna'
  - No pricing plans listed
  - No user reviews
  Fixes:
  → Verify correct website URL for Suna
  → Confirm GitHub repository is correct
  → Add pricing information if available
  → Collect user reviews or note absence

### Supermemory (`supermemory`) — W:75 D:70
- High GitHub stars (28k+) indicate significant community interest, but the tool is relatively new and niche. Pricing data is missing, which is important for comparison.
  Data issues:
  - Pricing plans array is empty; no pricing information provided.
  Fixes:
  → Add pricing information if available, or mark as 'Free' or 'Open Source'.

### Trieve (`trieve`) — W:65 D:80
- Trieve is a legitimate open-source project with a significant GitHub following (2694 stars) and a real website.
- It serves a clear niche (AI search/RAG) and has active development.
- However, it lacks user reviews and pricing information, which may indicate limited market adoption or incomplete data.
  Data issues:
  - No pricing plans listed.
  - No user reviews (rating 0/5).
  Fixes:
  → Add pricing plans if available, or mark as 'Free' or 'Contact for pricing'.
  → Encourage user reviews or note that reviews are not yet available.

### Activeloop (`activeloop`) — W:65 D:50
- Activeloop is a legitimate ML data platform with a real user base, but it is not as widely known as top-tier tools.
- The website URL points to openalternative.co instead of the actual product site, which is a significant data quality issue.
- Pricing plans are empty, which may be incomplete or missing.
- GitHub stars and URL are N/A despite being open source, which is inconsistent.
  Data issues:
  - Website URL is incorrect (should be activeloop.ai or similar).
  - Pricing plans are missing.
  - GitHub information is missing despite open source claim.
  Fixes:
  → Update website URL to the actual product website (e.g., https://activeloop.ai).
  → Add pricing plans or indicate if it's free/paid.
  → Provide GitHub URL and stars if available, or clarify open source status.

### Laminar (`laminar`) — W:55 D:40
- Tool has a niche but legitimate use case in ML observability, with 869 GitHub stars indicating some community interest.
- Website URL points to openalternative.co, not the tool's own domain, which is suspicious.
- No pricing plans listed, which may be acceptable for open-source but could be incomplete.
- GitHub URL points to a personal account (TimonPost) rather than an organization, suggesting early-stage project.
  Data issues:
  - Website URL is not the tool's own domain; it redirects to a directory site.
  - No pricing information provided.
  - GitHub stars are moderate but repository may not be actively maintained (check last commit).
  Fixes:
  → Update website URL to the actual tool domain if it exists, or mark as unknown.
  → Add pricing plans or note that it's free/open-source.
  → Verify GitHub repository activity and update status accordingly.

### OpenLIT  (`openlit`) — W:65 D:80
- OpenLIT is a legitimate open-source tool with a significant GitHub presence (2592 stars) and a clear use case for LLM observability. However, it lacks pricing plans and user reviews, which may indicate early-stage adoption.
  Data issues:
  - No pricing plans provided
  - No user reviews (0 ratings)
  Fixes:
  → Add pricing information if available, or mark as 'Free' or 'Open Source'
  → Encourage user reviews or note that it's a new tool

### 5ire (`5ire`) — W:65 D:75
- Open-source project with 5k+ GitHub stars indicates real user base and active development.
- Tagline and description are clear and accurate.
- Pricing plans are empty, which may be incomplete; tool might be free but should be clarified.
- Category 'productivity' is reasonable but could be more specific like 'developer tools'.
  Data issues:
  - Pricing plans array is empty; should indicate if it's free or have pricing details.
  Fixes:
  → Add pricing information: either mark as 'Free' or provide plan details.

### AnythingLLM (`anythingllm`) — W:65 D:50
- Tool is legitimate and has a real user base, but lacks GitHub stars and review data.
- Pricing plans are empty, which may be acceptable for open-source but needs clarification.
- Website URL points to openalternative.co instead of the actual product site.
  Data issues:
  - Missing GitHub stars and URL despite being open source.
  - Website URL is not the official product site.
  - No pricing information provided.
  - No user reviews available.
  Fixes:
  → Update website URL to the official product site (e.g., anythingllm.com or github repo).
  → Add GitHub URL and stars if available.
  → Add pricing plans or note 'Free/Open Source'.
  → Encourage user reviews or add placeholder.

### Colanode, (`colanode-`) — W:65 D:70
- Open-source project with nearly 5k GitHub stars indicates a real user base and active development.
- Tagline and description are clear and accurate.
- Pricing is minimal (only free self-hosted), which may be incomplete for a comparison site.
- Website URL points to GitHub, not a dedicated product site, which may reduce perceived legitimacy.
  Data issues:
  - Website URL is GitHub repo, not a proper product website.
  - No paid plans listed; may not reflect full pricing model.
  - No reviews or rating data available.
  Fixes:
  → Add a proper product website URL if available.
  → Consider adding more pricing tiers if they exist.
  → Encourage user reviews to populate rating.

### Steel (`steel`) — W:65 D:55
- Open-source framework with 2472 GitHub stars, indicating active community interest
- Tagline and description are generic and lack specificity
- Website URL points to openalternative.co instead of a dedicated domain, raising credibility concerns
- No pricing plans listed, which may be acceptable for open-source but should be clarified
- Features mention 7.3K stars but GitHub shows 2472, inconsistency in data
  Data issues:
  - Website URL is not the tool's own domain (openalternative.co is a directory)
  - Feature list incorrectly states 7.3K GitHub stars (actual is 2472)
  - No pricing information provided, even for open-source tools it's helpful to note 'free' or 'self-hosted'
  Fixes:
  → Update website URL to the actual project site or GitHub repository
  → Correct the GitHub stars count in features to match actual data
  → Add pricing plan information (e.g., 'Free (Open Source)')

### SurfSense (`surfsense`) — W:85 D:70
- High GitHub stars (15225) suggest significant interest, but no pricing plans listed and no user reviews indicate incomplete data.
- Website URL appears legitimate, but tagline and description are generic and could be improved.
- Category 'productivity' is appropriate.
  Data issues:
  - No pricing plans provided.
  - No user reviews (0 ratings).
  - Tagline and description are somewhat generic.
  Fixes:
  → Add pricing plans or indicate if it's free.
  → Encourage user reviews or provide more details on user base.
  → Refine tagline and description to be more specific and compelling.

### Swirl Search (`swirl-search`) — W:65 D:70
- Open-source project with 3032 GitHub stars indicates a real user base and active development.
- Website URL appears legitimate and functional.
- Pricing plans are empty, which may be incomplete or the tool is free; needs clarification.
- No reviews/ratings yet, but that's common for newer or niche tools.
  Data issues:
  - Pricing plans array is empty; should indicate if it's free or have pricing tiers.
  - Tagline 'Unify AI search across multiple sources' is a bit generic; could be more specific.
  - Category 'productivity' is broad; 'search' or 'data integration' might be more accurate.
  Fixes:
  → Add pricing information (e.g., 'Free and open source' or list plans).
  → Refine tagline to highlight unique value (e.g., 'Open-source AI search for enterprise data silos').
  → Consider more specific category like 'Enterprise Search' or 'Data Integration'.

### Typebot (`typebot`) — W:65 D:70
- Typebot is a legitimate open-source chatbot builder with a visual builder, but it is not as widely known as top-tier tools. The website URL points to a directory page instead of the actual product site, which is a data quality issue.
  Data issues:
  - Website URL is not the official product site (openalternative.co/typebot instead of typebot.io or similar)
  - Pricing plans are empty despite being open-source (should at least indicate free/self-hosted)
  - GitHub stars and URL are missing even though it's open-source
  Fixes:
  → Update website URL to the actual product site (e.g., https://typebot.io)
  → Add pricing information (e.g., 'Free (self-hosted)')
  → Provide GitHub URL and stars if available

### VoiceInk (`voiceink`) — W:65 D:70
- Open source with 5.5k GitHub stars indicates a real user base and active development.
- Website URL is valid and the tool appears legitimate.
- Pricing plans are empty, which may be incomplete or the tool is free; needs clarification.
- No reviews or rating data, which is suspicious for a tool with significant GitHub stars.
  Data issues:
  - Pricing plans array is empty; should include at least one plan or indicate 'Free'.
  - Rating is 0/5 with 0 reviews, but GitHub stars suggest usage; reviews may be missing.
  Fixes:
  → Add pricing information: if free, include a plan with price 0.
  → Check if there are any user reviews or ratings to populate.

### VoiceTypr (`voicetypr`) — W:45 D:70
- Small but legitimate open-source tool with 522 GitHub stars and active development, but lacks pricing plans and user reviews, and has limited market presence.
  Data issues:
  - Pricing plans array is empty
  - No user reviews (rating 0/5)
  - Features claim 'No internet required' but description says AI-powered, which typically needs internet
  Fixes:
  → Add pricing information or mark as free
  → Encourage user reviews or remove rating
  → Clarify if offline transcription is truly possible or update features

### Zero  (`zero`) — W:25 D:40
- Tool appears to be a real open-source project but lacks significant market presence or user base.
- No GitHub stars or URL provided, making it hard to verify community engagement.
- Website URL points to a directory site (openalternative.co) rather than the tool's own domain, which is suspicious.
  Data issues:
  - GitHub URL and stars are missing despite being open source.
  - Website URL is not the tool's own domain; it redirects to a third-party site.
  - No pricing plans listed, which may be acceptable for open-source but incomplete for comparison.
  - Rating is 0 with no reviews, indicating very low adoption.
  Fixes:
  → Verify the actual website URL and update it to the tool's official domain.
  → Provide GitHub URL and stars if available, or mark as not applicable.
  → Consider adding pricing information or note that it's free/open-source.
  → If the tool is too obscure, consider hiding it until it gains more traction.

### Zola (`zola`) — W:75 D:70
- Zola is a legitimate and well-known static site generator with significant GitHub stars (17k+), but its tagline and description claim AI-powered features which are not standard in Zola; this may be inaccurate or exaggerated.
- Pricing plans are empty, which is fine for open-source, but the features list includes 'AI-assisted content generation' which is not a core feature of Zola; this could mislead users.
  Data issues:
  - Tagline and description mention AI integration, but Zola is not known for AI features; this may be incorrect or misleading.
  - Features list includes 'AI-assisted content generation' which is not a standard feature of Zola.
  Fixes:
  → Verify if Zola has any AI capabilities; if not, remove AI references from tagline, description, and features.
  → Update tagline to reflect actual core features (e.g., 'Fast static site generator in Rust').
  → Consider adding more accurate features like 'Built-in Sass compilation', 'Asset pipeline', etc.

### Ever Gauzy (`ever-gauzy`) — W:65 D:70
- Open-source project with significant GitHub stars (3773) and active development, indicating a real user base.
- Tagline and description are accurate but could be more specific to differentiate from other CRM tools.
- Pricing plans are empty, which is a data quality issue; even open-source tools often have cloud pricing or donation options.
  Data issues:
  - Pricing plans array is empty; should include available plans (e.g., self-hosted free, cloud paid tiers) or explicitly state 'Free (self-hosted)'.
  - Rating is 0/5 with 0 reviews, which may be accurate but could be improved by adding a note that reviews are not yet collected.
  Fixes:
  → Add pricing plans: at least 'Self-hosted: Free' and optionally 'Cloud: Paid' with details.
  → Consider adding a note about the rating or removing it if not applicable.

### Frappe CRM (`frappe-crm`) — W:55 D:60
- Frappe CRM is a legitimate open-source CRM but has limited market presence and no GitHub stars or reviews, making it niche. Data quality is decent but missing pricing and GitHub info.
  Data issues:
  - Missing GitHub URL and stars
  - No pricing plans listed
  - Website URL points to openalternative.co instead of official site
  Fixes:
  → Add official website URL (e.g., frappe.io/crm)
  → Include GitHub repository link
  → Provide pricing information or state 'Free & Open Source'

### Krayin (`krayin`) — W:45 D:55
- Krayin is a real open-source CRM but has very limited community presence and no GitHub stars or URL provided.
- The website URL points to openalternative.co, not the official product site, which reduces credibility.
- No pricing plans listed, which is acceptable for open-source but could be more complete.
  Data issues:
  - Website URL is not the official product site (likely a directory listing).
  - Missing GitHub URL and stars, which are important for open-source tools.
  - No reviews or rating data available.
  Fixes:
  → Update website URL to the official Krayin site (e.g., krayincrm.com).
  → Add GitHub URL if available, or note that it's not public.
  → Consider adding more features or details to description.

### Malak (`malak`) — W:45 D:70
- Open-source CRM for VC firms with a niche focus, low GitHub stars (60) and no reviews, but has a real website and active development. Borderline worthiness due to limited community adoption.
  Data issues:
  - Missing pricing plans data (empty array)
  - No user reviews or rating data
  Fixes:
  → Add pricing information if available, or mark as 'Free' or 'Open Source'
  → Consider adding placeholder for reviews or note that it's a new tool

### Open Mercato (`open-mercato`) — W:65 D:70
- Open-source CRM with active GitHub repository (1489 stars) and real website, indicating a legitimate project with some community interest.
- Lacks pricing plans and user reviews, which are important for comparison purposes.
- Tagline and description are clear and appropriate for the CRM category.
  Data issues:
  - No pricing plans listed.
  - No user reviews (0 reviews).
  Fixes:
  → Add pricing plans if available (e.g., self-hosted free, cloud paid tiers).
  → Encourage user reviews or note that it's a new listing.

### Paymenter (`paymenter`) — W:25 D:50
- Tool appears to be a real open-source project but lacks significant market presence or user base. GitHub stars and URL are missing, and there are no reviews or pricing information.
  Data issues:
  - Missing GitHub URL and stars
  - No pricing plans listed
  - No user reviews
  - Website URL points to openalternative.co, not the tool's own site
  Fixes:
  → Add actual GitHub URL and star count
  → Provide pricing plans or indicate if free
  → Collect user reviews
  → Update website URL to the tool's official site

### UniBee (`unibee`) — W:55 D:75
- Open-source billing platform with 202 GitHub stars and active development, but lacks user reviews and pricing information, making it less established.
  Data issues:
  - No pricing plans listed
  - No user reviews
  Fixes:
  → Add pricing plans if available
  → Encourage user reviews or note that it's open-source with self-hosted pricing

### Horilla (`horilla`) — W:35 D:40
- Horilla appears to be a real open-source HRMS but lacks significant market presence or user reviews.
- The website URL points to openalternative.co, not the official product site, which is suspicious.
- No GitHub stars or URL provided, making it hard to verify activity or community.
- Pricing plans are empty, which is unusual for a product with payroll integration features.
  Data issues:
  - Website URL is not the official product site.
  - Missing GitHub URL and stars despite being open-source.
  - No pricing plans listed.
  - Category 'other' is too vague; should be more specific like 'HRMS'.
  Fixes:
  → Update website URL to the official Horilla site (e.g., horilla.com).
  → Provide GitHub URL and stars if available.
  → Add pricing plans or note if it's completely free.
  → Change category to a more specific one like 'Human Resources'.

### Dub Partners (`dub-partners`) — W:25 D:30
- Tool appears to be a real product but is very niche with no GitHub stars or user reviews, and the website URL points to a directory page rather than the actual product site.
  Data issues:
  - Website URL is not the tool's own domain but a directory listing
  - No GitHub stars or URL provided despite being open-source
  - No pricing plans listed
  - No user reviews
  Fixes:
  → Update website URL to the actual product site
  → Add GitHub repository URL and stars if available
  → Provide pricing information or indicate if it's free
  → Encourage user reviews or add placeholder

### Postiz (`postiz`) — W:60 D:40
- Postiz appears to be a legitimate open-source social media scheduling tool with a real user base, but the provided data has inconsistencies (e.g., GitHub stars mentioned in features but N/A in GitHub fields) and the website URL is not the official product site.
  Data issues:
  - GitHub stars listed as 33K in features but GitHub URL is N/A and GitHub Stars field is N/A
  - Website URL points to openalternative.co instead of the official Postiz website
  - Pricing plans are empty but tool is open-source (should indicate free or self-hosted)
  - No reviews or rating data available
  Fixes:
  → Update GitHub URL and stars if available
  → Change website URL to official Postiz site (e.g., postiz.com or GitHub repo)
  → Add pricing information (e.g., 'Free (self-hosted)')
  → Consider removing or correcting the GitHub stars claim if unverified

### Billion Mail (`billion-mail`) — W:75 D:60
- High GitHub stars suggest a real project, but no pricing and zero reviews indicate limited market presence.
  Data issues:
  - Pricing plans array is empty
  - Rating is 0 with no reviews
  Fixes:
  → Add pricing information if available
  → Verify if the tool is actively used and has user reviews

### Brace.to (`brace-to`) — W:30 D:40
- Very niche and unproven tool with no GitHub stars or reviews, but has a real website and plausible features. Open-source claim is unverifiable.
  Data issues:
  - GitHub URL is N/A despite being open-source
  - No pricing plans listed
  - Website URL points to a directory (openalternative.co) rather than the tool's own site
  - No reviews or ratings
  Fixes:
  → Verify if the tool has its own website and update URL
  → Add GitHub URL if available
  → Include pricing information or mark as 'Free' if applicable
  → Consider adding more context about its user base

### Chaskiq (`chaskiq`) — W:65 D:85
- Open-source with significant GitHub stars (3539) indicates real user base and active development, but pricing plans are empty and no reviews exist, which may affect completeness.
  Data issues:
  - Pricing plans array is empty; no reviews available.
  Fixes:
  → Add pricing information if available, or mark as 'Free' or 'Open Source'.

### Chatwoot (`chatwoot`) — W:85 D:70
- Chatwoot is a well-known open-source customer engagement platform with a large GitHub community (34k+ stars) and active development, making it worthy of listing. However, the data has issues: no pricing plans provided, and the website URL points to a help center instead of the main site.
  Data issues:
  - Missing pricing plans
  - Website URL should be https://www.chatwoot.com/ instead of help center
  Fixes:
  → Add pricing plans (e.g., free self-hosted, paid cloud plans)
  → Update website URL to main domain

### Contentport (`contentport`) — W:55 D:70
- Open-source with 760 GitHub stars indicates a real but small user base
- Website and GitHub are active, but no pricing plans listed
- Category is appropriate, but features are generic
  Data issues:
  - No pricing plans provided
  - Rating is 0/5 with 0 reviews, which may indicate low adoption
  Fixes:
  → Add pricing plans if available, or mark as 'Free' or 'Self-hosted'
  → Consider gathering user reviews or testimonials

### Sendportal (`sendportal`) — W:65 D:70
- Open-source tool with over 2000 GitHub stars, indicating a real user base and active development.
- Tagline and description are accurate but minimal; lacks specific features and use cases.
- No pricing plans listed, which is acceptable for open-source but could be improved.
- Category is appropriate.
  Data issues:
  - Pricing plans array is empty; even for open-source, could include 'Free' or 'Self-hosted'.
  - Features list is too generic; should include more specific capabilities.
  - No reviews or rating data available.
  Fixes:
  → Add pricing plan details (e.g., 'Free - Open Source').
  → Expand features list with concrete features (e.g., email campaigns, segmentation, analytics).
  → Encourage user reviews or add placeholder for future reviews.

### Shlink (`shlink`) — W:65 D:60
- Shlink is a legitimate open-source URL shortener with a significant GitHub following (5k+ stars), but its tagline and description inaccurately describe it as a marketing & customer engagement tool, which may mislead users.
- The tool is well-known in its niche (URL shortening) but not as a broad marketing platform.
  Data issues:
  - Tagline and description misrepresent the tool's primary function (URL shortener vs. marketing & customer engagement).
  - No pricing plans listed, though it's open-source and self-hosted, so pricing may not apply.
  - Features list is too generic and lacks detail.
  Fixes:
  → Update tagline to reflect its actual purpose, e.g., 'Open-source URL shortener with advanced analytics.'
  → Update description to accurately describe features like link shortening, tracking, and QR codes.
  → Add more specific features (e.g., 'URL shortening', 'real-time analytics', 'QR code generation').
  → Consider adding a note about self-hosted nature and no pricing.

### Sink (`sink`) — W:65 D:55
- Open-source project with 6908 GitHub stars indicates significant community interest, but the description is generic and lacks detail.
- No pricing plans listed, which may be acceptable for open-source but could be incomplete.
- Website URL appears valid but the tool's actual functionality and market presence are unclear from the provided data.
  Data issues:
  - Description is too generic: 'open-source alternative in the Marketing & Customer Engagement category' does not explain what Sink does.
  - No pricing plans provided; even for open-source, there might be hosted options or premium features.
  - Features list contains only one generic feature: 'Open-source marketing & customer engagement solution'.
  - Rating is 0/5 with 0 reviews, which may indicate lack of user feedback or newness.
  Fixes:
  → Expand description with specific capabilities, target audience, and key differentiators.
  → Add pricing plans if any exist (e.g., self-hosted free, cloud paid tiers).
  → List concrete features such as email campaigns, analytics, automation, etc.
  → Encourage user reviews or provide more context on community adoption.

### Slugy (`slugy`) — W:35 D:40
- Very low GitHub stars (90) and no reviews, indicating minimal adoption
- No pricing plans listed, which is unusual for a marketing tool
- Tagline and description are generic and lack detail
- Website URL appears functional but tool is not well-known
  Data issues:
  - Missing pricing plans
  - Features list is too vague (only one feature listed)
  - No reviews or community engagement indicators
  Fixes:
  → Add pricing plans or clarify if it's free
  → Expand features list with concrete capabilities
  → Gather user reviews or testimonials

### Tiledesk (`tiledesk`) — W:55 D:45
- Open-source project with moderate GitHub stars, but lacks user reviews and pricing information, making it less established.
  Data issues:
  - No pricing plans listed
  - No user reviews
  - Features list is too generic
  Fixes:
  → Add pricing plans if available
  → Encourage user reviews
  → Expand features list with specific capabilities

### TryPost (`trypost`) — W:45 D:60
- Small but legitimate open-source project with 386 GitHub stars and active development. However, it lacks user reviews and pricing information, and the description is generic.
  Data issues:
  - No pricing plans listed
  - No user reviews
  - Description is too brief and generic
  Fixes:
  → Add pricing plans if available
  → Encourage user reviews
  → Expand description with specific features and use cases

### Usertour (`usertour`) — W:60 D:70
- Open-source project with significant GitHub stars (2064) indicates real user interest and active development, but lacks pricing plans and has minimal feature description, which may affect user decision-making.
  Data issues:
  - No pricing plans provided
  - Features list is too generic and short
  Fixes:
  → Add pricing plans if available, or mark as 'Free' or 'Open Source'
  → Expand features list with more specific capabilities

### useSend (`usesend`) — W:45 D:50
- Open-source project with 4.4k GitHub stars, indicating some community interest
- Website URL is valid but tagline and description are generic and lack detail
- No pricing plans listed, which may be acceptable for open-source but incomplete
- Features list is minimal and vague
- Category 'marketing' is appropriate but tool is not well-known
  Data issues:
  - Tagline and description are too generic and do not differentiate the tool
  - Features list has only one item, which is insufficient
  - No pricing information provided
  Fixes:
  → Expand tagline and description to highlight unique selling points and key capabilities
  → Add more specific features (e.g., email campaigns, automation, analytics)
  → Include pricing details or state 'Free & Open Source' if no paid plans

### Zammad (`zammad`) — W:65 D:40
- Zammad is a legitimate open-source helpdesk/ticketing system with significant GitHub stars (5752) and active development, but its tagline and description incorrectly categorize it as marketing & customer engagement tool, which is misleading.
- Pricing data is missing; even open-source tools often have hosted plans or enterprise pricing that should be listed.
- Features list is too generic and does not reflect the actual functionality of the tool (it's a helpdesk, not marketing).
  Data issues:
  - Tagline and description are inaccurate: Zammad is a helpdesk/ticketing system, not a marketing & customer engagement tool.
  - Pricing plans are empty; should include at least the open-source self-hosted option and any official cloud plans.
  - Features list is too vague and does not describe the tool's actual capabilities.
  Fixes:
  → Update tagline to something like 'Zammad — open-source helpdesk & customer support system'.
  → Update description to accurately describe Zammad as a helpdesk/ticketing system.
  → Add pricing plans: e.g., 'Self-hosted (free)', 'Cloud (paid)' with details if available.
  → Expand features list to include key features like ticket management, knowledge base, automation, etc.

### ClearFlask (`clearflask`) — W:45 D:50
- Open-source project with 443 GitHub stars, indicating some community interest but not yet widely adopted. Category 'communication' may not be ideal for a customer support tool.
  Data issues:
  - No pricing plans listed
  - Category seems inappropriate (communication vs customer support)
  - Features list is too sparse
  Fixes:
  → Add pricing plans or indicate if it's free
  → Re-categorize to 'customer-support' or similar
  → Expand features list with more specific capabilities

### Cossistant (`cossistant`) — W:55 D:60
- Open-source with 691 GitHub stars indicates some community interest, but very low rating and no reviews suggest limited adoption.
- Category 'communication' may not be the best fit; customer support tools are often categorized separately.
- No pricing plans listed, which is acceptable for open-source but could be improved.
  Data issues:
  - Category 'communication' is too broad; 'Customer Support' would be more appropriate.
  - No pricing information provided; even open-source tools often list self-hosted or cloud options.
  - Features list is minimal (only one feature).
  Fixes:
  → Change category to 'Customer Support' or 'Help Desk'.
  → Add pricing details (e.g., free self-hosted, paid cloud tiers).
  → Expand features list with more specific capabilities (e.g., ticket management, knowledge base, live chat).

### Fider (`fider`) — W:65 D:70
- Fider is a legitimate open-source project with over 4400 GitHub stars, indicating a real user base and active development.
- The tagline and description are too generic and do not accurately reflect Fider's actual purpose (feedback management, not customer support/success).
- Category 'communication' is not ideal; 'customer feedback' or 'product management' would be more appropriate.
- Pricing plans are missing; Fider offers a hosted version with pricing, so data is incomplete.
  Data issues:
  - Tagline and description misrepresent the tool as a customer support/success tool; it is actually a feedback management platform.
  - Category is 'communication' but should be more specific like 'customer feedback' or 'product management'.
  - Pricing plans array is empty; Fider has a cloud version with paid plans (e.g., $29/month).
  Fixes:
  → Update tagline to something like 'Fider — open-source feedback management platform'.
  → Update description to accurately describe Fider as a tool for collecting and managing user feedback.
  → Change category to 'customer feedback' or 'product management'.
  → Add pricing plans for the cloud version (e.g., Free, Growth $29/mo, Business $99/mo).

### Formbricks (`formbricks`) — W:75 D:50
- Formbricks is a well-known open-source tool with over 12k GitHub stars, indicating significant community interest and active development. However, the tagline and description inaccurately describe it as a customer support tool, while it is actually a form and survey builder. The category is also wrong (communication vs. forms/surveys).
  Data issues:
  - Tagline and description misrepresent the tool's purpose
  - Category is incorrect
  - No pricing plans listed (though open-source, there may be a cloud version)
  Fixes:
  → Update tagline to reflect form/survey building
  → Update description to accurately describe features
  → Change category to 'forms' or 'surveys'
  → Add pricing plans if available

### Frappe Helpdesk (`frappe-helpdesk`) — W:40 D:30
- Tool is open-source and has a legitimate purpose, but lacks GitHub stars and URL, and has no user reviews.
- Website URL points to a directory page, not the actual product site.
  Data issues:
  - GitHub URL is missing despite being open-source.
  - Website URL is not the official product site.
  - No pricing plans listed.
  - No user reviews or rating.
  Fixes:
  → Add correct GitHub URL if available.
  → Update website URL to official product page (e.g., frappe.io/helpdesk).
  → Add pricing information if applicable.
  → Encourage user reviews to build credibility.

### Freescout (`freescout`) — W:75 D:60
- Freescout is a well-known open-source help desk with a significant GitHub following and active development, but its description and features are too sparse, and pricing data is missing.
  Data issues:
  - Description is too brief and generic
  - Features list contains only one item
  - Pricing plans are empty (should at least indicate free or self-hosted)
  Fixes:
  → Expand description to include key features and benefits
  → Add more features such as email piping, ticket management, knowledge base, etc.
  → Add pricing information (e.g., 'Free (self-hosted)')

### LogChimp (`logchimp`) — W:55 D:60
- Open-source tool with over 1k GitHub stars, indicating some community interest, but very limited market presence and no pricing or review data.
  Data issues:
  - Missing pricing plans
  - No reviews
  - Category 'communication' may not be the best fit for a customer support tool
  Fixes:
  → Add pricing plans or note if it's free
  → Encourage user reviews
  → Consider re-categorizing to 'Customer Support'

## Keep

- **Notion** (`notion`) — W:95 D:95
- **Obsidian** (`obsidian`) — W:95 D:90
- **Figma** (`figma`) — W:95 D:90
- **Penpot** (`penpot`) — W:95 D:95
- **Linear** (`linear`) — W:85 D:95
- **GitHub Issues** (`github-issues`) — W:95 D:90
- **Cursor** (`cursor`) — W:95 D:90
- **VS Code** (`vscode`) — W:95 D:100
- **Slack** (`slack`) — W:95 D:90
- **Discord** (`discord`) — W:95 D:95
- **composio** (`composio`) — W:85 D:90
- **AnkiAIUtils** (`anki`) — W:95 D:85
- **Dyad** (`dyad`) — W:75 D:85
- **ToolJet** (`tooljet`) — W:85 D:95
- **Skip** (`skip`) — W:65 D:85
- **Onlook** (`onlook`) — W:85 D:90
- **InstantDB** (`instantdb`) — W:75 D:85
- **Langfuse** (`langfuse`) — W:85 D:90
- **Jira** (`jira`) — W:95 D:90
- **Trello** (`trello`) — W:95 D:95
- **Asana** (`asana`) — W:95 D:90
- **ClickUp** (`clickup`) — W:95 D:90
- **GitLab** (`gitlab`) — W:95 D:95
- **Docker** (`docker`) — W:95 D:90
- **Postman** (`postman`) — W:95 D:90
- **Zoom** (`zoom`) — W:95 D:90
- **Confluence** (`confluence`) — W:95 D:95
- **Miro** (`miro`) — W:95 D:90
- **Airtable** (`airtable`) — W:95 D:90
- **Zapier** (`zapier`) — W:95 D:85
- **Vercel** (`vercel`) — W:95 D:95
- **Supabase** (`supabase`) — W:95 D:90
- **Microsoft Teams** (`microsoft-teams`) — W:95 D:95
- **Google Meet** (`google-meet`) — W:95 D:100
- **Telegram** (`telegram`) — W:95 D:95
- **GitHub Copilot** (`github-copilot`) — W:95 D:90
- **Resend** (`resend`) — W:85 D:95
- **Cal.com** (`cal-com`) — W:95 D:95
- **Unkey** (`unkey`) — W:75 D:85
- **Trigger.dev** (`trigger-dev`) — W:85 D:95
- **deer-flow** (`deer-flow`) — W:85 D:95
- **nanobot** (`nanobot`) — W:85 D:95
- **claude-code-templates** (`claude-code-templates`) — W:75 D:85
- **container** (`container`) — W:85 D:95
- **NotebookLM** (`notebooklm`) — W:85 D:90
- **Jellypod** (`jellypod`) — W:65 D:85
- **Podhoc** (`podhoc`) — W:55 D:85
- **Podcastify** (`podcastify`) — W:65 D:85
- **Parlant** (`parlant`) — W:75 D:85
- **Agenta** (`agenta`) — W:70 D:85
- **Beam** (`beam`) — W:85 D:90
- **Botpress** (`botpress`) — W:85 D:90
- **CopilotKit** (`copilotkit`) — W:75 D:85
- **Daytona** (`daytona`) — W:85 D:90
- **Dify** (`dify`) — W:85 D:90
- **E2B** (`e2b`) — W:75 D:85
- **FastGPT** (`fastgpt`) — W:85 D:90
- **Chroma** (`chroma`) — W:85 D:85
- **Deepnote** (`deepnote`) — W:75 D:85
- **Helicone** (`helicone`) — W:75 D:85
- **Letta** (`letta`) — W:82 D:75
- **Mem0** (`mem0`) — W:85 D:90
- **Weaviate** (`weaviate`) — W:85 D:90
- **LiteLLM** (`litellm`) — W:85 D:90
- **Amical** (`amical`) — W:65 D:85
- **Skyvern** (`skyvern`) — W:75 D:85
- **Atomic CRM** (`atomic-crm`) — W:65 D:85
- **Erxes** (`erxes`) — W:75 D:85
- **EspoCRM** (`espocrm`) — W:75 D:85
- **Odoo** (`odoo`) — W:95 D:85
- **Relaticle** (`relaticle`) — W:65 D:85
- **Lago** (`lago`) — W:75 D:85
- **Meteroid** (`meteroid`) — W:65 D:85
- **Midday** (`midday`) — W:75 D:85
- **OpenBB** (`openbb`) — W:85 D:90
- **OpenMeter** (`openmeter`) — W:65 D:80
- **Polar** (`polar`) — W:75 D:85
- **Spliit** (`spliit`) — W:65 D:85
- **Novu** (`novu`) — W:80 D:85
