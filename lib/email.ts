import nodemailer from 'nodemailer';

export async function sendWelcomeEmail(email: string, name: string, password: string) {
  const transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 587,
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const info = await transporter.sendMail({
    from: '"Konecta" <gaston.alvarez@sancor.konecta.ar>',
    to: email,
    subject: "Bienvenido a Konecta - SancorSalud - Telefonico",
    text: `Hola ${name},

¡Bienvenid@ a Konecta! Tu cuenta en la web ha sido creada exitosamente.

Aquí están los detalles de tu cuenta:
Correo electrónico: ${email}
Contraseña temporal: ${password}

Por razones de seguridad, por favor cambia tu contraseña después de tu primer inicio de sesión.

Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.

Saludos cordiales,
El equipo de Konecta`,
    html: `<h1>¡Bienvenido a Konecta, ${name}!</h1>
<p>Tu cuenta ha sido creada exitosamente.</p>
<h2>Detalles de tu cuenta:</h2>
<ul>
  <li><strong>Correo electrónico:</strong> ${email}</li>
  <li><strong>Contraseña temporal:</strong> ${password}</li>
</ul>
<p><strong>Por razones de seguridad, por favor cambia tu contraseña después de tu primer inicio de sesión.</strong></p>
<p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
<p>Saludos cordiales,<br>El equipo de Konecta</p>`,
  });

  console.log("Mensaje enviado: %s", info.messageId);
}