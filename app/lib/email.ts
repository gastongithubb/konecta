import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { SentMessageInfo } from 'nodemailer';


const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  const oauth2Client = new OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    "https://developers.google.com/oauthplayground"
  );

  oauth2Client.setCredentials({
    refresh_token: process.env.GMAIL_REFRESH_TOKEN
  });

  const accessToken = await new Promise<string>((resolve, reject) => {
    oauth2Client.getAccessToken((err, token) => {
      if (err) {
        reject("Failed to create access token :" + err);
      }
      resolve(token || '');
    });
  });

  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      type: "OAuth2",
      user: process.env.SMTP_USER,
      clientId: process.env.GMAIL_CLIENT_ID,
      clientSecret: process.env.GMAIL_CLIENT_SECRET,
      refreshToken: process.env.GMAIL_REFRESH_TOKEN,
      accessToken: accessToken
    }
  } as nodemailer.TransportOptions);

  return transporter;
};


export async function sendWelcomeEmail(email: string, name: string, password: string) {
  const transporter = await createTransporter();

  const info: SentMessageInfo = await transporter.sendMail({
    from: '"Konecta" <gaston.alvarez@sancor.konecta.ar>',
    to: email,
    subject: "Bienvenido a Konecta - SancorSalud - Telefonico",
    text: `Hola ${name},

¡Bienvenid@ a Konecta! Tu cuenta en la web ha sido creada exitosamente.

Aquí están los detalles de tu cuenta:
Correo electrónico: ${email}
Contraseña temporal: ${password}
Pagina del equipo: https://sancor-konectagroup.vercel.app/

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

  if (info.messageId) {
    console.log("Mensaje enviado: %s", info.messageId);
  } else {
    console.log("Mensaje enviado, pero no se recibió un messageId");
  }
}