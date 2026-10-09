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
