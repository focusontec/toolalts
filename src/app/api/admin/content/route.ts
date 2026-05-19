import { NextRequest, NextResponse } from "next/server";
import { getFileFromGitHub, updateFileOnGitHub } from "@/lib/admin";

const VALID_TYPES = ["blog", "comparisons", "reports"];

export async function GET(request: NextRequest) {
  try {
    const type = request.nextUrl.searchParams.get("type");
    const slug = request.nextUrl.searchParams.get("slug");

    if (!type || !slug || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type or slug" }, { status: 400 });
    }

    const filePath = `src/content/${type}/${slug}.md`;
    const { sha, content } = await getFileFromGitHub(filePath);

    return NextResponse.json({ content, sha });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { type, slug, content } = await request.json();

    if (!type || !slug || !VALID_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid type or slug" }, { status: 400 });
    }

    const filePath = `src/content/${type}/${slug}.md`;
    const { sha } = await getFileFromGitHub(filePath);

    await updateFileOnGitHub(
      filePath,
      content,
      `admin: update ${type}/${slug}`,
      sha
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
