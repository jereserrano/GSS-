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
      include: { instructor: true }
    });

    if (user?.rol !== "INSTRUCTOR" || !user?.instructor?.id) {
      return NextResponse.json({ success: false, error: "Rol no válido" }, { status: 403 });
    }

    const instructorId = user.instructor.id;

    // 1. Obtener fichas asignadas
    const fichasAsignadas = await prisma.instructorFicha.findMany({
      where: { instructorId },
      include: { 
        ficha: {
          select: { id: true, codigo: true, programa: { select: { nombre: true, id: true } } }
        } 
      }
    });

    const misFichaIds = fichasAsignadas.map(f => f.fichaId);
    if (fichaIdParam && !misFichaIds.includes(fichaIdParam)) {
      return NextResponse.json({ success: false, error: "Ficha no asignada" }, { status: 403 });
    }

    const fichasATraer = fichaIdParam ? [fichaIdParam] : misFichaIds;

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
    // Esto garantiza que los filtros <select>, la gráfica de araña y el acordeón 
    // siempre muestren el panorama completo del diseño curricular.
    
    // Obtener los programas de las fichas a traer
    const programasIds = [...new Set(fichasAsignadas
      .filter(f => fichasATraer.includes(f.fichaId))
      .map(f => f.ficha.programa.id)
    )];

    const todasCompetencias = await prisma.competencia.findMany({
      where: { programas: { some: { id: { in: programasIds } } } }
    });

    const todosRAs = await prisma.resultadoAprendizaje.findMany({
      where: { competencia: { id: { in: todasCompetencias.map(c => c.id) } } }
    });

    // Obtener todas las evaluaciones (sin filtro) para calcular el promedio global del Radar
    const todasEvaluaciones = await prisma.evaluacionAprendiz.findMany({
      where: { aprendiz: { fichaId: { in: fichasATraer } } },
      include: { 
        resultadoAprendizaje: true
      }
    });

    const compMap = new Map<string, { nombre: string, notas: number[] }>();
    const raMap = new Map<string, { nombre: string, compId: string, notas: number[] }>();

    // Inicializar mapas para asegurar que todas las competencias y RAs aparezcan (incluso si no tienen evaluaciones)
    todasCompetencias.forEach(comp => compMap.set(comp.id, { nombre: comp.nombre, notas: [] }));
    todosRAs.forEach(ra => raMap.set(ra.id, { nombre: ra.nombre, compId: ra.competenciaId, notas: [] }));

    todasEvaluaciones.forEach(ev => {
      const nota = ev.nota || 0;
      if (ev.resultadoAprendizaje) {
        const ra = ev.resultadoAprendizaje;
        
        // Sumar al RA
        if (raMap.has(ra.id)) raMap.get(ra.id)!.notas.push(nota);
        
        // Sumar a la competencia
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

    // El progreso global de la ficha (podemos filtrarlo si hay competencia seleccionada, pero mejor global)
    let fichaProgreso = 0;
    if (todasEvaluaciones.length > 0) {
      const sumaTotal = todasEvaluaciones.reduce((sum, ev) => sum + (ev.nota || 0), 0);
      fichaProgreso = Math.round((sumaTotal / todasEvaluaciones.length) * 20);
    }


    // 4. MATRIZ DE RIESGO: CALCULADA SOBRE EVALUACIONES FILTRADAS
    // Mapeamos las notas por aprendiz SOLO para los RAs o Competencia seleccionada
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
      // Si rendimiento es 0 y se aplicó filtro (y tal vez el aprendiz no ha sido evaluado ahí), 
      // podría marcar Riesgo Alto erróneamente. Pero asumiremos que es bajo rendimiento si está en 0.
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
      fichas: fichasAsignadas.map(f => ({ id: f.ficha.id, codigo: f.ficha.codigo, programa: f.ficha.programa.nombre })),
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
  } catch (error) {
    console.error("Dashboard API Error:", error);
    return NextResponse.json({ success: false, error: "Error de servidor" }, { status: 500 });
  }
}
