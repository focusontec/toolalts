import { NextRequest, NextResponse } from "next/server";
import { getFileFromGitHub, updateFileOnGitHub } from "@/lib/admin";

interface Submission {
  id: string;
  toolName: string;
  websiteUrl: string;
  githubUrl: string;
  category: string;
  reason: string;
  submitterEmail: string;
  status: "pending" | "approved" | "rejected";
  submittedAt: string;
  reviewedAt: string | null;
  reviewNote: string | null;
}

async function loadSubmissions(): Promise<Submission[]> {
  try {
    const { content } = await getFileFromGitHub("data/user-submissions.json");
    return JSON.parse(content);
  } catch {
    return [];
  }
}

async function saveSubmissions(submissions: Submission[], message: string) {
  try {
    const { sha } = await getFileFromGitHub("data/user-submissions.json");
    await updateFileOnGitHub(
      "data/user-submissions.json",
      JSON.stringify(submissions, null, 2) + "\n",
      message,
      sha
    );
  } catch (error) {
    throw new Error(`Failed to save submissions: ${(error as Error).message}`);
  }
}

async function addToPendingTools(submission: Submission) {
  try {
    const { content, sha } = await getFileFromGitHub("data/pending-tools.json");
    const pending = JSON.parse(content);

    pending.push({
      slug: submission.toolName.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, ""),
      name: submission.toolName,
      source: "user-submission",
      website: submission.websiteUrl,
      github: submission.githubUrl || null,
      category: submission.category,
      reason: submission.reason,
      submittedBy: submission.submitterEmail || "anonymous",
      discoveredAt: new Date().toISOString(),
    });

    await updateFileOnGitHub(
      "data/pending-tools.json",
      JSON.stringify(pending, null, 2) + "\n",
      `feat: approve user submission - ${submission.toolName}`,
      sha
    );
  } catch (error) {
    throw new Error(`Failed to add to pending tools: ${(error as Error).message}`);
  }
}

export async function GET() {
  try {
    const submissions = await loadSubmissions();
    return NextResponse.json(submissions);
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, action, note } = await request.json();

    if (!id || !action) {
      return NextResponse.json({ error: "id and action are required" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "action must be 'approve' or 'reject'" }, { status: 400 });
    }

    const submissions = await loadSubmissions();
    const index = submissions.findIndex((s) => s.id === id);

    if (index === -1) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    const submission = submissions[index];

    if (submission.status !== "pending") {
      return NextResponse.json({ error: "Submission already reviewed" }, { status: 400 });
    }

    submission.status = action === "approve" ? "approved" : "rejected";
    submission.reviewedAt = new Date().toISOString();
    submission.reviewNote = note || null;

    if (action === "approve") {
      await addToPendingTools(submission);
    }

    await saveSubmissions(submissions, `${action}: ${submission.toolName} submission`);

    return NextResponse.json({ success: true, submission });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}
