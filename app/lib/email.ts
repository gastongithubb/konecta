import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { SentMessageInfo } from 'nodemailer';

const OAuth2 = google.auth.OAuth2;

const createTransporter = async () => {
  try {
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
          console.error('Error detallado al obtener access token:', err);
          reject(new Error(`Error al obtener access token: ${err.message}`));
          return;
        }
        if (!token) {
          reject(new Error('No se pudo obtener el access token'));
          return;
        }
        resolve(token);
      });
    });

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        type: "OAuth2",
        user: process.env.SMTP_USER,
        clientId: process.env.GMAIL_CLIENT_ID,
        clientSecret: process.env.GMAIL_CLIENT_SECRET,
        refreshToken: process.env.GMAIL_REFRESH_TOKEN,
        accessToken: accessToken
      }
    } as nodemailer.TransportOptions);

    // Verificar la configuración
    await transporter.verify();
    return transporter;
  } catch (error) {
    console.error('Error detallado al crear el transporter:', error);
    throw error;
  }
};

export async function sendWelcomeEmail(email: string, name: string, password: string) {
  try {
    const transporter = await createTransporter();

    const mailOptions = {
      from: `"Konecta SancorSalud" <${process.env.SMTP_USER}>`,
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
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h1 style="color: #2c5282;">¡Bienvenido a Konecta, ${name}!</h1>
          <p>Tu cuenta ha sido creada exitosamente.</p>
          
          <div style="background-color: #f7fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h2 style="color: #2d3748;">Detalles de tu cuenta:</h2>
            <ul style="list-style: none; padding: 0;">
              <li style="margin: 10px 0;"><strong>Correo electrónico:</strong> ${email}</li>
              <li style="margin: 10px 0;"><strong>Contraseña temporal:</strong> ${password}</li>
            </ul>
          </div>

          <p style="color: #e53e3e; font-weight: bold;">Por razones de seguridad, por favor cambia tu contraseña después de tu primer inicio de sesión.</p>
          
          <p>Accede a tu cuenta aquí: <a href="https://sancor-konectagroup.vercel.app/" style="color: #3182ce;">Portal Konecta</a></p>
          
          <p>Si tienes alguna pregunta, no dudes en contactar a nuestro equipo de soporte.</p>
          
          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
            <p>Saludos cordiales,<br>El equipo de Konecta</p>
          </div>
        </div>
      `
    };

    const info = await transporter.sendMail(mailOptions);
    console.log('Email enviado exitosamente:', info.messageId);
    return true;

  } catch (error) {
    console.error('Error detallado en sendWelcomeEmail:', error);
    throw error;
  }
}