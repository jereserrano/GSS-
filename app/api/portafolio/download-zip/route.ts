import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { readFile } from "fs/promises";
import { join } from "path";
import { existsSync } from "fs";
import zlib from "zlib";
import { promisify } from "util";

const deflateRaw = promisify(zlib.deflateRaw);

// ─── Minimal ZIP builder (no external deps) ─────────────────────────────────
// Implements ZIP spec (PKZIP local file header + central directory)

function u16(n: number) {
  const b = Buffer.alloc(2);
  b.writeUInt16LE(n, 0);
  return b;
}
function u32(n: number) {
  const b = Buffer.alloc(4);
  b.writeUInt32LE(n >>> 0, 0);
  return b;
}

function dosDate(d: Date) {
  const date = ((d.getFullYear() - 1980) << 9) | ((d.getMonth() + 1) << 5) | d.getDate();
  const time = (d.getHours() << 11) | (d.getMinutes() << 5) | Math.floor(d.getSeconds() / 2);
  return { date, time };
}

function crc32(buf: Buffer): number {
  const table = (() => {
    const t = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
      let c = i;
      for (let j = 0; j < 8; j++) c = c & 1 ? 0xedb88320 ^ (c >>> 1) : c >>> 1;
      t[i] = c;
    }
    return t;
  })();
  let crc = 0xffffffff;
  for (let i = 0; i < buf.length; i++) crc = (table[(crc ^ buf[i]!) & 0xff]!) ^ (crc >>> 8);
  return (crc ^ 0xffffffff) >>> 0;
}

interface ZipEntry {
  name: string; // path inside zip
  data: Buffer;
  date: Date;
}

async function buildZip(entries: ZipEntry[]): Promise<Buffer> {
  const localHeaders: Buffer[] = [];
  const centralDir: Buffer[] = [];
  let offset = 0;

  for (const entry of entries) {
    const nameBuffer = Buffer.from(entry.name, "utf-8");
    const compressed = await deflateRaw(entry.data);
    const crc = crc32(entry.data);
    const { date, time } = dosDate(entry.date);

    // Local file header (signature 0x04034b50)
    const localHeader = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x03, 0x04]), // signature
      u16(20),            // version needed
      u16(0x800),         // flags (UTF-8)
      u16(8),             // compression: deflate
      u16(time),
      u16(date),
      u32(crc),
      u32(compressed.length),
      u32(entry.data.length),
      u16(nameBuffer.length),
      u16(0),             // extra length
      nameBuffer,
      compressed,
    ]);

    // Central directory header (signature 0x02014b50)
    const cdHeader = Buffer.concat([
      Buffer.from([0x50, 0x4b, 0x01, 0x02]), // signature
      u16(20),            // version made by
      u16(20),            // version needed
      u16(0x800),         // flags
      u16(8),             // deflate
      u16(time),
      u16(date),
      u32(crc),
      u32(compressed.length),
      u32(entry.data.length),
      u16(nameBuffer.length),
      u16(0),             // extra
      u16(0),             // comment length
      u16(0),             // disk start
      u16(0),             // internal attrs
      u32(0),             // external attrs
      u32(offset),        // local header offset
      nameBuffer,
    ]);

    localHeaders.push(localHeader);
    centralDir.push(cdHeader);
    offset += localHeader.length;
  }

  const centralDirBuffer = Buffer.concat(centralDir);
  const cdSize = centralDirBuffer.length;
  const cdOffset = offset;

  // End of Central Directory record
  const eocd = Buffer.concat([
    Buffer.from([0x50, 0x4b, 0x05, 0x06]), // signature
    u16(0), u16(0),
    u16(entries.length),
    u16(entries.length),
    u32(cdSize),
    u32(cdOffset),
    u16(0), // comment length
  ]);

  return Buffer.concat([...localHeaders, centralDirBuffer, eocd]);
}

// ─── Route Handler ────────────────────────────────────────────────────────────

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "No autorizado" }, { status: 401 });
    }

    const aprendiz = await prisma.aprendiz.findUnique({
      where: { userId: session.user.id },
      include: {
        ficha: {
          include: {
            programa: {
              include: {
                competencias: {
                  where: { estado: "ACTIVO" },
                  orderBy: { codigo: "asc" },
                  include: {
                    resultadosAprendizaje: { orderBy: { codigo: "asc" } },
                  },
                },
              },
            },
          },
        },
      },
    });

    if (!aprendiz) {
      return NextResponse.json({ error: "Aprendiz no encontrado" }, { status: 404 });
    }

    // Get all deliveries that have a file and an RA
    const entregas = await prisma.entrega.findMany({
      where: {
        aprendizId: aprendiz.id,
        urlArchivo: { not: null },
        actividad: {
          fichaId: aprendiz.fichaId,
          resultadoAprendizajeId: { not: null },
        },
      },
      include: {
        actividad: {
          select: { nombre: true, resultadoAprendizajeId: true },
        },
      },
    });

    // Build map: raId -> entrega
    const entregasPorRA = new Map<string, typeof entregas[0]>();
    for (const e of entregas) {
      const raId = e.actividad.resultadoAprendizajeId!;
      if (!entregasPorRA.has(raId)) entregasPorRA.set(raId, e);
    }

    // Build RAs lookup
    const rasById = new Map<string, { codigo: string; nombre: string }>();
    for (const comp of aprendiz.ficha.programa.competencias) {
      for (const ra of comp.resultadosAprendizaje) {
        rasById.set(ra.id, { codigo: ra.codigo, nombre: ra.nombre });
      }
    }

    const entries: ZipEntry[] = [];
    const uploadsDir = join(process.cwd(), "public", "uploads");

    for (const comp of aprendiz.ficha.programa.competencias) {
      const safeComp = `${comp.codigo} - ${comp.nombre}`.replace(/[/\\?%*:|"<>]/g, "_").slice(0, 60);

      // Add guide if it exists
      if (comp.urlGuia) {
        let filePath: string | null = null;
        if (comp.urlGuia.startsWith("/api/uploads/")) {
          const fileName = comp.urlGuia.replace("/api/uploads/", "");
          const candidate = join(uploadsDir, fileName);
          if (existsSync(candidate)) filePath = candidate;
        } else if (comp.urlGuia.startsWith("/uploads/")) {
          const fileName = comp.urlGuia.replace("/uploads/", "");
          const candidate = join(uploadsDir, fileName);
          if (existsSync(candidate)) filePath = candidate;
        }

        if (filePath) {
          const fileBuffer = await readFile(filePath);
          const ext = filePath.split(".").pop() ?? "bin";
          entries.push({ name: `Portafolio/${safeComp}/Guia_Aprendizaje.${ext}`, data: fileBuffer, date: new Date() });
        } else {
          const shortcut = Buffer.from(`[InternetShortcut]\nURL=${comp.urlGuia}\n`, "utf-8");
          entries.push({
            name: `Portafolio/${safeComp}/Guia_Aprendizaje.url`,
            data: shortcut,
            date: new Date(),
          });
        }
      }

      for (const ra of comp.resultadosAprendizaje) {
        const safeRA = `${ra.codigo} - ${ra.nombre}`.replace(/[/\\?%*:|"<>]/g, "_").slice(0, 60);
        const entrega = entregasPorRA.get(ra.id);

        if (entrega?.urlArchivo) {
          // Determine real file path
          let filePath: string | null = null;

          if (entrega.urlArchivo.startsWith("/api/uploads/")) {
            const fileName = entrega.urlArchivo.replace("/api/uploads/", "");
            const candidate = join(uploadsDir, fileName);
            if (existsSync(candidate)) filePath = candidate;
          } else if (entrega.urlArchivo.startsWith("/uploads/")) {
            const fileName = entrega.urlArchivo.replace("/uploads/", "");
            const candidate = join(uploadsDir, fileName);
            if (existsSync(candidate)) filePath = candidate;
          }

          if (filePath) {
            const fileBuffer = await readFile(filePath);
            const ext = filePath.split(".").pop() ?? "bin";
            const entryName = `Portafolio/${safeComp}/${safeRA}/evidencia.${ext}`;
            entries.push({ name: entryName, data: fileBuffer, date: entrega.fechaEntrega });
          } else {
            // External URL — store a .url shortcut file instead
            const shortcut = Buffer.from(`[InternetShortcut]\nURL=${entrega.urlArchivo}\n`, "utf-8");
            entries.push({
              name: `Portafolio/${safeComp}/${safeRA}/enlace_externo.url`,
              data: shortcut,
              date: entrega.fechaEntrega,
            });
          }
        } else {
          // Placeholder for empty RA
          const placeholder = Buffer.from(
            `Resultado de Aprendizaje: ${ra.nombre}\nAún no hay evidencia entregada para este RA.\n`,
            "utf-8"
          );
          entries.push({
            name: `Portafolio/${safeComp}/${safeRA}/sin_evidencia.txt`,
            data: placeholder,
            date: new Date(),
          });
        }
      }
    }

    const zipBuffer = await buildZip(entries);
    const aprendizNombre = `${aprendiz.nombres}_${aprendiz.apellidos}`.replace(/\s+/g, "_");
    const fichaCode = aprendiz.ficha.codigo;
    const fileName = `Portafolio_${aprendizNombre}_Ficha${fichaCode}.zip`;

    return new NextResponse(new Uint8Array(zipBuffer), {
      headers: {
        "Content-Type": "application/zip",
        "Content-Disposition": `attachment; filename="${fileName}"`,
        "Content-Length": String(zipBuffer.length),
      },
    });
  } catch (error: any) {
    console.error("Error generando ZIP del portafolio:", error);
    return NextResponse.json({ error: "Error al generar el archivo" }, { status: 500 });
  }
}
