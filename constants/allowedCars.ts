export const ALLOWED_CARS = {
  "Ford": [
    "Ecosport",
    "Everest",
    "Fiesta",
    "Focus",
    "Ka",
    "Kuga",
    "Maverick",
    "Mondeo",
    "Ranger",
    "Territori"
  ],
  "Fiat": [
    "500",
    "Argo",
    "Bravo",
    "Cronos",
    "Doblo",
    "Fastback",
    "Fiorino",
    "Grand Siena",
    "Idea",
    "Línea",
    "Mobi",
    "Palio",
    "Pulse",
    "Punto",
    "Cubo",
    "Siena",
    "Stilo",
    "Strada",
    "Titano",
    "Toro",
    "Uno"
  ],
  "Audi": [
    "A1",
    "A3",
    "A4",
    "A5",
    "Q2",
    "Q3",
    "Q5",
    "TT"
  ],
  "Chevrolet": [
    "Agile",
    "Astra",
    "Aveo",
    "Celta",
    "Classic",
    "Cobalt",
    "Corsa",
    "Cruze",
    "Grand Vitara",
    "Meriva",
    "Montana",
    "Ónix",
    "Prisma",
    "Spin",
    "Tracker",
    "Zafira"
  ],
  "Chrysler": [
    // Modelos JEEP (están bajo CHRYSLER en la API)
    "Cherokee",
    "Commander",
    "Compass",
    "Grand Cherokee",
    "Renegade",
    // Modelos DODGE (están bajo CHRYSLER en la API)
    "Journey"
  ],
  "Jeep": [
    "Cherokee",
    "Commander",
    "Compass",
    "Grand Cherokee",
    "Renegade"
  ],
  "Dodge": [
    "Journey"
  ],
  "Ram": [
    "Ram"
  ],
  "Honda": [
    "Accord",
    "City",
    "Civic",
    "Crv",
    "Fit",
    "Hrv",
    "Wrv",
    "Zrv"
  ],
  "Hyundai": [
    "Creta",
    "Grand Santa Fe",
    "H1",
    "I30",
    "Santa Fe",
    "Staria",
    "Tucson",
    "Veloster"
  ],
  "Kia": [
    "Carnival",
    "Cerato",
    "Grand Sportage",
    "K3",
    "Picanto",
    "Rio",
    "Seltos",
    "Sorento",
    "Soul",
    "Sportage"
  ],
  "Mitsubishi": [
    "L200"
  ],
  "Nissan": [
    "Kicks",
    "March",
    "Sentra",
    "Tiida",
    "Versa",
    "Xtrail"
  ],
  "Peugeot": [
    "2008",
    "206",
    "207",
    "208",
    "3008",
    "301",
    "307",
    "308",
    "4008",
    "408",
    "5008",
    "Partner",
    "Rcz"
  ],
  "Renault": [
    "Alaskan",
    "Arkana",
    "Captur",
    "Clio",
    "Duster",
    "Fluence",
    "Grand Scenic",
    "Kangoo",
    "Kardian",
    "Koleos",
    "Kwid",
    "Laguna",
    "Logan",
    "Megane",
    "Oroch",
    "Sandero",
    "Scenic",
    "Symbol",
    "Twingo"
  ],
  "Toyota": [
    "Corolla",
    "Corolla Cross",
    "Etios",
    "Hiace",
    "Hilux",
    "Innova",
    "Sw4",
    "Yaris"
  ],
  "Volkswagen": [
    "Amarok",
    "Bora",
    "Fox",
    "Gol",
    "Golf",
    "New Beetle",
    "Nivus",
    "Passat",
    "Polo",
    "Saveiro",
    "Scirocco",
    "Sharan",
    "Suran",
    "Taos",
    "Tcross",
    "Tera",
    "Tiguan",
    "Up",
    "Vento",
    "Virtus",
    "Voyage"
  ]
} as const;

/**
 * Normaliza un string de manera robusta, similar al LIKE de SQL
 * Remueve acentos, convierte a minúsculas, elimina guiones, espacios, y caracteres especiales
 * Solo mantiene letras y números esenciales
 */
export function normalizeForComparison(str: string): string {
  if (!str) return "";
  
  return str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "") // Remover acentos
    .replace(/[-_\s\.]/g, "") // Remover guiones, guiones bajos, espacios y puntos
    .replace(/[^a-z0-9]/g, "") // Solo letras y números
    .trim();
}

/**
 * Compara dos strings normalizados con lógica LIKE
 * Busca coincidencias parciales en ambas direcciones
 */
export function likeMatch(str1: string, str2: string): boolean {
  const normalized1 = normalizeForComparison(str1);
  const normalized2 = normalizeForComparison(str2);
  
  // Coincidencia exacta
  if (normalized1 === normalized2) return true;
  
  // Una contiene a la otra (para casos como "focus-1.6" vs "focus")
  if (normalized1.includes(normalized2) || normalized2.includes(normalized1)) {
    // Solo aceptar si la longitud del más corto es al menos 3 caracteres
    // para evitar coincidencias muy cortas (ej: "a" vs "am")
    const minLength = Math.min(normalized1.length, normalized2.length);
    if (minLength >= 3) {
      return true;
    }
  }
  
  return false;
}

// Función helper para verificar si una marca está permitida
export function isBrandAllowed(brandName: string): boolean {
  // Normalizar también el nombre de la marca para comparación
  const normalizedBrandName = normalizeForComparison(brandName);
  const allowedBrandNames = Object.keys(ALLOWED_CARS).map(b => normalizeForComparison(b));
  return allowedBrandNames.some(allowed => likeMatch(allowed, normalizedBrandName));
}

// Función helper para verificar si un modelo está permitido para una marca
export function isModelAllowed(brandName: string, modelName: string): boolean {
  // Primero encontrar la marca correcta (puede venir con diferentes formatos)
  const brandKey = Object.keys(ALLOWED_CARS).find(
    key => likeMatch(key, brandName)
  ) as keyof typeof ALLOWED_CARS | undefined;
  
  if (!brandKey) return false;
  
  const allowedModels = ALLOWED_CARS[brandKey];
  if (!allowedModels) return false;
  
  // Buscar coincidencias con LIKE en los modelos permitidos
  return allowedModels.some(allowed => likeMatch(allowed, modelName));
}

// Función helper para obtener los modelos permitidos de una marca
export function getAllowedModels(brandName: string): string[] {
  const brandKey = Object.keys(ALLOWED_CARS).find(
    key => likeMatch(key, brandName)
  ) as keyof typeof ALLOWED_CARS | undefined;
  
  return brandKey ? ALLOWED_CARS[brandKey] : [];
}

