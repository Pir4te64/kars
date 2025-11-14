interface QuoteEmailData {
  nombre: string;
  marca: string;
  modelo: string;
  grupo: string;
  año: string;
  precio: string;
  cotizacionDolar?: number;
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

  // Formatear precio en USD para WhatsApp
  const precioNum = parseFloat(precio.toString());
  const precioFormateado = !isNaN(precioNum) && precioNum > 0
    ? `USD $${precioNum.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : precio;

  // Construir el mensaje con los datos de la cotización
  let message = `Hola! Quiero consultar sobre mi cotización:\n\n`;
  message += `👤 Nombre: ${nombre}\n`;
  message += `🚗 Vehículo: ${marca} ${modelo}${grupo ? ` ${grupo}` : ""}\n`;
  message += `📅 Año: ${año}\n`;
  message += `💰 Precio ofrecido: ${precioFormateado}\n`;
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
  const precioRaw = data.precio ? parseFloat(data.precio.toString()) : 0;
  const precio = data.precio ? escapeHtml(data.precio) : "Consultar";

  // Formatear precio en USD
  const precioUSD = precioRaw > 0
    ? `USD $${precioRaw.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`
    : "Consultar";

  // Convertir a ARS usando la cotización recibida o valor por defecto
  const cotizacionDolar = data.cotizacionDolar || 1200; // Usar cotización recibida o fallback

  // Aplicar la misma lógica que en la página de resultado:
  // 1. Descontar 3% del precio
  // 2. Multiplicar por 1000
  const precioBasePesos = precioRaw > 0
    ? (precioRaw * 0.97 * 1000) // Mismo cálculo que obtenerPrecioBasePesos()
    : 0;

  // Calcular los 3 tipos de venta (igual que en resultado/page.tsx)
  const precioConsignacion = precioBasePesos; // 100% - Mejor precio
  const precioPermuta = precioBasePesos * 0.95; // 95% - Menos 5%
  const precioInmediata = precioBasePesos * 0.90; // 90% - Menos 10%

  // Formatear el precio de consignación (mejor precio) para el email
  const precioARS = precioBasePesos > 0
    ? precioConsignacion.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
    : "Consultar";

  // Precio en USD de consignación
  const precioUSDConsignacion = precioBasePesos > 0 && cotizacionDolar > 0
    ? (precioConsignacion / cotizacionDolar).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })
    : "0";

  // Formatear kilometraje
  const kmRaw = data.kilometraje ? parseFloat(data.kilometraje.toString()) : 0;
  const kilometraje = !isNaN(kmRaw) && kmRaw > 0
    ? `${kmRaw.toLocaleString('es-AR')} km`
    : (data.kilometraje ? escapeHtml(data.kilometraje) : "No especificado");

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
                                Opciones de venta para tu auto:
                            </h3>

                            <!-- Consignación -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 12px; margin: 0 0 15px;">
                                <tr>
                                    <td style="padding: 25px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 15px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="color: #ffffff; font-size: 18px; font-weight: 700;">Consignación</td>
                                                            <td align="right" style="background-color: rgba(255,255,255,0.3); color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; width: auto;">Mejor precio</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-bottom: 5px; color: #cccccc; font-size: 14px;">Precio en Pesos (ARS):</td>
                                            </tr>
                                            <tr>
                                                <td style="color: #ffffff; font-size: 36px; font-weight: 700; letter-spacing: -1px;">
                                                    $${precioARS}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 10px; color: #999999; font-size: 16px;">
                                                    USD $${precioUSDConsignacion}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 15px; color: #ffffff; font-size: 13px; opacity: 0.9;">
                                                    Precio completo, pagas al vender
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Permuta -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); border-radius: 12px; margin: 0 0 15px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 10px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="color: #ffffff; font-size: 16px; font-weight: 700;">Permuta</td>
                                                            <td align="right" style="background-color: rgba(255,255,255,0.3); color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; width: auto;">-5%</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #ffffff; font-size: 24px; font-weight: 700;">
                                                    $${precioPermuta.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 5px; color: #999999; font-size: 14px;">
                                                    USD $${(precioPermuta / cotizacionDolar).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 10px; color: #ffffff; font-size: 12px; opacity: 0.9;">
                                                    Cambia tu auto por otro
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>

                            <!-- Compra Inmediata -->
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); border-radius: 12px; margin: 0 0 20px;">
                                <tr>
                                    <td style="padding: 20px;">
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <tr>
                                                <td style="padding-bottom: 10px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                        <tr>
                                                            <td style="color: #ffffff; font-size: 16px; font-weight: 700;">Compra inmediata</td>
                                                            <td align="right" style="background-color: rgba(255,255,255,0.3); color: #ffffff; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; width: auto;">-10%</td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="color: #ffffff; font-size: 24px; font-weight: 700;">
                                                    $${precioInmediata.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 5px; color: #999999; font-size: 14px;">
                                                    USD $${(precioInmediata / cotizacionDolar).toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 2 })}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding-top: 10px; color: #ffffff; font-size: 12px; opacity: 0.9;">
                                                    Dinero en el momento
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
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
