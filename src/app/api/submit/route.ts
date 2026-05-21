import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
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

const RATE_LIMIT = new Map<string, { count: number; resetAt: number }>();

function checkRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = RATE_LIMIT.get(ip);
  if (!entry || now > entry.resetAt) {
    RATE_LIMIT.set(ip, { count: 1, resetAt: now + 3600000 });
    return true;
  }
  if (entry.count >= 5) return false;
  entry.count++;
  return true;
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "https:" || parsed.protocol === "http:";
  } catch {
    return false;
  }
}

function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

async function sendNotificationEmail(submission: Submission) {
  const resendApiKey = process.env.RESEND_API_KEY;
  const adminEmail = process.env.ADMIN_EMAIL;
  if (!resendApiKey || !adminEmail) return;

  try {
    const { Resend } = await import("resend");
    const resend = new Resend(resendApiKey);

    await resend.emails.send({
      from: "ToolAlts <noreply@toolalts.dev>",
      to: adminEmail,
      subject: `New Tool Submission: ${submission.toolName}`,
      html: `
        <div style="font-family: system-ui, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #1a1a2e;">New Tool Submission</h2>
          <table style="width: 100%; border-collapse: collapse; margin: 16px 0;">
            <tr><td style="padding: 8px 0; color: #666; width: 120px;">Tool Name</td><td style="padding: 8px 0; font-weight: 600;">${submission.toolName}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Website</td><td style="padding: 8px 0;"><a href="${submission.websiteUrl}">${submission.websiteUrl}</a></td></tr>
            <tr><td style="padding: 8px 0; color: #666;">GitHub</td><td style="padding: 8px 0;">${submission.githubUrl || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Category</td><td style="padding: 8px 0;">${submission.category}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Reason</td><td style="padding: 8px 0;">${submission.reason || "N/A"}</td></tr>
            <tr><td style="padding: 8px 0; color: #666;">Email</td><td style="padding: 8px 0;">${submission.submitterEmail || "N/A"}</td></tr>
          </table>
          <a href="https://www.toolalts.dev/admin/submissions/" style="display: inline-block; background: #e8553d; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600;">Review Submission</a>
        </div>
      `,
    });
  } catch (error) {
    console.error("Failed to send notification email:", error);
  }
}

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") || request.headers.get("x-real-ip") || "unknown";
    if (!checkRateLimit(ip)) {
      return NextResponse.json({ error: "Too many submissions. Please try again later." }, { status: 429 });
    }

    const body = await request.json();
    const { toolName, websiteUrl, githubUrl, category, reason, submitterEmail, honeypot } = body;

    // Honeypot check
    if (honeypot) {
      return NextResponse.json({ success: true });
    }

    // Validation
    if (!toolName?.trim()) return NextResponse.json({ error: "Tool name is required" }, { status: 400 });
    if (!websiteUrl?.trim()) return NextResponse.json({ error: "Website URL is required" }, { status: 400 });
    if (!isValidUrl(websiteUrl)) return NextResponse.json({ error: "Invalid website URL" }, { status: 400 });
    if (!category) return NextResponse.json({ error: "Category is required" }, { status: 400 });

    const validCategories = ["development", "productivity", "project-management", "design", "communication"];
    if (!validCategories.includes(category)) {
      return NextResponse.json({ error: "Invalid category" }, { status: 400 });
    }

    // Load existing submissions
    let submissions: Submission[] = [];
    try {
      const { content } = await getFileFromGitHub("data/user-submissions.json");
      submissions = JSON.parse(content);
    } catch {
      submissions = [];
    }

    // Check for duplicate URL
    const duplicate = submissions.find((s) => s.websiteUrl === websiteUrl && s.status !== "rejected");
    if (duplicate) {
      return NextResponse.json({ error: "This tool has already been submitted" }, { status: 409 });
    }

    // Create submission
    const submission: Submission = {
      id: `sub_${crypto.randomBytes(6).toString("hex")}`,
      toolName: toolName.trim(),
      websiteUrl: websiteUrl.trim(),
      githubUrl: githubUrl?.trim() || "",
      category,
      reason: reason?.trim() || "",
      submitterEmail: submitterEmail?.trim() || "",
      status: "pending",
      submittedAt: new Date().toISOString(),
      reviewedAt: null,
      reviewNote: null,
    };

    submissions.push(submission);

    // Save to GitHub
    try {
      const { sha } = await getFileFromGitHub("data/user-submissions.json");
      await updateFileOnGitHub(
        "data/user-submissions.json",
        JSON.stringify(submissions, null, 2) + "\n",
        `feat: user submission - ${submission.toolName}`,
        sha
      );
    } catch {
      // If file doesn't exist on GitHub yet, this will fail silently
      // The local file will be committed by the next CI run
    }

    // Send email notification
    await sendNotificationEmail(submission);

    return NextResponse.json({ success: true, id: submission.id });
  } catch (error) {
    console.error("Submission error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
