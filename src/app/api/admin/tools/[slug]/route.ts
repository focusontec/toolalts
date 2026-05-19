import { NextRequest, NextResponse } from "next/server";
import { getFileFromGitHub, updateFileOnGitHub } from "@/lib/admin";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { content } = await getFileFromGitHub("data/tools.json");
    const tools = JSON.parse(content);
    const tool = tools.find((t: any) => t.slug === slug);

    if (!tool) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    return NextResponse.json(tool);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const updates = await request.json();
    const { sha, content } = await getFileFromGitHub("data/tools.json");
    const tools = JSON.parse(content);
    const index = tools.findIndex((t: any) => t.slug === slug);

    if (index === -1) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    tools[index] = { ...tools[index], ...updates, slug }; // slug is immutable

    await updateFileOnGitHub(
      "data/tools.json",
      JSON.stringify(tools, null, 2) + "\n",
      `admin: update tool ${slug}`,
      sha
    );

    return NextResponse.json({ success: true, tool: tools[index] });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    const { sha, content } = await getFileFromGitHub("data/tools.json");
    const tools = JSON.parse(content);
    const filtered = tools.filter((t: any) => t.slug !== slug);

    if (filtered.length === tools.length) {
      return NextResponse.json({ error: "Tool not found" }, { status: 404 });
    }

    await updateFileOnGitHub(
      "data/tools.json",
      JSON.stringify(filtered, null, 2) + "\n",
      `admin: delete tool ${slug}`,
      sha
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
