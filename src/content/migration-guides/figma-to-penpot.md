---
title: "Migrate from Figma to Penpot: Complete Guide"
---

## Before You Start

**What you'll need:**
- Figma desktop or web app
- A Penpot account ([penpot.app](https://penpot.app) for cloud, or self-hosted)
- 30-60 minutes depending on project count

**What transfers well:**
- Page layouts and component structure
- Text styles and typography
- Colors and gradients
- Basic shapes and frames

**What may need adjustment:**
- Auto Layout (Penpot uses Flex Layout, slightly different behavior)
- Complex component variants
- Figma-specific plugins and effects

---

## Step 1: Install the Penpot Exporter Plugin

The official Penpot team maintains a Figma plugin for direct export:

1. Open Figma
2. Go to [Figma Community → Penpot Exporter](https://www.figma.com/community/plugin/1219369440655168734/penpot-exporter)
3. Click **Install**
4. The plugin will appear in your Figma plugins menu

> **Plugin stats:** 400+ GitHub stars, actively maintained, latest release v0.20.1 (April 2026).

## Step 2: Export Your Figma Files

1. Open the Figma file you want to migrate
2. Run the plugin: **Plugins** → **Penpot Exporter**
3. Select which pages/frames to export (or export everything)
4. Click **Export to Penpot**
5. The plugin generates a `.penpot` file — download it

For multiple files, repeat this process for each one.

## Step 3: Import into Penpot

1. Log into your Penpot instance
2. Create a new project (or use an existing one)
3. Click **Import** in the project menu
4. Select the `.penpot` file from Step 2
5. Penpot will import the design — this usually takes 10-60 seconds per file

## Step 4: Review and Adjust

After import, check these common areas:

- **Auto Layout → Flex Layout:** Penpot's Flex Layout is similar to Figma's Auto Layout but has some behavioral differences. Check that spacing and alignment are correct.
- **Component variants:** Figma variants may import as separate components. You may need to manually group them in Penpot.
- **Fonts:** Ensure the same fonts are available. Penpot supports Google Fonts natively; for custom fonts, upload them under **Settings** → **Fonts**.
- **Prototyping:** Figma prototypes don't transfer. Rebuild interactions using Penpot's prototype mode.

---

## Common Issues

**Q: The plugin says "Export failed" for some frames.**
A: This usually happens with very complex designs or unsupported Figma features (e.g., advanced prototyping, boolean operations on groups). Try exporting smaller sections individually.

**Q: Colors look different after import.**
A: Check color profiles. Figma uses sRGB by default; Penpot may render colors slightly differently. Adjust in Penpot's color picker if needed.

**Q: Can I go back to Figma?**
A: Penpot files are open format (.penpot is a zip of SVG + JSON). You can export individual frames as SVG and import them into Figma, but you'll lose component relationships.

---

## Summary

Migrating from Figma to Penpot is the easiest of all tool migrations, thanks to the official Penpot Exporter plugin. Most designs transfer cleanly in 30-60 minutes. The main adjustments needed are Auto Layout → Flex Layout and rebuilding prototypes. Penpot is free and open-source, with no per-editor pricing.

**Total estimated time:** 30-60 minutes
**Difficulty:** Easy
**Cost:** Free (cloud or self-hosted)
