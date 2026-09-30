"use server";

import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth-helpers";
import { authenticator } from "otplib";
import qrcode from "qrcode";

// Configurar authenticator para que los tokens sean válidos por un poco más de tiempo si es necesario
authenticator.options = { window: 1 };

export async function generate2FASecretAction() {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return { success: false, error: "No autenticado" };
    }

    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!dbUser) return { success: false, error: "Usuario no encontrado" };

    // Generar secreto
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(dbUser.email, "SENA GSS", secret);
    
    // Generar QR en base64
    const qrCodeUrl = await qrcode.toDataURL(otpauthUrl);

    // Guardar el secreto temporalmente o directamente en la DB (en este caso lo guardaremos, pero sin habilitar)
    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        twoFactorSecret: secret,
        // NO lo habilitamos todavía, hasta que lo confirme
      }
    });

    return { success: true, qrCodeUrl, secret };
  } catch (error: any) {
    console.error("Error in generate2FASecretAction:", error);
    return { success: false, error: error.message || "Error interno del servidor" };
  }
}

export async function verifyAndEnable2FAAction(token: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return { success: false, error: "No autenticado" };
    }

    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!dbUser || !dbUser.twoFactorSecret) {
      return { success: false, error: "No hay configuración 2FA pendiente" };
    }

    const isValid = authenticator.verify({ token, secret: dbUser.twoFactorSecret });
    
    if (isValid) {
      await prisma.user.update({
        where: { id: dbUser.id },
        data: {
          twoFactorEnabled: true,
          last2FADate: new Date(),
        }
      });
      return { success: true };
    } else {
      return { success: false, error: "Código inválido" };
    }
  } catch (error: any) {
    console.error("Error in verifyAndEnable2FAAction:", error);
    return { success: false, error: error.message || "Error interno del servidor" };
  }
}

export async function validateLogin2FAAction(email: string, token: string, deviceId: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.twoFactorSecret) {
    return { success: false, error: "Usuario no encontrado o 2FA no activo" };
  }

  const isValid = authenticator.verify({ token, secret: user.twoFactorSecret });
  
  if (isValid) {
    // Actualizar fecha de ultimo 2FA y registrar dispositivo
    await prisma.user.update({
      where: { id: user.id },
      data: { last2FADate: new Date() }
    });
    
    // Aquí deberíamos registrar el dispositivo o actualizar SessionLog
    await registerSessionLog(user.id, deviceId);
    
    return { success: true };
  }
  
  return { success: false, error: "Código 2FA incorrecto" };
}

export async function checkDeviceRequires2FA(email: string, deviceId: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.twoFactorEnabled) {
    return { requires2FA: false };
  }

  // Si ha pasado más de 30 días desde la última verificación 2FA
  const daysSinceLast2FA = user.last2FADate 
    ? (new Date().getTime() - user.last2FADate.getTime()) / (1000 * 3600 * 24)
    : 999;
    
  if (daysSinceLast2FA >= 30) {
    return { requires2FA: true, reason: "expired" };
  }

  // Verificar si es un dispositivo nuevo
  const sessionLog = await prisma.sessionLog.findFirst({
    where: { userId: user.id, deviceId },
    orderBy: { lastActiveAt: 'desc' }
  });

  if (!sessionLog) {
    return { requires2FA: true, reason: "new_device" };
  }

  return { requires2FA: false };
}

export async function registerSessionLog(userId: string, deviceId: string) {
  // Invalidar otras sesiones si queremos que solo haya una
  await prisma.sessionLog.updateMany({
    where: { userId, deviceId: { not: deviceId } },
    data: { isActive: false }
  });

  const existing = await prisma.sessionLog.findFirst({
    where: { userId, deviceId }
  });

  if (existing) {
    await prisma.sessionLog.update({
      where: { id: existing.id },
      data: { lastActiveAt: new Date(), isActive: true }
    });
  } else {
    await prisma.sessionLog.create({
      data: {
        userId,
        deviceId,
        isActive: true
      }
    });
  }
}

export async function disable2FAAction() {
  try {
    const user = await getCurrentUser();
    if (!user?.email) {
      return { success: false, error: "No autenticado" };
    }

    const dbUser = await prisma.user.findUnique({ where: { email: user.email } });
    if (!dbUser) {
      return { success: false, error: "Usuario no encontrado" };
    }

    await prisma.user.update({
      where: { id: dbUser.id },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      }
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in disable2FAAction:", error);
    return { success: false, error: error.message || "Error interno del servidor" };
  }
}

export async function disable2FAForUserAction(userId: string) {
  try {
    const user = await getCurrentUser();
    if (!user?.email) return { success: false, error: 'No autenticado' };

    const currentUser = await prisma.user.findUnique({ where: { email: user.email }, include: { rol: true } });
    if (!currentUser?.rol?.nombre?.toUpperCase().includes('ADMIN')) {
       return { success: false, error: 'No tienes permisos' };
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      }
    });
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
