import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { promises as fs } from "fs";
import { join } from "path";
import matter from "gray-matter";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Breadcrumb } from "@/components/Breadcrumb";
import type { BlogPost } from "@/lib/types";

export const dynamicParams = false;

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

export async function generateStaticParams(): Promise<{ slug: string }[]> {
  const posts = await loadPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === slug);
  if (!post) {
    return {
      title: "Not Found — ToolAlts",
      description: "This page could not be found.",
    };
  }
  const postTitle = `${post.title} — ToolAlts Blog`;
  return {
    title: postTitle,
    description: post.excerpt,
    alternates: {
      canonical: `https://www.toolalts.dev/blog/${slug}/`,
    },
    openGraph: {
      type: "article",
      title: postTitle,
      description: post.excerpt,
      url: `https://www.toolalts.dev/blog/${slug}/`,
      siteName: "ToolAlts",
    },
    twitter: {
      card: "summary_large_image",
      title: postTitle,
      description: post.excerpt,
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const posts = await loadPosts();
  const post = posts.find((p) => p.slug === slug);

  if (!post) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-6xl px-6 py-12">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog/" },
          { label: post.title },
        ]}
      />

      <article className="mx-auto max-w-[680px]">
        {/* Article Header */}
        <header className="mb-10">
          {post.tags && post.tags.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-1.5">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-md bg-[var(--color-accent-light)] px-2.5 py-0.5 text-[11px] font-semibold text-[var(--color-accent)]"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
          <h1 className="font-display text-3xl leading-[1.15] tracking-tight text-[var(--color-ink)] sm:text-4xl lg:text-[2.75rem]">
            {post.title}
          </h1>
          <div className="mt-5 flex items-center gap-3">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-highlight)] text-xs font-bold text-white">
              TA
            </div>
            <div>
              <p className="text-sm font-medium text-[var(--color-ink)]">
                {post.author}
              </p>
              <time
                dateTime={post.date}
                className="text-xs text-[var(--color-ink-faint)]"
              >
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
          </div>
          <div className="mt-8 border-b border-[var(--color-border)]" />
        </header>

        {/* Article Body */}
        <div className="prose">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>

        {/* Article Footer */}
        <div className="mt-12 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-warm)] p-6">
          <p className="text-sm font-medium text-[var(--color-ink)]">
            Enjoyed this article?
          </p>
          <p className="mt-1 text-sm text-[var(--color-ink-faint)]">
            Check out more articles on our{" "}
            <a href="/blog/" className="font-medium text-[var(--color-accent)] hover:underline">
              blog
            </a>{" "}
            or explore{" "}
            <a href="/category/" className="font-medium text-[var(--color-accent)] hover:underline">
              tool categories
            </a>.
          </p>
        </div>
      </article>
    </div>
  );
}
