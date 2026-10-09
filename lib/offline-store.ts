import { openDB, DBSchema, IDBPDatabase } from 'idb';

interface GSSOfflineDB extends DBSchema {
  asistencias_pendientes: {
    key: string;
    value: {
      id: string;
      fichaId: string;
      fecha: string; // ISO string
      payload: any; // The full arguments to guardarAsistenciaMasiva
      timestamp: number;
    };
  };
}

let dbPromise: Promise<IDBPDatabase<GSSOfflineDB>> | null = null;

if (typeof window !== 'undefined') {
  dbPromise = openDB<GSSOfflineDB>('gss-offline-db', 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains('asistencias_pendientes')) {
        db.createObjectStore('asistencias_pendientes', { keyPath: 'id' });
      }
    },
  });
}

export async function saveAsistenciaOffline(fichaId: string, fecha: string, payload: any) {
  if (!dbPromise) return;
  const db = await dbPromise;
  const id = `asistencia_${fichaId}_${fecha}_${Date.now()}`;
  await db.put('asistencias_pendientes', {
    id,
    fichaId,
    fecha,
    payload,
    timestamp: Date.now(),
  });
  return id;
}

export async function getAsistenciasPendientes() {
  if (!dbPromise) return [];
  const db = await dbPromise;
  return await db.getAll('asistencias_pendientes');
}

export async function deleteAsistenciaPendiente(id: string) {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.delete('asistencias_pendientes', id);
}

export async function clearAllAsistenciasPendientes() {
  if (!dbPromise) return;
  const db = await dbPromise;
  await db.clear('asistencias_pendientes');
}
