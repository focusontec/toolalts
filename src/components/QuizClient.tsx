"use client";

import { useState } from "react";
import Link from "next/link";
import toolsData from "@/../data/tools.json";
import type { Tool } from "@/lib/types";

const tools = (toolsData as Tool[]).filter((t) => t.status === "active");

const questions = [
  {
    id: "category",
    question: "What type of tool are you looking for?",
    options: [
      { value: "communication", label: "Communication & Chat", emoji: "💬" },
      { value: "development", label: "Development & DevOps", emoji: "⚙️" },
      { value: "productivity", label: "Productivity & Notes", emoji: "📝" },
      { value: "design", label: "Design & Creative", emoji: "🎨" },
      { value: "project-management", label: "Project Management", emoji: "📋" },
    ],
  },
  {
    id: "teamSize",
    question: "How big is your team?",
    options: [
      { value: "solo", label: "Just me", emoji: "🧑" },
      { value: "small", label: "2–10 people", emoji: "👥" },
      { value: "medium", label: "11–50 people", emoji: "🏢" },
      { value: "large", label: "50+ people", emoji: "🏗️" },
    ],
  },
  {
    id: "budget",
    question: "What's your budget?",
    options: [
      { value: "free", label: "Free only", emoji: "🆓" },
      { value: "low", label: "Under $10/user/mo", emoji: "💰" },
      { value: "medium", label: "Under $25/user/mo", emoji: "💰💰" },
      { value: "any", label: "No budget limit", emoji: "💎" },
    ],
  },
  {
    id: "priority",
    question: "What matters most to you?",
    options: [
      { value: "ease", label: "Ease of use", emoji: "✨" },
      { value: "features", label: "Most features", emoji: "🚀" },
      { value: "integrations", label: "Integrations", emoji: "🔗" },
      { value: "privacy", label: "Privacy & self-hosting", emoji: "🔒" },
    ],
  },
  {
    id: "openSource",
    question: "Do you prefer open source?",
    options: [
      { value: "yes", label: "Yes, open source only", emoji: "📖" },
      { value: "prefer", label: "Prefer open source, but flexible", emoji: "🤝" },
      { value: "no", label: "No preference", emoji: "🤷" },
    ],
  },
];

function scoreTool(tool: Tool, answers: Record<string, string>): number {
  let score = 0;

  // Category match (most important)
  if (tool.category === answers.category) score += 50;

  // Open source preference
  if (answers.openSource === "yes" && tool.openSource) score += 20;
  if (answers.openSource === "yes" && !tool.openSource) score -= 30;
  if (answers.openSource === "prefer" && tool.openSource) score += 10;

  // Budget
  const price = tool.pricing[0]?.price || "$0";
  const isFree = price === "$0" || price.toLowerCase().includes("free");
  if (answers.budget === "free" && isFree) score += 20;
  if (answers.budget === "free" && !isFree) score -= 20;

  // Rating bonus
  score += (tool.rating || 0) * 4;

  // Privacy priority — boost open source
  if (answers.priority === "privacy" && tool.openSource) score += 15;

  // Features priority — boost higher-rated tools
  if (answers.priority === "features") score += (tool.rating || 0) * 2;

  return score;
}

function getRecommendations(answers: Record<string, string>): Tool[] {
  const scored = tools
    .map((tool) => ({ tool, score: scoreTool(tool, answers) }))
    .sort((a, b) => b.score - a.score);

  return scored.slice(0, 5).map((s) => s.tool);
}

export function QuizClient() {
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [results, setResults] = useState<Tool[] | null>(null);

  const current = questions[step];

  function handleAnswer(value: string) {
    const newAnswers = { ...answers, [current.id]: value };
    setAnswers(newAnswers);

    if (step < questions.length - 1) {
      setStep(step + 1);
    } else {
      setResults(getRecommendations(newAnswers));
    }
  }

  function handleRestart() {
    setStep(0);
    setAnswers({});
    setResults(null);
  }

  if (results) {
    return (
      <div className="mx-auto max-w-3xl px-4 py-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            ✅ Your Top Picks
          </span>
          <h1 className="mt-4 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
            Recommended Tools for You
          </h1>
          <p className="mt-3 text-[var(--color-ink-faint)]">
            Based on your preferences, here are the best tools for your workflow.
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {results.map((tool, i) => (
            <Link
              key={tool.slug}
              href={`/tool/${tool.slug}/`}
              className="group flex items-start gap-4 rounded-xl border border-[var(--color-border)] bg-white p-5 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md"
            >
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-highlight)] text-lg font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
                    {tool.name}
                  </h3>
                  {tool.openSource && (
                    <span className="rounded-md bg-[var(--color-success-light)] px-1.5 py-0.5 text-[10px] font-semibold text-[var(--color-success)]">
                      OSS
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-[var(--color-ink-faint)]">{tool.tagline}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
                  <span className="flex items-center gap-1">
                    ⭐ {tool.rating}
                  </span>
                  <span>{tool.pricing[0]?.price || "Free"}</span>
                  <span className="capitalize">{tool.category}</span>
                </div>
              </div>
              <svg className="h-5 w-5 shrink-0 text-[var(--color-ink-faint)] transition-transform group-hover:translate-x-0.5 group-hover:text-[var(--color-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
              </svg>
            </Link>
          ))}
        </div>

        <div className="mt-10 flex justify-center gap-4">
          <button
            onClick={handleRestart}
            className="rounded-full border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-accent)]/30"
          >
            Retake Quiz
          </button>
          <Link
            href="/category/"
            className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          >
            Browse All Categories
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-border)] bg-white px-4 py-1.5 text-sm font-medium text-[var(--color-ink-muted)]">
          🧠 Tool Finder
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Find the Right Tool for Your Team
        </h1>
        <p className="mt-3 text-[var(--color-ink-faint)]">
          Answer 5 quick questions and get personalized recommendations.
        </p>
      </div>

      {/* Progress */}
      <div className="mx-auto mt-10 max-w-md">
        <div className="flex items-center justify-between text-xs text-[var(--color-ink-muted)]">
          <span>Question {step + 1} of {questions.length}</span>
          <span>{Math.round(((step + 1) / questions.length) * 100)}%</span>
        </div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[var(--color-border)]">
          <div
            className="h-full rounded-full bg-[var(--color-accent)] transition-all duration-300"
            style={{ width: `${((step + 1) / questions.length) * 100}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mt-10">
        <h2 className="text-center text-xl font-semibold text-[var(--color-ink)]">
          {current.question}
        </h2>
        <div className="mt-6 grid gap-3 sm:grid-cols-2">
          {current.options.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleAnswer(opt.value)}
              className="flex items-center gap-3 rounded-xl border border-[var(--color-border)] bg-white p-4 text-left transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md"
            >
              <span className="text-2xl">{opt.emoji}</span>
              <span className="font-medium text-[var(--color-ink)]">{opt.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Back button */}
      {step > 0 && (
        <div className="mt-8 text-center">
          <button
            onClick={() => setStep(step - 1)}
            className="text-sm text-[var(--color-ink-muted)] hover:text-[var(--color-accent)]"
          >
            ← Back to previous question
          </button>
        </div>
      )}
    </div>
  );
}
