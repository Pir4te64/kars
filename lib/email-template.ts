interface QuoteEmailData {
  nombre: string;
  marca: string;
  modelo: string;
  grupo: string;
  año: string;
  precio: string;
  kilometraje: string;
  ubicacion: string;
}

// Función para escapar HTML y prevenir XSS
function escapeHtml(text: string | number | null | undefined): string {
  // Convertir a string y manejar valores nulos/undefined
  if (text == null) return "";
  const str = String(text);
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

// Función para generar URL de WhatsApp con los datos de la cotización
export function generateWhatsAppUrl(
  data: QuoteEmailData,
  phone: string = "5493764000000"
): string {
  const nombre = data.nombre || "";
  const marca = data.marca || "";
  const modelo = data.modelo || "";
  const grupo = data.grupo || "";
  const año = data.año || "";
  const precio = data.precio || "Consultar";
  const kilometraje = data.kilometraje || "No especificado";
  const ubicacion = data.ubicacion || "";

  // Construir el mensaje con los datos de la cotización
  let message = `Hola! Quiero consultar sobre mi cotización:\n\n`;
  message += `👤 Nombre: ${nombre}\n`;
  message += `🚗 Vehículo: ${marca} ${modelo}${grupo ? ` ${grupo}` : ""}\n`;
  message += `📅 Año: ${año}\n`;
  message += `💰 Precio ofrecido: ${precio}\n`;
  message += `📏 Kilometraje: ${kilometraje}\n`;
  message += `📍 Ubicación: ${ubicacion}\n\n`;
  message += `¿Podemos agendar una visita para evaluar mi vehículo?`;

  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}?text=${encodedMessage}`;
}

export function generateQuoteEmailHTML(data: QuoteEmailData): string {
  // Escapar todos los datos para prevenir XSS
  // Convertir a string y manejar valores undefined/null
  const marca = escapeHtml(data.marca || "");
  const modelo = escapeHtml(data.modelo || "");
  const grupo = data.grupo ? escapeHtml(data.grupo) : "";
  const año = escapeHtml(data.año || "");
  const precio = data.precio ? escapeHtml(data.precio) : "Consultar";
  const kilometraje = data.kilometraje
    ? escapeHtml(data.kilometraje)
    : "No especificado";
  const ubicacion = escapeHtml(data.ubicacion || "");

  // Construir el título con los datos reales
  const titulo = `Agendá una visita para vender tu ${marca} ${modelo} ${año}`;

  // Generar URL de WhatsApp con los datos de la cotización
  const whatsappUrl = generateWhatsAppUrl(data);

  return `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Tu cotización de KARS</title>
</head>
<body style="margin: 0; padding: 0; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f4f4f4;">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f4f4f4;">
        <tr>
            <td style="padding: 20px 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="margin: 0 auto; background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                    
                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 40px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 3px;">
                                KARS
                            </h1>
                        </td>
                    </tr>
                    
                    <!-- Título Principal -->
                    <tr>
                        <td style="padding: 40px 30px 20px; text-align: center; background-color: #ffffff;">
                            <h2 style="margin: 0; color: #1a1a1a; font-size: 28px; font-weight: 700; line-height: 1.3;">
                                ${titulo}
                            </h2>
                        </td>
                    </tr>
                    
                    <!-- Subtítulo -->
                    <tr>
                        <td style="padding: 0 30px 30px; text-align: center;">
                            <p style="margin: 0; color: #555555; font-size: 18px; line-height: 1.6;">
                                ¡Agendá una visita  hoy mismo y vendé tu auto en 48hs!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Información del Vehículo -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f9f9f9;">
                            <h3 style="margin: 0 0 15px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                                Detalles del vehículo:
                            </h3>
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                                        <strong>Marca:</strong> ${marca}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                                        <strong>Modelo:</strong> ${modelo}
                                    </td>
                                </tr>
                                ${
                                  grupo
                                    ? `<tr>
                                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                                        <strong>Grupo:</strong> ${grupo}
                                    </td>
                                </tr>`
                                    : ""
                                }
                                <tr>
                                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                                        <strong>Año:</strong> ${año}
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                                        <strong>Kilometraje:</strong> ${
                                          kilometraje || "No especificado"
                                        }
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 8px 0; color: #333333; font-size: 15px;">
                                        <strong>Ubicación:</strong> ${ubicacion}
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Próximos Pasos -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f9f9f9;">
                            <h3 style="margin: 0 0 25px; color: #1a1a1a; font-size: 20px; font-weight: 600;">
                                Próximos pasos:
                            </h3>
                            
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                        <span style="display: inline-block; width: 30px; height: 30px; background-color: #1a1a1a; color: #ffffff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: 700; margin-right: 15px;">1</span>
                                        <span style="color: #333333; font-size: 16px; vertical-align: middle;">Cotizá tu auto</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                        <span style="display: inline-block; width: 30px; height: 30px; background-color: #1a1a1a; color: #ffffff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: 700; margin-right: 15px;">2</span>
                                        <span style="color: #333333; font-size: 16px; vertical-align: middle;">Revisá tu oferta</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0; border-bottom: 1px solid #e0e0e0;">
                                        <span style="display: inline-block; width: 30px; height: 30px; background-color: #0066FF; color: #ffffff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: 700; margin-right: 15px;">3</span>
                                        <span style="color: #333333; font-size: 16px; vertical-align: middle; font-weight: 600;">Agendá una inspección</span>
                                    </td>
                                </tr>
                                <tr>
                                    <td style="padding: 12px 0;">
                                        <span style="display: inline-block; width: 30px; height: 30px; background-color: #1a1a1a; color: #ffffff; border-radius: 50%; text-align: center; line-height: 30px; font-weight: 700; margin-right: 15px;">4</span>
                                        <span style="color: #333333; font-size: 16px; vertical-align: middle;">Vendé tu auto</span>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Oferta -->
                    <tr>
                        <td style="padding: 40px 30px; text-align: center; background-color: #ffffff;">
                            <h3 style="margin: 0 0 20px; color: #1a1a1a; font-size: 22px; font-weight: 600;">
                                La oferta para tu auto:
                            </h3>
                            
                            <div style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; padding: 30px; margin: 0 0 20px;">
                                <p style="margin: 0 0 10px; color: #cccccc; font-size: 16px;">
                                    Pago inmediato:
                                </p>
                                <p style="margin: 0; color: #ffffff; font-size: 42px; font-weight: 700; letter-spacing: -1px;">
                                    ${precio || "Consultar"}
                                </p>
                                <p style="margin: 15px 0 0; color: #4CAF50; font-size: 16px; font-weight: 600;">
                                    ✓ Excelentes condiciones
                                </p>
                            </div>
                            <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 15px; margin: 0 0 30px; border-radius: 4px;">
                                <p style="margin: 0; color: #856404; font-size: 15px; font-weight: 600;">
                                    ⚠️ Oferta válida solo por 7 días
                                </p>
                            </div>
                            <p style="margin: 0 0 25px; color: #333333; font-size: 18px; font-weight: 600;">
                                ¡No pierdas tu oferta y agendá una inspección ahora!
                            </p>
                            
                            <!-- CTA Principal -->
                            <a href="https://kars-sigma.vercel.app/cotizar/resultado" style="display: inline-block; background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); color: #ffffff; text-decoration: none; padding: 18px 50px; border-radius: 50px; font-size: 18px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0, 102, 255, 0.3);">
                                Agendar Inspección
                            </a>
                        </td>
                    </tr>
                    
                    <!-- ¿Tenés dudas? -->
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #f9f9f9;">
                            <h4 style="margin: 0 0 15px; color: #1a1a1a; font-size: 18px; font-weight: 600;">
                                ¿Tenés dudas?
                            </h4>
                            <a href="${whatsappUrl}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 12px 30px; border-radius: 25px; font-size: 16px; font-weight: 600;">
                                📱 Escribinos al WhatsApp
                            </a>
                        </td>
                    </tr>
                    
                    <!-- Footer -->
                    <tr>
                        <td style="padding: 30px; text-align: center; background-color: #1a1a1a; color: #ffffff;">
                            <p style="margin: 0 0 10px; font-size: 24px; font-weight: 700; letter-spacing: 2px;">
                                KARS
                            </p>
                            <p style="margin: 0 0 15px; color: #cccccc; font-size: 14px;">
                                Tu concesionario de confianza
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 12px; line-height: 1.6;">
                                Este email fue enviado desde <a href="https://kars-sigma.vercel.app" style="color: #0066FF; text-decoration: none;">KARS</a><br>
                                Si ya no querés recibir estos emails, podés <a href="#" style="color: #999999; text-decoration: underline;">ajustar tus preferencias</a>
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
