import type { ServiceResult, PaginatedResponse } from "@/types/common.types";
import type { Ficha, FiltrosFicha } from "@/types/institucion.types";

export const FichasService = {
  async getFichas(filtros: FiltrosFicha = {}): Promise<ServiceResult<PaginatedResponse<Ficha>>> {
    try {
      const params = new URLSearchParams();
      if (filtros.pagina) params.set("pagina", String(filtros.pagina));
      if (filtros.tamano) params.set("tamano", String(filtros.tamano));
      if (filtros.busqueda) params.set("busqueda", filtros.busqueda);

      const res = await fetch(`/api/fichas?${params.toString()}`);
      if (!res.ok) throw new Error("Error al obtener fichas");
      const json = await res.json();
      return { ok: true, data: json.data };
    } catch (error) {
      return { ok: false, error: error instanceof Error ? error.message : "Error desconocido" };
    }
  },
};
