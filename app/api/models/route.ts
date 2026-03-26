import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const supabase = createClient(supabaseUrl, supabaseKey);

// GET - Obtener modelos con filtros
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const brand_id = searchParams.get("brand_id");
    const search = searchParams.get("search");
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = (page - 1) * limit;

    const showHidden = searchParams.get("show_hidden") === "true";

    let query = supabase
      .from("models")
      .select("id, name, brand_id, codia, year_from, year_to, price_adjustments, custom_prices, infoauto_prices", { count: "exact" })
      .order("name", { ascending: true });

    if (brand_id) {
      query = query.eq("brand_id", brand_id);
    }

    if (search) {
      query = query.ilike("name", `%${search}%`);
    }

    query = query.range(offset, offset + limit - 1);

    const { data, error, count } = await query;

    // Filter hidden client-side if the column exists, to avoid errors when column doesn't exist yet
    let models = data || [];
    if (!showHidden && models.length > 0 && "hidden" in models[0]) {
      models = models.filter((m: Record<string, unknown>) => !m.hidden);
    }

    if (error) {
      return NextResponse.json(
        { error: "Error al obtener modelos", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      models,
      total: !showHidden && data && data.length !== models.length ? models.length : count,
      page,
      limit,
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

export async function OPTIONS() {
  return NextResponse.json({ ok: true });
}

// PATCH - Actualizar price_adjustments y/o custom_prices de un modelo
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, price_adjustments, custom_prices, infoauto_prices, hidden } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del modelo" },
        { status: 400 }
      );
    }

    if (price_adjustments === undefined && custom_prices === undefined && infoauto_prices === undefined && hidden === undefined) {
      return NextResponse.json(
        { error: "Faltan los datos a actualizar" },
        { status: 400 }
      );
    }

    const updatePayload: Record<string, unknown> = {};
    if (price_adjustments !== undefined) updatePayload.price_adjustments = price_adjustments;
    if (custom_prices !== undefined) updatePayload.custom_prices = custom_prices;
    if (infoauto_prices !== undefined) updatePayload.infoauto_prices = infoauto_prices;
    if (hidden !== undefined) updatePayload.hidden = hidden;

    const { data, error } = await supabase
      .from("models")
      .update(updatePayload)
      .eq("id", id)
      .select("id, name, price_adjustments");

    if (error) {
      return NextResponse.json(
        { error: "Error al actualizar", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      model: data[0],
      message: "Actualizado correctamente",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}

// DELETE - Eliminar un modelo
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del modelo" },
        { status: 400 }
      );
    }

    const { error } = await supabase
      .from("models")
      .delete()
      .eq("id", id);

    if (error) {
      return NextResponse.json(
        { error: "Error al eliminar", details: error.message },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: "Modelo eliminado correctamente",
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
