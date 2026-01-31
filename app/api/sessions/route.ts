import { NextRequest, NextResponse } from "next/server";
import { prisma } from "../../../lib/prisma";
import crypto from "crypto";

export async function GET(request: NextRequest) {
  const token = request.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.json({ error: "Token required" }, { status: 400 });
  }

  const session = await prisma.session.findUnique({
    where: { token }
  });

  if (!session) {
    return NextResponse.json({ error: "Session not found" }, { status: 404 });
  }

  return NextResponse.json({ id: session.id });
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}));
  const email = body?.email ?? null;
  const offer = body?.offer ?? null;
  const utmSource = body?.utm_source ?? null;
  const utmMedium = body?.utm_medium ?? null;
  const utmCampaign = body?.utm_campaign ?? null;
  const utmContent = body?.utm_content ?? null;
  const ref = body?.ref ?? null;
  const token = crypto.randomBytes(16).toString("hex");

  const session = await prisma.session.create({
    data: {
      token,
      email,
      offer,
      utmSource,
      utmMedium,
      utmCampaign,
      utmContent,
      ref
    }
  });

  const response = NextResponse.json({ id: session.id });
  response.cookies.set("session_token", session.token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/"
  });
  return response;
}
