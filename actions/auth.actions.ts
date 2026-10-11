"use server";

import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mail";
import crypto from "crypto";
import bcrypt from "bcryptjs";

import { getRecuperacionPasswordEmailTemplate } from "@/lib/email-templates";

export async function forgotPasswordAction(input: string) {
  try {
    const cleanInput = (input || "").trim().toLowerCase();
    if (!cleanInput) {
      return { success: true };
    }

    // 1. Buscar en la tabla User (por email directo)
    let user = await prisma.user.findFirst({
      where: {
        email: cleanInput,
      },
      include: { instructor: true, aprendiz: true },
    });

    // 2. Si no se encontró por User.email, buscar en Aprendices (por emailPersonal, emailSena o numeroDocumento)
    if (!user) {
      const aprendiz = await prisma.aprendiz.findFirst({
        where: {
          OR: [
            { emailPersonal: cleanInput },
            { emailSena: cleanInput },
            { numeroDocumento: cleanInput },
          ],
        },
        include: {
          user: {
            include: { instructor: true, aprendiz: true },
          },
        },
      });

      if (aprendiz?.user) {
        user = aprendiz.user;
      }
    }

    // 3. Si no se encontró, buscar en Instructores (por emailPersonal, email o numeroDocumento)
    if (!user) {
      const instructor = await prisma.instructor.findFirst({
        where: {
          OR: [
            { email: cleanInput },
            { emailPersonal: cleanInput },
            { numeroDocumento: cleanInput },
          ],
        },
        include: {
          user: {
            include: { instructor: true, aprendiz: true },
          },
        },
      });

      if (instructor?.user) {
        user = instructor.user;
      }
    }

    if (!user) {
      // Retornar success para no revelar si la cuenta existe (prevención de enumeración)
      return { success: true };
    }

    const token = crypto.randomBytes(32).toString("hex");
    const expires = new Date(Date.now() + 1000 * 60 * 60); // 1 hora

    // Limpiar tokens anteriores para este usuario
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    });

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    });

    const baseUrl = (process.env.NEXTAUTH_URL || "http://localhost:3000").replace(/\/$/, "");
    const resetUrl = `${baseUrl}/olvido-clave?token=${token}`;

    const html = getRecuperacionPasswordEmailTemplate(user.nombre, resetUrl);

    // Destino prioritario:
    // Aprendiz: emailPersonal -> emailSena -> user.email
    // Instructor: emailPersonal -> user.email
    // Otros roles: user.email
    let targetEmail = user.email;
    if (user.aprendiz?.emailPersonal) {
      targetEmail = user.aprendiz.emailPersonal;
    } else if (user.instructor?.emailPersonal) {
      targetEmail = user.instructor.emailPersonal;
    } else if (user.aprendiz?.emailSena) {
      targetEmail = user.aprendiz.emailSena;
    }

    await sendEmail({
      to: targetEmail,
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
