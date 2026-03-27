import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export const dynamic = "force-dynamic";
export const maxDuration = 300; // 5 minutos max para Vercel

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const INFOAUTO_BASE_URL = "https://api.infoauto.com.ar/cars";
const INFOAUTO_USER = "vicmor601@gmail.com";
const INFOAUTO_PASSWORD = "XhqOsuVIK1MeXpAB";

let cachedAccessToken: string | null = null;
let cachedRefreshToken: string | null = null;
let tokenExpiry = 0;

async function getAuthToken(): Promise<string> {
  const now = Date.now();
  if (cachedAccessToken && tokenExpiry > now) return cachedAccessToken;

  if (cachedRefreshToken && tokenExpiry > 0 && tokenExpiry <= now) {
    try {
      const res = await fetch(`${INFOAUTO_BASE_URL}/auth/refresh`, {
        method: "POST",
        headers: { Authorization: `Bearer ${cachedRefreshToken}`, "Content-Type": "application/json" },
      });
      if (res.ok) {
        const d = await res.json();
        cachedAccessToken = d.access;
        tokenExpiry = now + 50 * 60 * 1000;
        return cachedAccessToken!;
      }
    } catch {}
  }

  const credentials = Buffer.from(`${INFOAUTO_USER}:${INFOAUTO_PASSWORD}`).toString("base64");
  const res = await fetch(`${INFOAUTO_BASE_URL}/auth/login`, {
    method: "POST",
    headers: { Authorization: `Basic ${credentials}`, "Content-Type": "application/json" },
  });
  if (!res.ok) throw new Error(`InfoAuto login failed: ${res.status}`);
  const d = await res.json();
  cachedAccessToken = d.access;
  cachedRefreshToken = d.refresh;
  tokenExpiry = now + 50 * 60 * 1000;
  return cachedAccessToken!;
}

async function infoAutoGet(path: string): Promise<any> {
  const token = await getAuthToken();
  const res = await fetch(`${INFOAUTO_BASE_URL}/pub${path}`, {
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
  });
  if (res.status === 401) {
    cachedAccessToken = null;
    tokenExpiry = 0;
    return infoAutoGet(path);
  }
  if (!res.ok) return null;
  return res.json();
}

async function getPricesForCodia(codia: string): Promise<Record<string, number> | null> {
  const data = await infoAutoGet(`/models/${codia}/prices/`);
  if (!data) return null;

  let allPrices: any[] = [];
  if (Array.isArray(data)) {
    allPrices = data;
  } else if (data.data) {
    allPrices = [...(data.data.listPrice || []), ...(data.data.price || [])];
  } else {
    allPrices = [...(data.listPrice || []), ...(data.price || [])];
  }

  if (allPrices.length === 0) return null;

  const prices: Record<string, number> = {};
  for (const item of allPrices) {
    if (!item.year || item.price === null || item.price === undefined) continue;
    const priceNum = Number(item.price);
    if (isNaN(priceNum) || priceNum <= 0) continue;
    // InfoAuto devuelve en miles, guardar en pesos completos
    prices[String(item.year)] = Math.round(priceNum * 1000);
  }

  return Object.keys(prices).length > 0 ? prices : null;
}

function calcFinalPrices(
  infoautoPrices: Record<string, number>,
  adjustments: Record<string, number | null> | null
): Record<string, { amount: number; currency: "ARS" }> {
  const result: Record<string, { amount: number; currency: "ARS" }> = {};
  for (const [year, basePrice] of Object.entries(infoautoPrices)) {
    const adj = adjustments?.[year];
    const finalPrice = typeof adj === "number"
      ? Math.round(basePrice * (1 + adj / 100))
      : basePrice;
    result[year] = { amount: finalPrice, currency: "ARS" };
  }
  return result;
}

// POST — sincronizar una marca específica (llamado desde el admin)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const brandId = body.brand_id;

    let query = supabase
      .from("models")
      .select("id, name, codia, brand_id, price_adjustments, infoauto_prices, custom_prices")
      .order("name");

    if (brandId) {
      query = query.eq("brand_id", brandId);
    }

    // Paginar para superar límite de 1000
    let allModels: any[] = [];
    let from = 0;
    const PAGE_SIZE = 1000;
    while (true) {
      const { data, error } = await query.range(from, from + PAGE_SIZE - 1);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
      if (!data || data.length === 0) break;
      allModels = allModels.concat(data);
      if (data.length < PAGE_SIZE) break;
      from += PAGE_SIZE;
    }

    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const model of allModels) {
      try {
        const newInfoautoPrices = await getPricesForCodia(model.codia);
        if (!newInfoautoPrices) {
          skipped++;
          continue;
        }

        // Recalcular custom_prices: InfoAuto nuevos + adjustments existentes
        const recalculated = calcFinalPrices(newInfoautoPrices, model.price_adjustments);

        // Preservar precios manuales que no vienen de InfoAuto
        const existingCustom = (model as any).custom_prices || {};
        const mergedCustomPrices: Record<string, any> = {};

        // Primero: precios manuales existentes para años que InfoAuto NO tiene
        for (const [year, val] of Object.entries(existingCustom)) {
          if (!(year in newInfoautoPrices)) {
            mergedCustomPrices[year] = val; // preservar precio manual
          }
        }

        // Segundo: precios recalculados de InfoAuto (tienen prioridad)
        for (const [year, val] of Object.entries(recalculated)) {
          mergedCustomPrices[year] = val;
        }

        const { error: updateErr } = await supabase
          .from("models")
          .update({
            infoauto_prices: newInfoautoPrices,
            custom_prices: mergedCustomPrices,
          })
          .eq("id", model.id);

        if (updateErr) {
          errors++;
        } else {
          updated++;
        }

        // Rate limit
        await new Promise((r) => setTimeout(r, 100));
      } catch {
        errors++;
      }
    }

    return NextResponse.json({
      success: true,
      updated,
      skipped,
      errors,
      total: allModels.length,
    });
  } catch (err) {
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}

// GET — para el cron de Vercel (se ejecuta semanalmente)
export async function GET(request: NextRequest) {
  // Verificar que viene de Vercel Cron (header de autorización)
  const authHeader = request.headers.get("authorization");
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Sincronizar TODAS las marcas
  let allModels: any[] = [];
  let from = 0;
  const PAGE_SIZE = 1000;
  while (true) {
    const { data, error } = await supabase
      .from("models")
      .select("id, name, codia, brand_id, price_adjustments, infoauto_prices, custom_prices")
      .order("name")
      .range(from, from + PAGE_SIZE - 1);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    if (!data || data.length === 0) break;
    allModels = allModels.concat(data);
    if (data.length < PAGE_SIZE) break;
    from += PAGE_SIZE;
  }

  let updated = 0;
  let skipped = 0;
  let errors = 0;

  for (const model of allModels) {
    try {
      const newInfoautoPrices = await getPricesForCodia(model.codia);
      if (!newInfoautoPrices) {
        skipped++;
        continue;
      }

      const recalculated = calcFinalPrices(newInfoautoPrices, model.price_adjustments);

      // Preservar precios manuales de años que InfoAuto no tiene
      const existingCustom = model.custom_prices || {};
      const mergedCustomPrices: Record<string, any> = {};
      for (const [year, val] of Object.entries(existingCustom)) {
        if (!(year in newInfoautoPrices)) {
          mergedCustomPrices[year] = val;
        }
      }
      for (const [year, val] of Object.entries(recalculated)) {
        mergedCustomPrices[year] = val;
      }

      const { error: updateErr } = await supabase
        .from("models")
        .update({
          infoauto_prices: newInfoautoPrices,
          custom_prices: mergedCustomPrices,
        })
        .eq("id", model.id);

      if (updateErr) errors++;
      else updated++;

      await new Promise((r) => setTimeout(r, 100));
    } catch {
      errors++;
    }
  }

  return NextResponse.json({
    success: true,
    updated,
    skipped,
    errors,
    total: allModels.length,
  });
}
