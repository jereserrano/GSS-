"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createAprendiz, updateAprendiz } from "@/actions/aprendices.actions";
import { toast } from "sonner";
import { X, User } from "lucide-react";

interface Ficha {
  id: string;
  codigo: string;
}

interface AprendizFormDialogProps {
  aprendiz?: any;
  fichas: Ficha[];
  onClose: () => void;
}

const TIPOS_DOCUMENTO = ["CC", "TI", "CE", "PP"];
const NIVELES_RIESGO = [
  { value: "BAJO", label: "Bajo" },
  { value: "MEDIO", label: "Medio" },
  { value: "ALTO", label: "Alto" },
];
const ESTADOS_APRENDIZ = [
  { value: "EN_FORMACION", label: "En Formación" },
  { value: "EGRESADO", label: "Egresado" },
  { value: "RETIRADO", label: "Retirado" },
  { value: "APLAZADO", label: "Aplazado" },
  { value: "CANCELADO", label: "Cancelado" },
];

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export function AprendizFormDialog({ aprendiz, fichas, onClose }: AprendizFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!aprendiz;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      tipoDocumento:    formData.get("tipoDocumento") as string,
      numeroDocumento:  formData.get("numeroDocumento") as string,
      nombres:          formData.get("nombres") as string,
      apellidos:        formData.get("apellidos") as string,
      emailPersonal:    formData.get("emailPersonal") as string,
      emailSena:        formData.get("emailSena") as string,
      telefono:         formData.get("telefono") as string,
      fechaNacimiento:  formData.get("fechaNacimiento") as string,
      genero:           formData.get("genero") as string,
      direccion:        formData.get("direccion") as string,
      fichaId:          formData.get("fichaId") as string,
      estado:           formData.get("estado") as string,
      nivelRiesgo:      formData.get("nivelRiesgo") as string,
    };

    try {
      if (isEditing) {
        const res = await updateAprendiz(aprendiz.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Aprendiz actualizado correctamente");
      } else {
        const res = await createAprendiz(data);
        if (res.error) throw new Error(res.error);
        toast.success("Aprendiz registrado correctamente");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  // Formatear fecha para el input date
  const defaultFecha = aprendiz?.fechaNacimiento
    ? new Date(aprendiz.fechaNacimiento).toISOString().split("T")[0]
    : "";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sena-50 rounded-lg">
              <User size={20} className="text-sena-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {isEditing ? "Editar Aprendiz" : "Registrar Nuevo Aprendiz"}
              </h2>
              <p className="text-xs text-text-secondary">
                {isEditing ? `Editando: ${aprendiz.nombres} ${aprendiz.apellidos}` : "Completa todos los campos requeridos"}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="overflow-y-auto p-6 space-y-5 flex-1">
          {/* Sección: Identificación */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Identificación
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Tipo Doc. *</label>
                <select name="tipoDocumento" defaultValue={aprendiz?.tipoDocumento || "CC"} required className={selectClass}>
                  {TIPOS_DOCUMENTO.map(t => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Número de Documento *</label>
                <Input name="numeroDocumento" defaultValue={aprendiz?.numeroDocumento} required placeholder="Ej: 1012345678" />
              </div>
            </div>
          </div>

          {/* Sección: Datos Personales */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Datos Personales
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Nombres *</label>
                <Input name="nombres" defaultValue={aprendiz?.nombres} required placeholder="Ej: Juan Carlos" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Apellidos *</label>
                <Input name="apellidos" defaultValue={aprendiz?.apellidos} required placeholder="Ej: Pérez García" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Fecha de Nacimiento</label>
                <Input type="date" name="fechaNacimiento" defaultValue={defaultFecha} />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Género</label>
                <select name="genero" defaultValue={aprendiz?.genero || ""} className={selectClass}>
                  <option value="">No especificado</option>
                  <option value="masculino">Masculino</option>
                  <option value="femenino">Femenino</option>
                  <option value="otro">Otro</option>
                </select>
              </div>
              <div className="sm:col-span-2 space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Dirección</label>
                <Input name="direccion" defaultValue={aprendiz?.direccion} placeholder="Barrio / Calle / Carrera" />
              </div>
            </div>
          </div>

          {/* Sección: Contacto */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Contacto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Email Personal</label>
                <Input type="email" name="emailPersonal" defaultValue={aprendiz?.emailPersonal} placeholder="correo@gmail.com" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Email SENA</label>
                <Input type="email" name="emailSena" defaultValue={aprendiz?.emailSena} placeholder="correo@soy.sena.edu.co" />
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Teléfono</label>
                <Input name="telefono" defaultValue={aprendiz?.telefono} placeholder="300 000 0000" />
              </div>
            </div>
          </div>

          {/* Sección: Formación */}
          <div>
            <h3 className="text-xs font-semibold text-text-secondary uppercase tracking-wider mb-3">
              Formación y Seguimiento
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-1 space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Ficha *</label>
                <select name="fichaId" defaultValue={aprendiz?.fichaId || ""} required className={selectClass}>
                  <option value="">Seleccione ficha</option>
                  {fichas.map(f => (
                    <option key={f.id} value={f.id}>Ficha {f.codigo}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Estado</label>
                <select name="estado" defaultValue={aprendiz?.estado || "EN_FORMACION"} className={selectClass}>
                  {ESTADOS_APRENDIZ.map(e => (
                    <option key={e.value} value={e.value}>{e.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-text-primary">Nivel de Riesgo</label>
                <select name="nivelRiesgo" defaultValue={aprendiz?.nivelRiesgo || "BAJO"} className={selectClass}>
                  {NIVELES_RIESGO.map(r => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </form>

        {/* Footer */}
        <div className="px-6 py-4 border-t flex justify-end gap-3 bg-gray-50 rounded-b-xl">
          <Button type="button" variant="outline" onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button
            type="submit"
            form="aprendiz-form"
            disabled={loading}
            onClick={() => {
              // Trigger form submit desde el footer
              const form = document.querySelector<HTMLFormElement>("form");
              form?.requestSubmit();
            }}
          >
            {loading ? "Guardando..." : isEditing ? "Actualizar Aprendiz" : "Registrar Aprendiz"}
          </Button>
        </div>
      </div>
    </div>
  );
}
