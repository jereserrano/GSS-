import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // Optionally call Zoom's revocation endpoint here
    
    await prisma.user.update({
      where: { email: session.user.email },
      data: {
        zoomAccessToken: null,
        zoomRefreshToken: null,
      },
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Error unlinking Zoom:", err);
    return NextResponse.json({ error: "Error interno" }, { status: 500 });
  }
}
