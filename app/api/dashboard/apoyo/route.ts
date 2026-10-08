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
    const fichaIdParam = searchParams.get("fichaId");
    const competenciaIdParam = searchParams.get("competenciaId");
    const raIdParam = searchParams.get("raId");

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
    });

    if (!user || user.rol !== "APOYO_COORDINACION") {
      // Permitimos también que admin/coord prueben esta ruta si se requiere, pero validamos rol.
      if (user?.rol !== "ADMINISTRADOR" && user?.rol !== "COORDINADOR") {
        return NextResponse.json({ success: false, error: "Rol no válido" }, { status: 403 });
      }
    }

    // 1. Obtener fichas (Por Sede, luego por Institución, luego global si es admin/test)
    let fichasAsignadas = [];
    if (user.sedeId) {
      fichasAsignadas = await prisma.ficha.findMany({
        where: { sedeId: user.sedeId },
        select: { id: true, codigo: true, programa: { select: { nombre: true, id: true } } }
      });
    } else if (user.institucionId) {
      fichasAsignadas = await prisma.ficha.findMany({
        where: { institucionId: user.institucionId },
        select: { id: true, codigo: true, programa: { select: { nombre: true, id: true } } }
      });
    } else {
      // Fallback para usuarios de prueba sin sede/institución asignada
      fichasAsignadas = await prisma.ficha.findMany({
        select: { id: true, codigo: true, programa: { select: { nombre: true, id: true } } }
      });
    }

    const misFichaIds = fichasAsignadas.map(f => f.id);
    const fichasATraer = fichaIdParam ? [fichaIdParam] : misFichaIds;

    if (fichasATraer.length === 0) {
      return NextResponse.json({
        success: true,
        fichas: [],
        kpis: { totalFichas: 0, totalAprendices: 0, aprendicesRiesgoAlto: 0, actividadesPendientes: 0 },
        dashboard: { progreso: 0, competencias: [], resultadosAprendizaje: [], entregasSemanales: [], heatmap: [] },
        riskData: []
      });
    }

    // 2. Obtener aprendices y sus fallas
    const aprendices = await prisma.aprendiz.findMany({
      where: { fichaId: { in: fichasATraer } },
      select: {
        id: true,
        fichaId: true,
        nombres: true,
        apellidos: true,
        _count: { select: { detallesAsistencia: { where: { estado: 'FALLA' } } } }
      }
    });

    // 3. OBTENER EL NÚCLEO ACADÉMICO GLOBAL (NO FILTRADO)
    const todasCompetencias = await prisma.competencia.findMany({
      where: { programas: { some: { fichas: { some: { id: { in: fichasATraer } } } } } }
    });

    const todosRAs = await prisma.resultadoAprendizaje.findMany({
      where: { competencia: { id: { in: todasCompetencias.map(c => c.id) } } }
    });

    const todasEvaluaciones = await prisma.evaluacionAprendiz.findMany({
      where: { aprendiz: { fichaId: { in: fichasATraer } } },
      include: { resultadoAprendizaje: true }
    });

    const compMap = new Map<string, { nombre: string, notas: number[] }>();
    const raMap = new Map<string, { nombre: string, compId: string, notas: number[] }>();

    todasCompetencias.forEach(comp => compMap.set(comp.id, { nombre: comp.nombre, notas: [] }));
    todosRAs.forEach(ra => raMap.set(ra.id, { nombre: ra.nombre, compId: ra.competenciaId, notas: [] }));

    todasEvaluaciones.forEach(ev => {
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

    let fichaProgreso = 0;
    if (todasEvaluaciones.length > 0) {
      const sumaTotal = todasEvaluaciones.reduce((sum, ev) => sum + (ev.nota || 0), 0);
      fichaProgreso = Math.round((sumaTotal / todasEvaluaciones.length) * 20);
    }

    // 4. MATRIZ DE RIESGO: CALCULADA SOBRE EVALUACIONES FILTRADAS
    const aprendizNotasFiltradas = new Map<string, number[]>();
    todasEvaluaciones.forEach(ev => {
      if (raIdParam && ev.resultadoAprendizajeId !== raIdParam) return;
      if (competenciaIdParam && ev.resultadoAprendizaje?.competenciaId !== competenciaIdParam) return;
      
      const nota = ev.nota || 0;
      if (!aprendizNotasFiltradas.has(ev.aprendizId)) aprendizNotasFiltradas.set(ev.aprendizId, []);
      aprendizNotasFiltradas.get(ev.aprendizId)!.push(nota);
    });

    const riskData = aprendices.map(a => {
      const maxSesiones = 50; 
      const fallas = a._count.detallesAsistencia;
      const asistenciaPct = Math.max(0, 100 - ((fallas / maxSesiones) * 100));
      
      const notas = aprendizNotasFiltradas.get(a.id) || [];
      const rendimiento = notas.length > 0 ? ((notas.reduce((x, y) => x + y, 0) / notas.length) * 20) : 0; 
      
      let nivelRiesgo = "Bajo";
      if (asistenciaPct < 75 || rendimiento < 70) nivelRiesgo = "Alto";
      else if (asistenciaPct < 85 || rendimiento < 80) nivelRiesgo = "Medio";

      return {
        id: a.id,
        nombre: `${a.nombres} ${a.apellidos}`,
        fichaId: a.fichaId,
        asistencia: parseFloat(asistenciaPct.toFixed(1)),
        rendimiento: parseFloat(rendimiento.toFixed(1)),
        nivelRiesgo
      };
    });

    // 5. SEGUIMIENTO DE ACTIVIDADES Y ENTREGAS (FILTRADO)
    const whereActividades: any = { fichaId: { in: fichasATraer } };
    if (raIdParam) whereActividades.resultadoAprendizajeId = raIdParam;
    else if (competenciaIdParam) whereActividades.resultadoAprendizaje = { competenciaId: competenciaIdParam };

    const actividades = await prisma.actividad.findMany({
      where: whereActividades,
      include: { entregas: true }
    });

    let actividadesPendientes = 0;
    const entregasPorSemana = new Map<string, { calificadas: number, pendientes: number, noEntregadas: number }>();
    const diasSemana = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const heatmapData: any[] = [];

    actividades.forEach(act => {
      if (heatmapData.length < 5 && act.entregas.length > 0) {
        const entregasPorDia = Array(7).fill(0);
        act.entregas.forEach(ent => {
          const diaIndex = new Date(ent.fechaEntrega).getDay();
          entregasPorDia[diaIndex]++;
        });
        
        heatmapData.push({
          actividad: (act.nombre || 'Actividad').substring(0, 30),
          entregas: diasSemana.map((dia, idx) => ({ dia, cantidad: entregasPorDia[idx] }))
        });
      }

      const fechaV = act.fechaVencimiento ? new Date(act.fechaVencimiento) : new Date();
      const weekKey = `${fechaV.toLocaleString('es', { month: 'short' })} Sem ${Math.ceil(fechaV.getDate()/7)}`;
      
      if (!entregasPorSemana.has(weekKey)) {
        entregasPorSemana.set(weekKey, { calificadas: 0, pendientes: 0, noEntregadas: 0 });
      }
      
      const stats = entregasPorSemana.get(weekKey)!;
      const totalAprendices = aprendices.length;
      let entregadasCount = 0;

      act.entregas.forEach(ent => {
        entregadasCount++;
        if (ent.estado === "CALIFICADA" || ent.estado === "APROBADA" || ent.estado === "NO_APROBADA") {
          stats.calificadas++;
        } else {
          stats.pendientes++;
          actividadesPendientes++; 
        }
      });

      stats.noEntregadas += (totalAprendices - entregadasCount);
    });

    const realSemanas = Array.from(entregasPorSemana.entries()).map(([semana, data]) => ({
      semana,
      calificadas: data.calificadas,
      pendientes: data.pendientes,
      noEntregadas: data.noEntregadas
    }));

    return NextResponse.json({
      success: true,
      fichas: fichasAsignadas.map(f => ({ id: f.id, codigo: f.codigo, programa: f.programa.nombre })),
      riskData,
      kpis: {
        totalFichas: misFichaIds.length,
        totalAprendices: aprendices.length,
        aprendicesRiesgoAlto: riskData.filter(d => d.nivelRiesgo === "Alto").length,
        actividadesPendientes: actividadesPendientes
      },
      dashboard: {
        progreso: fichaProgreso,
        competencias: realCompetencias,
        resultadosAprendizaje: realRAs,
        entregasSemanales: realSemanas,
        heatmap: heatmapData
      }
    });
  } catch (error: any) {
    console.error("Apoyo Dashboard API Error:", error);
    require('fs').writeFileSync('c:\\GSS\\scratch\\apoyo_api_error.log', error.stack || error.toString());
    return NextResponse.json({ success: false, error: "Error de servidor: " + error.message }, { status: 500 });
  }
}
