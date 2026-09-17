"use server";

import { getPaginacion, paginatedResponse } from "@/lib/api-helpers";

// Documento model not yet in database. Mocking data for UI purposes.
let mockDocumentos: any[] = [];

export async function getDocumentosAction(filtros: any = {}) {
  try {
    const pagina = filtros.pagina || 1;
    const tamano = filtros.tamano || 10;
    
    let filtered = [...mockDocumentos];
    if (filtros.busqueda) {
      const q = filtros.busqueda.toLowerCase();
      filtered = filtered.filter(d => d.nombre.toLowerCase().includes(q));
    }

    const { skip, take } = getPaginacion(pagina, tamano);
    const paginated = filtered.slice(skip, skip + take);

    return { success: true, data: paginatedResponse(paginated, filtered.length, pagina, tamano) };
  } catch (error: any) {
    return { success: false, error: "Error al obtener documentos" };
  }
}

export async function createDocumento(data: z.infer<typeof documentoSchema>) {
  try {
    const parsed = documentoSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const newDoc = {
      id: "mock-" + Date.now(),
      ...data,
      institucion: data.institucionId ? { nombre: "Institución " + data.institucionId } : null,
      creadoEn: new Date().toISOString()
    };
    mockDocumentos.push(newDoc);
    return { success: true, documento: newDoc };
  } catch (error: any) {
    return { error: "Error al registrar documento" };
  }
}

export async function updateDocumento(id: string, data: z.infer<typeof documentoSchema>) {
  try {
    const parsed = documentoSchema.safeParse(data);
    if (!parsed.success) return { success: false, error: "Datos inválidos", issues: parsed.error.errors };
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    const idx = mockDocumentos.findIndex(d => d.id === id);
    if (idx >= 0) {
      mockDocumentos[idx] = { ...mockDocumentos[idx], ...data };
      return { success: true, documento: mockDocumentos[idx] };
    }
    return { error: "Documento no encontrado" };
  } catch (error: any) {
    return { error: "Error al actualizar documento" };
  }
}

export async function deleteDocumento(id: string) {
  try {
    
    const user = await requireRole(["ADMINISTRADOR", "COORDINADOR", "INSTRUCTOR"]);
    mockDocumentos = mockDocumentos.filter(d => d.id !== id);
    return { success: true };
  } catch (error: any) {
    return { error: "Error al eliminar documento" };
  }
}

export async function exportDocumentosCSV() {
  try {
    const header = "Nombre,Tipo,Institución,Fecha de Registro";
    const rows = mockDocumentos.map((d) =>
      [
        d.nombre ?? "",
        d.tipo ?? "",
        d.institucion?.nombre ?? "General",
        d.creadoEn ? new Date(d.creadoEn).toLocaleDateString("es-CO") : "",
      ]
        .map((v: any) => `"${String(v || "").replace(/"/g, '""')}"`)
        .join(",")
    );

    return { success: true, csv: [header, ...rows].join("\n") };
  } catch (error: any) {
    return { success: false, error: "Error al generar reporte de documentos" };
  }
}
