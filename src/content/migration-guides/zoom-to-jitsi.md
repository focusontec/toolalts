---
title: "Migrate from Zoom to Jitsi Meet: Complete Guide"
---

## Before You Start

**What you'll need:**
- A Jitsi Meet instance (use [meet.jit.si](https://meet.jit.si) for free, or self-host)
- 15-30 minutes

**What transfers well:**
- Nothing to "transfer" — Jitsi is meeting-based, not account-based

**What you'll gain:**
- No account required for participants
- No time limits
- No participant limits (self-hosted)
- End-to-end encryption
- Full privacy — no data sent to third parties

---

## Step 1: Try Jitsi Meet First

Before migrating, test with your team:

1. Go to [meet.jit.si](https://meet.jit.si)
2. Create a meeting room (e.g., `meet.jit.si/your-team-standup`)
3. Share the link with your team
4. Test: screen sharing, chat, reactions, recording

No downloads, no sign-ups. It just works in the browser.

## Step 2: Self-Host for Privacy (Optional)

For full control, self-host Jitsi Meet:

**Docker (easiest):**

```bash
git clone https://github.com/jitsi/docker-jitsi-meet
cd docker-jitsi-meet
cp env.example .env
./gen-passwords.sh
docker compose up -d
```

**Quick install (Ubuntu/Debian):**

```bash
curl -sL https://download.jitsi.org/jitsi-key.gpg.key | sudo gpg --dearmor -o /usr/share/keyrings/jitsi-archive-keyring.gpg
echo "deb [signed-by=/usr/share/keyrings/jitsi-archive-keyring.gpg] https://download.jitsi.org stable/" | sudo tee /etc/apt/sources.list.d/jitsi-stable.list
sudo apt update && sudo apt install jitsi-meet
```

## Step 3: Configure for Your Team

Key settings in `/etc/jitsi/meet/your-domain-config.js`:

- **Authentication:** Set up LDAP or OAuth for host authentication
- **Guest access:** Allow guests to join without accounts (default: on)
- **Recording:** Enable local recording or configure cloud storage
- **Streaming:** Enable YouTube/RTMP streaming for large meetings

---

## Common Issues

**Q: Can I schedule meetings in advance?**
A: Jitsi doesn't have built-in scheduling. Use Google Calendar or any calendar app and include the Jitsi room link. The room persists — the same URL works anytime.

**Q: How many participants can join?**
A: meet.jit.si supports ~100 participants. Self-hosted instances can handle more with proper server resources (4 CPU cores + 8GB RAM recommended for 100+ participants).

**Q: Is there a mobile app?**
A: Yes — Jitsi Meet apps are available for iOS and Android, both free and open-source.

---

## Summary

Migrating from Zoom to Jitsi Meet is the simplest migration — there's nothing to transfer since Jitsi is meeting-based. Just share a Jitsi link instead of a Zoom link. Self-hosting takes 15-30 minutes with Docker. You get unlimited meeting time, no participant limits, and full privacy.

**Total estimated time:** 15-30 minutes
**Difficulty:** Easy
**Cost:** Free (public or self-hosted)
