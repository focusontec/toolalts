import { NextRequest, NextResponse } from "next/server";
import { getFileFromGitHub, updateFileOnGitHub } from "@/lib/admin";

export async function GET() {
  try {
    const { content } = await getFileFromGitHub("data/categories.json");
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const { slug, name, description } = await request.json();
    const { sha, content } = await getFileFromGitHub("data/categories.json");
    const categories = JSON.parse(content);

    if (categories.some((c: any) => c.slug === slug)) {
      return NextResponse.json({ error: "Category already exists" }, { status: 409 });
    }

    categories.push({ slug, name, description });
    await updateFileOnGitHub(
      "data/categories.json",
      JSON.stringify(categories, null, 2) + "\n",
      `admin: add category ${slug}`,
      sha
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const { originalSlug, slug, name, description } = await request.json();
    const { sha, content } = await getFileFromGitHub("data/categories.json");
    const categories = JSON.parse(content);

    const index = categories.findIndex((c: any) => c.slug === originalSlug);
    if (index === -1) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    categories[index] = { slug, name, description };
    await updateFileOnGitHub(
      "data/categories.json",
      JSON.stringify(categories, null, 2) + "\n",
      `admin: update category ${slug}`,
      sha
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { slug } = await request.json();
    const { sha, content } = await getFileFromGitHub("data/categories.json");
    const filtered = JSON.parse(content).filter((c: any) => c.slug !== slug);

    await updateFileOnGitHub(
      "data/categories.json",
      JSON.stringify(filtered, null, 2) + "\n",
      `admin: delete category ${slug}`,
      sha
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
