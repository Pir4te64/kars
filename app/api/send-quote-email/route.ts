import { NextResponse } from "next/server";
import { Resend } from "resend";
import { generateQuoteEmailHTML } from "@/lib/email-template";

// Usar RESEND_API_KEY (recomendado) o NEXT_PUBLIC_RESEND_API_KEY como fallback
// NOTA: Para producción, usa RESEND_API_KEY sin NEXT_PUBLIC_ por seguridad
const resendApiKey =
  process.env.RESEND_API_KEY || process.env.NEXT_PUBLIC_RESEND_API_KEY;

if (!resendApiKey) {
  console.error(
    "RESEND_API_KEY no está configurada en las variables de entorno"
  );
}

const resend = new Resend(resendApiKey);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      email,
      nombre,
      marca,
      modelo,
      grupo,
      año,
      precio,
      cotizacionDolar,
      kilometraje,
      ubicacion,
      precio_consignacion_ars,
      precio_consignacion_usd,
      precio_permuta_ars,
      precio_permuta_usd,
      precio_inmediata_ars,
      precio_inmediata_usd,
      dolar_blue,
    } = body;

    // Validar campos requeridos
    if (!email || !nombre || !marca || !modelo || !año || !ubicacion) {
      return NextResponse.json(
        {
          error: "Faltan campos requeridos",
          missing: {
            email: !email,
            nombre: !nombre,
            marca: !marca,
            modelo: !modelo,
            año: !año,
            ubicacion: !ubicacion,
          },
        },
        { status: 400 }
      );
    }

    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: "Email inválido" }, { status: 400 });
    }

    // Validar que la API key esté configurada
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY no está configurada" },
        { status: 500 }
      );
    }

    // Generar HTML del email
    // Asegurar que todos los valores sean strings
    const html = generateQuoteEmailHTML({
      nombre: String(nombre || ""),
      marca: String(marca || ""),
      modelo: String(modelo || ""),
      grupo: grupo ? String(grupo) : "",
      año: String(año || ""),
      precio: precio ? String(precio) : "Consultar",
      cotizacionDolar: cotizacionDolar ? Number(cotizacionDolar) : 1200,
      kilometraje: kilometraje ? String(kilometraje) : "No especificado",
      ubicacion: String(ubicacion || ""),
      precio_consignacion_ars: precio_consignacion_ars
        ? String(precio_consignacion_ars)
        : undefined,
      precio_consignacion_usd: precio_consignacion_usd
        ? String(precio_consignacion_usd)
        : undefined,
      precio_permuta_ars: precio_permuta_ars
        ? String(precio_permuta_ars)
        : undefined,
      precio_permuta_usd: precio_permuta_usd
        ? String(precio_permuta_usd)
        : undefined,
      precio_inmediata_ars: precio_inmediata_ars
        ? String(precio_inmediata_ars)
        : undefined,
      precio_inmediata_usd: precio_inmediata_usd
        ? String(precio_inmediata_usd)
        : undefined,
      dolar_blue: dolar_blue ? String(dolar_blue) : undefined,
    });

    // Enviar email usando Resend
    // Siempre enviar copia a Contacto@kars.ar
    const { data, error } = await resend.emails.send({
      from: process.env.RESEND_FROM_EMAIL || "KARS <info@kars.com.ar>",
      to: [email],
      // cc: ["Contacto@kars.ar"],
      subject: `Cotización de ${marca} ${modelo} ${año} - KARS`,
      html,
    });

    if (error) {
      console.error("Error sending email with Resend:", error);
      return NextResponse.json(
        { error: "Error al enviar el email", details: error },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      messageId: data?.id,
      message: "Email enviado correctamente",
    });
  } catch (error) {
    console.error("Error in /api/send-quote-email:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
