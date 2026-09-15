import type { ServiceResult, PaginatedResponse } from "@/types/common.types";
import type { Institucion, FiltrosInstitucion } from "@/types/institucion.types";

export const InstitucionesService = {
  async getInstituciones(filtros: FiltrosInstitucion = {}): Promise<ServiceResult<PaginatedResponse<Institucion>>> {
    try {
      const params = new URLSearchParams();
      if (filtros.pagina) params.set("pagina", String(filtros.pagina));
      if (filtros.tamano) params.set("tamano", String(filtros.tamano));
      if (filtros.busqueda) params.set("busqueda", filtros.busqueda);
      if (filtros.estado) params.set("estado", filtros.estado);

      const res = await fetch(`/api/instituciones?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener instituciones");
      const json = await res.json();
      return { ok: true, data: json.data };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
  },

  async getInstitucionById(id: string): Promise<ServiceResult<Institucion>> {
    try {
      const res = await fetch(`/api/instituciones/${id}`);
      if (!res.ok) {
        if (res.status === 404) return { ok: false, error: "Institución no encontrada" };
        throw new Error("Error al obtener institución");
      }
      const json = await res.json();
      return { ok: true, data: json.data };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
  },
};
