---
title: "Migrate from Slack to Rocket.Chat: Complete Guide"
---

## Before You Start

**What you'll need:**
- A Rocket.Chat instance (self-hosted or cloud)
- Slack workspace admin access
- 2-4 hours depending on workspace size

**What transfers well:**
- Public and private channels
- Direct messages
- Users and roles
- File attachments

**What doesn't transfer:**
- Slack apps and integrations (need reconfiguration)
- Slack workflows
- Custom emoji (need manual re-upload)
- Thread history in some edge cases

---

## Step 1: Set Up Rocket.Chat

**Self-hosted (recommended for full control):**

```bash
# Docker (easiest)
docker compose up -d

# Or install directly
curl -L https://install.rocket.chat -o setup.sh
bash setup.sh
```

**Cloud-hosted:** Sign up at [rocket.chat/cloud](https://rocket.chat/cloud) for managed hosting starting at $2/user/month.

Complete the initial setup wizard: create admin account, set organization name, configure basic settings.

## Step 2: Export Data from Slack

1. Go to **Slack Workspace Settings** → **Import/Export Data**
2. Click **Export** and select the date range
3. Slack will email you a download link when the export is ready
4. Download the `.zip` file containing:
   - `channels.json` — channel list and metadata
   - `users.json` — user profiles
   - `*.json` files per channel — message history
   - File attachments

> **Note:** Slack's standard export only includes public channels. For private channels and DMs, you need Slack's Corporate export (requires Business+ or Enterprise Grid plan).

## Step 3: Import into Rocket.Chat

1. In Rocket.Chat, go to **Administration** → **Import**
2. Select **Slack** as the import source
3. Upload your Slack export `.zip` file
4. Rocket.Chat will parse the data and show a preview:
   - Channels to import
   - Users to create
   - Messages count
5. Map Slack users to Rocket.Chat users (or create new ones)
6. Click **Start Import**

The import runs in the background. Large workspaces (10,000+ messages) may take 30-60 minutes.

## Step 4: Verify Channel Structure

After import, check that:
- All channels appear with correct names
- Channel topics and descriptions are preserved
- Pinned messages are intact
- File attachments are accessible

If channels are missing, check the import logs under **Administration** → **Import** → **History**.

## Step 5: Reconfigure Integrations

Slack integrations don't transfer. Set up equivalents in Rocket.Chat:

| Slack Integration | Rocket.Chat Equivalent |
|---|---|
| Slack bots | Rocket.Chat bots (built-in) |
| Webhooks | Incoming/Outgoing Webhooks |
| GitHub notifications | GitHub integration (built-in) |
| Google Calendar | Calendar app (marketplace) |
| Custom apps | Rocket.Chat Apps Engine |

To set up webhooks: **Administration** → **Integrations** → **New Integration**

## Step 6: Configure Notifications

Rocket.Chat supports multiple notification channels:
- Desktop browser notifications
- Mobile push (iOS/Android apps)
- Email notifications
- SMS (via Twilio integration)

Configure under **Administration** → **Push** and **Email** settings.

## Step 7: Invite Your Team

1. Go to **Administration** → **Users** → **Invite**
2. Enter email addresses or share the invite link
3. Users can download Rocket.Chat desktop/mobile apps:
   - Desktop: [rocket.chat/download](https://rocket.chat/download)
   - iOS/Android: Search "Rocket.Chat" in app stores

## Step 8: Decommission Slack

After confirming everything works:
1. Post a final message in Slack directing team to Rocket.Chat
2. Set Slack channel topics to reference Rocket.Chat
3. After 30 days, cancel your Slack subscription

---

## Common Issues

**Q: The import is taking forever.**
A: Large Slack workspaces can take hours. Check the import progress under **Administration** → **Import**. If it stalls, try breaking the export into smaller date ranges.

**Q: Private channel messages aren't imported.**
A: Slack's standard export only includes public channels. You need a Business+ or Enterprise Grid plan for full export. Alternatively, use Slack's API to export private channel data programmatically.

**Q: File attachments aren't loading.**
A: Check that your Rocket.Chat instance has sufficient storage. File paths in the import may need adjustment if your Slack workspace used custom file storage.

---

## Summary

Migrating from Slack to Rocket.Chat takes 2-4 hours. The built-in Slack importer handles channels, messages, and users. The main limitation is private channel export (requires Slack Business+ plan). Once migrated, you get full data ownership, unlimited message history, and no per-user pricing.

**Total estimated time:** 2-4 hours
**Difficulty:** Hard
**Cost:** Free (self-hosted) or $2/user/month (cloud)
