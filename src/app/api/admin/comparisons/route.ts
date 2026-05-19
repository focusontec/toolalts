import { NextRequest, NextResponse } from "next/server";
import { getFileFromGitHub, updateFileOnGitHub } from "@/lib/admin";

export async function GET() {
  try {
    const { content } = await getFileFromGitHub("data/comparisons.json");
    return NextResponse.json(JSON.parse(content));
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const newComp = await request.json();
    const { sha, content } = await getFileFromGitHub("data/comparisons.json");
    const comparisons = JSON.parse(content);

    if (comparisons.some((c: any) => c.slug === newComp.slug)) {
      return NextResponse.json({ error: "Comparison already exists" }, { status: 409 });
    }

    comparisons.push(newComp);
    await updateFileOnGitHub(
      "data/comparisons.json",
      JSON.stringify(comparisons, null, 2) + "\n",
      `admin: add comparison ${newComp.slug}`,
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
    const { sha, content } = await getFileFromGitHub("data/comparisons.json");
    const filtered = JSON.parse(content).filter((c: any) => c.slug !== slug);

    await updateFileOnGitHub(
      "data/comparisons.json",
      JSON.stringify(filtered, null, 2) + "\n",
      `admin: delete comparison ${slug}`,
      sha
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
