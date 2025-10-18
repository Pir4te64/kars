// Configuración para la API de DolarAPI
export const DOLLAR_API_CONFIG = {
  baseUrl: "https://dolarapi.com/v1",
  endpoints: {
    blue: "/dolares/blue",
    oficial: "/dolares/oficial",
    bolsa: "/dolares/bolsa",
    ccl: "/dolares/ccl",
    tarjeta: "/dolares/tarjeta",
    mayorista: "/dolares/mayorista",
    cripto: "/dolares/cripto",
  },
  cacheTime: 5 * 60 * 1000, // 5 minutos en milisegundos
};

// Tipos para las respuestas de la API
export interface DollarApiResponse {
  compra: number;
  venta: number;
  casa: string;
  nombre: string;
  moneda: string;
  fechaActualizacion: string;
}

// Función para formatear precios en pesos argentinos
export const formatPesos = (amount: number): string => {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

// Función para formatear fechas
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleString("es-AR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  });
};

// Función para convertir USD a ARS usando dólar blue
export const convertUsdToArs = (
  usdAmount: number,
  dollarBlueRate: number
): number => {
  return usdAmount * dollarBlueRate;
};
