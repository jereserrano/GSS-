import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  if (!session?.user) {
    return NextResponse.redirect(new URL("/login", process.env.NEXTAUTH_URL));
  }

  const clientId = process.env.ZOOM_CLIENT_ID;
  const baseUrl = process.env.NEXTAUTH_URL;
  const redirectUri = `${baseUrl}/api/auth/zoom/callback`;

  if (!clientId) {
    return NextResponse.json({ error: "ZOOM_CLIENT_ID not configured" }, { status: 500 });
  }

  const authUrl = `https://zoom.us/oauth/authorize?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

  return NextResponse.redirect(authUrl);
}
