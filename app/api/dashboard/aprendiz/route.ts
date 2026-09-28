import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ success: false, error: "No autorizado" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const competenciaIdParam = searchParams.get("competenciaId");
    const raIdParam = searchParams.get("raId");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      include: { aprendiz: true }
    });

    if (!user || user.rol !== "APRENDIZ" || !user.aprendiz) {
      return NextResponse.json({ success: false, error: "Usuario no es un Aprendiz válido" }, { status: 403 });
    }

    const aprendizId = user.aprendiz.id;
    const fichaId = user.aprendiz.fichaId;

    // 1. Obtener la ficha y cantidad de aprendices para contexto
    const ficha = await prisma.ficha.findUnique({
      where: { id: fichaId },
      include: { _count: { select: { aprendices: true } } }
    });

    // 2. Obtener mi asistencia
    const miAsistencia = await prisma.aprendiz.findUnique({
      where: { id: aprendizId },
      select: { _count: { select: { detallesAsistencia: { where: { estado: 'FALLA' } } } } }
    });
    const misFallas = miAsistencia?._count.detallesAsistencia || 0;

    // 3. OBTENER MI NÚCLEO ACADÉMICO GLOBAL (NO FILTRADO)
    const todasCompetencias = await prisma.competencia.findMany({
      where: { programas: { some: { fichas: { some: { id: fichaId } } } } }
    });

    const todosRAs = await prisma.resultadoAprendizaje.findMany({
      where: { competencia: { id: { in: todasCompetencias.map(c => c.id) } } }
    });

    // Evaluaciones Mías
    const misEvaluaciones = await prisma.evaluacionAprendiz.findMany({
      where: { aprendizId: aprendizId },
      include: { resultadoAprendizaje: true }
    });

    const compMap = new Map<string, { nombre: string, notas: number[] }>();
    const raMap = new Map<string, { nombre: string, compId: string, notas: number[] }>();

    todasCompetencias.forEach(comp => compMap.set(comp.id, { nombre: comp.nombre, notas: [] }));
    todosRAs.forEach(ra => raMap.set(ra.id, { nombre: ra.nombre, compId: ra.competenciaId, notas: [] }));

    misEvaluaciones.forEach(ev => {
      const nota = ev.nota || 0;
      if (ev.resultadoAprendizaje) {
        const ra = ev.resultadoAprendizaje;
        if (raMap.has(ra.id)) raMap.get(ra.id)!.notas.push(nota);
        if (compMap.has(ra.competenciaId)) compMap.get(ra.competenciaId)!.notas.push(nota);
      }
    });

    const realCompetencias = Array.from(compMap.entries()).map(([id, data]) => ({
      id,
      nombre: data.nombre,
      promedio: data.notas.length ? Math.round((data.notas.reduce((a, b) => a + b, 0) / data.notas.length) * 20) : 0
    }));

    const realRAs = Array.from(raMap.entries()).map(([id, data]) => ({
      id,
      competenciaId: data.compId,
      nombre: data.nombre,
      aprobacion: data.notas.length ? Math.round((data.notas.reduce((a, b) => a + b, 0) / data.notas.length) * 20) : 0
    }));

    let miProgreso = 0;
    if (misEvaluaciones.length > 0) {
      const sumaTotal = misEvaluaciones.reduce((sum, ev) => sum + (ev.nota || 0), 0);
      miProgreso = Math.round((sumaTotal / misEvaluaciones.length) * 20);
    }

    // 4. MATRIZ DE RIESGO (Solo para mí, respetando filtros)
    let misNotasFiltradas: number[] = [];
    misEvaluaciones.forEach(ev => {
      if (raIdParam && ev.resultadoAprendizajeId !== raIdParam) return;
      if (competenciaIdParam && ev.resultadoAprendizaje?.competenciaId !== competenciaIdParam) return;
      misNotasFiltradas.push(ev.nota || 0);
    });

    const maxSesiones = 50; 
    const asistenciaPct = Math.max(0, 100 - ((misFallas / maxSesiones) * 100));
    const rendimiento = misNotasFiltradas.length > 0 ? ((misNotasFiltradas.reduce((x, y) => x + y, 0) / misNotasFiltradas.length) * 20) : 0; 
    
    let nivelRiesgo = "Bajo";
    if (asistenciaPct < 75 || rendimiento < 70) nivelRiesgo = "Alto";
    else if (asistenciaPct < 85 || rendimiento < 80) nivelRiesgo = "Medio";

    const riskData = [{
      id: user.aprendiz.id,
      nombre: "Mi Desempeño",
      fichaId: fichaId,
      asistencia: parseFloat(asistenciaPct.toFixed(1)),
      rendimiento: parseFloat(rendimiento.toFixed(1)),
      nivelRiesgo
    }];

    // 5. MIS ACTIVIDADES Y ENTREGAS (FILTRADAS)
    const whereActividades: any = { fichaId: fichaId };
    if (raIdParam) whereActividades.resultadoAprendizajeId = raIdParam;
    else if (competenciaIdParam) whereActividades.resultadoAprendizaje = { competenciaId: competenciaIdParam };

    const misActividades = await prisma.actividad.findMany({
      where: whereActividades,
      include: { 
        entregas: {
          where: { aprendizId: aprendizId }
        } 
      }
    });

    let misActividadesPendientes = 0;
    const entregasPorSemana = new Map<string, { calificadas: number, pendientes: number, noEntregadas: number }>();
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const heatmapData: any[] = [];

    misActividades.forEach(act => {
      // Heatmap
      if (heatmapData.length < 5 && act.entregas.length > 0) {
        const entregasPorDia = Array(7).fill(0);
        act.entregas.forEach(ent => {
          const diaIndex = new Date(ent.fechaEntrega).getDay();
          entregasPorDia[diaIndex]++;
        });
        heatmapData.push({
          actividad: act.nombre,
          entregas: diasSemana.map((dia, idx) => ({ dia, cantidad: entregasPorDia[idx] }))
        });
      }

      // Bar Chart
      const fechaV = new Date(act.fechaVencimiento);
      const weekKey = `${fechaV.toLocaleString('es', { month: 'short' })} Sem ${Math.ceil(fechaV.getDate()/7)}`;
      
      if (!entregasPorSemana.has(weekKey)) {
        entregasPorSemana.set(weekKey, { calificadas: 0, pendientes: 0, noEntregadas: 0 });
      }
      
      const stats = entregasPorSemana.get(weekKey)!;
      let entregadasCount = 0;

      act.entregas.forEach(ent => {
        entregadasCount++;
        if (ent.estado === "CALIFICADA" || ent.estado === "APROBADA" || ent.estado === "NO_APROBADA") {
          stats.calificadas++;
        } else {
          stats.pendientes++;
          misActividadesPendientes++; 
        }
      });

      stats.noEntregadas += (1 - entregadasCount); // Porque soy un único aprendiz
      if (entregadasCount === 0 && act.fechaVencimiento > new Date()) {
        misActividadesPendientes++; // Pendiente de entregar
      }
    });

    const realSemanas = Array.from(entregasPorSemana.entries()).map(([semana, data]) => ({
      semana,
      calificadas: data.calificadas,
      pendientes: data.pendientes,
      noEntregadas: Math.max(0, data.noEntregadas)
    }));

    return NextResponse.json({
      success: true,
      riskData,
      kpis: {
        totalAprendices: ficha?._count.aprendices || 1, // Tamaño de mi grupo
        actividadesPendientes: misActividadesPendientes,
        aprendicesRiesgoAlto: nivelRiesgo === "Alto" ? 1 : 0
      },
      dashboard: {
        progreso: miProgreso,
        competencias: realCompetencias,
        resultadosAprendizaje: realRAs,
        entregasSemanales: realSemanas,
        heatmap: heatmapData
      }
    });
  } catch (error) {
    console.error("Aprendiz Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: "Error de servidor" }, { status: 500 });
  }
}
