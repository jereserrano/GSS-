import { google } from "googleapis";
import { PrismaClient } from "@prisma/client";
import fs from "fs";
import path from "path";

const prisma = new PrismaClient();

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET,
  `${process.env.NEXTAUTH_URL}/api/google/callback`
);

export class GoogleDriveService {
  /**
   * Genera la URL de autorización para que el usuario vincule su cuenta
   */
  static getAuthUrl(userId: string) {
    return oauth2Client.generateAuthUrl({
      access_type: "offline", // Requerido para obtener el refresh_token
      scope: ["https://www.googleapis.com/auth/drive.file", "https://www.googleapis.com/auth/userinfo.email"],
      state: userId, // Pasamos el userId en el state para saber a quién asignarle el token al volver
      prompt: "consent", // Fuerza a que siempre nos dé el refresh_token
    });
  }

  /**
   * Procesa el código de autorización y guarda el refresh_token
   */
  static async linkAccount(userId: string, code: string) {
    const { tokens } = await oauth2Client.getToken(code);
    
    if (tokens.refresh_token) {
      await prisma.user.update({
        where: { id: userId },
        data: {
          googleDriveLinked: true,
          googleRefreshToken: tokens.refresh_token,
        },
      });
      return true;
    }
    
    // Si no trae refresh token, es porque el usuario ya había dado permisos antes y no forzamos el prompt
    // En este caso, ya debería estar vinculado o hay un error.
    return false;
  }

  /**
   * Desvincula la cuenta de Google Drive
   */
  static async unlinkAccount(userId: string) {
    await prisma.user.update({
      where: { id: userId },
      data: {
        googleDriveLinked: false,
        googleRefreshToken: null,
        googleDriveFolderId: null,
      },
    });
  }

  /**
   * Obtiene el cliente de Drive autenticado para un usuario específico
   */
  static async getDriveClient(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.googleDriveLinked || !user.googleRefreshToken) {
      throw new Error("El usuario no tiene vinculado Google Drive.");
    }

    const client = new google.auth.OAuth2(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_CLIENT_SECRET
    );
    client.setCredentials({ refresh_token: user.googleRefreshToken });

    return google.drive({ version: "v3", auth: client });
  }

  /**
   * Busca o crea la carpeta "Mi Portafolio SENA - GSS" en el Drive del usuario
   */
  static async getOrCreatePortfolioFolder(userId: string) {
    const user = await prisma.user.findUnique({ where: { id: userId } });
    const drive = await this.getDriveClient(userId);

    // Si ya tenemos el ID de la carpeta guardado, verificamos que exista
    if (user?.googleDriveFolderId) {
      try {
        const file = await drive.files.get({ fileId: user.googleDriveFolderId });
        if (file.data.id && !file.data.trashed) {
          return file.data.id;
        }
      } catch (e) {
        // La carpeta fue borrada o no hay acceso, seguimos para crearla de nuevo
      }
    }

    // Crear la carpeta
    const folderMetadata = {
      name: "Mi Portafolio SENA - GSS",
      mimeType: "application/vnd.google-apps.folder",
    };

    const folder = await drive.files.create({
      requestBody: folderMetadata,
      fields: "id",
    });

    const folderId = folder.data.id;

    // Guardamos el ID de la carpeta en la base de datos
    await prisma.user.update({
      where: { id: userId },
      data: { googleDriveFolderId: folderId },
    });

    return folderId;
  }

  /**
   * Obtiene o crea una subcarpeta dentro de un directorio padre
   */
  static async getOrCreateSubfolder(drive: any, parentId: string, folderName: string) {
    try {
      // Buscar si ya existe la carpeta con ese nombre dentro del padre
      const res = await drive.files.list({
        q: `name='${folderName}' and '${parentId}' in parents and mimeType='application/vnd.google-apps.folder' and trashed=false`,
        fields: "files(id, name)",
        spaces: "drive",
      });

      if (res.data.files && res.data.files.length > 0) {
        return res.data.files[0].id; // Retorna la existente
      }

      // Si no existe, crearla
      const folderMetadata = {
        name: folderName,
        mimeType: "application/vnd.google-apps.folder",
        parents: [parentId],
      };

      const folder = await drive.files.create({
        requestBody: folderMetadata,
        fields: "id",
      });

      return folder.data.id;
    } catch (error) {
      console.error(`Error obteniendo/creando subcarpeta ${folderName}:`, error);
      throw error;
    }
  }

  /**
   * Sube un archivo a la carpeta del portafolio del aprendiz en Google Drive
   */
  static async uploadEvidenceToDrive(
    userId: string, 
    filePath: string, 
    originalName: string, 
    mimeType: string,
    competenciaName: string = "Otras Evidencias",
    resultadoName: string = "Sin Resultado Asignado"
  ) {
    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });
      if (!user || !user.googleDriveLinked) return null;

      const portfolioFolderId = await this.getOrCreatePortfolioFolder(userId);
      const drive = await this.getDriveClient(userId);

      // Crear subcarpeta de la competencia
      const compFolderId = await this.getOrCreateSubfolder(drive, portfolioFolderId, competenciaName);
      
      // Crear subcarpeta del resultado dentro de la competencia
      const resFolderId = await this.getOrCreateSubfolder(drive, compFolderId, resultadoName);

      const fileMetadata = {
        name: originalName,
        parents: [resFolderId],
      };

      const media = {
        mimeType: mimeType,
        body: fs.createReadStream(filePath),
      };

      const file = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: "id, webViewLink",
      });

      return file.data;
    } catch (error) {
      console.error("Error al subir archivo a Google Drive:", error);
      return null;
    }
  }
}
