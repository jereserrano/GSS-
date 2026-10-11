"use client";

import React, { useState, useEffect, Suspense } from "react";
import { FolderCheck, UserCheck, Shield } from "lucide-react";
import { ConsolaRevisionDocumentos } from "./ConsolaRevisionDocumentos";
import { PortafolioInstructor } from "../instructor/PortafolioInstructor";
import { useSearchParams } from "next/navigation";

interface Props {
  userId: string;
  userRole?: string;
}

function ConsolaDocumentosRevisorInner({ userId, userRole }: Props) {
  const searchParams = useSearchParams();
  const initialTab = searchParams.get("vista") === "mi-portafolio" ? "mi-portafolio" : "supervision";
  const [vista, setVista] = useState<"supervision" | "mi-portafolio">(initialTab);

  useEffect(() => {
    const vistaParam = searchParams.get("vista");
    if (vistaParam === "mi-portafolio") {
      setVista("mi-portafolio");
    } else if (vistaParam === "supervision") {
      setVista("supervision");
    }
  }, [searchParams]);

  const rolFormat = (userRole || "FUNCIONARIO").replace(/_/g, " ");

  return (
    <div className="space-y-6">
      {/* Selector de Modo: Supervisión Institucional vs Mi Portafolio Personal */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-white p-3 rounded-2xl border border-[#00304D]/10 shadow-sm">
        <div className="inline-flex p-1 bg-slate-100 rounded-xl gap-1">
          <button
            type="button"
            onClick={() => setVista("supervision")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              vista === "supervision"
                ? "bg-[#00304D] text-white shadow-sm"
                : "text-slate-600 hover:text-[#00304D] hover:bg-white/60"
            }`}
          >
            <FolderCheck className="h-4 w-4" />
            <span>Supervisión Institucional</span>
          </button>

          <button
            type="button"
            onClick={() => setVista("mi-portafolio")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-lg font-medium text-sm transition-all duration-200 ${
              vista === "mi-portafolio"
                ? "bg-[#39A900] text-white shadow-sm"
                : "text-slate-600 hover:text-[#39A900] hover:bg-white/60"
            }`}
          >
            <UserCheck className="h-4 w-4" />
            <span>Mi Portafolio (Subir Documentos)</span>
          </button>
        </div>

        <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700">
          <Shield className="h-3.5 w-3.5 text-[#39A900]" />
          <span>ROL: {rolFormat}</span>
        </div>
      </div>

      {vista === "supervision" ? (
        <ConsolaRevisionDocumentos />
      ) : (
        <div className="space-y-4">
          <div className="bg-emerald-50 border border-emerald-200/80 p-4 rounded-xl text-emerald-900 text-sm flex flex-col sm:flex-row sm:items-center justify-between gap-2">
            <div>
              <p className="font-bold flex items-center gap-1.5">
                <UserCheck className="h-4 w-4 text-[#39A900]" />
                Mi Portafolio como Empleado / Funcionario
              </p>
              <p className="text-xs text-emerald-800 mt-0.5">
                Como empleado con rol administrativo o de coordinación, aquí puedes registrar y actualizar tus datos personales, subir tus soportes (Cédula, Hoja de Vida, Títulos, RUT, Contrato) y radicar solicitudes de cartas laborales.
              </p>
            </div>
            <span className="self-start sm:self-center px-3 py-1 bg-emerald-200/70 rounded-full text-xs font-bold text-emerald-900 whitespace-nowrap">
              {rolFormat}
            </span>
          </div>

          <PortafolioInstructor userId={userId} />
        </div>
      )}
    </div>
  );
}

export function ConsolaDocumentosRevisor(props: Props) {
  return (
    <Suspense fallback={<div className="p-8 text-center text-slate-500 animate-pulse">Cargando consola de documentos...</div>}>
      <ConsolaDocumentosRevisorInner {...props} />
    </Suspense>
  );
}

