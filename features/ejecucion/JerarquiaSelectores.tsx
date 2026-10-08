"use client";

import React, { useEffect, useState } from "react";
import { getJerarquiaAcademicaAction } from "@/actions/jerarquia.actions";

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export function JerarquiaSelectores({
  fichaId,
  defaultRaId = "",
  defaultCriterioId = "",
  defaultInstrumentoId = ""
}: {
  fichaId: string,
  defaultRaId?: string,
  defaultCriterioId?: string,
  defaultInstrumentoId?: string
}) {
  const [competencias, setCompetencias] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  const [selectedComp, setSelectedComp] = useState("");
  const [selectedRa, setSelectedRa] = useState(defaultRaId);

  useEffect(() => {
    if (fichaId) {
      setLoading(true);
      getJerarquiaAcademicaAction(fichaId).then(res => {
        if (res.success && res.data) {
          setCompetencias(res.data);

          // Si hay un RA por defecto, intentar autoseleccionar la competencia
          if (defaultRaId) {
            for (const c of res.data) {
              if (c.resultadosAprendizaje?.some((r: any) => r.id === defaultRaId)) {
                setSelectedComp(c.id);
                break;
              }
            }
          }
        }
        setLoading(false);
      });
    } else {
      setCompetencias([]);
    }
  }, [fichaId, defaultRaId]);

  const currentComp = competencias.find(c => c.id === selectedComp);
  const currentRa = currentComp?.resultadosAprendizaje?.find((r: any) => r.id === selectedRa);

  if (loading) return <div className="text-sm text-gray-500 py-2">Cargando jerarquía académica...</div>;
  if (!fichaId) return null;

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-gray-50 mt-4 mb-4">
      <h3 className="text-sm font-semibold text-gray-700">Trazabilidad Académica (SENA)</h3>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-primary">Competencia / Módulo</label>
        <select
          className={selectClass}
          value={selectedComp}
          onChange={e => { setSelectedComp(e.target.value); setSelectedRa(""); }}
        >
          <option value="">Seleccione competencia...</option>
          {competencias.map(c => (
            <option key={c.id} value={c.id}>{c.codigo} - {c.nombre}</option>
          ))}
        </select>
      </div>

      <div className="space-y-1.5">
        <label className="text-xs font-medium text-text-primary">Resultado de Aprendizaje (RA)</label>
        <select
          name="resultadoAprendizajeId"
          className={selectClass}
          value={selectedRa}
          onChange={e => { setSelectedRa(e.target.value); }}
          disabled={!selectedComp}
        >
          <option value="">Seleccione RA...</option>
          {currentComp?.resultadosAprendizaje?.map((r: any) => (
            <option key={r.id} value={r.id}>{r.codigo} - {r.nombre}</option>
          ))}
        </select>
      </div>

    </div>
  );
}
