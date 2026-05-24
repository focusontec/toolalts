---
title: "Migrate from GitHub to Gitea: Complete Guide"
---

## Before You Start

**What you'll need:**
- A Gitea instance (self-hosted)
- GitHub account with admin access to repositories
- Git installed locally
- 1-3 hours depending on repo count

**What transfers well:**
- Full Git history (branches, tags, commits)
- Pull requests (via API)
- Issues (via API)
- Wiki content
- Release assets

**What doesn't transfer:**
- GitHub Actions workflows (Gitea uses its own CI: Gitea Actions)
- GitHub Apps and OAuth apps
- GitHub Copilot settings
- Discussion threads

---

## Step 1: Install Gitea

**Docker (recommended):**

```bash
docker run -d --name gitea \
  -p 3000:3000 -p 2222:22 \
  -v gitea_data:/data \
  gitea/gitea:latest
```

**Binary install:**
```bash
wget https://dl.gitea.com/gitea/latest/gitea-latest-linux-amd64
chmod +x gitea-latest-linux-amd64
./gitea-latest-linux-amd64 web
```

Complete the initial setup at `http://your-server:3000`.

## Step 2: Create a Migration in Gitea

Gitea has a built-in GitHub migration tool:

1. Log into Gitea
2. Click **+** → **New Migration**
3. Select **GitHub** as the source
4. Enter your GitHub repository URL (e.g., `https://github.com/username/repo`)
5. Enter your GitHub Personal Access Token (with `repo` scope)
6. Select what to migrate:
   - ✅ Git data (branches, tags, commits)
   - ✅ Issues
   - ✅ Pull requests
   - ✅ Labels
   - ✅ Milestones
   - ✅ Releases
   - ✅ Wiki
7. Click **Migrate**

Gitea will clone the repo and import all selected data via the GitHub API.

## Step 3: For Multiple Repositories

If you have many repos, use Gitea's batch migration:

**Option A: Gitea's built-in batch (Gitea 1.21+)**

1. Go to **Site Administration** → **Packages** → **Migrations**
2. Select **GitHub** and enter your organization/user
3. Select all repos to migrate
4. Run batch migration

**Option B: Script-based approach**

```bash
#!/bin/bash
# List all GitHub repos and migrate via Gitea API
REPOS=$(curl -H "Authorization: token $GITHUB_TOKEN" \
  https://api.github.com/user/repos?per_page=100 | jq -r '.[].full_name')

for REPO in $REPOS; do
  curl -X POST "https://your-gitea.com/api/v1/repos/migrate" \
    -H "Authorization: token $GITEA_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"clone_addr\": \"https://github.com/$REPO.git\",
      \"repo_name\": \"$(basename $REPO)\",
      \"service\": \"github\",
      \"auth_token\": \"$GITHUB_TOKEN\"
    }"
done
```

## Step 4: Verify Migration

Check each repository for:
- All branches and tags present
- Issue history and comments intact
- Pull requests imported (they become "Pull Requests" in Gitea)
- Release assets downloadable
- Wiki pages accessible

## Step 5: Set Up Gitea Actions (CI/CD)

GitHub Actions don't transfer, but Gitea has its own CI that's compatible with GitHub Actions syntax:

1. Enable Gitea Actions: **Site Administration** → **Configuration** → `[actions]` → `ENABLED = true`
2. Rename `.github/workflows/` to `.gitea/workflows/` in your repos
3. Most GitHub Actions work in Gitea with minimal changes

Common changes needed:
- Replace `actions/cache` with Gitea's built-in caching
- Some third-party actions may need alternatives

## Step 6: Configure Webhooks and Integrations

Set up equivalent integrations in Gitea:
- **Webhooks:** **Repository Settings** → **Webhooks** → **Add Webhook**
- **CI/CD:** Gitea Actions (GitHub Actions compatible)
- **Container Registry:** Gitea has a built-in container registry
- **Package Registry:** Gitea supports npm, Maven, PyPI, etc.

## Step 7: Update Remote URLs

For all local clones, update the remote:

```bash
# Update remote URL
git remote set-url origin https://your-gitea.com/username/repo.git

# Verify
git remote -v
```

---

## Common Issues

**Q: Migration fails with "rate limit exceeded".**
A: GitHub's API has rate limits (5,000 requests/hour for authenticated users). Wait for the limit to reset or use a GitHub App token for higher limits.

**Q: Pull requests show wrong author.**
A: Gitea maps GitHub users to Gitea users by email. If team members haven't created Gitea accounts yet, PRs will show the migration performer as author. Have team members sign up with their same email addresses first.

**Q: GitHub Actions workflows won't run.**
A: Gitea Actions is compatible but not identical. Review each workflow for:
- Action version compatibility
- Runner image availability
- Third-party action alternatives

---

## Summary

Migrating from GitHub to Gitea takes 1-3 hours for a typical organization. Gitea's built-in GitHub migration handles repos, issues, PRs, and wikis. The main post-migration work is converting GitHub Actions to Gitea Actions and updating remote URLs. Gitea is free and open-source, with no per-user or per-repo limits.

**Total estimated time:** 1-3 hours
**Difficulty:** Medium
**Cost:** Free (self-hosted)
