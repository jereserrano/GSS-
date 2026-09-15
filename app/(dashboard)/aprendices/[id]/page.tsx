"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AprendizProfile } from "@/features/aprendices/AprendizProfile";
import { AprendicesService } from "@/services/aprendices.service";
import type { Aprendiz } from "@/types/aprendiz.types";

export default function AprendizDetailPage() {
  const params = useParams();
  const id = params.id as string;
  
  const [aprendiz, setAprendiz] = useState<Aprendiz | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const cargarAprendiz = async () => {
      setLoading(true);
      const result = await AprendicesService.getAprendizById(id);
      if (result.ok) {
        setAprendiz(result.data);
      }
      setLoading(false);
    };

    cargarAprendiz();
  }, [id]);

  if (loading) {
    return (
      <div className="page-container page-enter">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          <div className="lg:col-span-1 space-y-6">
            <div className="skeleton h-[400px] w-full rounded-xl" />
            <div className="skeleton h-[200px] w-full rounded-xl" />
          </div>
          <div className="lg:col-span-3">
            <div className="skeleton h-12 w-full mb-6 rounded-md" />
            <div className="skeleton h-[500px] w-full rounded-xl" />
          </div>
        </div>
      </div>
    );
  }

  if (!aprendiz) {
    return (
      <div className="page-container flex flex-col items-center justify-center min-h-[60vh]">
        <div className="text-danger-500 mb-4">
          {/* Icono de error (usaríamos Lucide si se necesitara importarlo, pero para mantenerlo simple omitimos el icono) */}
          ⚠️
        </div>
        <h2 className="text-xl font-bold mb-2">Aprendiz no encontrado</h2>
        <p className="text-text-secondary">El registro que buscas no existe o fue eliminado.</p>
      </div>
    );
  }

  return (
    <div className="page-container page-enter">
      <AprendizProfile aprendiz={aprendiz} />
    </div>
  );
}
