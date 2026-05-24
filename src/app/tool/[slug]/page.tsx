import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import toolsData from "@/../data/tools.json";
import { PricingCard } from "@/components/PricingCard";
import { AffiliateLink } from "@/components/AffiliateLink";
import { Breadcrumb } from "@/components/Breadcrumb";
import { SchemaJsonLd } from "@/components/SchemaJsonLd";
import type { Tool } from "@/lib/types";

export const dynamicParams = false;

const allTools = toolsData as Tool[];
const tools = allTools.filter((t) => t.status === "active");

export function generateStaticParams(): { slug: string }[] {
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) {
    return { title: "Not Found — ToolAlts", description: "This page could not be found." };
  }
  const title = `${tool.name} — Reviews, Pricing & Alternatives | ToolAlts`;
  const ratingText = tool.rating > 0 ? ` Rating: ${tool.rating}/5 from ${tool.reviewsCount.toLocaleString()} reviews.` : "";
  const description = `${tool.tagline}. Read reviews, compare pricing, and find the best alternatives to ${tool.name}.${ratingText}`;
  return {
    title,
    description,
    alternates: { canonical: `https://www.toolalts.dev/tool/${slug}/` },
    openGraph: {
      type: "website",
      title,
      description,
      url: `https://www.toolalts.dev/tool/${slug}/`,
      siteName: "ToolAlts",
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
    },
  };
}

function getAlternatives(tool: Tool): Tool[] {
  return tools
    .filter((t) => t.category === tool.category && t.slug !== tool.slug)
    .sort((a, b) => b.rating - a.rating)
    .slice(0, 5);
}

function getPros(tool: Tool): string[] {
  const pros: string[] = [];
  if (tool.rating >= 4.5) pros.push(`Highly rated at ${tool.rating}/5 from ${tool.reviewsCount.toLocaleString()} reviews`);
  else if (tool.rating === 0) pros.push("New tool — early adopter advantage");
  if (tool.openSource) pros.push("Open source — free to use and self-host");
  if (tool.features.length >= 6) pros.push(`Rich feature set with ${tool.features.length}+ capabilities`);
  if (tool.pricing.some((p) => p.price === "$0" || p.price.toLowerCase().includes("free")))
    pros.push("Free tier available for getting started");
  if (tool.githubStars && tool.githubStars > 5000)
    pros.push(`Strong community with ${tool.githubStars.toLocaleString()} GitHub stars`);
  if (tool.pricing.length >= 3) pros.push("Flexible pricing tiers for different team sizes");
  return pros.slice(0, 5);
}

function getCons(tool: Tool): string[] {
  const cons: string[] = [];
  if (tool.rating > 0 && tool.rating < 4.0) cons.push(`Lower rating at ${tool.rating}/5 compared to competitors`);
  else if (tool.rating === 0) cons.push("No verified reviews yet — limited community feedback");
  if (!tool.openSource) cons.push("Proprietary — vendor lock-in risk");
  if (tool.features.length < 5) cons.push("Limited feature set compared to alternatives");
  if (!tool.pricing.some((p) => p.price === "$0" || p.price.toLowerCase().includes("free")))
    cons.push("No free tier — paid plans required");
  if (tool.pricing.some((p) => p.price.toLowerCase().includes("custom")))
    cons.push("Enterprise pricing requires contacting sales");
  return cons.slice(0, 4);
}

function getUseCases(tool: Tool): { icon: string; title: string; description: string }[] {
  const categoryUseCases: Record<string, { icon: string; title: string; description: string }[]> = {
    development: [
      { icon: "👨‍💻", title: "Software Development", description: `Build and ship software faster with ${tool.name}'s developer tools and integrations.` },
      { icon: "🔄", title: "DevOps & CI/CD", description: "Automate workflows and streamline your development pipeline." },
      { icon: "👥", title: "Team Collaboration", description: "Enable seamless code review and pair programming across your team." },
    ],
    productivity: [
      { icon: "📝", title: "Note Taking & Knowledge Management", description: `Organize your thoughts and knowledge base with ${tool.name}.` },
      { icon: "📋", title: "Project Documentation", description: "Create and maintain comprehensive project documentation." },
      { icon: "🧠", title: "Personal Knowledge Base", description: "Build a second brain to capture and connect your ideas." },
    ],
    "project-management": [
      { icon: "📊", title: "Sprint Planning", description: `Plan and track sprints with ${tool.name}'s agile tools.` },
      { icon: "🗺️", title: "Roadmap Management", description: "Visualize and communicate your product roadmap." },
      { icon: "✅", title: "Task Tracking", description: "Track issues, bugs, and feature requests across your team." },
    ],
    design: [
      { icon: "🎨", title: "UI/UX Design", description: `Design beautiful interfaces with ${tool.name}'s design tools.` },
      { icon: "🧩", title: "Prototyping", description: "Create interactive prototypes for user testing." },
      { icon: "📐", title: "Design Systems", description: "Build and maintain consistent design systems across products." },
    ],
    communication: [
      { icon: "💬", title: "Team Communication", description: `Stay connected with your team using ${tool.name}.` },
      { icon: "📹", title: "Video Meetings", description: "Host virtual meetings and collaborate in real-time." },
      { icon: "🔗", title: "Integration Hub", description: "Connect your communication tools with your workflow." },
    ],
  };
  return categoryUseCases[tool.category] || categoryUseCases["development"];
}

function getFAQ(tool: Tool): { question: string; answer: string }[] {
  const freePlan = tool.pricing.find((p) => p.price === "$0" || p.price.toLowerCase().includes("free"));
  return [
    {
      question: `What is ${tool.name}?`,
      answer: tool.rating > 0
        ? `${tool.name} is ${tool.tagline.toLowerCase().endsWith(".") ? tool.tagline.slice(0, -1) : tool.tagline}. It has a ${tool.rating}/5 rating from ${tool.reviewsCount.toLocaleString()} reviews.`
        : `${tool.name} is ${tool.tagline.toLowerCase().endsWith(".") ? tool.tagline.slice(0, -1) : tool.tagline}.`,
    },
    {
      question: `Is ${tool.name} free?`,
      answer: freePlan
        ? `Yes, ${tool.name} offers a free tier${freePlan.plan !== "Free" ? ` (${freePlan.plan} plan)` : ""} with ${freePlan.features.slice(0, 2).join(" and ").toLowerCase()}. Paid plans start at ${tool.pricing.find((p) => !p.price.toLowerCase().includes("free") && p.price !== "$0")?.price || "various price points"}.`
        : `${tool.name} does not offer a free tier. Plans start at ${tool.pricing[0]?.price || "various price points"}.`,
    },
    {
      question: `What are the best alternatives to ${tool.name}?`,
      answer: `The best alternatives to ${tool.name} include ${getAlternatives(tool).slice(0, 3).map((a) => a.name).join(", ")}. The right choice depends on your specific needs and budget.`,
    },
    {
      question: `Is ${tool.name} open source?`,
      answer: tool.openSource
        ? `Yes, ${tool.name} is open source${tool.githubStars ? ` with ${tool.githubStars.toLocaleString()} GitHub stars` : ""}. You can view and contribute to the source code on GitHub.`
        : `No, ${tool.name} is a proprietary tool. If you need an open source alternative, consider ${getAlternatives(tool).find((a) => a.openSource)?.name || "other open source options in this category"}.`,
    },
  ];
}

export default async function ToolPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) notFound();

  const alternatives = getAlternatives(tool);
  const pros = tool.pros && tool.pros.length > 0 ? tool.pros : getPros(tool);
  const cons = tool.cons && tool.cons.length > 0 ? tool.cons : getCons(tool);
  const useCases = tool.useCases && tool.useCases.length > 0 ? tool.useCases : getUseCases(tool);
  const faq = tool.faq && tool.faq.length > 0 ? tool.faq : getFAQ(tool);

  const schema: Record<string, any> = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: tool.tagline,
    applicationCategory: tool.category,
    url: tool.websiteUrl,
    offers: tool.pricing.map((p) => ({
      "@type": "Offer",
      name: p.plan,
      price: (p.price || "0").replace(/[^0-9.]/g, ""),
      priceCurrency: "USD",
    })),
  };
  if (tool.rating > 0) {
    schema.aggregateRating = { "@type": "AggregateRating", ratingValue: tool.rating, reviewCount: tool.reviewsCount };
  }

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faq.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };

  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://www.toolalts.dev/" },
      { "@type": "ListItem", position: 2, name: tool.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), item: `https://www.toolalts.dev/category/${tool.category}/` },
      { "@type": "ListItem", position: 3, name: tool.name },
    ],
  };

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <SchemaJsonLd schema={schema} />
      <SchemaJsonLd schema={faqSchema} />
      <SchemaJsonLd schema={breadcrumbSchema} />
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: tool.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()), href: `/category/${tool.category}/` },
          { label: tool.name },
        ]}
      />

      <div className="flex flex-col gap-12 lg:flex-row">
        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Header */}
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-[var(--color-highlight)] text-2xl font-bold text-white">
              {tool.name.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-3xl tracking-tight text-[var(--color-ink)] sm:text-4xl">
                {tool.name}
              </h1>
              <p className="mt-2 text-lg text-[var(--color-ink-faint)]">{tool.tagline}</p>
            </div>
          </div>

          {/* Badges */}
          <div className="mt-6 flex flex-wrap items-center gap-2.5">
            {tool.rating > 0 ? (
              <>
                <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-amber-light)] px-3 py-1 text-sm font-semibold text-[var(--color-amber-warm)]">
                  <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  {tool.rating}
                </span>
                <span className="text-sm text-[var(--color-ink-faint)]">{tool.reviewsCount.toLocaleString()} reviews</span>
              </>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-border)] px-3 py-1 text-sm font-medium text-[var(--color-ink-faint)]">
                Not yet rated
              </span>
            )}
            {tool.openSource && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--color-success-light)] px-3 py-1 text-sm font-semibold text-[var(--color-success)]">
                <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                Open Source
              </span>
            )}
            {tool.githubStars && (
              <a href={tool.githubUrl ?? "#"} target="_blank" rel="noopener noreferrer nofollow" className="inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)] bg-white px-3 py-1 text-sm font-medium text-[var(--color-ink-muted)] transition-all hover:border-[var(--color-ink)]/20 hover:shadow-sm">
                <svg className="h-3.5 w-3.5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.374 0 0 5.373 0 12c0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23A11.509 11.509 0 0112 5.803c1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.233 1.911 1.233 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576C20.566 21.797 24 17.3 24 12c0-6.627-5.373-12-12-12z" /></svg>
                {tool.githubStars.toLocaleString()}
              </a>
            )}
          </div>

          {/* Description */}
          <section className="mt-8">
            <p className="text-base leading-relaxed text-[var(--color-ink-muted)]">{tool.description}</p>
          </section>

          {/* Pros & Cons */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Pros & Cons</h2>
            <div className="mt-4 grid gap-6 sm:grid-cols-2">
              <div className="rounded-xl border border-[var(--color-success)]/20 bg-[var(--color-success-light)]/30 p-5">
                <h3 className="text-sm font-semibold text-[var(--color-success)]">Pros</h3>
                <ul className="mt-3 space-y-2">
                  {pros.map((p) => (
                    <li key={p} className="flex items-start gap-2 text-sm text-[var(--color-ink-muted)]">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                      {p}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="rounded-xl border border-[var(--color-amber-warm)]/20 bg-[var(--color-amber-light)]/30 p-5">
                <h3 className="text-sm font-semibold text-[var(--color-amber-warm)]">Cons</h3>
                <ul className="mt-3 space-y-2">
                  {cons.map((c) => (
                    <li key={c} className="flex items-start gap-2 text-sm text-[var(--color-ink-muted)]">
                      <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-amber-warm)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                      {c}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </section>

          {/* Use Cases */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Best Use Cases</h2>
            <div className="mt-4 grid gap-4 sm:grid-cols-3">
              {useCases.map((uc) => (
                <div key={uc.title} className="rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-5">
                  <span className="text-2xl">{uc.icon}</span>
                  <h3 className="mt-2 text-sm font-semibold text-[var(--color-ink)]">{uc.title}</h3>
                  <p className="mt-1 text-sm text-[var(--color-ink-muted)]">{uc.description}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Features */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Key Features</h2>
            <ul className="mt-4 grid gap-2.5 sm:grid-cols-2">
              {tool.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm text-[var(--color-ink-muted)]">
                  <svg className="mt-0.5 h-4 w-4 shrink-0 text-[var(--color-success)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" /></svg>
                  {f}
                </li>
              ))}
            </ul>
          </section>

          {/* Integrations */}
          {tool.integrations && tool.integrations.length > 0 && (
            <section className="mt-10">
              <h2 className="text-lg font-semibold text-[var(--color-ink)]">Integrations</h2>
              <div className="mt-4 flex flex-wrap gap-2">
                {tool.integrations.map((integration) => (
                  <span key={integration} className="inline-flex items-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface)] px-3 py-1.5 text-sm text-[var(--color-ink-muted)]">
                    {integration}
                  </span>
                ))}
              </div>
            </section>
          )}

          {/* FAQ */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Frequently Asked Questions</h2>
            <div className="mt-4 space-y-4">
              {faq.map((f) => (
                <details key={f.question} className="group rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)]">
                  <summary className="flex cursor-pointer items-center justify-between p-5 text-sm font-semibold text-[var(--color-ink)]">
                    {f.question}
                    <svg className="h-4 w-4 shrink-0 text-[var(--color-ink-faint)] transition-transform group-open:rotate-180" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" /></svg>
                  </summary>
                  <p className="px-5 pb-5 text-sm leading-relaxed text-[var(--color-ink-muted)]">{f.answer}</p>
                </details>
              ))}
            </div>
          </section>

          {/* Alternatives */}
          <section className="mt-10">
            <h2 className="text-lg font-semibold text-[var(--color-ink)]">Top Alternatives to {tool.name}</h2>
            <p className="mt-1 text-sm text-[var(--color-ink-faint)]">Looking for something different? Here are the best alternatives in the {tool.category.replace(/-/g, " ")} category.</p>
            <div className="mt-4 space-y-3">
              {alternatives.map((alt) => (
                <Link key={alt.slug} href={`/tool/${alt.slug}/`} className="flex items-center gap-4 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface)] p-4 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-sm">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[var(--color-highlight)] text-sm font-bold text-white">
                    {alt.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="text-sm font-semibold text-[var(--color-ink)]">{alt.name}</h3>
                    <p className="mt-0.5 text-xs text-[var(--color-ink-faint)] truncate">{alt.tagline}</p>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-semibold text-[var(--color-amber-warm)]">{alt.rating}</span>
                    <svg className="h-3 w-3 text-[var(--color-amber-warm)]" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  </div>
                </Link>
              ))}
            </div>
            <div className="mt-4">
              <Link href={`/alternative-to/${tool.slug}/`} className="text-sm font-medium text-[var(--color-accent)] hover:underline">
                See all alternatives to {tool.name} →
              </Link>
            </div>
          </section>
        </div>

        {/* Sidebar */}
        <aside className="w-full shrink-0 space-y-5 lg:w-80">
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <AffiliateLink href={tool.websiteUrl}>
              Visit {tool.name}
              <svg className="ml-1.5 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" /></svg>
            </AffiliateLink>
          </div>

          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">Pricing</h3>
            <div className="mt-4 space-y-4">
              {tool.pricing.map((p, i) => (
                <PricingCard key={p.plan} plan={p} featured={i === 1} />
              ))}
            </div>
          </div>

          {/* Quick Info */}
          <div className="rounded-xl border border-[var(--color-border)] bg-white p-6">
            <h3 className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-ink-faint)]">Quick Info</h3>
            <dl className="mt-4 space-y-3 text-sm">
              <div className="flex justify-between">
                <dt className="text-[var(--color-ink-faint)]">Category</dt>
                <dd><Link href={`/category/${tool.category}/`} className="font-medium text-[var(--color-accent)] hover:underline">{tool.category.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}</Link></dd>
              </div>
              <div className="flex justify-between">
                <dt className="text-[var(--color-ink-faint)]">Rating</dt>
                <dd className="font-medium text-[var(--color-ink)]">{tool.rating > 0 ? `${tool.rating}/5` : "Not yet rated"}</dd>
              </div>
              {tool.reviewsCount > 0 && (
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-faint)]">Reviews</dt>
                  <dd className="font-medium text-[var(--color-ink)]">{tool.reviewsCount.toLocaleString()}</dd>
                </div>
              )}
              <div className="flex justify-between">
                <dt className="text-[var(--color-ink-faint)]">Open Source</dt>
                <dd className="font-medium text-[var(--color-ink)]">{tool.openSource ? "Yes" : "No"}</dd>
              </div>
              {tool.githubStars && (
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-faint)]">GitHub Stars</dt>
                  <dd className="font-medium text-[var(--color-ink)]">{tool.githubStars.toLocaleString()}</dd>
                </div>
              )}
              {tool.targetAudience && (
                <div className="flex justify-between">
                  <dt className="text-[var(--color-ink-faint)]">Best For</dt>
                  <dd className="font-medium text-[var(--color-ink)] text-right max-w-[160px]">{tool.targetAudience}</dd>
                </div>
              )}
            </dl>
          </div>
        </aside>
      </div>
    </div>
  );
}
