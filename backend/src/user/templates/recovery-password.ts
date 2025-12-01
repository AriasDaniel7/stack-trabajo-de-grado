export class RecoveryPasswordTemplate {
  static generateTemplate(password: string): string {
    return `<!DOCTYPE html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="color-scheme" content="light only" />
    <meta name="supported-color-schemes" content="light" />
    <title>Recuperación de Contraseña - DAP SOFT</title>
    <style>
      :root {
        color-scheme: light only;
      }
      * {
        color-scheme: light only !important;
      }
      @media (prefers-color-scheme: dark) {
        body,
        table,
        td {
          background-color: #f0fdf4 !important;
        }
        .card {
          background-color: #ffffff !important;
        }
      }
    </style>
  </head>
  <body
    style="
      margin: 0;
      padding: 0;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto,
        sans-serif;
      background-color: #f0fdf4 !important;
      color-scheme: light only;
    "
  >
    <table
      role="presentation"
      width="100%"
      cellpadding="0"
      cellspacing="0"
      style="background-color: #f0fdf4 !important"
    >
      <tr>
        <td style="padding: 40px 20px">
          <!-- Card Principal -->
          <table
            class="card"
            role="presentation"
            width="600"
            cellpadding="0"
            cellspacing="0"
            style="
              max-width: 600px;
              margin: 0 auto;
              background-color: #ffffff !important;
              border-radius: 16px;
              box-shadow: 0 10px 25px rgba(16, 185, 129, 0.1);
            "
          >
            <!-- Header -->
            <tr>
              <td
                style="
                  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
                  padding: 40px 30px;
                  text-align: center;
                "
              >
                <h1
                  style="
                    margin: 0;
                    color: #ffffff !important;
                    font-size: 28px;
                    font-weight: 700;
                  "
                >
                  DAP SOFT
                </h1>
                <p
                  style="
                    margin: 8px 0 0;
                    color: #d1fae5 !important;
                    font-size: 14px;
                  "
                >
                  Software de División Administrativa de Posgrados
                </p>
              </td>
            </tr>

            <!-- Icono -->
            <tr>
              <td
                style="
                  padding: 40px 30px 20px;
                  text-align: center;
                  background-color: #ffffff !important;
                "
              >
                <!-- Reemplazando SVG con entidad HTML compatible con todos los clientes de correo -->
                <table
                  role="presentation"
                  cellpadding="0"
                  cellspacing="0"
                  style="margin: 0 auto"
                >
                  <tr>
                    <td
                      style="
                        width: 80px;
                        height: 80px;
                        background: linear-gradient(
                          135deg,
                          #a78bfa 0%,
                          #8b5cf6 100%
                        ) !important;
                        border-radius: 50%;
                        text-align: center;
                        vertical-align: middle;
                      "
                    >
                      <span
                        style="
                          font-size: 40px;
                          line-height: 80px;
                          color: #ffffff !important;
                        "
                        >🔒</span
                      >
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Contenido -->
            <tr>
              <td
                style="
                  padding: 0 40px 30px;
                  background-color: #ffffff !important;
                "
              >
                <h2
                  style="
                    margin: 0 0 16px;
                    color: #047857 !important;
                    font-size: 24px;
                    font-weight: 700;
                    text-align: center;
                  "
                >
                  Recuperación de Contraseña
                </h2>
                <p
                  style="
                    margin: 0 0 24px;
                    color: #4b5563 !important;
                    font-size: 16px;
                    text-align: center;
                  "
                >
                  Hemos recibido una solicitud para restablecer tu contraseña.
                  Utiliza la contraseña temporal a continuación para acceder a
                  tu cuenta.
                </p>

                <!-- Contraseña Temporal -->
                <div
                  style="
                    background: linear-gradient(
                      135deg,
                      #dbeafe 0%,
                      #e0e7ff 100%
                    );
                    border-left: 4px solid #3b82f6;
                    border-radius: 8px;
                    padding: 24px;
                    margin: 30px 0;
                  "
                >
                  <p
                    style="
                      margin: 0 0 8px;
                      color: #1e40af !important;
                      font-size: 12px;
                      font-weight: 600;
                      text-transform: uppercase;
                      letter-spacing: 1px;
                    "
                  >
                    Contraseña Temporal
                  </p>
                  <div
                    style="
                      background-color: #ffffff !important;
                      border-radius: 6px;
                      padding: 16px;
                      margin: 12px 0;
                      border: 2px dashed #3b82f6;
                    "
                  >
                    <code
                      style="
                        font-family: 'Courier New', monospace;
                        font-size: 24px;
                        font-weight: 700;
                        color: #1e3a8a !important;
                        letter-spacing: 2px;
                        display: block;
                        text-align: center;
                      "
                      >${password}</code
                    >
                  </div>
                  <p
                    style="
                      margin: 8px 0 0;
                      color: #3730a3 !important;
                      font-size: 13px;
                    "
                  >
                    <strong style="color: #3730a3 !important"
                      >⚠️ Importante:</strong
                    >
                    Esta contraseña es temporal y debe cambiarse inmediatamente
                    después de iniciar sesión.
                  </p>
                </div>

                <!-- Instrucciones -->
                <div
                  style="
                    background-color: #f0fdf4 !important;
                    border-radius: 8px;
                    padding: 20px;
                    margin: 24px 0;
                  "
                >
                  <h3
                    style="
                      margin: 0 0 12px;
                      color: #065f46 !important;
                      font-size: 16px;
                      font-weight: 600;
                    "
                  >
                    📋 Pasos a seguir:
                  </h3>
                  <ol
                    style="
                      margin: 0;
                      padding-left: 20px;
                      color: #065f46 !important;
                    "
                  >
                    <li style="margin-bottom: 8px">
                      Ingresa a DAP SOFT con tu usuario
                    </li>
                    <li style="margin-bottom: 8px">
                      Utiliza la contraseña temporal proporcionada arriba
                    </li>
                    <li style="margin-bottom: 8px">
                      <strong
                        >Ve a la configuración de tu perfil y cambia tu
                        contraseña inmediatamente</strong
                      >
                    </li>
                    <li>Crea una contraseña segura que no olvides</li>
                  </ol>
                </div>

                <!-- Botón -->
                <div style="text-align: center; margin: 30px 0">
                  <a
                    href="https://danielariaspruebas.site"
                    style="
                      display: inline-block;
                      background: linear-gradient(
                        135deg,
                        #10b981 0%,
                        #059669 100%
                      );
                      color: #ffffff !important;
                      text-decoration: none;
                      padding: 16px 48px;
                      border-radius: 8px;
                      font-weight: 600;
                      font-size: 16px;
                    "
                    >Acceder a DAP SOFT</a
                  >
                </div>

                <!-- Advertencia -->
                <div
                  style="
                    background-color: #fef3c7 !important;
                    border-left: 4px solid #f59e0b;
                    border-radius: 8px;
                    padding: 16px;
                    margin: 24px 0;
                  "
                >
                  <p
                    style="
                      margin: 0 0 8px;
                      color: #92400e !important;
                      font-size: 14px;
                    "
                  >
                    <strong style="color: #92400e !important"
                      >🔒 Seguridad:</strong
                    >
                    Por tu seguridad, recuerda cambiar esta contraseña temporal
                    en la configuración de tu perfil inmediatamente después de
                    iniciar sesión.
                  </p>
                  <p
                    style="
                      margin: 0;
                      color: #92400e !important;
                      font-size: 14px;
                    "
                  >
                    Si no solicitaste este cambio de contraseña, contacta al
                    administrador del sistema inmediatamente.
                  </p>
                </div>
              </td>
            </tr>

            <!-- Info adicional -->
            <tr>
              <td
                style="
                  background-color: #f9fafb !important;
                  padding: 30px 40px;
                  border-top: 1px solid #e5e7eb;
                "
              >
                <p
                  style="
                    margin: 0 0 12px;
                    color: #6b7280 !important;
                    font-size: 14px;
                    text-align: center;
                  "
                >
                  <strong>Validez:</strong> Esta contraseña temporal expira en
                  24 horas
                </p>
                <p
                  style="
                    margin: 0;
                    color: #9ca3af !important;
                    font-size: 13px;
                    text-align: center;
                  "
                >
                  Si tienes problemas para acceder, contacta al soporte técnico
                </p>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td
                style="
                  background: linear-gradient(135deg, #065f46 0%, #047857 100%);
                  padding: 30px 40px;
                  text-align: center;
                "
              >
                <p
                  style="
                    margin: 0 0 8px;
                    color: #d1fae5 !important;
                    font-size: 14px;
                    font-weight: 600;
                  "
                >
                  DAP SOFT
                </p>
                <p
                  style="
                    margin: 0 0 16px;
                    color: #a7f3d0 !important;
                    font-size: 12px;
                  "
                >
                  División Administrativa de Posgrados
                </p>
                <p
                  style="margin: 0; color: #6ee7b7 !important; font-size: 11px"
                >
                  © 2025 DAP SOFT. Todos los derechos reservados.
                </p>
              </td>
            </tr>
          </table>

          <!-- Texto legal -->
          <table
            role="presentation"
            width="600"
            style="max-width: 600px; margin: 20px auto 0"
          >
            <tr>
              <td style="text-align: center; padding: 0 20px">
                <p
                  style="margin: 0; color: #059669 !important; font-size: 11px"
                >
                  Este es un correo automático, por favor no responda a esta
                  dirección.<br />Para asistencia, contacte al administrador del
                  sistema.
                </p>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
  }
}
