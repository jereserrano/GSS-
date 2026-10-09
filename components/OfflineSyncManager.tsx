"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { useNetworkStatus } from "@/hooks/use-network";
import { getAsistenciasPendientes, deleteAsistenciaPendiente } from "@/lib/offline-store";
import { guardarAsistenciaMasiva } from "@/actions/asistencia.actions";

export function OfflineSyncManager() {
  const isOnline = useNetworkStatus();

  useEffect(() => {
    if (isOnline) {
      syncOfflineData();
    }
  }, [isOnline]);

  const syncOfflineData = async () => {
    try {
      const pendientes = await getAsistenciasPendientes();
      if (pendientes && pendientes.length > 0) {
        toast.info(`Sincronizando ${pendientes.length} registros guardados offline...`);
        let exito = 0;

        for (const item of pendientes) {
          try {
            const result = await guardarAsistenciaMasiva(item.payload);
            if (result.success) {
              await deleteAsistenciaPendiente(item.id);
              exito++;
            }
          } catch (e) {
            console.error("Error sincronizando ítem", item, e);
          }
        }

        if (exito > 0) {
          toast.success(`¡Sincronización completada! ${exito} asistencias subidas a la base de datos.`);
        }
      }
    } catch (e) {
      console.error("Error leyendo offline DB", e);
    }
  };

  return null;
}
