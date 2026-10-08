import { prisma } from "@/lib/prisma";
import { NivelRiesgo } from "@prisma/client";

export async function recalcularRiesgoAprendiz(aprendizId: string) {
  try {
    // 1. Obtener la configuración del sistema para los umbrales
    const config = await prisma.configuracionSistema.findUnique({
      where: { id: "global" }
    });
    
    // Valores por defecto seguros si no hay config
    const asistenciaMinima = config?.asistenciaMinima ?? 75; 
    const asistenciaMedia = 85; // Umbral estático recomendado para riesgo medio
    
    // 2. Analizar Asistencia
    const registrosAsistencia = await prisma.registroAsistencia.findMany({
      where: { aprendizId }
    });
    
    const totalSesiones = registrosAsistencia.length;
    let asistenciasYExcusas = 0;
    
    registrosAsistencia.forEach(registro => {
      if (registro.estado === "PRESENTE" || registro.estado === "EXCUSA") {
        asistenciasYExcusas++;
      }
    });

    const porcentajeAsistencia = totalSesiones > 0 
      ? parseFloat(((asistenciasYExcusas / totalSesiones) * 100).toFixed(2))
      : 100;

    // 3. Analizar Rendimiento Académico (Entregas y Evaluaciones)
    const evaluacionesDeficientes = await prisma.evaluacionAprendiz.count({
      where: {
        aprendizId,
        juicio: "DEFICIENTE"
      }
    });

    const entregasMalas = await prisma.entrega.count({
      where: {
        aprendizId,
        estado: {
          in: ["NO_APROBADA", "TARDIA"]
        }
      }
    });

    const totalFallasAcademicas = evaluacionesDeficientes + entregasMalas;

    // 3b. Calcular promedio real desde las notas de EvaluacionAprendiz
    const evaluacionesConNota = await prisma.evaluacionAprendiz.findMany({
      where: { aprendizId, nota: { not: null } },
      select: { nota: true }
    });

    const promedioAcumulado = evaluacionesConNota.length > 0
      ? parseFloat(
          (evaluacionesConNota.reduce((sum, e) => sum + (e.nota ?? 0), 0) / evaluacionesConNota.length).toFixed(2)
        )
      : 0;

    // 4. Algoritmo de Decisión
    let nuevoRiesgo: NivelRiesgo = NivelRiesgo.BAJO;
    let motivoRiesgo = "";

    if (porcentajeAsistencia < asistenciaMinima || totalFallasAcademicas >= 3) {
      nuevoRiesgo = NivelRiesgo.ALTO;
      motivoRiesgo = porcentajeAsistencia < asistenciaMinima 
        ? `Inasistencia crítica (${porcentajeAsistencia}%).` 
        : `Múltiples fallas académicas (${totalFallasAcademicas} actividades/evaluaciones perdidas).`;
    } else if (porcentajeAsistencia < asistenciaMedia || totalFallasAcademicas >= 1) {
      nuevoRiesgo = NivelRiesgo.MEDIO;
      motivoRiesgo = porcentajeAsistencia < asistenciaMedia
        ? `Inasistencia en nivel de advertencia (${porcentajeAsistencia}%).`
        : `Presenta ${totalFallasAcademicas} falla(s) académica(s).`;
    }

    // 5. Actualizar el Aprendiz (incluyendo promedioAcumulado real)
    const aprendizActual = await prisma.aprendiz.findUnique({
      where: { id: aprendizId },
      include: { ficha: { include: { instructores: true } } }
    });

    if (!aprendizActual) return;

    await prisma.aprendiz.update({
      where: { id: aprendizId },
      data: {
        porcentajeAsistencia,
        promedioAcumulado,
        nivelRiesgo: nuevoRiesgo
      }
    });


    // 6. Generar Alerta y Notificaciones si subió a Riesgo MEDIO o ALTO
    // Solo si el riesgo anterior era menor, o si no tenía una alerta abierta por este motivo
    if (nuevoRiesgo !== NivelRiesgo.BAJO && nuevoRiesgo !== aprendizActual.nivelRiesgo) {
      
      // Verificar si ya hay una alerta no gestionada para evitar duplicados
      const alertaExistente = await prisma.alertaRiesgo.findFirst({
        where: {
          aprendizId,
          gestionada: false,
          nivel: nuevoRiesgo
        }
      });

      if (!alertaExistente) {
        await prisma.alertaRiesgo.create({
          data: {
            aprendizId,
            nivel: nuevoRiesgo,
            motivo: motivoRiesgo,
            observaciones: "Alerta generada automáticamente por el motor de riesgo del sistema."
          }
        });

        // Notificar a los instructores de la ficha
        const instructoresFicha = aprendizActual.ficha.instructores;
        
        // Para crear notificaciones, necesitamos los IDs de usuario (userId) reales de los instructores
        const instructoresDocs = await prisma.instructor.findMany({
          where: { id: { in: instructoresFicha.map(i => i.instructorId) } },
          select: { userId: true }
        });

        const notificacionesReales = instructoresDocs
          .filter(doc => doc.userId)
          .map(doc => ({
            userId: doc.userId as string,
            titulo: `⚠️ Alerta de Riesgo ${nuevoRiesgo}`,
            mensaje: `El aprendiz ${aprendizActual.nombres} ${aprendizActual.apellidos} (Ficha ${aprendizActual.ficha.codigo}) ha entrado en riesgo ${nuevoRiesgo}. Motivo: ${motivoRiesgo}`,
            tipo: "ALERTA",
            enlace: `/seguimiento-riesgos/ficha/${aprendizActual.fichaId}`
          }));

        if (notificacionesReales.length > 0) {
          await prisma.notificacion.createMany({
            data: notificacionesReales
          });
        }
      }
    }

  } catch (error) {
    console.error("Error en motor de cálculo de riesgo para el aprendiz:", aprendizId, error);
    // Silent fail: No rompemos la ejecución principal
  }
}

export async function recalcularRiesgoFicha(fichaId: string) {
  try {
    const aprendices = await prisma.aprendiz.findMany({
      where: { fichaId, estado: "EN_FORMACION" },
      select: { id: true }
    });

    // Ejecutamos de a uno para no sobrecargar las conexiones a DB
    for (const aprendiz of aprendices) {
      await recalcularRiesgoAprendiz(aprendiz.id);
    }
  } catch (error) {
    console.error("Error al recalcular riesgo de la ficha:", fichaId, error);
  }
}
