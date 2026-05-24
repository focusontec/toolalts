import type { Metadata } from "next";
import { MigrationGuidesClient } from "@/components/MigrationGuidesClient";
import { allMigrationGuides } from "@/lib/migration-guides";

export const metadata: Metadata = {
  title: "Migration Guides — Switch to Open Source | ToolAlts",
  description:
    "Step-by-step guides to migrate from proprietary SaaS tools to open source alternatives. Covers Notion, Slack, Figma, Jira, GitHub, Zoom, and more.",
  alternates: {
    canonical: "https://www.toolalts.dev/migration-guides/",
  },
  openGraph: {
    type: "website",
    title: "Migration Guides — Switch to Open Source | ToolAlts",
    description:
      "Step-by-step guides to migrate from proprietary SaaS tools to open source alternatives.",
    url: "https://www.toolalts.dev/migration-guides/",
    siteName: "ToolAlts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Migration Guides — Switch to Open Source | ToolAlts",
    description:
      "Step-by-step guides to migrate from proprietary SaaS tools to open source alternatives.",
  },
};

export default function MigrationGuidesPage() {
  return <MigrationGuidesClient guides={allMigrationGuides} />;
}
