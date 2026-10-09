import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  
  const baseUrl = process.env.NEXTAUTH_URL;

  if (!session?.user?.email) {
    return NextResponse.redirect(new URL("/login", baseUrl));
  }

  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const error = url.searchParams.get("error");

  if (error) {
    return NextResponse.redirect(new URL("/perfil?error=zoom_auth_failed", baseUrl));
  }

  if (!code) {
    return NextResponse.redirect(new URL("/perfil?error=no_code_provided", baseUrl));
  }

  const clientId = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;
  const redirectUri = `${baseUrl}/api/auth/zoom/callback`;

  try {
    const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");
    
    const response = await fetch(`https://zoom.us/oauth/token`, {
      method: "POST",
      headers: {
        "Authorization": `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        code,
        redirect_uri: redirectUri,
        grant_type: "authorization_code",
      }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error("Zoom Token Exchange Error:", data);
      return NextResponse.redirect(new URL("/perfil?error=token_exchange_failed", baseUrl));
    }

    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        zoomAccessToken: data.access_token,
        zoomRefreshToken: data.refresh_token,
      },
    });

    return NextResponse.redirect(new URL("/perfil?success=zoom_linked", baseUrl));
  } catch (err) {
    console.error("Zoom Callback Error:", err);
    return NextResponse.redirect(new URL("/perfil?error=internal_error", baseUrl));
  }
}
