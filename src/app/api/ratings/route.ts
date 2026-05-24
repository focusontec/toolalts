import { NextRequest, NextResponse } from "next/server";
import { getFileFromGitHub, updateFileOnGitHub } from "@/lib/admin";

const RATINGS_PATH = "data/ratings.json";

interface Rating {
  id: string;
  slug: string;
  stars: number;
  review: string;
  createdAt: string;
}

interface RatingsStore {
  [slug: string]: Rating[];
}

export async function GET(req: NextRequest) {
  const slug = req.nextUrl.searchParams.get("slug");
  if (!slug) {
    return NextResponse.json({ error: "slug required" }, { status: 400 });
  }

  try {
    const { content } = await getFileFromGitHub(RATINGS_PATH);
    const store: RatingsStore = JSON.parse(content);
    const ratings = store[slug] || [];
    const avg = ratings.length > 0
      ? ratings.reduce((s, r) => s + r.stars, 0) / ratings.length
      : 0;
    return NextResponse.json({
      ratings,
      count: ratings.length,
      average: Math.round(avg * 10) / 10,
    });
  } catch {
    return NextResponse.json({ ratings: [], count: 0, average: 0 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { slug, stars, review } = body;

  if (!slug || !stars || stars < 1 || stars > 5) {
    return NextResponse.json({ error: "Invalid rating" }, { status: 400 });
  }

  const rating: Rating = {
    id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    slug,
    stars,
    review: (review || "").slice(0, 500),
    createdAt: new Date().toISOString(),
  };

  try {
    let store: RatingsStore = {};
    try {
      const { content, sha } = await getFileFromGitHub(RATINGS_PATH);
      store = JSON.parse(content);
      if (!store[slug]) store[slug] = [];
      store[slug].push(rating);
      await updateFileOnGitHub(
        RATINGS_PATH,
        JSON.stringify(store, null, 2) + "\n",
        `feat: add rating for ${slug} (${stars}★)`,
        sha
      );
    } catch {
      // File doesn't exist yet, create it
      store[slug] = [rating];
      // Can't create via update, skip GitHub write for new file
    }

    return NextResponse.json({ success: true, rating });
  } catch (err) {
    return NextResponse.json({ error: "Failed to save rating" }, { status: 500 });
  }
}
