"use client";

import { useState } from "react";
import Link from "next/link";

const saasTools = [
  { name: "Slack Pro", category: "communication", pricePerUser: 8.75, ossAlt: "Rocket.Chat", ossSlug: "rocket-chat" },
  { name: "Microsoft Teams Business", category: "communication", pricePerUser: 6, ossAlt: "Mattermost", ossSlug: "mattermost" },
  { name: "Zoom Business", category: "communication", pricePerUser: 13.33, ossAlt: "Jitsi Meet", ossSlug: "jitsi" },
  { name: "Notion Plus", category: "productivity", pricePerUser: 10, ossAlt: "Outline", ossSlug: "outline" },
  { name: "Confluence", category: "productivity", pricePerUser: 6, ossAlt: "BookStack", ossSlug: "bookstack" },
  { name: "Google Workspace", category: "productivity", pricePerUser: 7, ossAlt: "Nextcloud", ossSlug: "nextcloud" },
  { name: "GitHub Team", category: "development", pricePerUser: 4, ossAlt: "Gitea", ossSlug: "gitea" },
  { name: "GitLab Premium", category: "development", pricePerUser: 29, ossAlt: "GitLab CE", ossSlug: "gitlab" },
  { name: "Linear Standard", category: "project-management", pricePerUser: 8, ossAlt: "Plane", ossSlug: "plane" },
  { name: "Jira Standard", category: "project-management", pricePerUser: 8.15, ossAlt: "Focalboard", ossSlug: "focalboard" },
  { name: "Asana Premium", category: "project-management", pricePerUser: 10.99, ossAlt: "Wekan", ossSlug: "wekan" },
  { name: "Figma Professional", category: "design", pricePerUser: 15, ossAlt: "Penpot", ossSlug: "penpot" },
  { name: "Miro Business", category: "design", pricePerUser: 16, ossAlt: "Excalidraw", ossSlug: "excalidraw" },
  { name: "Calendly Teams", category: "productivity", pricePerUser: 12, ossAlt: "Cal.com", ossSlug: "cal-com" },
];

export function CalculatorClient() {
  const [teamSize, setTeamSize] = useState(20);
  const [selected, setSelected] = useState<Set<string>>(new Set(["Slack Pro", "GitHub Team", "Notion Plus", "Figma Professional"]));

  function toggle(name: string) {
    const next = new Set(selected);
    if (next.has(name)) next.delete(name);
    else next.add(name);
    setSelected(next);
  }

  const selectedTools = saasTools.filter((t) => selected.has(t.name));
  const totalMonthly = selectedTools.reduce((sum, t) => sum + t.pricePerUser * teamSize, 0);
  const totalYearly = totalMonthly * 12;
  const hostingCost = 600; // ~$50/month VPS
  const savings = totalYearly - hostingCost;

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="text-center">
        <span className="inline-flex items-center gap-2 rounded-full border border-[var(--color-accent)]/20 bg-[var(--color-accent-light)] px-4 py-1.5 text-sm font-medium text-[var(--color-accent)]">
          💰 Cost Calculator
        </span>
        <h1 className="mt-4 font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
          How Much Can You Save with Open Source?
        </h1>
        <p className="mt-3 text-[var(--color-ink-faint)]">
          Select the SaaS tools you currently use and see your potential savings.
        </p>
      </div>

      {/* Team size slider */}
      <div className="mx-auto mt-10 max-w-md rounded-xl border border-[var(--color-border)] bg-white p-6">
        <label className="text-sm font-medium text-[var(--color-ink)]">
          Team size: <span className="text-[var(--color-accent)]">{teamSize} people</span>
        </label>
        <input
          type="range"
          min={1}
          max={200}
          value={teamSize}
          onChange={(e) => setTeamSize(Number(e.target.value))}
          className="mt-3 w-full accent-[var(--color-accent)]"
        />
        <div className="mt-1 flex justify-between text-xs text-[var(--color-ink-muted)]">
          <span>1</span>
          <span>50</span>
          <span>100</span>
          <span>150</span>
          <span>200</span>
        </div>
      </div>

      {/* Tool selection */}
      <div className="mt-8">
        <h2 className="text-lg font-semibold text-[var(--color-ink)]">Select your current tools:</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {saasTools.map((tool) => (
            <button
              key={tool.name}
              onClick={() => toggle(tool.name)}
              className={`flex items-center justify-between rounded-xl border p-4 text-left transition-all ${
                selected.has(tool.name)
                  ? "border-[var(--color-accent)] bg-[var(--color-accent-light)]"
                  : "border-[var(--color-border)] bg-white hover:border-[var(--color-accent)]/30"
              }`}
            >
              <div>
                <p className="font-medium text-[var(--color-ink)]">{tool.name}</p>
                <p className="text-xs text-[var(--color-ink-muted)]">
                  ${tool.pricePerUser}/user/mo → {tool.ossAlt} (free)
                </p>
              </div>
              <div className={`flex h-6 w-6 items-center justify-center rounded-full border-2 ${
                selected.has(tool.name)
                  ? "border-[var(--color-accent)] bg-[var(--color-accent)] text-white"
                  : "border-[var(--color-border)]"
              }`}>
                {selected.has(tool.name) && (
                  <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Results */}
      {selectedTools.length > 0 && (
        <div className="mt-10 rounded-2xl border border-[var(--color-accent)]/20 bg-gradient-to-br from-[var(--color-accent-light)] to-white p-8">
          <h2 className="text-xl font-bold text-[var(--color-ink)]">Your Annual Cost Breakdown</h2>
          <div className="mt-6 grid gap-6 sm:grid-cols-3">
            <div>
              <p className="text-sm text-[var(--color-ink-muted)]">Current SaaS cost</p>
              <p className="mt-1 text-3xl font-bold text-red-600">${totalYearly.toLocaleString()}</p>
              <p className="text-xs text-[var(--color-ink-muted)]">${totalMonthly.toLocaleString()}/month</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-ink-muted)]">Self-hosted cost (estimate)</p>
              <p className="mt-1 text-3xl font-bold text-[var(--color-ink)]">${hostingCost.toLocaleString()}</p>
              <p className="text-xs text-[var(--color-ink-muted)]">~$50/month VPS + maintenance time</p>
            </div>
            <div>
              <p className="text-sm text-[var(--color-ink-muted)]">Annual savings</p>
              <p className="mt-1 text-3xl font-bold text-emerald-600">${savings.toLocaleString()}</p>
              <p className="text-xs text-[var(--color-ink-muted)]">{Math.round((savings / totalYearly) * 100)}% reduction</p>
            </div>
          </div>

          <div className="mt-8 border-t border-[var(--color-accent)]/10 pt-6">
            <h3 className="text-sm font-semibold text-[var(--color-ink)]">Suggested open source alternatives:</h3>
            <div className="mt-3 flex flex-wrap gap-2">
              {selectedTools.map((tool) => (
                <Link
                  key={tool.ossSlug}
                  href={`/tool/${tool.ossSlug}/`}
                  className="rounded-full border border-[var(--color-border)] bg-white px-3 py-1.5 text-xs font-medium text-[var(--color-ink)] transition-all hover:border-[var(--color-accent)]/30 hover:text-[var(--color-accent)]"
                >
                  {tool.name} → {tool.ossAlt}
                </Link>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="mt-10 text-center">
        <Link
          href="/blog/self-hosted-saas-alternatives-2026/"
          className="text-sm font-medium text-[var(--color-accent)] hover:underline"
        >
          Read our complete self-hosting guide →
        </Link>
        <p className="mt-4 text-xs text-[var(--color-ink-muted)]">
          * Self-hosted cost estimate covers basic VPS hosting only. Actual costs may include maintenance time,
          backups, monitoring, and scaling. Open source tools are free to use but require technical setup.
        </p>
      </div>
    </div>
  );
}
