"use client";

import React, { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createDocenteAction, updateDocenteAction } from "@/actions/docentes.actions";
import { toast } from "sonner";
import { TipoDocumento, Estado } from "@prisma/client";
import { X, User } from "lucide-react";

interface DocenteFormDialogProps {
  docente?: any;
  instituciones: any[];
  onClose: () => void;
  onSuccess: () => void;
}

const selectClass =
  "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2";

export function DocenteFormDialog({ docente, instituciones, onClose, onSuccess }: DocenteFormDialogProps) {
  const [isPending, startTransition] = useTransition();
  const [errors, setErrors] = useState<any>({});
  
  const [formData, setFormData] = useState({
    tipoDocumento: docente?.tipoDocumento || "CC",
    numeroDocumento: docente?.numeroDocumento || "",
    nombres: docente?.nombres || "",
    apellidos: docente?.apellidos || "",
    email: docente?.email || "",
    telefono: docente?.telefono || "",
    profesion: docente?.profesion || "",
    institucionId: docente?.institucionId || "",
    estado: docente?.estado || "ACTIVO"
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    if (errors[e.target.name]) {
      setErrors(prev => ({ ...prev, [e.target.name]: null }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrors({});
    
    startTransition(async () => {
      let res;
      if (docente?.id) {
        res = await updateDocenteAction(docente.id, formData);
      } else {
        res = await createDocenteAction(formData);
      }

      if (res.success) {
        toast.success(`Docente ${docente ? "actualizado" : "creado"} correctamente`);
        onSuccess();
      } else {
        toast.error(res.error || "Error al procesar la solicitud");
        if (res.issues) {
          const newErrors: any = {};
          res.issues.forEach((issue: any) => {
            newErrors[issue.path[0]] = issue.message;
          });
          setErrors(newErrors);
        }
      }
    });
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4 overflow-y-auto">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg flex flex-col my-8">
        
        {/* Header */}
        <div className="flex justify-between items-center px-6 py-4 border-b">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-sena-50 rounded-lg">
              <User size={20} className="text-sena-600" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-text-primary">
                {docente ? "Editar Docente" : "Nuevo Docente"}
              </h2>
              <p className="text-xs text-text-secondary">
                {docente ? "Modifique los datos del docente." : "Ingrese los datos del nuevo docente asignado."}
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors">
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Tipo Documento *</label>
              <select name="tipoDocumento" value={formData.tipoDocumento} onChange={handleChange} className={selectClass} required>
                {Object.values(TipoDocumento).map(tipo => (
                  <option key={tipo} value={tipo}>{tipo}</option>
                ))}
              </select>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Número de Documento *</label>
              <Input 
                name="numeroDocumento" 
                value={formData.numeroDocumento} 
                onChange={handleChange} 
                placeholder="Ej. 100200300"
                disabled={!!docente}
                required
              />
              {errors.numeroDocumento && <span className="text-xs text-red-500">{errors.numeroDocumento}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Nombres *</label>
              <Input 
                name="nombres" 
                value={formData.nombres} 
                onChange={handleChange} 
                placeholder="Ej. Juan"
                required
              />
              {errors.nombres && <span className="text-xs text-red-500">{errors.nombres}</span>}
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-medium text-text-primary">Apellidos *</label>
              <Input 
                name="apellidos" 
                value={formData.apellidos} 
                onChange={handleChange} 
                placeholder="Ej. Pérez"
                required
              />
              {errors.apellidos && <span className="text-xs text-red-500">{errors.apellidos}</span>}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-text-primary">Correo Electrónico *</label>
              <Input 
                name="email" 
                type="email"
                value={formData.email} 
                onChange={handleChange} 
                placeholder="correo@ejemplo.com"
                required
              />
              {errors.email && <span className="text-xs text-red-500">{errors.email}</span>}
            </div>

            <div className="space-y-1.5 col-span-2 sm:col-span-1">
              <label className="text-sm font-medium text-text-primary">Teléfono</label>
              <Input 
                name="telefono" 
                value={formData.telefono} 
                onChange={handleChange} 
                placeholder="Ej. 3001234567"
              />
            </div>

            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-medium text-text-primary">Institución Educativa *</label>
              <select name="institucionId" value={formData.institucionId} onChange={handleChange} className={selectClass} required>
                <option value="" disabled>Seleccione la institución...</option>
                {instituciones.map(inst => (
                  <option key={inst.id} value={inst.id}>{inst.nombre}</option>
                ))}
              </select>
              {errors.institucionId && <span className="text-xs text-red-500">{errors.institucionId}</span>}
            </div>
            
            <div className="space-y-1.5 col-span-2">
              <label className="text-sm font-medium text-text-primary">Profesión / Perfil</label>
              <Input 
                name="profesion" 
                value={formData.profesion} 
                onChange={handleChange} 
                placeholder="Ej. Ingeniero de Sistemas, Licenciado en Matemáticas..."
              />
            </div>

            {docente && (
              <div className="space-y-1.5 col-span-2">
                <label className="text-sm font-medium text-text-primary">Estado</label>
                <select name="estado" value={formData.estado} onChange={handleChange} className={selectClass}>
                  <option value="ACTIVO">Activo</option>
                  <option value="INACTIVO">Inactivo</option>
                </select>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-3 border-t mt-6">
            <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending ? "Guardando..." : "Guardar"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

