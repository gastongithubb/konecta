// app/lib/forgot-password.ts
import nodemailer from 'nodemailer';
import { google } from 'googleapis';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';

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

    await transporter.verify();
    return transporter;
  } catch (error) {
    console.error('Error detallado al crear el transporter:', error);
    throw new Error('Error al configurar el servicio de correo');
  }
};

function generateEmailTemplate(name: string, resetLink: string, expiryTime: Date) {
  const timeUntilExpiry = formatDistanceToNow(expiryTime, { locale: es });
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Restablecimiento de contraseña</title>
    </head>
    <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; line-height: 1.6;">
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f8fafc; min-height: 400px;">
        <tr>
          <td align="center" style="padding: 40px 10px;">
            <table style="background-color: #ffffff; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); max-width: 600px; width: 100%;">
              <tr>
                <td style="padding: 40px;">
                  <!-- Logo Header -->
                  <div style="text-align: center; margin-bottom: 30px;">
                    <table width="100%">
                      <tr>
                        <td align="center">
                          <div style="background-color: #001933; display: inline-block; padding: 12px; border-radius: 8px;">
                            <span style="color: white; font-size: 24px; font-weight: bold;">K</span>
                            <span style="color: #00bf9a; font-size: 24px; font-weight: bold;">!</span>
                          </div>
                        </td>
                      </tr>
                    </table>
                  </div>

                  <!-- Content -->
                  <h1 style="color: #001933; font-size: 24px; margin-bottom: 20px; text-align: center;">
                    Restablecimiento de contraseña
                  </h1>

                  <p style="color: #4a5568; margin-bottom: 20px;">
                    Hola ${name},
                  </p>

                  <p style="color: #4a5568; margin-bottom: 20px;">
                    Se ha solicitado un restablecimiento de contraseña para tu cuenta en Konecta SancorSalud.
                  </p>

                  <div style="background-color: #f7fafc; border-radius: 8px; padding: 20px; margin: 30px 0;">
                    <p style="color: #4a5568; margin-bottom: 20px; text-align: center;">
                      Para restablecer tu contraseña, haz clic en el siguiente botón:
                    </p>

                    <div style="text-align: center;">
                      <a href="${resetLink}"
                         style="background-color: #00bf9a; color: white; padding: 12px 24px; border-radius: 5px; text-decoration: none; display: inline-block; font-weight: bold;">
                        Restablecer contraseña
                      </a>
                    </div>

                    <p style="color: #e53e3e; font-size: 14px; margin-top: 20px; text-align: center;">
                      Este enlace expirará en ${timeUntilExpiry}.
                    </p>
                  </div>

                  <p style="color: #718096; font-size: 14px; margin-top: 30px;">
                    Si no has solicitado este cambio, puedes ignorar este correo. 
                    Tu contraseña actual seguirá siendo válida.
                  </p>

                  <!-- Footer -->
                  <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                    <p style="color: #718096; font-size: 14px; margin: 0; text-align: center;">
                      Saludos cordiales,<br>
                      El equipo de Konecta SancorSalud
                    </p>
                  </div>
                </td>
              </tr>
            </table>

            <!-- Footer Note -->
            <p style="color: #a0aec0; font-size: 12px; margin-top: 20px; text-align: center;">
              Este es un correo automático, por favor no responder.
            </p>
          </td>
        </tr>
      </table>
    </body>
    </html>
  `;
}

export async function sendPasswordResetEmail(email: string, name: string, resetLink: string) {
  let retries = 3;
  const expiryTime = new Date(Date.now() + 30 * 60 * 1000); // 30 minutos

  while (retries > 0) {
    try {
      const transporter = await createTransporter();

      const mailOptions = {
        from: {
          name: "Konecta SancorSalud",
          address: process.env.SMTP_USER!
        },
        to: email,
        subject: "Restablecimiento de contraseña - Konecta SancorSalud",
        html: generateEmailTemplate(name, resetLink, expiryTime),
        text: `
          Hola ${name},

          Se ha solicitado un restablecimiento de contraseña para tu cuenta en Konecta SancorSalud.

          Para restablecer tu contraseña, accede al siguiente enlace:
          ${resetLink}

          Este enlace expirará en 30 minutos por razones de seguridad.

          Si no has solicitado este cambio, puedes ignorar este correo.
          Tu contraseña actual seguirá siendo válida.

          Saludos cordiales,
          El equipo de Konecta SancorSalud
        `,
      };

      const info = await transporter.sendMail(mailOptions);
      console.log('Email de restablecimiento enviado exitosamente:', info.messageId);
      return true;
    } catch (error) {
      console.error(`Intento ${4 - retries} fallido:`, error);
      retries--;

      if (retries === 0) {
        console.error('Error en sendPasswordResetEmail después de 3 intentos:', error);
        throw new Error('No se pudo enviar el correo de restablecimiento después de varios intentos');
      }

      // Esperar antes del siguiente intento
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }

  return false;
}