---
title: "Migrate from Notion to Obsidian: Complete Guide"
---

## Before You Start

**What you'll need:**
- Notion desktop or web app (for export)
- Obsidian installed locally ([download here](https://obsidian.md))
- 1-2 hours depending on workspace size

**What transfers well:**
- Page content and basic formatting
- Images (with some cleanup)
- Nested page hierarchy

**What doesn't transfer:**
- Notion databases (exported as CSV, lose views/filters/relations)
- Toggle blocks (become raw HTML)
- Colored text and highlights
- Real-time collaboration features

---

## Step 1: Export Your Notion Workspace

1. Open Notion and go to **Settings & Members** → **Settings**
2. Scroll to **Export all workspace content**
3. Select **Markdown & CSV** format
4. Click **Export** and choose a destination folder
5. Wait for the export to complete — large workspaces can take several minutes

> **Tip:** If the desktop app freezes during export, use the web version at notion.so instead.

Notion will produce a `.zip` file containing:
- `.md` files for each page
- `.csv` files for each database
- Folders for images and attachments

## Step 2: Clean Up Exported Files

Notion's export has known issues that need fixing:

**Remove UUID suffixes from filenames.** Notion appends 32-character hex IDs to every file. Use a bulk rename tool or script:

```bash
# macOS/Linux: remove the UUID suffix
for f in *.md; do
  mv "$f" "$(echo "$f" | sed 's/ [a-f0-9]\{32\}\.md/.md/')"
done
```

**Fix image paths.** Images are exported into subfolders. Move them to a central `attachments/` folder in your Obsidian vault and update references in your markdown files.

**Remove broken HTML.** Notion exports callout blocks as raw `<aside>` tags. Search for `<aside` and replace with Obsidian callout syntax:

```markdown
> [!note]
> Your callout text here
```

## Step 3: Create Your Obsidian Vault

1. Open Obsidian
2. Click **Open folder as vault** (or **Create new vault**)
3. Point it to the cleaned-up export folder
4. Obsidian will index all `.md` files automatically

Your notes should now appear in the sidebar with their original hierarchy preserved as folders.

## Step 4: Rebuild Databases as Dataview Queries

Notion databases don't export cleanly. Here's how to rebuild the most common patterns:

**For simple tables:** Convert the CSV export to markdown tables manually or with a script.

**For filtered views:** Install the [Dataview](https://github.com/blacksmithgu/obsidian-dataview) community plugin and create queries:

```dataview
TABLE status, priority, due-date
FROM #project
WHERE status != "done"
SORT due-date ASC
```

**For Kanban boards:** Install the [Kanban](https://github.com/mgmeyers/obsidian-kanban) plugin and create boards from your task notes.

## Step 5: Set Up Sync (Optional)

Obsidian notes are local by default. For multi-device access:

- **Obsidian Sync** ($5/month): Official, end-to-end encrypted sync
- **iCloud/Google Drive**: Free, but less reliable for conflict resolution
- **Git**: Free, version-controlled, best for developers

## Step 6: Install Essential Plugins

To replicate Notion features in Obsidian:

| Notion Feature | Obsidian Plugin |
|---|---|
| Databases | Dataview |
| Kanban boards | Kanban |
| Calendar view | Calendar |
| Templates | Templater |
| Daily notes | Daily Notes (built-in) |
| Graph view | Built-in |
| Collaboration | None (Obsidian is single-user) |

---

## Common Issues

**Q: My images aren't showing up.**
A: Check that image paths in your markdown files point to the correct location. Use Obsidian's settings to configure the attachment folder location under **Files & Links** → **Default location for new attachments**.

**Q: Notion databases are just CSV files now.**
A: This is a known limitation. You'll need to rebuild database views using the Dataview plugin or convert them to markdown tables. There is a [$5,000 bounty](https://github.com/obsidianmd/obsidian-importer/issues/421) on the Obsidian Importer repo for better database migration support.

**Q: Can I go back to Notion?**
A: Your Obsidian notes are plain markdown files. You can re-import them into Notion, but you'll lose any Obsidian-specific formatting (callouts, Dataview queries, etc.).

---

## Summary

Migrating from Notion to Obsidian takes 1-2 hours for a typical workspace. The main challenges are cleaning up Notion's messy export (UUID filenames, broken images, raw HTML) and rebuilding database views as Dataview queries. Once migrated, you gain full data ownership, offline access, and a blazing-fast local app with 1,500+ community plugins.

**Total estimated time:** 1-2 hours
**Difficulty:** Medium
**Cost:** Free (Obsidian is free; Sync is optional at $5/month)
