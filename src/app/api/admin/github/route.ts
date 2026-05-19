import { NextRequest, NextResponse } from "next/server";
import { triggerWorkflow, getWorkflowRuns } from "@/lib/admin";

export async function GET() {
  try {
    const runs = await getWorkflowRuns();
    return NextResponse.json(runs);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { workflowId } = await request.json();

    if (!workflowId) {
      return NextResponse.json(
        { error: "workflowId is required" },
        { status: 400 }
      );
    }

    await triggerWorkflow(workflowId);
    return NextResponse.json({ success: true, message: `Workflow ${workflowId} triggered` });
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 500 }
    );
  }
}
