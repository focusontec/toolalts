"use client";

import { useState } from "react";
import Link from "next/link";
import toolsData from "@/../data/tools.json";
import type { Tool } from "@/lib/types";

const tools = (toolsData as Tool[]).filter((t) => t.status === "active");

const roles = [
  { id: "developer", label: "Developer", emoji: "👨‍💻", categories: ["development", "communication", "project-management"] },
  { id: "designer", label: "Designer", emoji: "🎨", categories: ["design", "communication", "productivity"] },
  { id: "pm", label: "Product Manager", emoji: "📋", categories: ["project-management", "communication", "productivity"] },
  { id: "marketing", label: "Marketing", emoji: "📢", categories: ["productivity", "communication", "design"] },
  { id: "founder", label: "Founder / Startup", emoji: "🚀", categories: ["communication", "project-management", "development", "design", "productivity"] },
];

interface StackItem {
  category: string;
  categoryLabel: string;
  tool: Tool;
  reason: string;
}

const categoryLabels: Record<string, string> = {
  communication: "Communication",
  development: "Development",
  productivity: "Productivity",
  design: "Design",
  "project-management": "Project Management",
};

const reasons: Record<string, Record<string, string>> = {
  communication: {
    "rocket-chat": "Self-hosted, unlimited message history, no per-user cost",
    mattermost: "Developer-friendly, extensive integrations",
    slack: "Best integrations ecosystem, widely adopted",
    discord: "Great for communities, free for most use cases",
  },
  development: {
    gitea: "Lightweight, fast, self-hosted Git forge",
    gitlab: "Complete DevOps platform with built-in CI/CD",
    github: "Largest developer community, excellent CI/CD",
  },
  productivity: {
    obsidian: "Local-first, privacy-focused, 1500+ plugins",
    outline: "Beautiful team wiki, open-source, self-hosted",
    notion: "All-in-one workspace, great for teams",
    bookstack: "Simple documentation platform, self-hosted",
    nextcloud: "Self-hosted cloud storage and collaboration",
  },
  design: {
    penpot: "Open-source design tool, no per-editor cost",
    figma: "Industry standard, best collaboration features",
    excalidraw: "Quick whiteboarding, open-source",
  },
  "project-management": {
    plane: "Modern, open-source, Jira alternative",
    linear: "Fast, beautiful, developer-focused",
    focalboard: "Open-source, self-hosted, Notion-like boards",
    "github-issues": "Free with GitHub, simple and effective",
  },
};

function buildStack(roleId: string, budget: string, openSource: boolean): StackItem[] {
  const role = roles.find((r) => r.id === roleId);
  if (!role) return [];

  const stack: StackItem[] = [];

  for (const category of role.categories) {
    let candidates = tools.filter((t) => t.category === category);

    if (openSource) {
      const ossOnly = candidates.filter((t) => t.openSource);
      if (ossOnly.length > 0) candidates = ossOnly;
    }

    if (budget === "free") {
      const freeOnly = candidates.filter((t) => {
        const price = t.pricing[0]?.price || "$0";
        return price === "$0" || price.toLowerCase().includes("free");
      });
      if (freeOnly.length > 0) candidates = freeOnly;
    }

    // Sort by rating
    candidates.sort((a, b) => (b.rating || 0) - (a.rating || 0));

    const tool = candidates[0];
    if (tool) {
      stack.push({
        category,
        categoryLabel: categoryLabels[category] || category,
        tool,
        reason: reasons[category]?.[tool.slug] || `Top-rated ${categoryLabels[category]?.toLowerCase()} tool`,
      });
    }
  }

  return stack;
}

export function StackBuilderClient() {
  const [selectedRole, setSelectedRole] = useState<string | null>(null);
  const [budget, setBudget] = useState("any");
  const [openSource, setOpenSource] = useState(false);
  const [stack, setStack] = useState<StackItem[] | null>(null);

  function handleBuild() {
    if (!selectedRole) return;
    const result = buildStack(selectedRole, budget, openSource);
    setStack(result);
  }

  function handleReset() {
    setSelectedRole(null);
    setBudget("any");
    setOpenSource(false);
    setStack(null);
  }

  if (stack) {
    const role = roles.find((r) => r.id === selectedRole);
    const totalMonthly = stack.reduce((sum, item) => {
      const price = item.tool.pricing[0]?.price || "$0";
      const num = parseFloat(price.replace(/[^0-9.]/g, "")) || 0;
      return sum + num;
    }, 0);

    return (
      <div className="mx-auto max-w-4xl px-4 py-10">
        <div className="text-center">
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-1.5 text-sm font-medium text-emerald-700">
            ✅ Your Recommended Stack
          </span>
          <h1 className="mt-4 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
            {role?.emoji} {role?.label} Stack
          </h1>
          <p className="mt-3 text-[var(--color-ink-faint)]">
            {openSource ? "Open source tools" : "Best tools"} for your workflow
            {totalMonthly > 0 ? ` · ~$${Math.round(totalMonthly)}/user/mo` : " · Free"}
          </p>
        </div>

        <div className="mt-10 space-y-4">
          {stack.map((item) => (
            <Link
              key={item.tool.slug}
              href={`/tool/${item.tool.slug}/`}
              className="group flex items-start gap-5 rounded-xl border border-[var(--color-border)] bg-white p-6 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md"
            >
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[var(--color-highlight)] text-lg">
                {item.tool.logo ? (
                  <img src={item.tool.logo} alt="" className="h-8 w-8 rounded" />
                ) : (
                  <span className="text-white font-bold">{item.tool.name[0]}</span>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-accent)]">
                  {item.categoryLabel}
                </p>
                <h3 className="mt-1 text-lg font-semibold text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
                  {item.tool.name}
                </h3>
                <p className="mt-1 text-sm text-[var(--color-ink-faint)]">{item.reason}</p>
                <div className="mt-2 flex items-center gap-3 text-xs text-[var(--color-ink-muted)]">
                  <span>⭐ {item.tool.rating}</span>
                  <span>{item.tool.pricing[0]?.price || "Free"}</span>
                  {item.tool.openSource && (
                    <span className="rounded-md bg-[var(--color-success-light)] px-1.5 py-0.5 font-semibold text-[var(--color-success)]">
                      OSS
                    </span>
                  )}
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
            onClick={handleReset}
            className="rounded-full border border-[var(--color-border)] px-6 py-2.5 text-sm font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-accent)]/30"
          >
            Build Another Stack
          </button>
          <Link
            href="/calculator/"
            className="rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold text-white transition-all hover:opacity-90"
          >
            Calculate Savings
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent-light)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent)]">
          🧰 Stack Builder
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
          Build Your Ideal Tool Stack
        </h1>
        <p className="mt-3 text-[var(--color-ink-faint)]">
          Select your role and preferences to get a curated set of tools for your workflow.
        </p>
      </div>

      {/* Role selection */}
      <div className="mt-10">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">What's your role?</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRole(role.id)}
              className={`flex items-center gap-3 rounded-xl border p-4 text-left transition-all ${
                selectedRole === role.id
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/30"
              }`}
            >
              <span className="text-2xl">{role.emoji}</span>
              <span className="font-medium text-[var(--color-ink)]">{role.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Budget */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Budget preference</h2>
        <div className="mt-4 flex flex-wrap gap-3">
          {[
            { value: "free", label: "Free only" },
            { value: "low", label: "Under $15/user/mo" },
            { value: "any", label: "No limit" },
          ].map((opt) => (
            <button
              key={opt.value}
              onClick={() => setBudget(opt.value)}
              className={`rounded-full border px-4 py-2 text-sm font-medium transition-all ${
                budget === opt.value
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-light)] text-[var(--color-accent)]"
                  : "border-[var(--color-border)] bg-white text-[var(--color-ink-muted)] hover:border-[var(--color-accent)]/30"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Open source toggle */}
      <div className="mt-6">
        <button
          onClick={() => setOpenSource(!openSource)}
          className="flex items-center gap-3 text-sm"
        >
          <div className={`flex h-6 w-11 items-center rounded-full transition-colors ${openSource ? "bg-[var(--color-accent)]" : "bg-[var(--color-border)]"}`}>
            <div className={`h-5 w-5 rounded-full bg-white shadow-sm transition-transform ${openSource ? "translate-x-5.5" : "translate-x-0.5"}`} />
          </div>
          <span className="font-medium text-[var(--color-ink)]">Open source only</span>
        </button>
      </div>

      {/* Build button */}
      <div className="mt-10 text-center">
        <button
          onClick={handleBuild}
          disabled={!selectedRole}
          className="rounded-full bg-[var(--color-accent)] px-8 py-3 text-base font-semibold text-white transition-all hover:opacity-90 disabled:opacity-40"
        >
          Build My Stack
        </button>
      </div>
    </div>
  );
}
