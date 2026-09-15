"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { MapPin, Phone, Building2, User } from "lucide-react";
import type { Institucion } from "@/types/institucion.types";
import { formatDateShort } from "@/lib/utils";
// En un caso real importaríamos SedesTable pasando la institucionId como prop
// import { SedesTable } from "@/features/sedes/SedesTable";

export function InstitucionDetail({ institucion }: { institucion: Institucion }) {
  return (
    <div className="space-y-6">
      {/* Tarjeta de Encabezado */}
      <Card className="border-0 shadow-sm bg-surface overflow-hidden">
        <div className="h-24 bg-sena-900 flex items-center justify-between px-8">
          <div className="flex items-center gap-4 text-white">
            <div className="h-16 w-16 bg-white rounded-lg flex items-center justify-center text-sena-900 shadow-md">
              <Building2 size={32} />
            </div>
            <div>
              <h2 className="text-2xl font-bold">{institucion.nombre}</h2>
              <p className="text-sena-100 flex items-center gap-2">
                NIT: {institucion.nit} 
                <span className="opacity-50">•</span> 
                {institucion.municipio}, {institucion.departamento}
              </p>
            </div>
          </div>
          <StatusBadge estado={institucion.estado} />
        </div>
        
        <CardContent className="p-0">
          <div className="grid grid-cols-1 md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border">
            <div className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
              <User className="text-primary shrink-0 mt-1" size={24} />
              <div>
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">Rector</p>
                <p className="font-semibold text-text-primary mt-1">{institucion.rector}</p>
              </div>
            </div>
            
            <div className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
              <Phone className="text-primary shrink-0 mt-1" size={24} />
              <div>
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">Contacto</p>
                <p className="font-semibold text-text-primary mt-1">{institucion.telefono}</p>
                <p className="text-sm text-text-secondary mt-0.5 break-all">{institucion.email}</p>
              </div>
            </div>
            
            <div className="p-6 flex items-start gap-4 hover:bg-slate-50 transition-colors">
              <MapPin className="text-primary shrink-0 mt-1" size={24} />
              <div>
                <p className="text-sm font-medium text-text-secondary uppercase tracking-wider">Ubicación</p>
                <p className="font-semibold text-text-primary mt-1">{institucion.direccion}</p>
                <p className="text-sm text-text-secondary mt-0.5">{institucion.municipio}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs o secciones secundarias */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Sedes Asociadas ({institucion.sedes?.length || 0})</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Aquí iría la tabla de sedes filtrada por esta institución */}
              <div className="p-8 text-center text-text-secondary border rounded-lg border-dashed">
                <p>Lista de sedes en construcción</p>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div className="lg:col-span-1 space-y-6">
          <Card className="border-0 shadow-sm">
            <CardHeader>
              <CardTitle className="text-lg">Información de Sistema</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">ID Interno</p>
                <p className="text-sm font-mono text-text-primary">{institucion.id}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Registro Creado</p>
                <p className="text-sm text-text-primary">{formatDateShort(institucion.creadoEn)}</p>
              </div>
              <div>
                <p className="text-xs text-text-secondary font-medium uppercase tracking-wider mb-1">Última Actualización</p>
                <p className="text-sm text-text-primary">{formatDateShort(institucion.actualizadoEn)}</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
