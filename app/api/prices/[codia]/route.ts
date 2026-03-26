import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

/**
 * GET /api/prices/[codia]
 * Devuelve los precios almacenados en Supabase para un modelo (codia).
 * Formato de respuesta compatible con lo que espera useCarInfo:
 * { data: { price: [{ year, price }], listPrice: [] } }
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ codia: string }> }
) {
  try {
    const { codia } = await params;

    if (!codia) {
      return NextResponse.json({ error: "codia requerido" }, { status: 400 });
    }

    const { data, error } = await supabase
      .from("models")
      .select("id, name, codia, year_from, year_to, custom_prices, km_depreciation")
      .eq("codia", codia)
      .limit(1);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data || data.length === 0) {
      return NextResponse.json({ error: "Modelo no encontrado" }, { status: 404 });
    }

    const model = data[0];
    const customPrices = model.custom_prices || {};

    // Convertir custom_prices JSONB a formato InfoAuto-compatible
    // custom_prices: { "2024": { amount: 16500000, currency: "ARS" }, ... }
    // → price: [{ year: 2024, price: 16500 }]  (dividido por 1000 para mantener formato)
    const prices = Object.entries(customPrices)
      .map(([year, val]: [string, any]) => {
        const amount = typeof val === "object" && val?.amount ? val.amount : (typeof val === "number" ? val : 0);
        return {
          year: parseInt(year),
          price: Math.round(amount / 1000), // InfoAuto usa miles
        };
      })
      .filter((p) => p.year >= 2008 && p.price > 0)
      .sort((a, b) => a.year - b.year);

    return NextResponse.json({
      data: {
        price: prices,
        listPrice: [],
      },
      model: {
        id: model.id,
        name: model.name,
        codia: model.codia,
        year_from: model.year_from,
        year_to: model.year_to,
        km_depreciation: model.km_depreciation ?? null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
