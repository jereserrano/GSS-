"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUser, updateUser } from "@/actions/user.actions";
import { toast } from "sonner";
import { X, ShieldAlert } from "lucide-react";
import { getHierarchyLevel } from "@/lib/hierarchy";

interface UsuarioFormDialogProps {
  user?: any;
  roles: any[];
  instituciones?: any[];
  fichas?: any[];
  aprendicesSinUsuario?: any[];
  /** Sesión del usuario en sesión, para filtrar roles asignables. */
  currentUserSession: {
    id: string;
    role: string;
    hierarchyLevel: number;
  };
  onClose: () => void;
}

export function UsuarioFormDialog({
  user,
  roles,
  instituciones = [],
  fichas = [],
  aprendicesSinUsuario = [],
  currentUserSession,
  onClose
}: UsuarioFormDialogProps) {
  const [loading, setLoading] = useState(false);
  const isEditing = !!user;

  /**
   * Filtra los roles que el usuario en sesión puede asignar.
   * Solo se muestran roles con jerarquía ESTRICTAMENTE INFERIOR a la del solicitante.
   */
  const assignableRoles = roles.filter((rol) => {
    const rolLevel = getHierarchyLevel(rol.nombre);
    return rolLevel > currentUserSession.hierarchyLevel && rolLevel !== 99;
  });

  const initialRolId = user?.rolId || (typeof user?.rol === "string" ? user?.rol : user?.rol?.id) || "";
  const [selectedRolId, setSelectedRolId] = useState(initialRolId);
  const [vinculacionModo, setVinculacionModo] = useState<"ficha" | "existente">("ficha");
  const [selectedFichaId, setSelectedFichaId] = useState(user?.aprendiz?.fichaId || "");
  const [selectedAprendizId, setSelectedAprendizId] = useState("");

  const selectedRoleObj = assignableRoles.find((r) => r.id === selectedRolId) || roles.find((r) => r.id === selectedRolId || r.nombre === selectedRolId);
  const isAprendizRol = (selectedRoleObj?.nombre || selectedRolId || "").toUpperCase().includes("APRENDIZ");

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: any = {
      nombre: formData.get("nombre") as string,
      email: formData.get("email") as string,
      rolId: formData.get("rolId") as string,
      institucionId: (formData.get("institucionId") as string) || null,
      password: formData.get("password") as string,
      estado: formData.get("estado") as string,
      fichaId: (formData.get("fichaId") as string) || null,
      aprendizId: (formData.get("aprendizId") as string) || null,
      tipoDocumento: (formData.get("tipoDocumento") as string) || "CC",
      numeroDocumento: (formData.get("numeroDocumento") as string) || null,
    };

    if (isAprendizRol && !data.fichaId && !data.aprendizId) {
      toast.error("Para el rol APRENDIZ debes seleccionar una Ficha o vincular un aprendiz existente.");
      setLoading(false);
      return;
    }

    try {
      if (isEditing) {
        const res = await updateUser(user.id, data);
        if (res.error) throw new Error(res.error);
        toast.success("Usuario actualizado correctamente");
      } else {
        const res = await createUser(data);
        if (res.error) throw new Error(res.error);
        toast.success("Usuario creado y vinculado correctamente");
      }
      onClose();
    } catch (error: any) {
      toast.error(error.message || "Ocurrió un error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]">
        <div className="flex justify-between items-center p-4 border-b shrink-0">
          <h2 className="text-lg font-semibold">{isEditing ? "Editar Usuario" : "Nuevo Usuario"}</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4 space-y-4 overflow-y-auto">
          <div className="space-y-2">
            <label className="text-sm font-medium">Nombre completo *</label>
            <Input id="input-nombre-usuario" name="nombre" defaultValue={user?.nombre} required />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Correo electrónico *</label>
            <Input id="input-email-usuario" type="email" name="email" defaultValue={user?.email} required />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">Rol *</label>
            {assignableRoles.length === 0 ? (
              <div className="flex items-center gap-2 rounded-md border border-orange-200 bg-orange-50 px-3 py-2 text-sm text-orange-700">
                <ShieldAlert size={16} />
                <span>No tiene permisos para asignar roles desde este nivel.</span>
              </div>
            ) : (
              <select 
                id="select-rol-usuario"
                name="rolId" 
                value={selectedRolId}
                onChange={(e) => setSelectedRolId(e.target.value)}
                required
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="">Seleccione un rol</option>
                {assignableRoles.map((rol) => (
                  <option key={rol.id} value={rol.id}>
                    {rol.nombre}
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Sección condicional para Aprendiz */}
          {isAprendizRol && (
            <div className="p-4 bg-emerald-50/80 border border-emerald-200 rounded-lg space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-900 uppercase tracking-wide">
                  Asignación Académica (Ficha Obligatoria) *
                </label>
                {aprendicesSinUsuario.length > 0 && !isEditing && (
                  <div className="flex text-xs gap-1 bg-white p-0.5 rounded border border-emerald-200">
                    <button
                      type="button"
                      onClick={() => setVinculacionModo("ficha")}
                      className={`px-2 py-0.5 rounded transition-colors ${vinculacionModo === "ficha" ? "bg-emerald-600 text-white font-medium" : "text-slate-600 hover:text-emerald-700"}`}
                    >
                      Asignar Ficha
                    </button>
                    <button
                      type="button"
                      onClick={() => setVinculacionModo("existente")}
                      className={`px-2 py-0.5 rounded transition-colors ${vinculacionModo === "existente" ? "bg-emerald-600 text-white font-medium" : "text-slate-600 hover:text-emerald-700"}`}
                    >
                      Vincular Existente ({aprendicesSinUsuario.length})
                    </button>
                  </div>
                )}
              </div>

              {vinculacionModo === "ficha" ? (
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-medium text-slate-700 mb-1 block">Ficha de Formación *</label>
                    <select
                      id="select-ficha-aprendiz"
                      name="fichaId"
                      value={selectedFichaId}
                      onChange={(e) => setSelectedFichaId(e.target.value)}
                      required={isAprendizRol && vinculacionModo === "ficha"}
                      className="flex h-10 w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                    >
                      <option value="">Seleccione la ficha académica</option>
                      {fichas.map((f) => (
                        <option key={f.id} value={f.id}>
                          {f.codigo} - {f.programa?.nombre || "Sin Programa"}
                        </option>
                      ))}
                    </select>
                    <p className="text-[11px] text-emerald-700 mt-1">
                      El aprendiz podrá consultar actividades y registrar evidencias únicamente de esta ficha.
                    </p>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">Tipo de Documento</label>
                      <select name="tipoDocumento" defaultValue={user?.aprendiz?.tipoDocumento || "CC"} className="flex h-9 w-full rounded border bg-white px-2 text-xs">
                        <option value="CC">Cédula de Ciudadanía (CC)</option>
                        <option value="TI">Tarjeta de Identidad (TI)</option>
                        <option value="CE">Cédula de Extranjería (CE)</option>
                        <option value="PP">Pasaporte (PP)</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-[11px] text-slate-600 font-medium block mb-1">N° de Documento</label>
                      <Input 
                        name="numeroDocumento" 
                        defaultValue={user?.aprendiz?.numeroDocumento || ""} 
                        placeholder="Ej. 1000000000" 
                        className="h-9 text-xs bg-white" 
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-700 block">Seleccionar Aprendiz Existente *</label>
                  <select
                    id="select-aprendiz-existente"
                    name="aprendizId"
                    value={selectedAprendizId}
                    onChange={(e) => setSelectedAprendizId(e.target.value)}
                    required={isAprendizRol && vinculacionModo === "existente"}
                    className="flex h-10 w-full rounded-md border border-emerald-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="">Seleccione el expediente a vincular</option>
                    {aprendicesSinUsuario.map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.nombres} {a.apellidos} ({a.numeroDocumento}) — Ficha: {a.ficha?.codigo}
                      </option>
                    ))}
                  </select>
                  <p className="text-[11px] text-emerald-800">
                    Se enlazará este usuario con el expediente académico seleccionado.
                  </p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-2">
            <label className="text-sm font-medium">Institución (Opcional)</label>
            <select 
              id="select-institucion-usuario"
              name="institucionId" 
              defaultValue={user?.institucionId || ""} 
              className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
            >
              <option value="">Ninguna / Global</option>
              {instituciones.map((inst) => (
                <option key={inst.id} value={inst.id}>
                  {inst.nombre}
                </option>
              ))}
            </select>
            <p className="text-[10px] text-slate-500">Útil para Subdirectores, Coordinadores y roles limitados por sede.</p>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium">
              Contraseña {isEditing && <span className="text-gray-400 font-normal">(Dejar en blanco para mantener actual)</span>}
            </label>
            <Input id="input-password-usuario" type="password" name="password" required={!isEditing} />
          </div>

          {isEditing && (
            <div className="space-y-2">
              <label className="text-sm font-medium">Estado</label>
              <select 
                id="select-estado-usuario"
                name="estado" 
                defaultValue={user?.estado}
                className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
              >
                <option value="ACTIVO">Activo</option>
                <option value="INACTIVO">Inactivo</option>
              </select>
            </div>
          )}

          <div className="pt-4 flex justify-end gap-2 shrink-0">
            <Button id="btn-cancelar-usuario" type="button" variant="outline" onClick={onClose}>Cancelar</Button>
            <Button
              id="btn-guardar-usuario"
              type="submit"
              disabled={loading || assignableRoles.length === 0}
            >
              {loading ? "Guardando..." : "Guardar Usuario"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
