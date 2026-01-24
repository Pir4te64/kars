/* eslint-disable @typescript-eslint/no-unused-vars */
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
  precio_consignacion_ars?: string;
  precio_consignacion_usd?: string;
  precio_permuta_ars?: string;
  precio_permuta_usd?: string;
  precio_inmediata_ars?: string;
  precio_inmediata_usd?: string;
  dolar_blue?: string;
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
  phone: string = "541121596100"
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

  // Si recibimos los precios ya calculados, usarlos directamente
  // Si no, calcular con la misma lógica que la página de resultado
  const cotizacionDolar = data.cotizacionDolar || 1200;

  let precioConsignacionARS: number;
  let precioConsignacionUSD: string;
  let precioPermutaARS: number;
  let precioPermutaUSD: string;
  let precioInmediataARS: number;
  let precioInmediataUSD: string;

  if (data.precio_consignacion_ars && data.precio_consignacion_usd &&
      data.precio_permuta_ars && data.precio_permuta_usd &&
      data.precio_inmediata_ars && data.precio_inmediata_usd) {
    // Usar valores ya calculados (ya vienen formateados como "$7.394.097 ARS" o "$4,979 USD")
    // Extraer solo los números para ARS (eliminar puntos, comas, símbolos de moneda, etc.)
    precioConsignacionARS = parseFloat(data.precio_consignacion_ars.replace(/[^0-9]/g, '')) || 0;
    precioPermutaARS = parseFloat(data.precio_permuta_ars.replace(/[^0-9]/g, '')) || 0;
    precioInmediataARS = parseFloat(data.precio_inmediata_ars.replace(/[^0-9]/g, '')) || 0;
    
    // Para USD, mantener el formato con comas si existe, pero extraer números
    precioConsignacionUSD = data.precio_consignacion_usd.replace(/[^0-9.,]/g, '').replace(/,/g, '');
    precioPermutaUSD = data.precio_permuta_usd.replace(/[^0-9.,]/g, '').replace(/,/g, '');
    precioInmediataUSD = data.precio_inmediata_usd.replace(/[^0-9.,]/g, '').replace(/,/g, '');
  } else {
    // Calcular con la misma lógica que la página de resultado:
    // 1. Precio * 1000 = precio real en pesos
    const precioEnPesos = precioRaw * 1000;
    const precioBasePesos = precioEnPesos;

    // Calcular los 3 tipos de venta
    const precioInmediata = precioBasePesos; // Base
    const precioConsignacion = precioInmediata * 1.1; // +10%
    const precioPermuta = precioInmediata * 1.05; // +5%

    precioConsignacionARS = precioConsignacion.toFixed(0);
    precioConsignacionUSD = (precioConsignacion / cotizacionDolar).toFixed(0);
    precioPermutaARS = precioPermuta;
    precioPermutaUSD = (precioPermuta / cotizacionDolar).toFixed(0);
    precioInmediataARS = precioInmediata;
    precioInmediataUSD = (precioInmediata / cotizacionDolar).toFixed(0);
  }

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
            <td style="padding: 0;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 0 auto; background-color: #ffffff; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">

                    <!-- Header -->
                    <tr>
                        <td style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); padding: 25px 30px; text-align: center;">
                            <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: 3px;">
                                KARS
                            </h1>
                        </td>
                    </tr>

                    <!-- Título Principal -->
                    <tr>
                        <td style="padding: 25px 30px 10px; text-align: center; background-color: #ffffff;">
                            <h2 style="margin: 0; color: #1a1a1a; font-size: 22px; font-weight: 700; line-height: 1.3;">
                                ${titulo}
                            </h2>
                        </td>
                    </tr>

                    <!-- Subtítulo -->
                    <tr>
                        <td style="padding: 0 30px 20px; text-align: center;">
                            <p style="margin: 0; color: #555555; font-size: 16px; line-height: 1.5;">
                                ¡Agendá una visita hoy mismo y vendé tu auto en 48hs!
                            </p>
                        </td>
                    </tr>
                    
                    <!-- Información del Vehículo y Precios en dos columnas -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #ffffff;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <!-- Columna Izquierda: Detalles del Vehículo -->
                                    <td style="width: 40%; vertical-align: top; padding-right: 15px;">
                                        <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                                            Detalles del vehículo:
                                        </h3>
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #f9f9f9; border-radius: 8px; padding: 12px;">
                                            <tr>
                                                <td style="padding: 5px 0; color: #333333; font-size: 13px;">
                                                    <strong>Marca:</strong> ${marca}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; color: #333333; font-size: 13px;">
                                                    <strong>Modelo:</strong> ${modelo}
                                                </td>
                                            </tr>
                                            ${
                                              grupo
                                                ? `<tr>
                                                <td style="padding: 5px 0; color: #333333; font-size: 13px;">
                                                    <strong>Grupo:</strong> ${grupo}
                                                </td>
                                            </tr>`
                                                : ""
                                            }
                                            <tr>
                                                <td style="padding: 5px 0; color: #333333; font-size: 13px;">
                                                    <strong>Año:</strong> ${año}
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; color: #333333; font-size: 13px;">
                                                    <strong>Kilometraje:</strong> ${
                                                      kilometraje || "No especificado"
                                                    }
                                                </td>
                                            </tr>
                                            <tr>
                                                <td style="padding: 5px 0; color: #333333; font-size: 13px;">
                                                    <strong>Ubicación:</strong> ${ubicacion}
                                                </td>
                                            </tr>
                                        </table>
                                    </td>

                                    <!-- Columna Derecha: Opciones de Venta -->
                                    <td style="width: 60%; vertical-align: top; padding-left: 15px;">
                                        <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                                            Opciones de venta:
                                        </h3>

                                        <!-- Tres tarjetas de precios horizontales -->
                                        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                            <!-- Consignación -->
                                            <tr>
                                                <td style="padding-bottom: 8px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%); border-radius: 8px;">
                                                        <tr>
                                                            <td style="padding: 12px;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="color: #ffffff; font-size: 14px; font-weight: 700; width: 35%;">Consignación</td>
                                                                        <td style="text-align: right; width: 65%;">
                                                                            <div style="color: #ffffff; font-size: 18px; font-weight: 700;">
                                                                                $${precioConsignacionARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ARS
                                                                            </div>
                                                                            <div style="color: #cccccc; font-size: 12px; margin-top: 2px;">
                                                                                USD $${precioConsignacionUSD}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- Permuta -->
                                            <tr>
                                                <td style="padding-bottom: 8px;">
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); border-radius: 8px;">
                                                        <tr>
                                                            <td style="padding: 12px;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="color: #ffffff; font-size: 14px; font-weight: 700; width: 35%;">Permuta</td>
                                                                        <td style="text-align: right; width: 65%;">
                                                                            <div style="color: #ffffff; font-size: 18px; font-weight: 700;">
                                                                                $${precioPermutaARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ARS
                                                                            </div>
                                                                            <div style="color: #cccccc; font-size: 12px; margin-top: 2px;">
                                                                                USD $${precioPermutaUSD}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>

                                            <!-- Compra Inmediata -->
                                            <tr>
                                                <td>
                                                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background: linear-gradient(135deg, #2d2d2d 0%, #1a1a1a 100%); border-radius: 8px;">
                                                        <tr>
                                                            <td style="padding: 12px;">
                                                                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                                                    <tr>
                                                                        <td style="color: #ffffff; font-size: 14px; font-weight: 700; width: 35%;">Compra inmediata</td>
                                                                        <td style="text-align: right; width: 65%;">
                                                                            <div style="color: #ffffff; font-size: 18px; font-weight: 700;">
                                                                                $${precioInmediataARS.toLocaleString('es-AR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })} ARS
                                                                            </div>
                                                                            <div style="color: #cccccc; font-size: 12px; margin-top: 2px;">
                                                                                USD $${precioInmediataUSD}
                                                                            </div>
                                                                        </td>
                                                                    </tr>
                                                                </table>
                                                            </td>
                                                        </tr>
                                                    </table>
                                                </td>
                                            </tr>
                                        </table>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- Próximos Pasos y CTA en una fila compacta -->
                    <tr>
                        <td style="padding: 20px 30px; background-color: #f9f9f9;">
                            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                                <tr>
                                    <!-- Columna Izquierda: Próximos pasos -->
                                    <td style="width: 50%; vertical-align: middle; padding-right: 15px;">
                                        <h3 style="margin: 0 0 12px; color: #1a1a1a; font-size: 16px; font-weight: 600;">
                                            Próximos pasos:
                                        </h3>
                                        <div style="color: #333333; font-size: 13px; line-height: 1.8;">
                                            <div style="margin-bottom: 8px;">
                                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #1a1a1a; color: #ffffff; border-radius: 50%; text-align: center; line-height: 24px; font-weight: 700; margin-right: 10px; font-size: 12px;">✓</span>
                                                <span style="vertical-align: middle;">Cotizá tu auto</span>
                                            </div>
                                            <div style="margin-bottom: 8px;">
                                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #1a1a1a; color: #ffffff; border-radius: 50%; text-align: center; line-height: 24px; font-weight: 700; margin-right: 10px; font-size: 12px;">✓</span>
                                                <span style="vertical-align: middle;">Revisá tu oferta</span>
                                            </div>
                                            <div style="margin-bottom: 8px;">
                                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #0066FF; color: #ffffff; border-radius: 50%; text-align: center; line-height: 24px; font-weight: 700; margin-right: 10px; font-size: 12px;">→</span>
                                                <span style="vertical-align: middle; font-weight: 600;">Agendá una inspección</span>
                                            </div>
                                            <div>
                                                <span style="display: inline-block; width: 24px; height: 24px; background-color: #cccccc; color: #ffffff; border-radius: 50%; text-align: center; line-height: 24px; font-weight: 700; margin-right: 10px; font-size: 12px;">4</span>
                                                <span style="vertical-align: middle;">Vendé tu auto</span>
                                            </div>
                                        </div>
                                    </td>

                                    <!-- Columna Derecha: CTA y Advertencia -->
                                    <td style="width: 50%; vertical-align: middle; padding-left: 15px; text-align: center;">
                                        <div style="background-color: #fff3cd; border-left: 4px solid #ff9800; padding: 12px; margin: 0 0 15px; border-radius: 4px; text-align: left;">
                                            <p style="margin: 0; color: #856404; font-size: 13px; font-weight: 600;">
                                                ⚠️ Oferta válida solo por 7 días
                                            </p>
                                        </div>
                                        <a href="https://kars-sigma.vercel.app/cotizar/resultado" style="display: inline-block; background: linear-gradient(135deg, #0066FF 0%, #0052CC 100%); color: #ffffff; text-decoration: none; padding: 14px 35px; border-radius: 50px; font-size: 15px; font-weight: 700; text-transform: uppercase; letter-spacing: 1px; box-shadow: 0 4px 15px rgba(0, 102, 255, 0.3);">
                                            Agendar Inspección
                                        </a>
                                    </td>
                                </tr>
                            </table>
                        </td>
                    </tr>
                    
                    <!-- WhatsApp y Footer compactos -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; background-color: #ffffff;">
                            <a href="${whatsappUrl}" style="display: inline-block; background-color: #25D366; color: #ffffff; text-decoration: none; padding: 10px 25px; border-radius: 25px; font-size: 14px; font-weight: 600; margin-bottom: 10px;">
                                📱 ¿Tenés dudas? Escribinos al WhatsApp
                            </a>
                        </td>
                    </tr>

                    <!-- Footer -->
                    <tr>
                        <td style="padding: 20px 30px; text-align: center; background-color: #1a1a1a; color: #ffffff;">
                            <p style="margin: 0 0 5px; font-size: 20px; font-weight: 700; letter-spacing: 2px;">
                                KARS
                            </p>
                            <p style="margin: 0; color: #999999; font-size: 11px;">
                                Tu concesionario de confianza | <a href="https://kars-sigma.vercel.app" style="color: #0066FF; text-decoration: none;">kars-sigma.vercel.app</a>
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
