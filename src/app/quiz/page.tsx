import type { Metadata } from "next";
import { QuizClient } from "@/components/QuizClient";

export const metadata: Metadata = {
  title: "Find the Right Tool for Your Team — Free Quiz | ToolAlts",
  description:
    "Answer 5 quick questions and get personalized software recommendations. Find the best communication, development, productivity, and design tools for your team.",
  alternates: {
    canonical: "https://www.toolalts.dev/quiz/",
  },
  openGraph: {
    type: "website",
    title: "Find the Right Tool for Your Team — Free Quiz | ToolAlts",
    description:
      "Answer 5 quick questions and get personalized software recommendations.",
    url: "https://www.toolalts.dev/quiz/",
    siteName: "ToolAlts",
  },
  twitter: {
    card: "summary_large_image",
    title: "Find the Right Tool for Your Team — Free Quiz | ToolAlts",
    description:
      "Answer 5 quick questions and get personalized software recommendations.",
  },
};

export default function QuizPage() {
  return <QuizClient />;
}
