"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";
import bcrypt from "bcryptjs";

export async function forgotPasswordAction(email: string) {
  try {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      // Retornar success para no revelar si el correo existe (prevención de enumeración)
      return { success: true };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    await prisma.passwordResetToken.create({
      data: {
        email,
        token,
        expires,
      }
    });

    const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/olvido-clave?token=${token}`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #39A900;">Recuperación de Contraseña - GSS</h2>
        <p>Hola ${user.nombre},</p>
        <p>Has solicitado restablecer tu contraseña. Haz clic en el siguiente enlace para crear una nueva:</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${resetUrl}" style="background-color: #39A900; color: white; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">Restablecer Contraseña</a>
        </div>
        <p>Este enlace expirará en 1 hora.</p>
        <p>Si no solicitaste este cambio, puedes ignorar este correo.</p>
        <hr style="border: 1px solid #eee; margin-top: 30px;" />
        <p style="color: #888; font-size: 12px; text-align: center;">GSS Media Técnica - SENA</p>
      </div>
    `;

    await sendEmail({
      to: email,
      subject: "Recuperación de Contraseña - GSS",
      html,
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in forgotPasswordAction:", error);
    return { success: false, error: "Ocurrió un error al procesar tu solicitud." };
  }
}

export async function resetPasswordAction(token: string, newPassword: string) {
  try {
    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token },
    });

    if (!resetToken) {
      return { success: false, error: "Token inválido o expirado." };
    }

    if (resetToken.expires < new Date()) {
      await prisma.passwordResetToken.delete({ where: { id: resetToken.id } });
      return { success: false, error: "El token ha expirado. Solicita uno nuevo." };
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    await prisma.user.update({
      where: { email: resetToken.email },
      data: { passwordHash: hashedPassword },
    });

    await prisma.passwordResetToken.deleteMany({
      where: { email: resetToken.email },
    });

    return { success: true };
  } catch (error: any) {
    console.error("Error in resetPasswordAction:", error);
    return { success: false, error: "Error al restablecer la contraseña." };
  }
}
