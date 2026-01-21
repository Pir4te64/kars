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
 * El precio base corresponde a 50,000 km
 * Aplica la fórmula sobre la diferencia respecto a 50,000 km
 * 
 * Fórmula: Precio = precioBase × e^(-0.00000394 × kmDiferencia)
 * Donde kmDiferencia = kmReal - 50000 (puede ser negativo, positivo o cero)
 * 
 * Comportamiento:
 * - Si kmDiferencia = 0 (km igual a 50,000): Precio = precioBase
 * - Si kmDiferencia < 0 (menos km que 50,000): Precio > precioBase (incremento)
 * - Si kmDiferencia > 0 (más km que 50,000): Precio < precioBase (descuento)
 * 
 * Tasa de depreciación ajustada para que:
 * - 50,000 km → precioBase
 * - 150,000 km → precioBase × 0.6742 (ej: 19.800.000 → 13.350.000 ARS)
 *
 * @param basePrice - Precio base del vehículo (corresponde a 50,000 km)
 * @param kilometraje - Kilómetros exactos del vehículo (número o string)
 * @param añoVehiculo - Año del vehículo (opcional, solo para logs)
 * @returns Precio ajustado según los kilómetros
 */
export function calculatePriceByKilometers(
  basePrice: number,
  kilometraje: string | number,
  añoVehiculo?: number | string
): number {
  if (!kilometraje || !basePrice) {
    console.log(
      `⚠️ calculatePriceByKilometers: No se aplica ajuste - kilometraje: ${kilometraje}, basePrice: ${basePrice}`
    );
    return basePrice;
  }

  // Convertir kilometraje a número
  const km = typeof kilometraje === 'string' ? parseFloat(kilometraje.replace(/[.,]/g, '')) : kilometraje;

  // Si no es un número válido, retornar precio base
  if (isNaN(km) || km < 0) {
    console.log(
      `⚠️ calculatePriceByKilometers: Kilometraje inválido - km: ${km}, basePrice: ${basePrice}`
    );
    return basePrice;
  }

  // El precio base corresponde a 50,000 km
  // Calcular diferencia respecto a 50,000 km (puede ser negativo, positivo o cero)
  const kmBaseReferencia = 50000;
  const kmDiferencia = km - kmBaseReferencia;
  const tieneAño = añoVehiculo !== undefined && añoVehiculo !== null;
  
  if (tieneAño) {
    const año = typeof añoVehiculo === 'string' ? parseInt(añoVehiculo) : añoVehiculo;
    const añoActual = new Date().getFullYear();
    
    if (!isNaN(año) && año > 0 && año <= añoActual) {
      console.log(
        `📊 Cálculo de ajuste por kilometraje: Año ${año}, Km real: ${km.toLocaleString()}, Km base referencia: ${kmBaseReferencia.toLocaleString()}, Km diferencia: ${kmDiferencia.toLocaleString()} ${kmDiferencia > 0 ? '(mayor a referencia)' : kmDiferencia < 0 ? '(menor a referencia)' : '(igual a referencia)'}`
      );
    } else {
      console.log(
        `⚠️ calculatePriceByKilometers: Año inválido - año: ${año}, añoActual: ${añoActual}. Aplicando descuento sobre diferencia respecto a ${kmBaseReferencia.toLocaleString()} km.`
      );
    }
  } else {
    console.log(
      `📊 Cálculo de ajuste por kilometraje: Km real: ${km.toLocaleString()}, Km base referencia: ${kmBaseReferencia.toLocaleString()}, Km diferencia: ${kmDiferencia.toLocaleString()}`
    );
  }

  // Aplicar la fórmula: Precio = precioBase × e^(-0.00000289 × kmDiferencia)
  // Si kmDiferencia es negativo (menos km que 50,000), el precio será mayor
  // Si kmDiferencia es positivo (más km que 50,000), el precio será menor
  // Si kmDiferencia es cero (igual a 50,000), el precio será igual al base
  // 
  // Calcular tasa de depreciación para que 50,000 km = precioBase y 150,000 km = precioBase × 0.6742
  // 13.350.000 = 19.800.000 × e^(-rate × 100,000)
  // rate = -ln(13.350.000 / 19.800.000) / 100,000 = 0.00000394
  const deprecationRate = 0.00000394; // Ajustada para que 150,000 km = 13.350.000 ARS cuando precioBase = 19.800.000 ARS
  const adjustedPrice = basePrice * Math.exp(-deprecationRate * kmDiferencia);
  const diferenciaPrecio = adjustedPrice - basePrice;
  const porcentajeAjuste = (diferenciaPrecio / basePrice) * 100;

  if (kmDiferencia === 0) {
    console.log(
      `✅ calculatePriceByKilometers: El vehículo tiene exactamente el kilometraje de referencia (${kmBaseReferencia.toLocaleString()} km). Precio base: ${basePrice.toLocaleString()} ARS, Precio ajustado: ${adjustedPrice.toLocaleString()} ARS`
    );
  } else if (kmDiferencia < 0) {
    console.log(
      `✅ calculatePriceByKilometers: Ajuste aplicado (menor kilometraje que referencia) - Precio base: ${basePrice.toLocaleString()} ARS, Precio ajustado: ${adjustedPrice.toLocaleString()} ARS, Incremento: ${diferenciaPrecio.toLocaleString()} ARS (+${Math.abs(porcentajeAjuste).toFixed(2)}%)`
    );
  } else {
    console.log(
      `✅ calculatePriceByKilometers: Ajuste aplicado (mayor kilometraje que referencia) - Precio base: ${basePrice.toLocaleString()} ARS, Precio ajustado: ${adjustedPrice.toLocaleString()} ARS, Descuento: ${Math.abs(diferenciaPrecio).toLocaleString()} ARS (${porcentajeAjuste.toFixed(2)}%)`
    );
  }

  // Redondear a 2 decimales
  return Math.round(adjustedPrice * 100) / 100;
}
