import { supabase } from "./supabase";

/**
 * Obtiene el ajuste de precio desde Supabase para un modelo específico y año
 * @param brandName Nombre de la marca (ej: "Volkswagen")
 * @param modelName Nombre del modelo (ej: "Amarok")
 * @param year Año del vehículo (ej: 2015)
 * @returns Porcentaje de ajuste (número) o null si no está disponible
 */
export async function getPriceAdjustmentFromSupabase(
  brandName: string,
  modelName: string,
  year: number
): Promise<number | null> {
  try {
    // Normalizar nombres para búsqueda (case-insensitive, sin espacios extra)
    const normalizedModelName = modelName.trim().toLowerCase();
    const yearString = year.toString();

    // Buscar el modelo en Supabase
    // Intentar buscar por name o description que coincida con el nombre del modelo
    const { data, error } = await supabase
      .from("models")
      .select("price_adjustments")
      .or(`name.ilike.%${normalizedModelName}%,description.ilike.%${normalizedModelName}%`)
      .limit(1);

    if (error) {
      console.error("Error fetching price adjustment from Supabase:", error);
      return null;
    }

    if (!data || data.length === 0) {
      // No se encontró el modelo en Supabase
      return null;
    }

    const priceAdjustments = data[0].price_adjustments;

    // Si no hay ajustes configurados, retornar null
    if (!priceAdjustments || typeof priceAdjustments !== "object") {
      return null;
    }

    // Obtener el ajuste para el año específico
    const adjustment = priceAdjustments[yearString];

    // Si el ajuste es null, undefined, o no es un número, retornar null
    if (adjustment === null || adjustment === undefined) {
      return null;
    }

    // Convertir a número si es string
    const adjustmentNumber =
      typeof adjustment === "number"
        ? adjustment
        : typeof adjustment === "string"
        ? parseFloat(adjustment)
        : null;

    if (adjustmentNumber === null || isNaN(adjustmentNumber)) {
      return null;
    }

    return adjustmentNumber;
  } catch (error) {
    console.error("Error in getPriceAdjustmentFromSupabase:", error);
    return null;
  }
}

/**
 * Obtiene todos los ajustes de precio para un modelo desde Supabase
 * @param brandName Nombre de la marca
 * @param modelName Nombre del modelo
 * @returns Objeto con ajustes por año o null si no se encuentra
 */
export async function getAllPriceAdjustmentsFromSupabase(
  brandName: string,
  modelName: string
): Promise<Record<string, number | null> | null> {
  try {
    const normalizedModelName = modelName.trim().toLowerCase();

    const { data, error } = await supabase
      .from("models")
      .select("price_adjustments")
      .or(`name.ilike.%${normalizedModelName}%,description.ilike.%${normalizedModelName}%`)
      .limit(1);

    if (error) {
      console.error("Error fetching price adjustments from Supabase:", error);
      return null;
    }

    if (!data || data.length === 0) {
      return null;
    }

    const priceAdjustments = data[0].price_adjustments;

    if (!priceAdjustments || typeof priceAdjustments !== "object") {
      return null;
    }

    // Convertir valores a números o null
    const result: Record<string, number | null> = {};
    for (const [year, adjustment] of Object.entries(priceAdjustments)) {
      if (adjustment === null || adjustment === undefined) {
        result[year] = null;
      } else {
        const num =
          typeof adjustment === "number"
            ? adjustment
            : typeof adjustment === "string"
            ? parseFloat(adjustment)
            : null;
        result[year] = num !== null && !isNaN(num) ? num : null;
      }
    }

    return result;
  } catch (error) {
    console.error("Error in getAllPriceAdjustmentsFromSupabase:", error);
    return null;
  }
}

