import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";

const SESSION_DURATION = 24 * 60 * 60 * 1000; // 24 hours

function createSession(password: string): string {
  const hash = crypto.createHash("sha256").update(password).digest("hex");
  const expiry = Date.now() + SESSION_DURATION;
  return `${hash}.${expiry}`;
}

function verifySession(session: string): boolean {
  const [hash, expiryStr] = session.split(".");
  const expiry = parseInt(expiryStr, 10);
  if (isNaN(expiry) || Date.now() > expiry) return false;

  const adminPassword = process.env.ADMIN_PASSWORD;
  if (!adminPassword) return false;

  const expectedHash = crypto.createHash("sha256").update(adminPassword).digest("hex");
  return hash === expectedHash;
}

export async function POST(request: NextRequest) {
  const { password } = await request.json();
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!adminPassword) {
    return NextResponse.json({ error: "Admin password not configured" }, { status: 500 });
  }

  if (password !== adminPassword) {
    return NextResponse.json({ error: "Invalid password" }, { status: 401 });
  }

  const session = createSession(password);
  const response = NextResponse.json({ success: true });

  response.cookies.set("admin_session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_DURATION / 1000,
    path: "/",
  });

  return response;
}

export async function DELETE() {
  const response = NextResponse.json({ success: true });
  response.cookies.delete("admin_session");
  return response;
}
