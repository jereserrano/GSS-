import { NextResponse } from "next/server";
import { GoogleDriveService } from "@/services/google-drive.service";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const code = searchParams.get("code");
  const state = searchParams.get("state"); // Aquí viene el userId
  const error = searchParams.get("error");

  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";

  if (error) {
    return NextResponse.redirect(new URL("/configuracion?error=google_auth_denied", baseUrl));
  }

  if (!code || !state) {
    return NextResponse.redirect(new URL("/configuracion?error=invalid_google_callback", baseUrl));
  }

  try {
    const success = await GoogleDriveService.linkAccount(state, code);
    if (success) {
      return NextResponse.redirect(new URL("/portafolio?success=google_linked", baseUrl));
    } else {
      return NextResponse.redirect(new URL("/portafolio?error=no_refresh_token", baseUrl));
    }
  } catch (err) {
    console.error("Error en el callback de Google:", err);
    return NextResponse.redirect(new URL("/portafolio?error=google_auth_failed", baseUrl));
  }
}
