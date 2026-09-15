import type { ServiceResult, PaginatedResponse } from "@/types/common.types";
import type { Aprendiz, FiltrosAprendiz } from "@/types/aprendiz.types";

export const AprendicesService = {
  async getAprendices(filtros: FiltrosAprendiz = {}): Promise<ServiceResult<PaginatedResponse<Aprendiz>>> {
    try {
      const params = new URLSearchParams();
      if (filtros.pagina) params.set("pagina", String(filtros.pagina));
      if (filtros.tamano) params.set("tamano", String(filtros.tamano));
      if (filtros.busqueda) params.set("busqueda", filtros.busqueda);
      if (filtros.nivelRiesgo) params.set("nivelRiesgo", filtros.nivelRiesgo);
      if (filtros.fichaId) params.set("fichaId", filtros.fichaId);

      const res = await fetch(`/api/aprendices?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener aprendices");
      const json = await res.json();
      return { ok: true, data: json.data };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
  },

  async getAprendizById(id: string): Promise<ServiceResult<Aprendiz>> {
    try {
      const res = await fetch(`/api/aprendices/${id}`);
      if (!res.ok) {
        if (res.status === 404) return { ok: false, error: "Aprendiz no encontrado" };
        throw new Error("Error al obtener aprendiz");
      }
      const json = await res.json();
      return { ok: true, data: json.data };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
  },
};
