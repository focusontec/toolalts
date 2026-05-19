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

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-10">
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 sm:text-4xl">
          Blog
        </h1>
        <p className="mt-4 max-w-2xl text-lg text-slate-600">
          Articles about open-source tools, software comparisons, and
          productivity tips.
        </p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {posts.map((post) => (
          <Link
            key={post.slug}
            href={`/blog/${post.slug}/`}
            className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 transition hover:border-indigo-300 hover:shadow-sm dark:border-slate-800 dark:bg-slate-900"
          >
            <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
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
            <h2 className="mt-3 text-lg font-semibold text-slate-900 group-hover:text-primary-600 dark:text-slate-100 dark:group-hover:text-indigo-400">
              {post.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-400">
              {post.excerpt}
            </p>
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
          </Link>
        ))}
      </div>
    </div>
  );
}
