import type { Metadata } from "next";
import { CalculatorClient } from "@/components/CalculatorClient";

export const metadata: Metadata = {
  title: "SaaS Cost Calculator — See How Much You Can Save | ToolAlts",
  description:
    "Calculate how much your team spends on SaaS tools and see potential savings by switching to open source alternatives. Free calculator with 14 popular tools.",
  alternates: {
    canonical: "https://www.toolalts.dev/calculator/",
  },
  openGraph: {
    type: "website",
    title: "SaaS Cost Calculator — See How Much You Can Save | ToolAlts",
    description:
      "Calculate how much your team spends on SaaS tools and see potential savings by switching to open source alternatives.",
    url: "https://www.toolalts.dev/calculator/",
    siteName: "ToolAlts",
  },
  twitter: {
    card: "summary_large_image",
    title: "SaaS Cost Calculator — See How Much You Can Save | ToolAlts",
    description:
      "Calculate how much your team spends on SaaS tools and see potential savings by switching to open source alternatives.",
  },
};

export default function CalculatorPage() {
  return <CalculatorClient />;
}
