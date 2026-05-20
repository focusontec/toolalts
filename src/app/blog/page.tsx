import Link from "next/link";
import type { Metadata } from "next";
import { promises as fs } from "fs";
import { join } from "path";
import matter from "gray-matter";
import type { BlogPost } from "@/lib/types";

export const metadata: Metadata = {
  title: "Blog — ToolAlts",
  description:
    "Read the latest articles about open-source tools, software comparisons, and productivity tips.",
  alternates: {
    canonical: "https://www.toolalts.dev/blog/",
  },
};

async function loadPosts(): Promise<BlogPost[]> {
  const postsDir = join(process.cwd(), "src", "content", "blog");
  let files: string[] = [];
  try {
    files = await fs.readdir(postsDir);
  } catch {
    return [];
  }

  const posts: BlogPost[] = [];
  for (const file of files) {
    if (!file.endsWith(".md")) continue;
    const content = await fs.readFile(join(postsDir, file), "utf-8");
    const { data, content: body } = matter(content);
    posts.push({
      slug: file.replace(/\.md$/, ""),
      title: data.title ?? "Untitled",
      date: data.date ?? new Date().toISOString(),
      excerpt: data.excerpt ?? "",
      content: body,
      tags: data.tags ?? [],
      author: data.author ?? "ToolAlts",
    });
  }

  return posts.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
}

export default async function BlogPage() {
  const posts = await loadPosts();
  const [featured, ...rest] = posts;

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      {/* Header */}
      <div className="mb-12">
        <span className="text-xs font-semibold uppercase tracking-[0.15em] text-[var(--color-accent)]">
          Insights
        </span>
        <h1 className="mt-2 font-display text-4xl tracking-tight text-[var(--color-ink)] sm:text-5xl">
          Blog
        </h1>
        <p className="mt-4 max-w-xl text-lg text-[var(--color-ink-faint)]">
          Articles about open-source tools, software comparisons, and
          productivity tips.
        </p>
      </div>

      {/* Featured Post */}
      {featured && (
        <Link
          href={`/blog/${featured.slug}/`}
          className="group mb-12 block rounded-2xl border border-[var(--color-border)] bg-white p-8 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-lg sm:p-10"
        >
          <div className="flex items-center gap-2 text-xs text-[var(--color-ink-faint)]">
            <time dateTime={featured.date}>
              {new Date(featured.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {featured.author && (
              <>
                <span className="text-[var(--color-border)]">·</span>
                <span>{featured.author}</span>
              </>
            )}
            <span className="ml-2 rounded-full bg-[var(--color-accent-light)] px-2 py-0.5 text-[10px] font-semibold text-[var(--color-accent)]">
              Featured
            </span>
          </div>
          <h2 className="mt-4 font-display text-2xl tracking-tight text-[var(--color-ink)] group-hover:text-[var(--color-accent)] sm:text-3xl">
            {featured.title}
          </h2>
          <p className="mt-3 max-w-2xl text-[var(--color-ink-faint)]">
            {featured.excerpt}
          </p>
          <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent)] transition-opacity group-hover:opacity-80">
            Read article
            <svg className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
            </svg>
          </span>
        </Link>
      )}

      {/* Post Grid */}
      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {rest.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}/`}
            className="group flex flex-col rounded-xl border border-[var(--color-border)] bg-white p-6 transition-all hover:border-[var(--color-accent)]/30 hover:shadow-md"
          >
            <div className="flex items-center gap-2 text-xs text-[var(--color-ink-faint)]">
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "short",
                  day: "numeric",
                })}
              </time>
              {post.author && (
                <>
                  <span className="text-[var(--color-border)]">·</span>
                  <span>{post.author}</span>
                </>
              )}
            </div>
            <h3 className="mt-3 text-lg font-semibold leading-snug text-[var(--color-ink)] group-hover:text-[var(--color-accent)]">
              {post.title}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--color-ink-faint)]">
              {post.excerpt}
            </p>
            {post.tags && post.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {post.tags.slice(0, 3).map((tag) => (
                  <span
                    key={tag}
                    className="rounded-md bg-[var(--color-surface-warm)] px-2 py-0.5 text-[11px] font-medium text-[var(--color-ink-faint)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </Link>
        ))}
      </div>
    </div>
  );
}
