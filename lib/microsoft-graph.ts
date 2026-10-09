/**
 * Integración con Microsoft Graph API para agendar clases virtuales (Teams)
 */

export async function createTeamsMeeting(accessToken: string, subject: string, startTime: Date, endTime: Date) {
  try {
    const response = await fetch("https://graph.microsoft.com/v1.0/me/onlineMeetings", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        startDateTime: startTime.toISOString(),
        endDateTime: endTime.toISOString(),
        subject: subject,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      console.error("Microsoft Graph Error:", errorData);
      throw new Error(`Error al crear la reunión en Teams: ${errorData.error?.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      success: true,
      joinUrl: data.joinWebUrl,
      meetingId: data.id,
    };
  } catch (error: any) {
    console.error("Teams Integration Error:", error);
    return { success: false, error: error.message };
  }
}

export async function getMicrosoftAccessTokenFromRefreshToken(refreshToken: string) {
  const tenantId = process.env.MICROSOFT_TENANT_ID || "common";
  const clientId = process.env.MICROSOFT_CLIENT_ID!;
  const clientSecret = process.env.MICROSOFT_CLIENT_SECRET!;

  const response = await fetch(`https://login.microsoftonline.com/${tenantId}/oauth2/v2.0/token`, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  });

  if (!response.ok) {
    throw new Error("No se pudo renovar el token de Microsoft.");
  }

  return response.json();
}
