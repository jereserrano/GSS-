/**
 * Integración con Zoom API para agendar clases virtuales
 */

export async function createZoomMeeting(accessToken: string, subject: string, startTime: Date, durationMin: number) {
  try {
    const response = await fetch("https://api.zoom.us/v2/users/me/meetings", {
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

export async function getZoomAccessTokenFromRefreshToken(refreshToken: string) {
  const clientId = process.env.ZOOM_CLIENT_ID!;
  const clientSecret = process.env.ZOOM_CLIENT_SECRET!;

  const credentials = Buffer.from(`${clientId}:${clientSecret}`).toString("base64");

  const response = await fetch(`https://zoom.us/oauth/token`, {
    method: "POST",
    headers: {
      "Authorization": `Basic ${credentials}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo renovar el token de Zoom.");
  }

  return response.json();
}
