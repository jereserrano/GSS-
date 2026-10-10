require('dotenv').config();
const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: parseInt(process.env.SMTP_PORT || "587"),
  secure: process.env.SMTP_SECURE === "true", 
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function main() {
  try {
    const info = await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: "ivan@sena.edu.co",
      subject: "Test email GSS",
      html: "<p>Prueba de notificaciones</p>",
    });
    console.log("Email sent:", info);
  } catch (error) {
    console.error("Error sending email:", error);
  }
}
main();
