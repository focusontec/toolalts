import fs from "fs";
import path from "path";

const COMPARISONS_PATH = path.resolve(__dirname, "../data/comparisons.json");
const CONTENT_DIR = path.resolve(__dirname, "../src/content/comparisons");

interface ComparisonPair {
  a: string;
  b: string;
}

interface ComparisonsData {
  comparisons?: ComparisonPair[];
}

function toKebabCase(str: string): string {
  return str
    .trim()
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-");
}

function capitalize(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function formatDate(date: Date): string {
  return date.toISOString().split("T")[0];
}

function generateMarkdown(pair: ComparisonPair): string {
  const a = capitalize(pair.a);
  const b = capitalize(pair.b);
  const slugA = toKebabCase(pair.a);
  const slugB = toKebabCase(pair.b);
  const today = formatDate(new Date());

  return `---
title: "${a} vs ${b}: Which is Better in 2025?"
date: "${today}"
---

## Overview
Brief intro about both tools...

## Feature Comparison
| Feature | ${a} | ${b} |
|---------|------|------|
| Core Feature | ... | ... |
| Collaboration | ... | ... |
| Integrations | ... | ... |
| Mobile App | ... | ... |
| Offline Support | ... | ... |

## Pricing

### ${a}
- Free plan: ...
- Paid plan: ...

### ${b}
- Free plan: ...
- Paid plan: ...

## When to Choose ${a}
...

## When to Choose ${b}
...

## Verdict
...

<!-- TODO: Integrate LLM to auto-generate detailed comparison content for ${a} vs ${b} -->
`;
}

async function main() {
  if (!fs.existsSync(COMPARISONS_PATH)) {
    console.error(`comparisons.json not found at ${COMPARISONS_PATH}`);
    process.exit(1);
  }

  const raw = fs.readFileSync(COMPARISONS_PATH, "utf-8");
  const data: ComparisonsData = JSON.parse(raw);
  const pairs = data.comparisons || [];

  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
  }

  let generated = 0;
  let skipped = 0;

  for (const pair of pairs) {
    const slug = `${toKebabCase(pair.a)}-vs-${toKebabCase(pair.b)}`;
    const filePath = path.join(CONTENT_DIR, `${slug}.md`);

    if (fs.existsSync(filePath)) {
      console.log(`Skipping existing comparison: ${slug}.md`);
      skipped++;
      continue;
    }

    const content = generateMarkdown(pair);
    fs.writeFileSync(filePath, content, "utf-8");
    console.log(`Generated comparison: ${slug}.md`);
    generated++;
  }

  console.log("\n========== GENERATION SUMMARY ==========");
  console.log(`Total pairs:   ${pairs.length}`);
  console.log(`Generated:     ${generated}`);
  console.log(`Skipped:       ${skipped}`);
  console.log("========================================\n");
}

main().catch((err) => {
  console.error("Fatal error:", err);
  process.exit(1);
});
