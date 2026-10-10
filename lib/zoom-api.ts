/**
 * Integración con Zoom API para agendar clases virtuales
 */

export async function getZoomServerToken() {
  const accountId = process.env.ZOOM_ACCOUNT_ID;
  const clientId = process.env.ZOOM_CLIENT_ID;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET;

  if (!accountId || !clientId || !clientSecret) {
    throw new Error("Credenciales de Zoom Server-to-Server no configuradas en el servidor.");
  }

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`https://zoom.us/oauth/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "account_credentials",
      account_id: accountId,
    }),
    cache: "no-store", // Para que no use cache de Next.js
  });

  if (!response.ok) {
    const err = await response.text();
    console.error("Zoom Token Error:", err);
    throw new Error("No se pudo obtener el token de servidor de Zoom.");
  }

  const data = await response.json();
  return data.access_token;
}

export async function createZoomMeeting(subject: string, startTime: Date, durationMin: number) {
  try {
    const accountId = process.env.ZOOM_ACCOUNT_ID;
    const clientId = process.env.ZOOM_CLIENT_ID;
    const clientSecret = process.env.ZOOM_CLIENT_SECRET;

    if (!accountId || !clientId || !clientSecret) {
      console.warn("⚠️ Credenciales de Zoom no configuradas. Generando enlace de prueba.");
      const mockMeetingId = Math.floor(Math.random() * 10000000000).toString();
      return {
        success: true,
        joinUrl: `https://zoom.us/j/${mockMeetingId}?pwd=demo`,
        meetingId: mockMeetingId,
      };
    }

    const accessToken = await getZoomServerToken();
    const hostEmail = process.env.ZOOM_HOST_EMAIL || "me";

    const response = await fetch(`https://api.zoom.us/v2/users/${hostEmail}/meetings`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        topic: subject,
        type: 2, // 2 = Scheduled meeting
        start_time: startTime.toISOString(),
        duration: durationMin,
        timezone: "America/Bogota",
        settings: {
          join_before_host: true,
          jbh_time: 0,
          waiting_room: false,
          mute_upon_entry: true,
          participant_video: false
        }
      }),
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      console.error("Zoom API Error:", errorData);
      throw new Error(`Error al crear la reunión en Zoom: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      joinUrl: data.join_url,
      meetingId: data.id.toString(),
    };
  } catch (error: any) {
    console.error("Zoom Integration Error:", error);
    return { success: false, error: error.message };
  }
}
