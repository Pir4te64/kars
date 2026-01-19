const API_BASE_URL = "https://kars-backend-y4w9.vercel.app/api";

interface Brand {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface Group {
  id: number;
  name: string;
  [key: string]: unknown;
}

interface Model {
  id: number;
  name: string;
  description: string;
  codia: string;
  list_price?: boolean;
  prices?: boolean;
  [key: string]: unknown;
}

interface PriceResponse {
  price: number;
  [key: string]: unknown;
}

export async function getBrands(token: string): Promise<Brand[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands/`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("TOKEN_EXPIRED");
      }
      throw new Error("Error al obtener las marcas");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching brands:", error);
    throw error;
  }
}

export async function getGroups(
  token: string,
  brandId: string
): Promise<Group[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/brands/${brandId}/groups`, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      cache: "no-store",
    });

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("TOKEN_EXPIRED");
      }
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching groups:", error);
    return [];
  }
}

export async function getModels(
  token: string,
  brandId: string,
  group: string
): Promise<Model[]> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/brands/${brandId}/models?query_string=${group}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("TOKEN_EXPIRED");
      }
      return [];
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching models:", error);
    return [];
  }
}

export async function getPrice(
  codia: string,
  isNew: boolean,
  isOld: boolean,
  token: string
): Promise<PriceResponse | null> {
  try {
    const res = await fetch(
      `${API_BASE_URL}/models/${codia}/prices?isNew=${isNew}&isOld=${isOld}`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        cache: "no-store",
      }
    );

    if (!res.ok) {
      if (res.status === 401 || res.status === 403) {
        throw new Error("TOKEN_EXPIRED");
      }
      throw new Error("Error al obtener el precio");
    }

    return res.json();
  } catch (error) {
    console.error("Error fetching price:", error);
    throw error;
  }
}

/**
 * Calcula el precio ajustado según los kilómetros del vehículo
 * Fórmula mejorada para mercado argentino: considera kilometraje base esperado según antigüedad
 * Solo aplica descuento sobre el exceso de kilómetros respecto al esperado
 * 
 * Fórmula: Precio = precioBase × e^(-0.00000289 × kmExceso)
 * Donde kmExceso = max(0, kmReal - kmBaseEsperado)
 * Y kmBaseEsperado = (añoActual - añoVehiculo) × 15000
 * 
 * Basado en una depreciación de ~2.9% cada 10,000 km sobre el exceso
 *
 * @param basePrice - Precio base del vehículo (después de ajustes por marca/modelo/año)
 * @param kilometraje - Kilómetros exactos del vehículo (número o string)
 * @param añoVehiculo - Año del vehículo (opcional, para calcular km base esperado)
 * @returns Precio ajustado según los kilómetros
 */
export function calculatePriceByKilometers(
  basePrice: number,
  kilometraje: string | number,
  añoVehiculo?: number | string
): number {
  if (!kilometraje || !basePrice) {
    return basePrice;
  }

  // Convertir kilometraje a número
  const km = typeof kilometraje === 'string' ? parseFloat(kilometraje.replace(/[.,]/g, '')) : kilometraje;

  // Si no es un número válido, retornar precio base
  if (isNaN(km) || km < 0) {
    return basePrice;
  }

  // Calcular kilometraje base esperado según antigüedad (solo si se proporciona el año)
  let kmExceso = km;
  if (añoVehiculo !== undefined && añoVehiculo !== null) {
    const año = typeof añoVehiculo === 'string' ? parseInt(añoVehiculo) : añoVehiculo;
    const añoActual = new Date().getFullYear();
    
    if (!isNaN(año) && año > 0 && año <= añoActual) {
      // Calcular km base esperado: 15,000 km por año de antigüedad
      const añosAntigüedad = añoActual - año;
      const kmBaseEsperado = añosAntigüedad * 15000;
      
      // Solo aplicar descuento sobre el exceso de kilómetros
      kmExceso = Math.max(0, km - kmBaseEsperado);
      
      // Si el vehículo tiene menos km del esperado, no hay descuento adicional
      if (kmExceso === 0) {
        return basePrice;
      }
    }
  }

  // Aplicar la fórmula: Precio = precioBase × e^(-0.00000289 × kmExceso)
  const deprecationRate = 0.00000289;
  const adjustedPrice = basePrice * Math.exp(-deprecationRate * kmExceso);

  // Redondear a 2 decimales
  return Math.round(adjustedPrice * 100) / 100;
}
