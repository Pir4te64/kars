const API_BASE_URL = "/api/catalog";

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
    const res = await fetch(`/api/prices/${codia}`, {
      cache: "no-store",
    });

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
 * @param añoVehiculo - Año del vehículo (opcional)
 * @param modelName - Nombre del modelo (opcional, para tasa diferenciada)
 * @returns Precio ajustado según los kilómetros
 */
export function calculatePriceByKilometers(
  basePrice: number,
  kilometraje: string | number,
  añoVehiculo?: number | string,
  modelName?: string,
  customDepRate?: number | null
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

  // Tasas de depreciación por km (calibradas con datos de mercado Kavak):
  // - Utilitarios/pickups/SUVs: 0.00000262 (curva suave, retienen más valor por km)
  // - Autos (sedanes/hatchbacks): 0.00000386 (curva estándar)
  // - 2008-2018: tasa original 0.00000394 (sin cambio)
  const UTILITARIOS = [
    'partner', 'berlingo', 'kangoo', 'doblo', 'fiorino', 'caddy',
    'amarok', 'ranger', 'hilux', 'frontier', 'saveiro', 's10', 'alaskan', 'maverick', 'montana',
    'sw4', 'fortuner', 'territory', 'bronco',
    'sprinter', 'master', 'boxer', 'ducato', 'transit', 'daily',
    'trafic', 'expert', 'jumpy', 'vito',
  ];
  const añoNum = typeof añoVehiculo === 'string' ? parseInt(String(añoVehiculo)) : (añoVehiculo ?? 0);
  const esModerno = !isNaN(añoNum) && añoNum >= 2019;

  let adjustedPrice: number;
  if (customDepRate !== undefined && customDepRate !== null && customDepRate > 0) {
    // Porcentaje directo del admin: X% cada 10,000 km desde base 50k
    // Ej: 2 = 2% cada 10k km → a 100k km (50k sobre base) = -10%
    const bloques = kmDiferencia / 10000;
    const factor = 1 - (customDepRate / 100) * bloques;
    adjustedPrice = basePrice * Math.max(factor, 0.1); // mínimo 10% del precio base
  } else {
    let deprecationRate: number;
    if (!esModerno) {
      deprecationRate = 0.00000394; // 2008-2018: tasa original
    } else {
      const modelLower = (modelName || '').toLowerCase();
      const esUtilitario = UTILITARIOS.some(u => modelLower.includes(u));
      deprecationRate = esUtilitario ? 0.00000262 : 0.00000386;
    }
    adjustedPrice = basePrice * Math.exp(-deprecationRate * kmDiferencia);
  }
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
