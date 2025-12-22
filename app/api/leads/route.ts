import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

export async function POST(request: Request) {
  try {
    console.log("📥 API /api/leads - POST recibido");

    const body = await request.json();
    console.log("📦 Datos recibidos:", body);

    const {
      nombre,
      email,
      telefono,
      ubicacion,
      marca,
      modelo,
      grupo,
      año,
      kilometraje,
      precio,
      // Nuevos campos para las tres cotizaciones
      precio_inmediata_ars,
      precio_inmediata_usd,
      precio_consignacion_ars,
      precio_consignacion_usd,
      precio_permuta_ars,
      precio_permuta_usd,
      cotizacion_dolar,
    } = body;

    // Validar campos requeridos
    if (!nombre || !email || !telefono || !ubicacion) {
      console.error("❌ Faltan campos requeridos");
      return NextResponse.json(
        {
          error: "Faltan campos requeridos",
          missing: {
            nombre: !nombre,
            email: !email,
            telefono: !telefono,
            ubicacion: !ubicacion,
          },
        },
        { status: 400 }
      );
    }

    console.log("✅ Validación OK, guardando en Supabase...");

    // Guardar lead en Supabase con las tres cotizaciones
    const { data, error } = await supabase
      .from("leads")
      .insert([
        {
          nombre,
          email,
          telefono,
          ubicacion,
          marca,
          modelo,
          grupo,
          año,
          kilometraje,
          precio,
          // Agregar las tres cotizaciones
          precio_inmediata_ars,
          precio_inmediata_usd,
          precio_consignacion_ars,
          precio_consignacion_usd,
          precio_permuta_ars,
          precio_permuta_usd,
          cotizacion_dolar,
          estado: "nuevo",
        },
      ])
      .select();

    if (error) {
      console.error("❌ Error de Supabase:", error);
      return NextResponse.json(
        {
          error: "Error al guardar el lead",
          details: error.message,
          code: error.code,
          hint: error.hint,
        },
        { status: 500 }
      );
    }

    console.log(
      "✅ Lead guardado exitosamente con las tres cotizaciones:",
      data[0]
    );
    return NextResponse.json({
      success: true,
      lead: data[0],
      message: "Lead guardado correctamente",
    });
  } catch (error) {
    console.error("Error in /api/leads:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// GET - Obtener todos los leads
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const estado = searchParams.get("estado");

    let query = supabase
      .from("leads")
      .select("*")
      .order("created_at", { ascending: false });

    if (estado) {
      query = query.eq("estado", estado);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching leads:", error);
      return NextResponse.json(
        { error: "Error al obtener leads", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      leads: data,
      count: data.length,
    });
  } catch (error) {
    console.error("Error in GET /api/leads:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// PATCH - Actualizar estado de un lead
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, estado } = body;

    if (!id || !estado) {
      return NextResponse.json(
        { error: "Faltan campos requeridos (id, estado)" },
        { status: 400 }
      );
    }

    const { data, error } = await supabase
      .from("leads")
      .update({
        estado,
        updated_at: new Date().toISOString(),
      })
      .eq("id", id)
      .select();

    if (error) {
      console.error("Error updating lead:", error);
      return NextResponse.json(
        { error: "Error al actualizar el lead", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      lead: data[0],
      message: "Estado actualizado correctamente",
    });
  } catch (error) {
    console.error("Error in PATCH /api/leads:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un lead
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del lead" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("leads").delete().eq("id", id);

    if (error) {
      console.error("Error deleting lead:", error);
      return NextResponse.json(
        { error: "Error al eliminar el lead", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Lead eliminado correctamente",
    });
  } catch (error) {
    console.error("Error in DELETE /api/leads:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
