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
  return {
    title: `${post.title} — ToolAlts Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `https://tool-alts.vercel.app/blog/${slug}/`,
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
    <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
      <Breadcrumb
        items={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog/" },
          { label: post.title },
        ]}
      />

      <article>
        <header className="mb-8">
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <time dateTime={post.date}>
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </time>
            {post.author && (
              <>
                <span>•</span>
                <span>{post.author}</span>
              </>
            )}
          </div>
          <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-slate-900 dark:text-slate-100">
            {post.title}
          </h1>
          {post.tags && post.tags.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-800 dark:text-slate-400"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}
        </header>

        <div className="prose prose-slate max-w-none dark:prose-invert">
          <ReactMarkdown remarkPlugins={[remarkGfm]}>
            {post.content}
          </ReactMarkdown>
        </div>
      </article>
    </div>
  );
}
