---
title: "Migrate from Jira to Plane: Complete Guide"
---

## Before You Start

**What you'll need:**
- Jira admin access (Cloud, Server, or Data Center)
- A Plane workspace (cloud at [plane.so](https://plane.so) or self-hosted)
- 1-2 hours depending on project size

**What transfers well:**
- Issues with titles and descriptions
- Assignees and reporters
- Labels and priorities
- Comments
- Attachments

**What may need adjustment:**
- Issue types (imported as Work Item Types on Pro+ plans)
- Custom fields (mapped to Plane properties)
- Jira workflows (recreated as Plane states)
- Epics and Sprint data

---

## Step 1: Set Up Your Plane Workspace

1. Sign up at [plane.so](https://plane.so) or deploy self-hosted
2. Create a workspace and at least one project
3. Note your workspace URL (you'll need it for the import)

> **Note:** The Jira importer is available on Plane Cloud and all plans of the Commercial Edition for self-hosted instances.

## Step 2: Generate a Jira Personal Access Token

1. In Jira, go to **Profile** → **Personal Access Tokens**
2. Click **Create token**
3. Give it a name like "Plane Migration"
4. Copy the token — you'll need it in the next step

For Jira Server/Data Center: go to **Profile** → **Security** → **API Tokens**.

## Step 3: Run the Import

1. In Plane, click the dropdown next to your workspace name → **Workspace Settings**
2. Select **Imports** and click **Import** under the Jira section
3. In the Migration Assistant, enter:
   - Your Jira Personal Access Token
   - Your Jira user email
   - Your Jira domain (e.g., `yourcompany.atlassian.net`)
4. Click **Connect Jira** to verify the connection

## Step 4: Configure the Import

After connecting:

1. **Select Plane project:** Choose where to import Jira data
2. **Select Jira project:** Choose which Jira project to import from
3. **Import users:** Either upload a CSV of users or skip and add them manually later
   > If you skip user import, all issues will show the migration performer as assignee
4. **Map states:** Match Jira statuses to Plane states
   - Use **Auto create and map** to automatically create missing states
   - Or manually map each Jira status to an existing Plane state

## Step 5: Run and Verify

1. Click **Import** to start the migration
2. Monitor progress in the import history
3. After completion, verify:
   - Issue counts match
   - Comments are preserved
   - Assignees are correctly mapped
   - Attachments are accessible

## Step 6: Post-Migration Cleanup

- **Rebuild boards:** Create Plane views that match your Jira board layouts
- **Set up cycles:** Plane's cycles replace Jira sprints
- **Configure issue types:** On Pro+ plans, map imported issue types to Plane's Work Item Types
- **Invite team:** Send invites to team members who weren't imported

---

## Common Issues

**Q: The import fails with "Authentication error".**
A: Double-check your Personal Access Token hasn't expired and your email matches the Jira account. For Jira Cloud, ensure API token access is enabled.

**Q: Custom fields aren't showing up.**
A: Jira custom fields import as Plane properties. Some complex field types (cascading selects, multi-user pickers) may need manual recreation.

**Q: Sprint data isn't imported.**
A: Plane uses "Cycles" instead of sprints. Sprint dates and names can be recreated manually, or you can use Plane's API to bulk-create cycles from your Jira sprint data.

---

## Summary

Plane has a built-in Jira importer that handles the heavy lifting. The process takes 1-2 hours and transfers issues, comments, users, and attachments. The main post-migration work is rebuilding board views and mapping sprints to cycles. Plane is free for up to 500 issues, with Pro plans starting at $7/user/month.

**Total estimated time:** 1-2 hours
**Difficulty:** Medium
**Cost:** Free (up to 500 issues) or $7/user/month (Pro)
