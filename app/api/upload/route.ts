import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join, basename } from "path";
import { v4 as uuidv4 } from "uuid";

// Extensiones permitidas para subidas de archivos
const ALLOWED_EXTENSIONS = new Set([
  "pdf", "doc", "docx", "xls", "xlsx", "ppt", "pptx",
  "png", "jpg", "jpeg", "gif", "webp",
  "txt", "csv", "zip",
]);

/**
 * Extrae y sanitiza la extensión del nombre de archivo proporcionado por el usuario.
 * Retorna null si la extensión no es válida o no está en el allowlist.
 */
function getSafeExtension(originalName: string): string | null {
  // basename previene traversal en el nombre
  const safeName = basename(originalName);
  const parts = safeName.split(".");
  if (parts.length < 2) return null;
  const ext = parts.pop()!.toLowerCase().replace(/[^a-z0-9]/g, "");
  if (!ALLOWED_EXTENSIONS.has(ext)) return null;
  return ext;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const data = await request.formData();
    const file: File | null = data.get("file") as unknown as File;

    if (!file) {
      return NextResponse.json({ error: "No se encontró ningún archivo" }, { status: 400 });
    }

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Sanitizar y validar extensión del archivo subido por el usuario
    const ext = getSafeExtension(file.name);
    if (!ext) {
      return NextResponse.json(
        { error: "Tipo de archivo no permitido" },
        { status: 400 }
      );
    }
    const fileName = `${uuidv4()}.${ext}`;

    // Path in public/uploads
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    
    const filePath = join(uploadDir, fileName);
    await writeFile(filePath, buffer);

    const publicUrl = `/api/uploads/${fileName}`;

    return NextResponse.json({ success: true, url: publicUrl, originalName: file.name });
  } catch (error) {
    console.error("Error uploading file:", error);
    return NextResponse.json({ error: "Error al subir el archivo" }, { status: 500 });
  }
}
