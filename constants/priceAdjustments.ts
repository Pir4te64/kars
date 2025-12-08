/**
 * Configuración de ajustes de precio por modelo y rango de años
 * 
 * Estructura:
 * - Las claves son el nombre de la marca
 * - Cada marca tiene un objeto con modelos
 * - Cada modelo tiene porcentajes para rangos de años:
 *   - 2008-2012: porcentaje de la columna "2008"
 *   - 2013-2017: porcentaje de la columna "2013"
 *   - 2018-actualidad: porcentaje de la columna "2018"
 * 
 * Si un porcentaje es null, significa que el modelo no está disponible para ese rango (celda roja)
 * Si el porcentaje tiene signo negativo (-), es un decremento
 * Si el porcentaje es positivo, es un incremento
 * 
 * Ejemplo: "1,17%" se escribe como 1.17 (incremento)
 * Ejemplo: "-24,00%" se escribe como -24.00 (decremento)
 * Ejemplo: null significa que no se aplica ajuste (modelo no disponible para ese rango)
 */

export interface YearRangeAdjustment {
  /** Porcentaje para años 2008-2012 */
  range2008_2012: number | null;
  /** Porcentaje para años 2013-2017 */
  range2013_2017: number | null;
  /** Porcentaje para años 2018-actualidad */
  range2018_plus: number | null;
}

export interface ModelAdjustments {
  [modelName: string]: YearRangeAdjustment;
}

export interface BrandAdjustments {
  [brandName: string]: ModelAdjustments;
}

export const PRICE_ADJUSTMENTS: BrandAdjustments = {
  Volkswagen: {
    "Amarok": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 1.17, // 1,17%
      range2018_plus: 11.00, // 11%
    },
    "Bora": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "CrossFox": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Fox": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Gol": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Golf": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Golf Variant": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Gol Trend": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Polo": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Polo Classic": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Saveiro": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Sharan": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Suran": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Suran Cross": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Tiguan": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Tiguan Allspace": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Up": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Vento": {
      range2008_2012: -24.00, // -24,00%
      range2013_2017: -12.00, // -12,00%
      range2018_plus: -10.00, // -10,00%
    },
    "Vento Variant": {
      range2008_2012: -31.00, // -31,00%
      range2013_2017: -20.00, // -20,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Voyage": {
      range2008_2012: -17.00, // -17,00%
      range2013_2017: -15.00, // -15,00%
      range2018_plus: 4.00, // 4,00%
    },
    // Agregar más modelos según sea necesario
  },
  Chevrolet: {
    "Agile": {
      range2008_2012: -9.00, // -9,00%
      range2013_2017: 11.00, // 11,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Astra": {
      range2008_2012: 0.00, // 0,00%
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    "Aveo": {
      range2008_2012: 4.00, // 4,00%
      range2013_2017: -1.00, // -1,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Celta": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 16.00, // 16,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Classic": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Corsa": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Cruze": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Cruze II": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: 6.50, // 6,50%
    },
    "Grand Vitara": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Meriva": {
      range2008_2012: -10.00, // -10,00%
      range2013_2017: 6.00, // 6,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Montana": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -25.00, // -25,00%
      range2018_plus: -23.50, // -23,50%
    },
    "Onix": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 3.50, // 3,50%
      range2018_plus: 3.50, // 3,50%
    },
    "Ónix": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 3.50, // 3,50%
      range2018_plus: 3.50, // 3,50%
    },
    "Prisma": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 0.00, // 0,00%
      range2018_plus: 10.70, // 10,70%
    },
    "Spin": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 2.50, // 2,50%
      range2018_plus: 18.00, // 18,00%
    },
    "Tracker": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 16.00, // 16,00%
      range2018_plus: 10.60, // 10,60%
    },
    "Zafira": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: 12.00, // 12,00%
    },
    // Agregar más modelos según sea necesario
  },
  Renault: {
    "Alaskan": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Arkana": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Captur": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -5.50, // -5,50%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Clio": {
      range2008_2012: -11.00, // -11,00%
      range2013_2017: -12.50, // -12,50%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Clio Mio": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Duster": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -1.50, // -1,50%
      range2018_plus: 1.00, // 1,00%
    },
    "Duster Oroch": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: -3.00, // -3,00%
    },
    "Oroch": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: -3.00, // -3,00%
    },
    "Fluence": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -14.00, // -14,00%
      range2018_plus: 2.00, // 2,00%
    },
    "Grand Scenic": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Kangoo": {
      range2008_2012: -20.00, // -20,00%
      range2013_2017: 5.00, // 5,00%
      range2018_plus: 2.50, // 2,50%
    },
    "Kardian": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Koleos": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -3.00, // -3,00%
      range2018_plus: -2.50, // -2,50%
    },
    "Kwid": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: -2.50, // -2,50%
    },
    "Laguna": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Logan": {
      range2008_2012: -15.00, // -15,00%
      range2013_2017: -16.50, // -16,50%
      range2018_plus: -7.00, // -7,00%
    },
    "Megane": {
      range2008_2012: -12.00, // -12,00%
      range2013_2017: 9.00, // 9,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Sandero": {
      range2008_2012: -19.00, // -19,00%
      range2013_2017: -15.00, // -15,00%
      range2018_plus: -10.00, // -10,00%
    },
    "Sandero Stepway": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -7.00, // -7,00%
      range2018_plus: -9.00, // -9,00%
    },
    "Scenic": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Scenic II": {
      range2008_2012: 11.00, // 11,00%
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    "Symbol": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 5.00, // 5,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Twingo": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    // Agregar más modelos según sea necesario
  },
  Citroen: {
    "2CV": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "3CV": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "AK 400": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "AMI 8": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "AMI 8 ELYSEE": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "AZAM M28 SPORT": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "DYANE 6": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "GRINGA PICK-UP": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "IES AMERICA": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "IES AMERICA CARGA": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "IES SAFARI": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "IES SUPER AMERICA": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "MEHARI": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "OLT CIT CLUB": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "AX": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "BASALT": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "BERLINGO": {
      range2008_2012: -17.00, // -17,00%
      range2013_2017: -9.00, // -9,00%
      range2018_plus: -12.00, // -12,00%
    },
    "C3": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    "C4": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: null, // Celda roja - no disponible
    },
    "C4 Lounge": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "C5": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    "C6": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    // Agregar más modelos según sea necesario
  },
  Peugeot: {
    "2008": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: 1.00, // 1,00%
    },
    "206": {
      range2008_2012: -4.00, // -4,00%
      range2013_2017: 12.00, // 12,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "207": {
      range2008_2012: -11.00, // -11,00%
      range2013_2017: -12.00, // -12,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "208": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -4.50, // -4,50%
      range2018_plus: 4.00, // 4,00%
    },
    "3008": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -21.00, // -21,00%
      range2018_plus: 30.00, // 30,00%
    },
    "307": {
      range2008_2012: -10.50, // -10,50%
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    "308": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -17.50, // -17,50%
      range2018_plus: -4.00, // -4,00%
    },
    "408": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -1.50, // -1,50%
      range2018_plus: 1.50, // 1,50%
    },
    "Partner": {
      range2008_2012: -14.00, // -14,00%
      range2013_2017: -12.00, // -12,00%
      range2018_plus: -10.00, // -10,00%
    },
    "Partner Patagonica": {
      range2008_2012: -14.00, // -14,00%
      range2013_2017: -19.00, // -19,00%
      range2018_plus: -5.00, // -5,00%
    },
    "Rcz": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    // Agregar más modelos según sea necesario
  },
  Fiat: {
    "500": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda amarilla - 0%
      range2018_plus: -9.00, // -9,00%
    },
    "Argo": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: -1.00, // -1,00%
    },
    "Bravo": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -30.00, // -30,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Cronos": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: 11.00, // 11,00%
    },
    "Fastback": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Fiorino": {
      range2008_2012: -8.00, // -8,00%
      range2013_2017: -5.00, // -5,00%
      range2018_plus: -11.00, // -11,00%
    },
    "Grand Siena": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -12.00, // -12,00%
      range2018_plus: -3.00, // -3,00%
    },
    "Idea": {
      range2008_2012: -21.00, // -21,00%
      range2013_2017: 3.00, // 3,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Línea": {
      range2008_2012: -36.00, // -36,00%
      range2013_2017: 0.50, // 0,50%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Linea": {
      range2008_2012: -36.00, // -36,00%
      range2013_2017: 0.50, // 0,50%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Mobi": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: -11.00, // -11,00%
    },
    "Palio": {
      range2008_2012: -8.00, // -8,00%
      range2013_2017: -4.00, // -4,00%
      range2018_plus: -8.00, // -8,00%
    },
    "Pulse": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Punto": {
      range2008_2012: -18.00, // -18,00%
      range2013_2017: -18.00, // -18,00%
      range2018_plus: -0.05, // -0,05%
    },
    "Cubo": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Qubo": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    "Siena": {
      range2008_2012: -10.00, // -10,00%
      range2013_2017: -4.00, // -4,00%
      range2018_plus: -7.00, // -7,00%
    },
    "Strada": {
      range2008_2012: -15.00, // -15,00%
      range2013_2017: 3.00, // 3,00%
      range2018_plus: null, // Celda roja - no disponible
    },
    "Titano": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Toro": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: 16.00, // 16,00%
    },
    "Uno": {
      range2008_2012: null, // Celda amarilla - 0%
      range2013_2017: -0.09, // -0,09%
      range2018_plus: -4.00, // -4,00%
    },
    // Agregar más modelos según sea necesario
  },
  Ford: {
    "Ecosport": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: -1.00, // -1,00%
      range2018_plus: -17.00, // -17,00%
    },
    "Everest": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Fiesta": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 25.00, // 25,00%
    },
    "Fiesta Kinetic Design": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 19.00, // 19,00%
      range2018_plus: -5.00, // -5,00%
    },
    "Focus": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: -19.00, // -19,00%
      range2018_plus: 2.00, // 2,00%
    },
    "Focus II": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "Focus III": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "Ka": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "Maverick": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Ranger": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: -11.00, // -11,00%
      range2018_plus: -3.00, // -3,00%
    },
    "Ranger 3.0 XLS V6": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Territori": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    // Agregar más modelos según sea necesario
  },
  Nissan: {
    "Frontier": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "Kicks": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "March": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: -2.00, // -2,00%
    },
    "Note": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "Sentra": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "Tiida": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: -7.00, // -7,00%
      range2018_plus: -2.00, // -2,00%
    },
    "Versa": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: -6.00, // -6,00%
      range2018_plus: -7.00, // -7,00%
    },
    "X-terra": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "Xtrail": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    "X-Trail": {
      range2008_2012: 0.00, // 0,00% (celda amarilla)
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: 0.00, // 0,00% (celda amarilla)
    },
    // Agregar más modelos según sea necesario
  },
  Toyota: {
    "Corolla": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -8.00, // -8,00%
      range2018_plus: -4.00, // -4,00%
    },
    "Corolla Cross": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Etios": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: -12.00, // -12,00%
      range2018_plus: -2.00, // -2,00%
    },
    "Hiace": {
      range2008_2012: null,
      range2013_2017: null,
      range2018_plus: null,
    },
    "Hilux": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: null, // Celda roja - no disponible
    },
    "RAV4": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: 0.00, // 0,00% (celda amarilla)
      range2018_plus: null, // Celda roja - no disponible
    },
    "Sw4": {
      range2008_2012: -0.50, // -0,50%
      range2013_2017: -7.00, // -7,00%
      range2018_plus: 1.00, // 1,00%
    },
    "Yaris": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: -1.00, // -1,00%
    },
    // Agregar más modelos según sea necesario
  },
  Suzuki: {
    "Fun": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    "Grand Vitara": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    "Swift": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: null, // Celda roja - no disponible
    },
    "Vitara": {
      range2008_2012: null, // Celda roja - no disponible
      range2013_2017: null, // Celda roja - no disponible
      range2018_plus: 13.00, // 13,00%
    },
    // Agregar más modelos según sea necesario
  },
  // Agregar más marcas según sea necesario
};

/**
 * Determina el rango de años basado en el año seleccionado
 */
export function getYearRange(year: number): keyof YearRangeAdjustment {
  if (year >= 2008 && year <= 2012) {
    return "range2008_2012";
  } else if (year >= 2013 && year <= 2017) {
    return "range2013_2017";
  } else if (year >= 2018) {
    return "range2018_plus";
  }
  // Por defecto, si el año es anterior a 2008, usar el rango más antiguo
  return "range2008_2012";
}

/**
 * Obtiene el porcentaje de ajuste para un modelo específico y año
 * @param brandName Nombre de la marca (ej: "Volkswagen")
 * @param modelName Nombre del modelo (ej: "Amarok")
 * @param year Año del vehículo
 * @returns Porcentaje de ajuste (null si no está disponible para ese rango)
 */
export function getPriceAdjustment(
  brandName: string,
  modelName: string,
  year: number
): number | null {
  const brandAdjustments = PRICE_ADJUSTMENTS[brandName];
  if (!brandAdjustments) {
    return null;
  }

  // Buscar el modelo usando coincidencia flexible (case-insensitive, sin espacios extra)
  const normalizedModelName = modelName.trim();
  const modelKey = Object.keys(brandAdjustments).find(
    (key) => key.toLowerCase() === normalizedModelName.toLowerCase()
  );

  if (!modelKey) {
    // Si no se encuentra coincidencia exacta, intentar búsqueda parcial
    const partialMatch = Object.keys(brandAdjustments).find((key) =>
      normalizedModelName.toLowerCase().includes(key.toLowerCase()) ||
      key.toLowerCase().includes(normalizedModelName.toLowerCase())
    );
    
    if (partialMatch) {
      const modelAdjustments = brandAdjustments[partialMatch];
      const yearRange = getYearRange(year);
      return modelAdjustments[yearRange];
    }
    
    return null;
  }

  const modelAdjustments = brandAdjustments[modelKey];
  const yearRange = getYearRange(year);
  return modelAdjustments[yearRange];
}

/**
 * Aplica el ajuste de precio al precio base
 * @param basePrice Precio base en USD
 * @param adjustment Porcentaje de ajuste (puede ser positivo, negativo o null)
 * @returns Precio ajustado (o null si el ajuste es null, indicando que no está disponible)
 */
export function applyPriceAdjustment(
  basePrice: number,
  adjustment: number | null
): number | null {
  if (adjustment === null) {
    return null; // Modelo no disponible para ese rango de años
  }

  // Aplicar el porcentaje: precio * (1 + porcentaje/100)
  // Si adjustment es -24, significa -24%, entonces: precio * (1 - 0.24) = precio * 0.76
  // Si adjustment es 11, significa +11%, entonces: precio * (1 + 0.11) = precio * 1.11
  return basePrice * (1 + adjustment / 100);
}

