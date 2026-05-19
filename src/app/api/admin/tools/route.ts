import { NextRequest, NextResponse } from "next/server";
import { getFileFromGitHub, updateFileOnGitHub } from "@/lib/admin";

export async function GET() {
  try {
    const { content } = await getFileFromGitHub("data/tools.json");
    const tools = JSON.parse(content);
    return NextResponse.json(tools);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const newTool = await request.json();
    const { sha, content } = await getFileFromGitHub("data/tools.json");
    const tools = JSON.parse(content);

    if (tools.some((t: any) => t.slug === newTool.slug)) {
      return NextResponse.json(
        { error: `Tool with slug "${newTool.slug}" already exists` },
        { status: 409 }
      );
    }

    tools.push(newTool);
    await updateFileOnGitHub(
      "data/tools.json",
      JSON.stringify(tools, null, 2) + "\n",
      `admin: add tool ${newTool.name}`,
      sha
    );

    return NextResponse.json({ success: true, tool: newTool });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
