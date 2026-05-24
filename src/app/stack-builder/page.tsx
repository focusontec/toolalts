import type { Metadata } from "next";
import { StackBuilderClient } from "@/components/StackBuilderClient";

export const metadata: Metadata = {
  title: "Stack Builder — Build Your Ideal Tool Stack | ToolAlts",
  description:
    "Select your role and preferences to get a curated set of recommended tools for your workflow. Find the perfect combination of communication, development, and productivity tools.",
  alternates: {
    canonical: "https://www.toolalts.dev/stack-builder/",
  },
  openGraph: {
    type: "website",
    title: "Stack Builder — Build Your Ideal Tool Stack | ToolAlts",
    description:
      "Select your role and preferences to get a curated set of recommended tools for your workflow.",
    url: "https://www.toolalts.dev/stack-builder/",
    siteName: "ToolAlts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Stack Builder — Build Your Ideal Tool Stack | ToolAlts",
    description:
      "Select your role and preferences to get a curated set of recommended tools for your workflow.",
  },
};

export default function StackBuilderPage() {
  return <StackBuilderClient />;
}
