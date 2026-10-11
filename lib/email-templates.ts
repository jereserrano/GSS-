export function getEvaluacionEmailTemplate(
  aprendizNombre: string, 
  rapNombre: string, 
  juicio: string, 
  observaciones?: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #2e6c80;">Notificación de Calificación GSS</h2>
      <p>Hola <strong>${aprendizNombre}</strong>,</p>
      <p>Se ha registrado o actualizado la calificación de uno de tus Resultados de Aprendizaje (RAP).</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p><strong>Resultado de Aprendizaje:</strong> ${rapNombre}</p>
      <p><strong>Juicio Valorativo:</strong> <span style="color: ${juicio === 'APROBADO' ? 'green' : (juicio === 'DEFICIENTE' ? 'red' : '#333')}; font-weight: bold;">${juicio}</span></p>
      ${observaciones ? `<p><strong>Observaciones:</strong> ${observaciones}</p>` : ''}
      <br/>
      <p>Puedes verificar más detalles ingresando a la plataforma GSS.</p>
      <p style="font-size: 12px; color: #888;">Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
  `;
}

export function getCompetenciaCreadaEmailTemplate(
  competenciaNombre: string, 
  competenciaCodigo: string,
  programaNombres: string
) {
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #2e6c80;">Nueva Competencia Agregada - GSS</h2>
      <p>Hola,</p>
      <p>Te informamos que se ha agregado una nueva competencia que afecta a tu programa y ficha de formación.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p><strong>Competencia:</strong> ${competenciaNombre}</p>
      <p><strong>Código:</strong> ${competenciaCodigo}</p>
      <p><strong>Programa(s) Asociado(s):</strong> ${programaNombres}</p>
      <br/>
      <p>Puedes verificar más detalles ingresando a la plataforma GSS.</p>
      <p style="font-size: 12px; color: #888;">Este es un mensaje automático, por favor no respondas a este correo.</p>
    </div>
  `;
}

function escapeHtml(value: string) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function buildLink(enlace?: string | null) {
  const base = (process.env.NEXTAUTH_URL || "").replace(/\/$/, "");
  if (!enlace) return base || null;
  if (/^https?:\/\//i.test(enlace)) return enlace;
  return `${base}${enlace.startsWith("/") ? "" : "/"}${enlace}`;
}

export function getNotificacionEmailTemplate(
  nombre: string,
  titulo: string,
  mensaje: string,
  enlace?: string | null
) {
  const link = buildLink(enlace);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #2e6c80;">${escapeHtml(titulo)}</h2>
      <p>Hola <strong>${escapeHtml(nombre)}</strong>,</p>
      <p>${escapeHtml(mensaje)}</p>
      ${link ? `<p style="margin-top: 20px;"><a href="${link}" style="background-color: #39a900; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Abrir en GSS</a></p>` : ""}
      <p style="font-size: 12px; color: #888; margin-top: 30px;">Este es un mensaje automático del sistema GSS - SENA Regional Magdalena, por favor no respondas a este correo.</p>
    </div>
  `;
}

export function getActividadEmailTemplate(params: {
  aprendizNombre: string;
  actividadNombre: string;
  descripcion?: string | null;
  instructorNombre?: string | null;
  fichaCodigo?: string | null;
  rapNombre?: string | null;
  fechaVencimiento: string;
  enlace?: string | null;
}) {
  const link = buildLink(params.enlace);
  return `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: auto; padding: 20px; border: 1px solid #ddd; border-radius: 8px;">
      <h2 style="color: #2e6c80;">Nueva actividad publicada - GSS</h2>
      <p>Hola <strong>${escapeHtml(params.aprendizNombre)}</strong>,</p>
      <p>${params.instructorNombre ? `Tu instructor <strong>${escapeHtml(params.instructorNombre)}</strong> ha` : "Se ha"} publicado una nueva actividad${params.fichaCodigo ? ` para tu ficha <strong>${escapeHtml(params.fichaCodigo)}</strong>` : ""}.</p>
      <hr style="border: none; border-top: 1px solid #eee;" />
      <p><strong>Actividad:</strong> ${escapeHtml(params.actividadNombre)}</p>
      ${params.rapNombre ? `<p><strong>Resultado de Aprendizaje:</strong> ${escapeHtml(params.rapNombre)}</p>` : ""}
      ${params.descripcion ? `<p><strong>Descripción:</strong> ${escapeHtml(params.descripcion)}</p>` : ""}
      <p><strong>Fecha límite de entrega:</strong> <span style="color: #c0392b; font-weight: bold;">${escapeHtml(params.fechaVencimiento)}</span></p>
      ${link ? `<p style="margin-top: 20px;"><a href="${link}" style="background-color: #39a900; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; font-weight: bold;">Ver actividad en GSS</a></p>` : ""}
      <p style="font-size: 12px; color: #888; margin-top: 30px;">Este es un mensaje automático del sistema GSS - SENA Regional Magdalena, por favor no respondas a este correo.</p>
    </div>
  `;
}
