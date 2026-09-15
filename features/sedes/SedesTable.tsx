"use client";

import React, { useEffect, useState } from "react";
import { DataTable } from "@/components/shared/DataTable";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Plus, Filter, Download } from "lucide-react";
import type { Sede } from "@/types/institucion.types";
import type { ColumnaDef, PaginatedResponse } from "@/types/common.types";
// Asumiendo que expandimos el servicio de instituciones para obtener sedes:
import { InstitucionesService } from "@/services/instituciones.service";

export function SedesTable() {
  const [data, setData] = useState<PaginatedResponse<Sede> | null>(null);
  const [loading, setLoading] = useState(true);
  
  const [filtros, setFiltros] = useState({
    pagina: 1,
    tamano: 10,
    busqueda: ""
  });

  const cargarDatos = async () => {
    setLoading(true);
    // Para la Fase 1, reutilizamos la lógica de instituciones simulando que devuelve sedes.
    // En la realidad, esto llamaría a un getSedes(). 
    // Usaremos un mock directo aquí para demostrar la UI de Sedes:
    const mockSedes: Sede[] = [
      {
        id: "sede-1",
        institucionId: "inst-1",
        nombre: "Sede Principal",
        direccion: "Calle 1 # 2-3",
        barrio: "Centro",
        municipio: "Santa Marta",
        esPrincipal: true,
        coordinador: "María Pérez",
        telefono: "3001234567",
        estado: "activo",
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        institucion: { id: "inst-1", nombre: "IED Liceo Celedón", nit: "800.123.456-7" } as any
      },
      {
        id: "sede-2",
        institucionId: "inst-2",
        nombre: "Sede Sur",
        direccion: "Carrera 45 # 12-8",
        barrio: "El Rodadero",
        municipio: "Santa Marta",
        esPrincipal: false,
        coordinador: "Juan Gómez",
        telefono: "3019876543",
        estado: "activo",
        creadoEn: new Date().toISOString(),
        actualizadoEn: new Date().toISOString(),
        institucion: { id: "inst-2", nombre: "IED Normal Superior", nit: "800.987.654-3" } as any
      }
    ];

    setTimeout(() => {
      setData({
        data: mockSedes,
        total: 2,
        page: 1,
        pageSize: 10,
        totalPages: 1
      });
      setLoading(false);
    }, 600);
  };

  useEffect(() => {
    const handler = setTimeout(() => {
      cargarDatos();
    }, 300);
    return () => clearTimeout(handler);
  }, [filtros]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFiltros(prev => ({ ...prev, busqueda: e.target.value, pagina: 1 }));
  };

  const columnas: ColumnaDef<Sede>[] = [
    {
      key: "nombre",
      header: "Sede",
      render: (s) => (
        <div className="flex flex-col">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-text-primary">{s.nombre}</span>
            {s.esPrincipal && (
              <span className="bg-primary-light text-primary text-[10px] px-1.5 py-0.5 rounded-sm uppercase tracking-wider font-bold">
                Principal
              </span>
            )}
          </div>
          <span className="text-xs text-text-secondary">{s.institucion?.nombre}</span>
        </div>
      )
    },
    {
      key: "ubicacion",
      header: "Ubicación",
      render: (s) => (
        <div className="flex flex-col">
          <span className="text-sm">{s.direccion}</span>
          <span className="text-xs text-text-secondary">{s.barrio} • {s.municipio}</span>
        </div>
      )
    },
    {
      key: "coordinador",
      header: "Coordinador",
      render: (s) => (
        <div className="flex flex-col">
          <span className="text-sm">{s.coordinador || "No asignado"}</span>
          <span className="text-xs text-text-secondary">{s.telefono}</span>
        </div>
      )
    },
    {
      key: "estado",
      header: "Estado",
      render: (s) => <StatusBadge estado={s.estado} />
    }
  ];

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-3 justify-between">
        <div className="flex flex-1 gap-2 max-w-lg">
          <div className="relative flex-1 input-with-icon">
            <Search size={16} className="input-icon" />
            <Input 
              placeholder="Buscar sede por nombre o institución..." 
              value={filtros.busqueda}
              onChange={handleSearchChange}
              className="bg-surface"
            />
          </div>
          <Button variant="outline" className="shrink-0 bg-surface">
            <Filter size={16} className="mr-2" /> Filtros
          </Button>
        </div>
        
        <div className="flex gap-2">
          <Button variant="outline" className="bg-surface">
            <Download size={16} className="mr-2" /> Exportar
          </Button>
          <Button>
            <Plus size={16} className="mr-2" /> Nueva Sede
          </Button>
        </div>
      </div>

      <DataTable 
        data={data?.data || []} 
        columnas={columnas} 
        isLoading={loading} 
        // En un caso real llevaría al detalle de la sede o se edita en modal
      />
    </div>
  );
}
