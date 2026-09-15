"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { InstitucionDetail } from "@/features/instituciones/InstitucionDetail";
import { InstitucionesService } from "@/services/instituciones.service";
import type { Institucion } from "@/types/institucion.types";

export default function InstitucionDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [institucion, setInstitucion] = useState<Institucion | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarInstitucion = async () => {
      setLoading(true);
      const result = await InstitucionesService.getInstitucionById(id);
      if (result.ok) {
        setInstitucion(result.data);
      }
      setLoading(false);
    };

    cargarInstitucion();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container page-enter space-y-6">
        <div className="skeleton h-[200px] w-full rounded-xl" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="skeleton h-[400px] lg:col-span-2 rounded-xl" />
          <div className="skeleton h-[400px] lg:col-span-1 rounded-xl" />
        </div>
      </div>
    );
  }

  if (!institucion) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-danger-500 mb-4 text-4xl">⚠️</div>
        <h2 className="text-xl font-bold mb-2">Institución no encontrada</h2>
        <p className="text-text-secondary">El registro que buscas no existe o fue eliminado.</p>
      </div>
    );
  }

  return (
    <div className="page-container page-enter">
      <InstitucionDetail institucion={institucion} />
    </div>
  );
}
