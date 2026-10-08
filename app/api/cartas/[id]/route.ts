import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(req: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    
    const sol = await prisma.solicitudCarta.findUnique({
      where: { id },
      include: {
        user: { include: { instructor: true, aprendiz: { include: { ficha: { include: { programa: true } } } } } }
      }
    });

    if (!sol) {
      return new NextResponse("Carta no encontrada", { status: 404 });
    }

    // Buscamos un coordinador que tenga firma digital para usarla
    const coordinador = await prisma.user.findFirst({
      where: { rol: "COORDINADOR", firmaDigitalUrl: { not: null } }
    });

    const firmaUrl = coordinador?.firmaDigitalUrl || "";
    const fechaActual = new Date(sol.creadoEn).toLocaleDateString("es-CO", { year: 'numeric', month: 'long', day: 'numeric' });

    const esAprendiz = !!sol.user?.aprendiz;
    const tipoNormalizado = sol.tipoCarta.replace(/ /g, "_").toUpperCase();
    const esCertificadoConNotas = tipoNormalizado === "CERTIFICADO_ESTUDIO_NOTAS" || tipoNormalizado.includes("NOTAS");
    const esCertificadoEstudio = tipoNormalizado === "CERTIFICADO_ESTUDIO" || esCertificadoConNotas || tipoNormalizado.includes("ESTUDIO");

    // CSS compartido
    const css = `
      body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; color: #333; }
      .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #39A900; padding-bottom: 20px; }
      .content { margin-top: 40px; text-align: justify; }
      .signature { margin-top: 80px; }
      .signature img { max-height: 100px; max-width: 200px; display: block; margin-bottom: 10px; }
      .footer { margin-top: 50px; font-size: 10px; color: #777; text-align: center; border-top: 1px solid #ccc; padding-top: 10px; }
      .notas-table { width: 100%; border-collapse: collapse; margin-top: 20px; font-size: 13px; }
      .notas-table th, .notas-table td { border: 1px solid #ccc; padding: 8px 12px; text-align: left; }
      .notas-table th { background-color: #f0f0f0; font-weight: bold; }
      .notas-table .aprobado { color: #16a34a; font-weight: bold; }
      .notas-table .deficiente { color: #dc2626; font-weight: bold; }
      .notas-table .pendiente { color: #d97706; }
      .promedio { margin-top: 15px; font-size: 14px; }
      @media print { .no-print { display: none; } }
    `;

    // Firma y footer compartidos
    const firmaHtml = `
      <div class="signature">
        ${firmaUrl ? `<img src="${firmaUrl}" alt="Firma Coordinador" />` : '<p>___________________________________</p>'}
        ${firmaUrl ? '' : '<p><strong>Firma Autorizada</strong></p>'}
        <p><strong>Coordinación Académica</strong></p>
        ${firmaUrl ? `<p>${coordinador?.nombre}</p>` : ''}
      </div>
      <div class="footer">
        Generado automáticamente por GSS Media Técnica - Proyecto Académico SENA
      </div>
    `;

    let contentHtml = "";

    if (esCertificadoEstudio && esAprendiz) {
      // ========================================
      // CERTIFICADO DE ESTUDIO (APRENDIZ)
      // ========================================
      const aprendiz = sol.user!.aprendiz!;
      const ficha = aprendiz.ficha;
      const programa = ficha?.programa;

      const tituloDoc = esCertificadoConNotas 
        ? "CERTIFICADO DE ESTUDIO CON CALIFICACIONES" 
        : "CERTIFICADO DE ESTUDIO";

      contentHtml = `
        <div class="content">
          <p><strong>FECHA:</strong> ${fechaActual}</p>
          <p><strong>${sol.dirigidoA ? sol.dirigidoA.toUpperCase() : "A QUIEN CORRESPONDA"}</strong></p>
          <br/>
          <p>El suscrito Coordinador Académico del Centro de Formación, hace constar que:</p>
          <p>El(la) aprendiz <strong>${(aprendiz.nombres + " " + aprendiz.apellidos).toUpperCase()}</strong>, identificado(a) con ${aprendiz.tipoDocumento} número <strong>${aprendiz.numeroDocumento}</strong>, se encuentra actualmente <strong>${aprendiz.estado === "EN_FORMACION" ? "EN FORMACIÓN" : aprendiz.estado.replace(/_/g, " ")}</strong> en el programa:</p>
          <ul style="margin: 15px 0;">
            <li><strong>Programa:</strong> ${programa?.nombre || "N/A"} (${programa?.codigo || ""})</li>
            <li><strong>Ficha:</strong> ${ficha?.codigo || "N/A"}</li>
            <li><strong>Porcentaje de Asistencia:</strong> ${aprendiz.porcentajeAsistencia}%</li>
          </ul>
      `;

      // Si es con notas, traer evaluaciones
      if (esCertificadoConNotas) {
        const evaluaciones = await prisma.evaluacionAprendiz.findMany({
          where: { aprendizId: aprendiz.id },
          include: {
            resultadoAprendizaje: {
              include: { competencia: true }
            }
          },
          orderBy: { resultadoAprendizaje: { competencia: { codigo: "asc" } } }
        });

        if (evaluaciones.length > 0) {
          // Calcular promedio
          const conNota = evaluaciones.filter(e => e.nota !== null);
          const promedio = conNota.length > 0 
            ? (conNota.reduce((sum, e) => sum + (e.nota ?? 0), 0) / conNota.length).toFixed(2) 
            : "N/A";

          // Agrupar por competencia
          const compMap = new Map();
          for (const ev of evaluaciones) {
            const comp = ev.resultadoAprendizaje.competencia;
            if (!compMap.has(comp.id)) {
              compMap.set(comp.id, {
                codigo: comp.codigo,
                nombre: comp.nombre,
                evaluaciones: []
              });
            }
            compMap.get(comp.id).evaluaciones.push(ev);
          }

          const competenciasArray = Array.from(compMap.values());

          contentHtml += `
            <p style="margin-top: 25px;"><strong>Detalle de calificaciones por Competencia:</strong></p>
            <table class="notas-table">
              <thead>
                <tr>
                  <th>Código</th>
                  <th>Competencia</th>
                  <th style="text-align: center;">Nota Final</th>
                  <th style="text-align: center;">Juicio</th>
                </tr>
              </thead>
              <tbody>
                ${competenciasArray.map((comp: any) => {
                  const evsConNota = comp.evaluaciones.filter((e: any) => e.nota !== null);
                  let notaFinal: number | null = null;
                  if (evsConNota.length > 0) {
                     notaFinal = evsConNota.reduce((s: number, e: any) => s + e.nota, 0) / evsConNota.length;
                  }
                  
                  const hasDeficiente = comp.evaluaciones.some((e: any) => e.juicio === "DEFICIENTE");
                  const allAprobado = comp.evaluaciones.every((e: any) => e.juicio === "APROBADO");
                  
                  let juicioFinal = "PENDIENTE";
                  if (hasDeficiente) juicioFinal = "DEFICIENTE";
                  else if (allAprobado && comp.evaluaciones.length > 0) juicioFinal = "APROBADO";

                  const juicioClass = juicioFinal === "APROBADO" ? "aprobado" : juicioFinal === "DEFICIENTE" ? "deficiente" : "pendiente";
                  const juicioLabel = juicioFinal === "APROBADO" ? "Aprobado" : juicioFinal === "DEFICIENTE" ? "Deficiente" : "Pendiente";
                  
                  return `
                    <tr>
                      <td>${comp.codigo}</td>
                      <td>${comp.nombre}</td>
                      <td style="text-align: center;">${notaFinal !== null ? notaFinal.toFixed(1) : "-"}</td>
                      <td style="text-align: center;" class="${juicioClass}">${juicioLabel}</td>
                    </tr>
                  `;
                }).join("")}
              </tbody>
            </table>
            <p class="promedio"><strong>Promedio Acumulado:</strong> ${promedio} | <strong>Promedio Registrado:</strong> ${aprendiz.promedioAcumulado.toFixed(2)}</p>
          `;
        } else {
          contentHtml += `<p style="margin-top: 20px; color: #666;"><em>El aprendiz aún no cuenta con evaluaciones registradas en el sistema.</em></p>`;
        }
      }

      contentHtml += `
          ${sol.motivo ? `<p style="margin-top: 20px;"><strong>Motivo de la solicitud:</strong> ${sol.motivo}</p>` : ""}
          <p style="margin-top: 20px;">La presente constancia se expide a solicitud del interesado.</p>
        </div>
      `;

      // Generar HTML completo para certificado de aprendiz
      const html = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>${tituloDoc} - ${aprendiz.nombres} ${aprendiz.apellidos}</title>
            <style>${css}</style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #39A900; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Descargar</button>
            </div>
            <div class="header">
              <h2 style="color: #39A900;">SERVICIO NACIONAL DE APRENDIZAJE - SENA</h2>
              <h3>${tituloDoc}</h3>
            </div>
            ${contentHtml}
            ${firmaHtml}
          </body>
        </html>
      `;

      return new NextResponse(html, { headers: { "Content-Type": "text/html" } });

    } else {
      // ========================================
      // CARTA LABORAL / SALARIO (INSTRUCTOR)
      // ========================================
      const html = `
        <html>
          <head>
            <meta charset="UTF-8">
            <title>Carta - ${sol.user?.nombre || "Instructor"}</title>
            <style>${css}</style>
          </head>
          <body>
            <div class="no-print" style="margin-bottom: 20px; text-align: right;">
              <button onclick="window.print()" style="padding: 10px 20px; background: #39A900; color: white; border: none; border-radius: 5px; cursor: pointer; font-weight: bold;">Descargar</button>
            </div>
            <div class="header">
              <h2 style="color: #39A900;">SERVICIO NACIONAL DE APRENDIZAJE - SENA</h2>
              <h3>CARTA ${sol.tipoCarta === "SALARIO" ? "DE SALARIO" : "LABORAL"}</h3>
            </div>
            
            <div class="content">
              <p><strong>FECHA:</strong> ${fechaActual}</p>
              <p><strong>${sol.dirigidoA ? sol.dirigidoA.toUpperCase() : "A QUIEN CORRESPONDA"}</strong></p>
              <br/>
              <p>El suscrito Coordinador Académico del Centro de Formación, hace constar que:</p>
              <p>El(la) señor(a) <strong>${(sol.user?.nombre || "________________").toUpperCase()}</strong>, identificado(a) con documento número <strong>${sol.user?.instructor?.numeroDocumento || "________________"}</strong>, se encuentra actualmente prestando servicios como Instructor(a) en los programas de Articulación con la Media Técnica.</p>
              
              ${sol.motivo ? `<p><strong>Motivo de la solicitud:</strong> ${sol.motivo}</p>` : ""}
              
              <p>La presente constancia se expide a solicitud del interesado.</p>
            </div>
            ${firmaHtml}
          </body>
        </html>
      `;

      return new NextResponse(html, { headers: { "Content-Type": "text/html" } });
    }

  } catch (error) {
    console.error("Error generando carta/certificado:", error);
    return new NextResponse("Error al generar carta", { status: 500 });
  }
}
